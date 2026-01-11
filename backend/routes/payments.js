const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendWhatsAppMessage } = require('../utils/notifications');

// Payment gateway configurations
const PAYMENT_CONFIGS = {
    jazzcash: {
        merchantId: process.env.JAZZCASH_MERCHANT_ID,
        password: process.env.JAZZCASH_PASSWORD,
        integritySalt: process.env.JAZZCASH_INTEGRITY_SALT,
        apiUrl: process.env.NODE_ENV === 'production' 
            ? 'https://payments.jazzcash.com.pk' 
            : 'https://sandbox.jazzcash.com.pk'
    },
    easypaisa: {
        storeId: process.env.EASYPAISA_STORE_ID,
        apiKey: process.env.EASYPAISA_API_KEY,
        apiUrl: process.env.NODE_ENV === 'production'
            ? 'https://easypaisa.com.pk'
            : 'https://sandbox.easypaisa.com.pk'
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        apiUrl: process.env.NODE_ENV === 'production'
            ? 'https://api.paypal.com'
            : 'https://api.sandbox.paypal.com'
    }
};

// COD availability by city
const COD_CITIES = {
    'karachi': { available: true, deliveryDays: 2, charges: 0 },
    'lahore': { available: true, deliveryDays: 2, charges: 0 },
    'islamabad': { available: true, deliveryDays: 1, charges: 250 },
    'rawalpindi': { available: true, deliveryDays: 1, charges: 0 },
    'faisalabad': { available: true, deliveryDays: 3, charges: 0 },
    'multan': { available: true, deliveryDays: 3, charges: 100 },
    'peshawar': { available: true, deliveryDays: 3, charges: 150 },
    'quetta': { available: true, deliveryDays: 4, charges: 200 }
};

// Middleware to verify payment request
const verifyPaymentRequest = (req, res, next) => {
    const { amount, currency = 'PKR' } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid amount' 
        });
    }
    
    if (currency !== 'PKR') {
        return res.status(400).json({ 
            success: false, 
            message: 'Only PKR currency is supported' 
        });
    }
    
    next();
};

// Check COD availability
router.post('/cod/check-availability', async (req, res) => {
    try {
        const { city, totalAmount } = req.body;
        
        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City is required'
            });
        }
        
        const cityLower = city.toLowerCase();
        const codInfo = COD_CITIES[cityLower];
        
        if (!codInfo) {
            return res.json({
                success: true,
                available: false,
                message: 'COD not available in this city',
                alternativePaymentMethods: ['jazzcash', 'easypaisa', 'stripe', 'paypal']
            });
        }
        
        const minimumOrderAmount = 500; // Minimum order for COD
        const isEligible = totalAmount >= minimumOrderAmount;
        
        res.json({
            success: true,
            available: codInfo.available && isEligible,
            deliveryDays: codInfo.deliveryDays,
            charges: codInfo.charges,
            minimumOrderAmount,
            message: isEligible 
                ? `COD available in ${city}. Delivery within ${codInfo.deliveryDays} business days.`
                : `Minimum order amount for COD is Rs. ${minimumOrderAmount}`
        });
        
    } catch (error) {
        console.error('COD availability check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check COD availability'
        });
    }
});

// JazzCash payment initiation
router.post('/jazzcash/initiate', verifyPaymentRequest, async (req, res) => {
    try {
        const { amount, orderId, mobileNumber, email } = req.body;
        
        // Generate unique transaction ID
        const transactionId = `JC${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare JazzCash payload
        const payload = {
            pp_Amount: amount * 100, // Convert to paisa
            pp_BillReference: orderId,
            pp_Description: 'GBDRYFRUITS Order Payment',
            pp_Language: 'EN',
            pp_MerchantID: PAYMENT_CONFIGS.jazzcash.merchantId,
            pp_Password: PAYMENT_CONFIGS.jazzcash.password,
            pp_ReturnURL: `${process.env.FRONTEND_URL}/payment/jazzcash/return`,
            pp_TxnDateTime: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
            pp_TxnExpiryDateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString().replace(/[-:T.]/g, '').slice(0, 14),
            pp_TxnRefNo: transactionId,
            pp_TxnType: 'MWALLET',
            pp_Version: '1.1',
            ppmpf_1: mobileNumber || '',
            ppmpf_2: email || '',
            ppmpf_3: 'GBDRYFRUITS'
        };
        
        // Generate secure hash
        const sortedPayload = Object.keys(payload)
            .sort()
            .map(key => `${key}=${payload[key]}`)
            .join('&');
        
        const secureHash = crypto
            .createHash('sha256')
            .update(sortedPayload + PAYMENT_CONFIGS.jazzcash.integritySalt)
            .digest('hex');
        
        payload.pp_SecureHash = secureHash;
        
        // Store payment details in database
        await Order.findOneAndUpdate(
            { orderId },
            {
                $set: {
                    'payment.gateway': 'jazzcash',
                    'payment.transactionId': transactionId,
                    'payment.amount': amount,
                    'payment.status': 'pending',
                    'payment.details': payload
                }
            }
        );
        
        res.json({
            success: true,
            paymentUrl: `${PAYMENT_CONFIGS.jazzcash.apiUrl}/CheckoutPage`,
            payload,
            transactionId
        });
        
    } catch (error) {
        console.error('JazzCash initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate JazzCash payment'
        });
    }
});

// JazzCash payment verification
router.post('/jazzcash/verify', async (req, res) => {
    try {
        const { pp_TxnRefNo, pp_ResponseCode, pp_ResponseMsg, pp_SecureHash } = req.body;
        
        // Verify secure hash
        const sortedPayload = Object.keys(req.body)
            .sort()
            .filter(key => key !== 'pp_SecureHash')
            .map(key => `${key}=${req.body[key]}`)
            .join('&');
        
        const expectedHash = crypto
            .createHash('sha256')
            .update(sortedPayload + PAYMENT_CONFIGS.jazzcash.integritySalt)
            .digest('hex');
        
        if (pp_SecureHash !== expectedHash) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
        
        // Update order status
        const order = await Order.findOne({ 'payment.transactionId': pp_TxnRefNo });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        const isSuccessful = pp_ResponseCode === '000';
        
        await Order.updateOne(
            { 'payment.transactionId': pp_TxnRefNo },
            {
                $set: {
                    'payment.status': isSuccessful ? 'completed' : 'failed',
                    'payment.responseCode': pp_ResponseCode,
                    'payment.responseMessage': pp_ResponseMsg,
                    'payment.verifiedAt': new Date(),
                    'status': isSuccessful ? 'confirmed' : 'payment_failed'
                }
            }
        );
        
        if (isSuccessful) {
            // Send confirmation email and WhatsApp
            await sendOrderConfirmationEmail(order);
            await sendWhatsAppMessage(order);
        }
        
        res.json({
            success: true,
            status: isSuccessful ? 'success' : 'failed',
            orderId: order.orderId,
            redirectUrl: `${process.env.FRONTEND_URL}/payment/${isSuccessful ? 'success' : 'failed'}?orderId=${order.orderId}`
        });
        
    } catch (error) {
        console.error('JazzCash verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify JazzCash payment'
        });
    }
});

// EasyPaisa payment initiation
router.post('/easypaisa/initiate', verifyPaymentRequest, async (req, res) => {
    try {
        const { amount, orderId, mobileNumber, email } = req.body;
        
        const transactionId = `EP${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        
        // EasyPaisa API call
        const response = await fetch(`${PAYMENT_CONFIGS.easypaisa.apiUrl}/api/v2/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PAYMENT_CONFIGS.easypaisa.apiKey}`
            },
            body: JSON.stringify({
                storeId: PAYMENT_CONFIGS.easypaisa.storeId,
                transactionId,
                amount,
                currency: 'PKR',
                description: 'GBDRYFRUITS Order Payment',
                customerEmail: email,
                customerMobile: mobileNumber,
                returnUrl: `${process.env.FRONTEND_URL}/payment/easypaisa/return`,
                cancelUrl: `${process.env.FRONTEND_URL}/payment/easypaisa/cancel`,
                callbackUrl: `${process.env.BACKEND_URL}/api/payments/easypaisa/callback`
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await Order.findOneAndUpdate(
                { orderId },
                {
                    $set: {
                        'payment.gateway': 'easypaisa',
                        'payment.transactionId': transactionId,
                        'payment.amount': amount,
                        'payment.status': 'pending',
                        'payment.details': data
                    }
                }
            );
            
            res.json({
                success: true,
                paymentUrl: data.paymentUrl,
                transactionId
            });
        } else {
            res.status(400).json({
                success: false,
                message: data.message || 'Failed to initiate EasyPaisa payment'
            });
        }
        
    } catch (error) {
        console.error('EasyPaisa initiation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate EasyPaisa payment'
        });
    }
});

// EasyPaisa callback
router.post('/easypaisa/callback', async (req, res) => {
    try {
        const { transactionId, status, orderId } = req.body;
        
        const order = await Order.findOne({ 'payment.transactionId': transactionId });
        
        if (!order) {
            return res.status(404).json({ success: false });
        }
        
        const isSuccessful = status === 'SUCCESS';
        
        await Order.updateOne(
            { 'payment.transactionId': transactionId },
            {
                $set: {
                    'payment.status': isSuccessful ? 'completed' : 'failed',
                    'payment.callbackData': req.body,
                    'payment.verifiedAt': new Date(),
                    'status': isSuccessful ? 'confirmed' : 'payment_failed'
                }
            }
        );
        
        if (isSuccessful) {
            await sendOrderConfirmationEmail(order);
            await sendWhatsAppMessage(order);
        }
        
        res.json({ success: true });
        
    } catch (error) {
        console.error('EasyPaisa callback error:', error);
        res.status(500).json({ success: false });
    }
});

// Stripe payment intent creation
router.post('/stripe/create-intent', verifyPaymentRequest, async (req, res) => {
    try {
        const { amount, orderId, email } = req.body;
        
        // Convert PKR to cents (Stripe expects amount in smallest currency unit)
        const amountInCents = Math.round(amount * 100);
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'pkr',
            metadata: {
                orderId,
                merchant: 'GBDRYFRUITS'
            },
            receipt_email: email,
            automatic_payment_methods: {
                enabled: true
            }
        });
        
        await Order.findOneAndUpdate(
            { orderId },
            {
                $set: {
                    'payment.gateway': 'stripe',
                    'payment.transactionId': paymentIntent.id,
                    'payment.amount': amount,
                    'payment.status': 'pending',
                    'payment.clientSecret': paymentIntent.client_secret
                }
            }
        );
        
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            transactionId: paymentIntent.id
        });
        
    } catch (error) {
        console.error('Stripe payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment intent'
        });
    }
});

// Stripe webhook handler
router.post('/stripe/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Stripe webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                await handleStripePaymentSuccess(paymentIntent);
                break;
                
            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                await handleStripePaymentFailure(failedPayment);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (error) {
        console.error('Stripe webhook processing error:', error);
    }
    
    res.json({ received: true });
});

// Handle Stripe payment success
async function handleStripePaymentSuccess(paymentIntent) {
    const { orderId } = paymentIntent.metadata;
    
    await Order.updateOne(
        { orderId },
        {
            $set: {
                'payment.status': 'completed',
                'payment.stripePaymentIntent': paymentIntent,
                'payment.verifiedAt': new Date(),
                'status': 'confirmed'
            }
        }
    );
    
    const order = await Order.findOne({ orderId });
    if (order) {
        await sendOrderConfirmationEmail(order);
        await sendWhatsAppMessage(order);
    }
}

// Handle Stripe payment failure
async function handleStripePaymentFailure(paymentIntent) {
    const { orderId } = paymentIntent.metadata;
    
    await Order.updateOne(
        { orderId },
        {
            $set: {
                'payment.status': 'failed',
                'payment.stripePaymentIntent': paymentIntent,
                'payment.verifiedAt': new Date(),
                'status': 'payment_failed'
            }
        }
    );
}

// PayPal payment creation
router.post('/paypal/create-order', verifyPaymentRequest, async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        
        // Get PayPal access token
        const auth = Buffer.from(
            `${PAYMENT_CONFIGS.paypal.clientId}:${PAYMENT_CONFIGS.paypal.clientSecret}`
        ).toString('base64');
        
        const tokenResponse = await fetch(`${PAYMENT_CONFIGS.paypal.apiUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            throw new Error('Failed to get PayPal access token');
        }
        
        // Create PayPal order
        const orderResponse = await fetch(`${PAYMENT_CONFIGS.paypal.apiUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: orderId,
                    description: 'GBDRYFRUITS Order Payment',
                    amount: {
                        currency_code: 'USD',
                        value: (amount / 280).toFixed(2) // Convert PKR to USD (approximate rate)
                    }
                }],
                application_context: {
                    brand_name: 'GBDRYFRUITS',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                    return_url: `${process.env.FRONTEND_URL}/payment/paypal/return`,
                    cancel_url: `${process.env.FRONTEND_URL}/payment/paypal/cancel`
                }
            })
        });
        
        const orderData = await orderResponse.json();
        
        if (orderData.id) {
            await Order.findOneAndUpdate(
                { orderId },
                {
                    $set: {
                        'payment.gateway': 'paypal',
                        'payment.transactionId': orderData.id,
                        'payment.amount': amount,
                        'payment.status': 'pending',
                        'payment.paypalOrder': orderData
                    }
                }
            );
            
            res.json({
                success: true,
                paypalOrderId: orderData.id,
                approvalUrl: orderData.links.find(link => link.rel === 'approve').href
            });
        } else {
            res.status(400).json({
                success: false,
                message: orderData.message || 'Failed to create PayPal order'
            });
        }
        
    } catch (error) {
        console.error('PayPal order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create PayPal order'
        });
    }
});

// PayPal payment capture
router.post('/paypal/capture', async (req, res) => {
    try {
        const { paypalOrderId, orderId } = req.body;
        
        // Get PayPal access token
        const auth = Buffer.from(
            `${PAYMENT_CONFIGS.paypal.clientId}:${PAYMENT_CONFIGS.paypal.clientSecret}`
        ).toString('base64');
        
        const tokenResponse = await fetch(`${PAYMENT_CONFIGS.paypal.apiUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        
        const tokenData = await tokenResponse.json();
        
        // Capture payment
        const captureResponse = await fetch(
            `${PAYMENT_CONFIGS.paypal.apiUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const captureData = await captureResponse.json();
        
        const isSuccessful = captureData.status === 'COMPLETED';
        
        await Order.updateOne(
            { orderId },
            {
                $set: {
                    'payment.status': isSuccessful ? 'completed' : 'failed',
                    'payment.paypalCapture': captureData,
                    'payment.verifiedAt': new Date(),
                    'status': isSuccessful ? 'confirmed' : 'payment_failed'
                }
            }
        );
        
        if (isSuccessful) {
            const order = await Order.findOne({ orderId });
            if (order) {
                await sendOrderConfirmationEmail(order);
                await sendWhatsAppMessage(order);
            }
        }
        
        res.json({
            success: isSuccessful,
            status: captureData.status,
            orderId
        });
        
    } catch (error) {
        console.error('PayPal capture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to capture PayPal payment'
        });
    }
});

// COD order processing
router.post('/cod/process', async (req, res) => {
    try {
        const { orderId, shippingInfo, orderTotal } = req.body;
        
        // Verify COD availability for the city
        const cityLower = shippingInfo.city.toLowerCase();
        const codInfo = COD_CITIES[cityLower];
        
        if (!codInfo || !codInfo.available) {
            return res.status(400).json({
                success: false,
                message: 'COD not available in this city'
            });
        }
        
        // Update order with COD details
        await Order.updateOne(
            { orderId },
            {
                $set: {
                    'payment.gateway': 'cod',
                    'payment.status': 'pending',
                    'payment.amount': orderTotal,
                    'payment.deliveryCharges': codInfo.charges,
                    'payment.expectedDeliveryDays': codInfo.deliveryDays,
                    'payment.codConfirmed': true,
                    'status': 'confirmed',
                    'shipping': shippingInfo
                }
            }
        );
        
        const order = await Order.findOne({ orderId });
        
        // Send confirmation
        await sendOrderConfirmationEmail(order);
        await sendWhatsAppMessage(order);
        
        res.json({
            success: true,
            message: 'COD order placed successfully',
            deliveryDays: codInfo.deliveryDays,
            charges: codInfo.charges
        });
        
    } catch (error) {
        console.error('COD processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process COD order'
        });
    }
});

// Get payment status
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findOne({ orderId }).select('payment status');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            paymentStatus: order.payment.status,
            paymentGateway: order.payment.gateway,
            orderStatus: order.status,
            amount: order.payment.amount,
            transactionId: order.payment.transactionId
        });
        
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status'
        });
    }
});

// Payment retry
router.post('/retry/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newPaymentMethod } = req.body;
        
        const order = await Order.findOne({ orderId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        if (order.payment.status !== 'failed') {
            return res.status(400).json({
                success: false,
                message: 'Only failed payments can be retried'
            });
        }
        
        // Reset payment details for retry
        await Order.updateOne(
            { orderId },
            {
                $set: {
                    'payment.gateway': newPaymentMethod,
                    'payment.status': 'pending',
                    'payment.transactionId': null,
                    'payment.clientSecret': null,
                    'payment.verifiedAt': null,
                    'payment.responseCode': null,
                    'payment.responseMessage': null
                }
            }
        );
        
        res.json({
            success: true,
            message: 'Payment reset for retry',
            newPaymentMethod
        });
        
    } catch (error) {
        console.error('Payment retry error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retry payment'
        });
    }
});

module.exports = router;
