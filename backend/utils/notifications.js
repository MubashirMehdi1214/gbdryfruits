const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Initialize email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Initialize Twilio for WhatsApp (disabled for now)
// const twilioClient = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
// );

// Email templates
const getEmailTemplate = (type, data) => {
    const templates = {
        orderConfirmation: {
            subject: `Order Confirmation - GBDRYFRUITS - Order #${data.orderId}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Confirmation</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2D5016; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                        .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                        .order-details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
                        .item-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .item-row:last-child { border-bottom: none; }
                        .total-row { font-weight: bold; font-size: 18px; color: #2D5016; margin-top: 20px; }
                        .btn { display: inline-block; padding: 12px 30px; background: #2D5016; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .payment-badge { background: #27AE60; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; }
                        .delivery-info { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🌰 GBDRYFRUITS</div>
                            <h1>Order Confirmation</h1>
                            <p>Thank you for your order! We're preparing your premium dry fruits.</p>
                        </div>
                        
                        <div class="content">
                            <h2>Order Details</h2>
                            <p><strong>Order Number:</strong> #${data.orderId}</p>
                            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Payment Method:</strong> <span class="payment-badge">${data.paymentMethod}</span></p>
                            
                            <div class="order-details">
                                <h3>Items Ordered</h3>
                                ${data.items.map(item => `
                                    <div class="item-row">
                                        <div>
                                            <strong>${item.name}</strong><br>
                                            <small>${item.weight} × ${item.quantity}</small>
                                        </div>
                                        <div>Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                `).join('')}
                                
                                <div class="item-row total-row">
                                    <div>Total Amount</div>
                                    <div>Rs. ${data.total.toLocaleString()}</div>
                                </div>
                            </div>
                            
                            <div class="delivery-info">
                                <h3>📦 Delivery Information</h3>
                                <p><strong>Estimated Delivery:</strong> ${data.deliveryDays} business days</p>
                                <p><strong>Delivery Address:</strong></p>
                                <p>${data.shipping.firstName} ${data.shipping.lastName}</p>
                                <p>${data.shipping.address}</p>
                                <p>${data.shipping.city}, ${data.shipping.postalCode}</p>
                                <p>📞 ${data.shipping.phone}</p>
                            </div>
                            
                            ${data.paymentMethod === 'COD' ? `
                                <div class="delivery-info" style="background: #fff3cd;">
                                    <h3>💵 Cash on Delivery</h3>
                                    <p>Please keep the exact amount ready. Our delivery agent will accept cash and provide a receipt.</p>
                                    <p><strong>Total to Pay:</strong> Rs. ${data.total.toLocaleString()}</p>
                                </div>
                            ` : ''}
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL}/track-order/${data.orderId}" class="btn">Track Your Order</a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 GBDRYFRUITS. All rights reserved.</p>
                            <p>Premium Dry Fuits & Nuts | 100% Quality Guaranteed</p>
                            <p>Need help? Contact us: +92 300 1234567 | support@gbdryfruits.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        },
        
        orderShipped: {
            subject: `Your Order Has Been Shipped - GBDRYFRUITS - Order #${data.orderId}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Shipped</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #2D5016; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                        .tracking-info { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .btn { display: inline-block; padding: 12px 30px; background: #2D5016; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🌰 GBDRYFRUITS</div>
                            <h1>🚚 Your Order Has Been Shipped!</h1>
                            <p>Great news! Your premium dry fruits are on their way.</p>
                        </div>
                        
                        <div class="content">
                            <h2>Shipping Details</h2>
                            <p><strong>Order Number:</strong> #${data.orderId}</p>
                            <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                            <p><strong>Carrier:</strong> ${data.carrier}</p>
                            <p><strong>Shipped Date:</strong> ${new Date().toLocaleDateString()}</p>
                            
                            <div class="tracking-info">
                                <h3>📍 Track Your Package</h3>
                                <p>Track your order in real-time using the tracking number above.</p>
                                <div style="text-align: center;">
                                    <a href="${data.trackingUrl}" class="btn">Track Package</a>
                                </div>
                            </div>
                            
                            <h3>📦 What's Next?</h3>
                            <ul>
                                <li>Your order will arrive within 1-2 business days</li>
                                <li>You'll receive SMS updates on delivery progress</li>
                                <li>Please ensure someone is available to receive the package</li>
                                ${data.paymentMethod === 'COD' ? '<li>Keep the exact amount ready for payment</li>' : ''}
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 GBDRYFRUITS. All rights reserved.</p>
                            <p>Questions? Contact us: +92 300 1234567 | support@gbdryfruits.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        },
        
        orderDelivered: {
            subject: `Order Delivered - GBDRYFRUITS - Order #${data.orderId}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Order Delivered</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #27AE60; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                        .review-section { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .btn { display: inline-block; padding: 12px 30px; background: #2D5016; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🌰 GBDRYFRUITS</div>
                            <h1>✅ Order Delivered Successfully!</h1>
                            <p>Your premium dry fruits have been delivered. Enjoy!</p>
                        </div>
                        
                        <div class="content">
                            <h2>Delivery Confirmation</h2>
                            <p><strong>Order Number:</strong> #${data.orderId}</p>
                            <p><strong>Delivered Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><strong>Delivered To:</strong> ${data.deliveryAddress}</p>
                            
                            <div class="review-section">
                                <h3>⭐ Share Your Experience</h3>
                                <p>How was your order? Your feedback helps us improve!</p>
                                <div style="text-align: center;">
                                    <a href="${process.env.FRONTEND_URL}/review/${data.orderId}" class="btn">Leave a Review</a>
                                </div>
                            </div>
                            
                            <h3>🎉 Special Offer Just For You!</h3>
                            <p>Thank you for choosing GBDRYFRUITS! Here's a special discount on your next order:</p>
                            <div style="text-align: center; background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <h4 style="color: #856404;">Use Code: <strong>THANKYOU10</strong></h4>
                                <p>Get 10% off your next order!</p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 GBDRYFRUITS. All rights reserved.</p>
                            <p>Questions? Contact us: +92 300 1234567 | support@gbdryfruits.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        }
    };
    
    return templates[type];
};

// WhatsApp message templates
const getWhatsAppTemplate = (type, data) => {
    const templates = {
        orderConfirmation: `
🌰 *GBDRYFRUITS - Order Confirmed!*

Thank you for your order! 🎉

*Order Details:*
📋 Order #: ${data.orderId}
📅 Date: ${new Date().toLocaleDateString()}
💳 Payment: ${data.paymentMethod}
💰 Total: Rs. ${data.total.toLocaleString()}

*Delivery Information:*
📦 Estimated Delivery: ${data.deliveryDays} business days
🏠 Address: ${data.shipping.address}
📞 Phone: ${data.shipping.phone}

*Items:*
${data.items.map(item => `• ${item.name} (${item.weight} × ${item.quantity})`).join('\n')}

${data.paymentMethod === 'COD' ? `
💵 *Cash on Delivery*
Please keep Rs. ${data.total.toLocaleString()} ready for payment.
` : ''}

Track your order: ${process.env.FRONTEND_URL}/track-order/${data.orderId}

Need help? Call us: +92 300 1234567
        `,
        
        orderShipped: `
🚚 *Your Order Has Been Shipped!*

Great news! Your order is on the way.

*Shipping Details:*
📋 Order #: ${data.orderId}
📦 Tracking #: ${data.trackingNumber}
🚚 Carrier: ${data.carrier}
📅 Shipped: ${new Date().toLocaleDateString()}

Track here: ${data.trackingUrl}

Expected delivery: 1-2 business days
        `,
        
        orderDelivered: `
✅ *Order Delivered Successfully!*

Your premium dry fruits have been delivered! 🎉

*Order Details:*
📋 Order #: ${data.orderId}
✅ Delivered: ${new Date().toLocaleDateString()}
🏠 To: ${data.deliveryAddress}

Thank you for choosing GBDRYFRUITS! 

⭐ *Special Offer:* Use code THANKYOU10 for 10% off your next order!

Questions? Call us: +92 300 1234567
        `
    };
    
    return templates[type];
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (order) => {
    try {
        const template = getEmailTemplate('orderConfirmation', {
            orderId: order.orderId,
            items: order.items,
            total: order.payment.amount,
            paymentMethod: order.payment.gateway.toUpperCase(),
            shipping: order.shipping,
            deliveryDays: order.payment.expectedDeliveryDays || 3
        });
        
        const mailOptions = {
            from: `"GBDRYFRUITS" <${process.env.SMTP_USER}>`,
            to: order.shipping.email,
            subject: template.subject,
            html: template.html
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent for order ${order.orderId}`);
        
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
    }
};

// Send order shipped email
const sendOrderShippedEmail = async (order, trackingInfo) => {
    try {
        const template = getEmailTemplate('orderShipped', {
            orderId: order.orderId,
            trackingNumber: trackingInfo.trackingNumber,
            carrier: trackingInfo.carrier,
            trackingUrl: trackingInfo.trackingUrl,
            paymentMethod: order.payment.gateway.toUpperCase()
        });
        
        const mailOptions = {
            from: `"GBDRYFRUITS" <${process.env.SMTP_USER}>`,
            to: order.shipping.email,
            subject: template.subject,
            html: template.html
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Order shipped email sent for order ${order.orderId}`);
        
    } catch (error) {
        console.error('Failed to send order shipped email:', error);
    }
};

// Send order delivered email
const sendOrderDeliveredEmail = async (order) => {
    try {
        const template = getEmailTemplate('orderDelivered', {
            orderId: order.orderId,
            deliveryAddress: `${order.shipping.address}, ${order.shipping.city}`
        });
        
        const mailOptions = {
            from: `"GBDRYFRUITS" <${process.env.SMTP_USER}>`,
            to: order.shipping.email,
            subject: template.subject,
            html: template.html
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Order delivered email sent for order ${order.orderId}`);
        
    } catch (error) {
        console.error('Failed to send order delivered email:', error);
    }
};

// Send WhatsApp message
const sendWhatsAppMessage = async (order, type = 'orderConfirmation') => {
    try {
        // Format phone number (remove +92 and spaces)
        const phoneNumber = order.shipping.phone.replace(/[^0-9]/g, '');
        const formattedPhone = phoneNumber.startsWith('92') ? phoneNumber : `92${phoneNumber}`;
        
        const message = getWhatsAppTemplate(type, {
            orderId: order.orderId,
            items: order.items,
            total: order.payment.amount,
            paymentMethod: order.payment.gateway.toUpperCase(),
            shipping: order.shipping,
            deliveryDays: order.payment.expectedDeliveryDays || 3,
            deliveryAddress: `${order.shipping.address}, ${order.shipping.city}`
        });
        
        // Send via Twilio WhatsApp
        const twilioMessage = await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:+${formattedPhone}`
        });
        
        console.log(`WhatsApp message sent for order ${order.orderId}, SID: ${twilioMessage.sid}`);
        
        return twilioMessage;
        
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
        
        // Fallback to SMS if WhatsApp fails
        try {
            const phoneNumber = order.shipping.phone.replace(/[^0-9]/g, '');
            const formattedPhone = phoneNumber.startsWith('92') ? phoneNumber : `92${phoneNumber}`;
            
            const message = `GBDRYFRUITS: Order #${order.orderId} confirmed! Total: Rs. ${order.payment.amount.toLocaleString()}. Delivery in ${order.payment.expectedDeliveryDays || 3} days. Track: ${process.env.FRONTEND_URL}/track-order/${order.orderId}`;
            
            const smsMessage = await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: `+${formattedPhone}`
            });
            
            console.log(`SMS sent as fallback for order ${order.orderId}, SID: ${smsMessage.sid}`);
            return smsMessage;
            
        } catch (smsError) {
            console.error('Failed to send SMS fallback:', smsError);
        }
    }
};

// Send abandoned checkout recovery email
const sendAbandonedCheckoutEmail = async (user, cartItems) => {
    try {
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        const template = {
            subject: 'Complete Your Order - GBDRYFRUITS',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Complete Your Order</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #F39C12; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                        .offer { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
                        .btn { display: inline-block; padding: 12px 30px; background: #2D5016; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .urgency { color: #e74c3c; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🌰 GBDRYFRUITS</div>
                            <h1>Complete Your Order!</h1>
                            <p>Your premium dry fruits are waiting for you.</p>
                        </div>
                        
                        <div class="content">
                            <h2>Don't Miss Out! 🏃‍♂️</h2>
                            <p>We noticed you left some delicious items in your cart. Complete your order now before they sell out!</p>
                            
                            <div class="offer">
                                <h3>⏰ Limited Time Offer</h3>
                                <p>Complete your order in the next <span class="urgency">2 hours</span> and get <strong>FREE SHIPPING!</strong></p>
                                <p><strong>Use Code:</strong> <span style="font-size: 18px; color: #2D5016;">COMPLETE24</span></p>
                            </div>
                            
                            <h3>Items in Your Cart:</h3>
                            ${cartItems.map(item => `
                                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                                    <div>
                                        <strong>${item.name}</strong><br>
                                        <small>${item.weight} × ${item.quantity}</small>
                                    </div>
                                    <div>Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                                </div>
                            `).join('')}
                            
                            <div style="text-align: center; margin: 20px 0;">
                                <h3>Total: Rs. ${subtotal.toLocaleString()}</h3>
                                <a href="${process.env.FRONTEND_URL}/checkout-professional.html" class="btn">Complete Order Now</a>
                            </div>
                            
                            <p style="text-align: center; color: #666;">
                                <small>This offer expires in 2 hours. Don't miss out!</small>
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 GBDRYFRUITS. All rights reserved.</p>
                            <p>Premium Dry Fuits & Nuts | 100% Quality Guaranteed</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const mailOptions = {
            from: `"GBDRYFRUITS" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: template.subject,
            html: template.html
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Abandoned checkout email sent to ${user.email}`);
        
    } catch (error) {
        console.error('Failed to send abandoned checkout email:', error);
    }
};

// Send OTP verification
const sendOTPVerification = async (phoneNumber, otp) => {
    try {
        const formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
        const cleanPhone = formattedPhone.startsWith('92') ? formattedPhone : `92${formattedPhone}`;
        
        const message = `GBDRYFRUITS: Your verification code is ${otp}. Valid for 5 minutes. Do not share this code with anyone.`;
        
        const smsMessage = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+${cleanPhone}`
        });
        
        console.log(`OTP sent to ${phoneNumber}, SID: ${smsMessage.sid}`);
        return smsMessage;
        
    } catch (error) {
        console.error('Failed to send OTP:', error);
        throw error;
    }
};

// Send payment failure notification
const sendPaymentFailureNotification = async (order) => {
    try {
        const template = {
            subject: `Payment Failed - GBDRYFRUITS - Order #${order.orderId}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Failed</title>
                    <style>
                        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
                        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
                        .btn { display: inline-block; padding: 12px 30px; background: #2D5016; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .error-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🌰 GBDRYFRUITS</div>
                            <h1>Payment Failed</h1>
                            <p>We couldn't process your payment. Don't worry, your order is still safe!</p>
                        </div>
                        
                        <div class="content">
                            <h2>Payment Issue Detected</h2>
                            <p><strong>Order Number:</strong> #${order.orderId}</p>
                            <p><strong>Payment Method:</strong> ${order.payment.gateway.toUpperCase()}</p>
                            <p><strong>Amount:</strong> Rs. ${order.payment.amount.toLocaleString()}</p>
                            
                            <div class="error-box">
                                <h3>What Happened?</h3>
                                <p>Your payment couldn't be processed due to one of these reasons:</p>
                                <ul>
                                    <li>Insufficient funds</li>
                                    <li>Incorrect card details</li>
                                    <li>Bank declined the transaction</li>
                                    <li>Network connectivity issues</li>
                                </ul>
                            </div>
                            
                            <h3>What Can You Do?</h3>
                            <ol>
                                <li>Check your payment details and try again</li>
                                <li>Use a different payment method</li>
                                <li>Contact your bank if the issue persists</li>
                            </ol>
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL}/checkout-professional.html" class="btn">Try Payment Again</a>
                            </div>
                            
                            <p style="text-align: center; color: #666;">
                                Your order will be held for 24 hours. After that, it may be cancelled.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2024 GBDRYFRUITS. All rights reserved.</p>
                            <p>Need help? Contact us: +92 300 1234567 | support@gbdryfruits.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const mailOptions = {
            from: `"GBDRYFRUITS" <${process.env.SMTP_USER}>`,
            to: order.shipping.email,
            subject: template.subject,
            html: template.html
        };
        
        await transporter.sendMail(mailOptions);
        
        // Also send WhatsApp notification
        await sendWhatsAppMessage(order, 'paymentFailure');
        
        console.log(`Payment failure notification sent for order ${order.orderId}`);
        
    } catch (error) {
        console.error('Failed to send payment failure notification:', error);
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderShippedEmail,
    sendOrderDeliveredEmail,
    sendWhatsAppMessage,
    sendAbandonedCheckoutEmail,
    sendOTPVerification,
    sendPaymentFailureNotification
};
