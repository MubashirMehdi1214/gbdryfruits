# 🏦 Professional Payment Gateway Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Pakistani Payment Gateways](#pakistani-payment-gateways)
4. [International Payment Gateways](#international-payment-gateways)
5. [Cash on Delivery Configuration](#cash-on-delivery-configuration)
6. [Security & SSL Setup](#security--ssl-setup)
7. [Testing & Sandbox](#testing--sandbox)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

GBDRYFRUITS supports multiple payment gateways to provide customers with flexible payment options:

### 🇵🇰 Pakistani Payment Methods
- **JazzCash** - Mobile wallet with 1.5% transaction fee
- **EasyPaisa** - Mobile wallet with 1.8% transaction fee
- **UBL Omni** - Digital banking with 1.2% transaction fee
- **Meezan Bank** - Islamic banking with 1.8% transaction fee
- **Bank Alfalah** - Online banking with 2.0% transaction fee

### 🌍 International Payment Methods
- **Stripe** - Cards, Apple Pay, Google Pay (1.5-2.9% fee)
- **PayPal** - Global wallet (3.4-4.4% fee)
- **Visa/MasterCard** - Direct card processing
- **UnionPay** - Chinese card network

### 💵 Cash on Delivery (COD)
- Available in major Pakistani cities
- Free delivery on orders above Rs. 1000
- Delivery within 1-4 business days

---

## 🛠️ Environment Setup

### 1. Environment Variables

Create a `.env` file in your backend directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://gbdryfruits.com
BACKEND_URL=https://api.gbdryfruits.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gbdryfruits

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# SSL Configuration
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
SSL_CA_PATH=/path/to/ssl/ca.pem
```

### 2. Install Dependencies

```bash
# Backend dependencies
npm install express mongoose stripe paypal-rest-sdk twilio nodemailer
npm install crypto jsonwebtoken bcryptjs cors helmet rate-limit
npm install dotenv winston morgan compression

# Development dependencies
npm install -D nodemon jest supertest
```

---

## 🇵🇰 Pakistani Payment Gateways

### 📱 JazzCash Setup

#### 1. Account Registration
1. Visit [JazzCash Merchant Portal](https://jazzcash.com.pk/merchant)
2. Register as a business merchant
3. Complete KYC verification
4. Submit business documents

#### 2. API Credentials
```bash
# Add to .env file
JAZZCASH_ENABLED=true
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
```

#### 3. Webhook Configuration
- **Production URL**: `https://api.gbdryfruits.com/api/payments/jazzcash/verify`
- **Sandbox URL**: `https://sandbox-api.gbdryfruits.com/api/payments/jazzcash/verify`
- **Method**: POST
- **Content-Type**: application/x-www-form-urlencoded

#### 4. Testing
```javascript
// Test transaction
const testPayment = {
    pp_Amount: 10000, // Rs. 100
    pp_BillReference: 'TEST123',
    pp_Description: 'Test Payment',
    pp_MerchantID: process.env.JAZZCASH_MERCHANT_ID,
    pp_Password: process.env.JAZZCASH_PASSWORD,
    pp_TxnRefNo: 'JC' + Date.now(),
    pp_TxnType: 'MWALLET'
};
```

### 📱 EasyPaisa Setup

#### 1. Account Registration
1. Visit [EasyPaisa Business Portal](https://easypaisa.com.pk/business)
2. Register your business
3. Complete verification process
4. Get API credentials

#### 2. API Credentials
```bash
# Add to .env file
EASYPAISA_ENABLED=true
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_API_KEY=your_api_key
EASYPAISA_SECRET_KEY=your_secret_key
```

#### 3. Webhook Configuration
- **URL**: `https://api.gbdryfruits.com/api/payments/easypaisa/callback`
- **Events**: payment.success, payment.failed, payment.cancelled

### 🏦 UBL Omni Setup

#### 1. Account Registration
1. Contact UBL Business Banking
2. Apply for UBL Omni merchant account
3. Submit business documentation
4. Complete integration process

#### 2. API Credentials
```bash
# Add to .env file
UBL_ENABLED=true
UBL_MERCHANT_ID=your_merchant_id
UBL_API_KEY=your_api_key
UBL_SECRET_KEY=your_secret_key
```

### 🏦 Meezan Bank Setup

#### 1. Account Registration
1. Visit [Meezan Bank Business Portal](https://meezanbank.com/business)
2. Apply for online payment gateway
3. Complete Islamic banking requirements
4. Get API credentials

#### 2. API Credentials
```bash
# Add to .env file
MEEZAN_ENABLED=true
MEEZAN_MERCHANT_ID=your_merchant_id
MEEZAN_API_KEY=your_api_key
MEEZAN_SECRET_KEY=your_secret_key
```

### 🏦 Bank Alfalah Setup

#### 1. Account Registration
1. Visit [Bank Alfalah Merchant Portal](https://bankalfalah.com/merchant)
2. Register for Alfa Payment Gateway
3. Complete documentation
4. Get API credentials

#### 2. API Credentials
```bash
# Add to .env file
BANKALFALAH_ENABLED=true
BANKALFALAH_MERCHANT_ID=your_merchant_id
BANKALFALAH_API_KEY=your_api_key
BANKALFALAH_SECRET_KEY=your_secret_key
```

---

## 🌍 International Payment Gateways

### 💳 Stripe Setup

#### 1. Account Registration
1. Visit [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account and complete verification
3. Enable PKR currency support
4. Configure business details

#### 2. API Credentials
```bash
# Add to .env file
STRIPE_ENABLED=true
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### 3. Webhook Configuration
- **Production URL**: `https://api.gbdryfruits.com/api/payments/stripe/webhook`
- **Events to listen**:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`

#### 4. Enable Payment Methods
```javascript
// In your Stripe dashboard, enable:
- Cards (Visa, MasterCard, UnionPay)
- Apple Pay
- Google Pay
- Alipay (for international customers)
```

### 🌐 PayPal Setup

#### 1. Account Registration
1. Visit [PayPal Developer Dashboard](https://developer.paypal.com)
2. Create business account
3. Complete verification
4. Create REST API credentials

#### 2. API Credentials
```bash
# Add to .env file
PAYPAL_ENABLED=true
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
```

#### 3. Webhook Configuration
- **Production URL**: `https://api.gbdryfruits.com/api/payments/paypal/webhook`
- **Events**:
  - `PAYMENT.AUTHORIZATION.CREATED`
  - `PAYMENT.AUTHORIZATION.VOIDED`
  - `PAYMENT.SALE.COMPLETED`

#### 4. Currency Configuration
- **Primary Currency**: USD (PayPal doesn't support PKR directly)
- **Auto-conversion**: Enabled (PKR → USD at current rate)

---

## 💵 Cash on Delivery Configuration

### 1. City Configuration

```javascript
// COD availability by city
const COD_CITIES = {
    karachi: { 
        available: true, 
        deliveryDays: 2, 
        charges: 0, 
        minOrderAmount: 500 
    },
    lahore: { 
        available: true, 
        deliveryDays: 2, 
        charges: 0, 
        minOrderAmount: 500 
    },
    islamabad: { 
        available: true, 
        deliveryDays: 1, 
        charges: 0, 
        minOrderAmount: 500 
    },
    // ... more cities
};
```

### 2. Delivery Partner Integration

```bash
# Add to .env file
COD_ENABLED=true
TCS_API_KEY=your_tcs_api_key
LEOPARDS_API_KEY=your_leopards_api_key
BLUEEX_API_KEY=your_blueex_api_key
```

### 3. WhatsApp Confirmation

```bash
# Add to .env file
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
```

---

## 🔒 Security & SSL Setup

### 1. SSL Certificate Installation

```bash
# Using Let's Encrypt
sudo certbot --nginx -d gbdryfruits.com -d api.gbdryfruits.com

# Manual SSL installation
sudo cp /path/to/cert.pem /etc/ssl/certs/gbdryfruits.com.crt
sudo cp /path/to/private.key /etc/ssl/private/gbdryfruits.com.key
```

### 2. Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name gbdryfruits.com;
    
    ssl_certificate /etc/ssl/certs/gbdryfruits.com.crt;
    ssl_certificate_key /etc/ssl/private/gbdryfruits.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Security Headers

```javascript
// In your Express app
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://www.paypal.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com", "https://api.paypal.com"]
        }
    }
}));
```

---

## 🧪 Testing & Sandbox

### 1. Sandbox Accounts

#### JazzCash Sandbox
- **Merchant ID**: TEST_MERCHANT_ID
- **Password**: TEST_PASSWORD
- **Integrity Salt**: TEST_SALT

#### EasyPaisa Sandbox
- **Store ID**: TEST_STORE_ID
- **API Key**: TEST_API_KEY

#### Stripe Test Cards
```
Card Number: 4242424242424242 (Visa)
Expiry: Any future date
CVC: Any 3 digits
```

#### PayPal Sandbox
- Create test accounts in PayPal Developer Dashboard
- Use buyer account for testing payments

### 2. Test Scenarios

```javascript
// Test payment flow
const testScenarios = [
    {
        name: 'Successful Payment',
        amount: 1000,
        method: 'jazzcash',
        expected: 'success'
    },
    {
        name: 'Insufficient Funds',
        amount: 1000000,
        method: 'stripe',
        expected: 'failed'
    },
    {
        name: 'Invalid Card',
        cardNumber: '4000000000000002',
        expected: 'failed'
    },
    {
        name: 'COD Valid City',
        city: 'karachi',
        amount: 2000,
        expected: 'success'
    },
    {
        name: 'COD Invalid City',
        city: 'unknown',
        amount: 2000,
        expected: 'failed'
    }
];
```

### 3. Automated Testing

```javascript
// Jest test file: payments.test.js
describe('Payment Gateway Integration', () => {
    test('JazzCash payment initiation', async () => {
        const response = await request(app)
            .post('/api/payments/jazzcash/initiate')
            .send({
                amount: 1000,
                orderId: 'TEST123',
                mobileNumber: '03001234567'
            });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.paymentUrl).toBeDefined();
    });
});
```

---

## 📊 Monitoring & Analytics

### 1. Payment Analytics

```javascript
// Track payment metrics
const paymentMetrics = {
    totalRevenue: 0,
    transactionCount: 0,
    successRate: 0,
    gatewayUsage: {},
    averageOrderValue: 0
};

// Daily metrics calculation
const calculateDailyMetrics = async () => {
    const today = new Date();
    const payments = await Payment.find({
        createdAt: {
            $gte: new Date(today.setHours(0,0,0,0)),
            $lt: new Date(today.setHours(23,59,59,999))
        }
    });
    
    paymentMetrics.transactionCount = payments.length;
    paymentMetrics.totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    paymentMetrics.successRate = (payments.filter(p => p.status === 'completed').length / payments.length) * 100;
};
```

### 2. Error Monitoring

```javascript
// Error tracking
const trackPaymentError = async (error, gateway, orderId) => {
    await ErrorLog.create({
        type: 'payment_error',
        gateway,
        orderId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date()
    });
    
    // Send alert to admin
    await sendErrorAlert(error, gateway, orderId);
};
```

### 3. Performance Monitoring

```javascript
// Response time tracking
const trackPaymentPerformance = (gateway, startTime) => {
    const responseTime = Date.now() - startTime;
    
    console.log(`Payment performance for ${gateway}: ${responseTime}ms`);
    
    // Alert if slow
    if (responseTime > 5000) {
        sendPerformanceAlert(gateway, responseTime);
    }
};
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. JazzCash Payment Failures

**Issue**: Signature verification failed
```
Solution: Check integration salt and ensure proper sorting of parameters
```

**Issue**: Transaction timeout
```
Solution: Increase transaction expiry time to 30 minutes
```

#### 2. Stripe Payment Issues

**Issue**: Currency not supported
```
Solution: Enable PKR in Stripe dashboard or use USD with conversion
```

**Issue**: Webhook not received
```
Solution: Check webhook URL and ensure it's publicly accessible
```

#### 3. PayPal Integration Issues

**Issue**: Invalid client credentials
```
Solution: Verify sandbox vs production credentials
```

**Issue**: Currency conversion errors
```
Solution: Implement real-time exchange rate API
```

#### 4. COD Issues

**Issue**: Delivery not available
```
Solution: Check city configuration and delivery partner coverage
```

**Issue**: High COD failure rate
```
Solution: Implement address verification and phone confirmation
```

### Debug Mode

```javascript
// Enable debug logging
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`, req.body);
        next();
    });
}
```

### Health Checks

```javascript
// Payment gateway health check
const checkGatewayHealth = async () => {
    const gateways = ['jazzcash', 'easypaisa', 'stripe', 'paypal'];
    
    for (const gateway of gateways) {
        try {
            const response = await axios.get(`${getGatewayEndpoint(gateway)}/health`);
            console.log(`${gateway} status: ${response.data.status}`);
        } catch (error) {
            console.error(`${gateway} health check failed:`, error.message);
        }
    }
};
```

---

## 📞 Support & Contact

### Gateway Support Contacts
- **JazzCash**: merchantsupport@jazzcash.com.pk | 021-111-529-522
- **EasyPaisa**: business@easypaisa.com.pk | 021-111-003-777
- **Stripe**: support@stripe.com | +1-855-455-2994
- **PayPal**: business-support@paypal.com | +1-888-221-1161

### Technical Support
- **Email**: techsupport@gbdryfruits.com
- **Phone**: +92 300 1234567
- **Documentation**: https://docs.gbdryfruits.com/payments

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All API credentials configured
- [ ] SSL certificates installed
- [ ] Webhook endpoints configured
- [ ] Test transactions completed
- [ ] Error monitoring setup
- [ ] Performance monitoring enabled

### Post-Deployment
- [ ] Monitor transaction success rates
- [ ] Check webhook delivery
- [ ] Verify email notifications
- [ ] Test mobile responsiveness
- [ ] Load testing completed
- [ ] Security audit performed

---

## 📈 Optimization Tips

### 1. Reduce Cart Abandonment
- Offer multiple payment options
- Implement one-click checkout
- Show trust badges and security indicators
- Send abandoned cart recovery emails

### 2. Improve Conversion Rates
- Display payment method icons
- Show estimated delivery times
- Offer free shipping thresholds
- Implement mobile optimization

### 3. Reduce Failed Transactions
- Implement real-time validation
- Provide clear error messages
- Offer retry mechanisms
- Use multiple gateway fallbacks

---

## 🔄 Maintenance

### Daily Tasks
- Monitor transaction success rates
- Check error logs
- Verify webhook delivery
- Update exchange rates

### Weekly Tasks
- Review payment analytics
- Update gateway configurations
- Test backup payment methods
- Audit security logs

### Monthly Tasks
- Update API credentials
- Review gateway performance
- Optimize payment flow
- Update documentation

---

*Last Updated: December 2024*
*Version: 1.0.0*
*Contact: techsupport@gbdryfruits.com*
