// Payment Gateway Configuration
// This file contains all payment gateway settings and configurations

const PAYMENT_GATEWAYS = {
    // JazzCash Configuration
    jazzcash: {
        enabled: process.env.JAZZCASH_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        credentials: {
            merchantId: process.env.JAZZCASH_MERCHANT_ID,
            password: process.env.JAZZCASH_PASSWORD,
            integritySalt: process.env.JAZZCASH_INTEGRITY_SALT
        },
        endpoints: {
            production: 'https://payments.jazzcash.com.pk',
            sandbox: 'https://sandbox.jazzcash.com.pk',
            checkout: '/CheckoutPage',
            verification: '/WebAPI/Transaction/TransactionVerification'
        },
        settings: {
            transactionExpiry: 30, // minutes
            supportedMethods: ['MWALLET'],
            currency: 'PKR',
            minAmount: 100,
            maxAmount: 500000
        },
        fees: {
            percentage: 1.5, // 1.5% per transaction
            fixed: 10, // Rs. 10 fixed fee
            taxRate: 0.17 // 17% tax
        }
    },

    // EasyPaisa Configuration
    easypaisa: {
        enabled: process.env.EASYPAISA_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        credentials: {
            storeId: process.env.EASYPAISA_STORE_ID,
            apiKey: process.env.EASYPAISA_API_KEY,
            secretKey: process.env.EASYPAISA_SECRET_KEY
        },
        endpoints: {
            production: 'https://easypaisa.com.pk',
            sandbox: 'https://sandbox.easypaisa.com.pk',
            payment: '/api/v2/payment',
            verification: '/api/v2/verify',
            refund: '/api/v2/refund'
        },
        settings: {
            transactionExpiry: 15, // minutes
            supportedMethods: ['ACCOUNT', 'CC', 'DC'],
            currency: 'PKR',
            minAmount: 100,
            maxAmount: 300000
        },
        fees: {
            percentage: 1.8,
            fixed: 15,
            taxRate: 0.17
        }
    },

    // Stripe Configuration
    stripe: {
        enabled: process.env.STRIPE_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'test',
        credentials: {
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            secretKey: process.env.STRIPE_SECRET_KEY,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
        },
        endpoints: {
            production: 'https://api.stripe.com',
            test: 'https://api.stripe.com',
            webhooks: '/webhooks/stripe'
        },
        settings: {
            transactionExpiry: 60, // minutes
            supportedMethods: ['card', 'alipay', 'apple_pay', 'google_pay'],
            currency: 'pkr',
            minAmount: 50,
            maxAmount: 1000000
        },
        fees: {
            percentage: 2.9, // International cards
            percentageLocal: 1.5, // Local cards
            fixed: 20,
            taxRate: 0.17
        }
    },

    // PayPal Configuration
    paypal: {
        enabled: process.env.PAYPAL_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
        credentials: {
            clientId: process.env.PAYPAL_CLIENT_ID,
            clientSecret: process.env.PAYPAL_CLIENT_SECRET
        },
        endpoints: {
            production: 'https://api.paypal.com',
            sandbox: 'https://api.sandbox.paypal.com',
            checkout: '/v2/checkout/orders',
            capture: '/v2/checkout/orders'
        },
        settings: {
            transactionExpiry: 180, // minutes
            supportedMethods: ['paypal', 'card', 'venmo'],
            currency: 'USD',
            conversionRate: 280, // PKR to USD
            minAmount: 1,
            maxAmount: 10000
        },
        fees: {
            percentage: 4.4, // International
            percentageLocal: 3.4, // Domestic
            fixed: 0.30, // USD fixed fee
            taxRate: 0.17
        }
    },

    // Bank Alfalah Configuration
    bankalfalah: {
        enabled: process.env.BANKALFALAH_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        credentials: {
            merchantId: process.env.BANKALFALAH_MERCHANT_ID,
            apiKey: process.env.BANKALFALAH_API_KEY,
            secretKey: process.env.BANKALFALAH_SECRET_KEY
        },
        endpoints: {
            production: 'https://bankalfalah.com.pk',
            sandbox: 'https://sandbox.bankalfalah.com.pk',
            payment: '/api/payment',
            verification: '/api/verify'
        },
        settings: {
            transactionExpiry: 20,
            supportedMethods: ['CC', 'DC', 'NETBANKING'],
            currency: 'PKR',
            minAmount: 500,
            maxAmount: 1000000
        },
        fees: {
            percentage: 2.0,
            fixed: 25,
            taxRate: 0.17
        }
    },

    // UBL Omni Configuration
    ubl: {
        enabled: process.env.UBL_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        credentials: {
            merchantId: process.env.UBL_MERCHANT_ID,
            apiKey: process.env.UBL_API_KEY,
            secretKey: process.env.UBL_SECRET_KEY
        },
        endpoints: {
            production: 'https://ubloni.com',
            sandbox: 'https://sandbox.ubloni.com',
            payment: '/api/v1/payment',
            verification: '/api/v1/verify'
        },
        settings: {
            transactionExpiry: 25,
            supportedMethods: ['MOBILE_ACCOUNT', 'BANK_TRANSFER'],
            currency: 'PKR',
            minAmount: 100,
            maxAmount: 500000
        },
        fees: {
            percentage: 1.2,
            fixed: 8,
            taxRate: 0.17
        }
    },

    // Meezan Bank Configuration
    meezan: {
        enabled: process.env.MEEZAN_ENABLED === 'true',
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
        credentials: {
            merchantId: process.env.MEEZAN_MERCHANT_ID,
            apiKey: process.env.MEEZAN_API_KEY,
            secretKey: process.env.MEEZAN_SECRET_KEY
        },
        endpoints: {
            production: 'https://meezanbank.com',
            sandbox: 'https://sandbox.meezanbank.com',
            payment: '/api/payment',
            verification: '/api/verify'
        },
        settings: {
            transactionExpiry: 30,
            supportedMethods: ['CC', 'DC', 'NETBANKING'],
            currency: 'PKR',
            minAmount: 1000,
            maxAmount: 2000000
        },
        fees: {
            percentage: 1.8,
            fixed: 20,
            taxRate: 0.17
        }
    }
};

// Cash on Delivery Configuration
const COD_CONFIG = {
    enabled: process.env.COD_ENABLED === 'true',
    cities: {
        karachi: { 
            available: true, 
            deliveryDays: 2, 
            charges: 0, 
            minOrderAmount: 500,
            maxOrderAmount: 50000,
            serviceAreas: ['all']
        },
        lahore: { 
            available: true, 
            deliveryDays: 2, 
            charges: 0, 
            minOrderAmount: 500,
            maxOrderAmount: 50000,
            serviceAreas: ['all']
        },
        islamabad: { 
            available: true, 
            deliveryDays: 1, 
            charges: 0, 
            minOrderAmount: 500,
            maxOrderAmount: 50000,
            serviceAreas: ['all']
        },
        rawalpindi: { 
            available: true, 
            deliveryDays: 1, 
            charges: 0, 
            minOrderAmount: 500,
            maxOrderAmount: 50000,
            serviceAreas: ['all']
        },
        faisalabad: { 
            available: true, 
            deliveryDays: 3, 
            charges: 0, 
            minOrderAmount: 1000,
            maxOrderAmount: 30000,
            serviceAreas: ['all']
        },
        multan: { 
            available: true, 
            deliveryDays: 3, 
            charges: 100, 
            minOrderAmount: 1000,
            maxOrderAmount: 30000,
            serviceAreas: ['all']
        },
        peshawar: { 
            available: true, 
            deliveryDays: 3, 
            charges: 150, 
            minOrderAmount: 1000,
            maxOrderAmount: 25000,
            serviceAreas: ['all']
        },
        quetta: { 
            available: true, 
            deliveryDays: 4, 
            charges: 200, 
            minOrderAmount: 2000,
            maxOrderAmount: 20000,
            serviceAreas: ['all']
        }
    },
    settings: {
        maxOrderValue: 50000,
        verificationRequired: true,
        otpVerification: true,
        addressVerification: true,
        deliveryTimeSlots: ['9AM-12PM', '12PM-3PM', '3PM-6PM'],
        sameDayDelivery: false,
        freeShippingThreshold: 1000
    }
};

// Fraud Detection Configuration
const FRAUD_CONFIG = {
    enabled: process.env.FRAUD_DETECTION_ENABLED === 'true',
    rules: {
        maxOrdersPerHour: 5,
        maxOrdersPerDay: 15,
        maxOrderValue: 100000,
        suspiciousCountries: ['XX'], // Blocked countries
        velocityChecks: true,
        deviceFingerprinting: true,
        ipBlacklisting: true,
        addressVerification: true
    },
    riskScoring: {
        highRiskThreshold: 80,
        mediumRiskThreshold: 50,
        autoBlockHighRisk: true,
        manualReviewMediumRisk: true
    },
    alerts: {
        email: 'fraud@gbdryfruits.com',
        sms: '+923001234567',
        webhook: process.env.FRAUD_WEBHOOK_URL
    }
};

// Notification Configuration
const NOTIFICATION_CONFIG = {
    email: {
        enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        templates: {
            orderConfirmation: true,
            orderShipped: true,
            orderDelivered: true,
            paymentFailed: true,
            abandonedCheckout: true
        }
    },
    sms: {
        enabled: process.env.SMS_NOTIFICATIONS_ENABLED === 'true',
        provider: 'twilio',
        credentials: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            phoneNumber: process.env.TWILIO_PHONE_NUMBER,
            whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
        },
        templates: {
            orderConfirmation: true,
            orderShipped: true,
            orderDelivered: true,
            otpVerification: true,
            deliveryUpdates: true
        }
    },
    push: {
        enabled: process.env.PUSH_NOTIFICATIONS_ENABLED === 'true',
        service: 'firebase',
        credentials: {
            serverKey: process.env.FIREBASE_SERVER_KEY,
            senderId: process.env.FIREBASE_SENDER_ID
        }
    }
};

// Security Configuration
const SECURITY_CONFIG = {
    ssl: {
        enabled: true,
        certificatePath: process.env.SSL_CERT_PATH,
        privateKeyPath: process.env.SSL_KEY_PATH,
        caPath: process.env.SSL_CA_PATH
    },
    encryption: {
        algorithm: 'AES-256-GCM',
        keyLength: 32,
        ivLength: 16,
        tagLength: 16
    },
    hashing: {
        algorithm: 'SHA-256',
        saltLength: 32,
        iterations: 100000
    },
    rateLimiting: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    },
    cors: {
        enabled: true,
        origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
};

// Currency Configuration
const CURRENCY_CONFIG = {
    default: 'PKR',
    supported: ['PKR', 'USD', 'EUR', 'GBP'],
    exchangeRates: {
        PKR: { USD: 0.0036, EUR: 0.0032, GBP: 0.0028 },
        USD: { PKR: 280, EUR: 0.92, GBP: 0.79 },
        EUR: { PKR: 310, USD: 1.09, GBP: 0.86 },
        GBP: { PKR: 360, USD: 1.27, EUR: 1.16 }
    },
    formatting: {
        PKR: { symbol: 'Rs.', position: 'before', decimals: 0 },
        USD: { symbol: '$', position: 'before', decimals: 2 },
        EUR: { symbol: '€', position: 'before', decimals: 2 },
        GBP: { symbol: '£', position: 'before', decimals: 2 }
    }
};

// Get gateway configuration
const getGatewayConfig = (gateway) => {
    return PAYMENT_GATEWAYS[gateway];
};

// Get enabled gateways
const getEnabledGateways = () => {
    return Object.keys(PAYMENT_GATEWAYS).filter(gateway => 
        PAYMENT_GATEWAYS[gateway].enabled
    );
};

// Check if gateway is enabled
const isGatewayEnabled = (gateway) => {
    return PAYMENT_GATEWAYS[gateway]?.enabled || false;
};

// Get gateway endpoint
const getGatewayEndpoint = (gateway, endpoint) => {
    const config = PAYMENT_GATEWAYS[gateway];
    if (!config) return null;
    
    const baseUrl = config.endpoints[config.mode];
    return `${baseUrl}${endpoint}`;
};

// Calculate transaction fees
const calculateFees = (gateway, amount) => {
    const config = PAYMENT_GATEWAYS[gateway];
    if (!config) return { total: 0, breakdown: {} };
    
    const fees = config.fees;
    let percentageFee = fees.percentage;
    
    // Use local percentage for international cards (Stripe)
    if (gateway === 'stripe' && amount < 100000) {
        percentageFee = fees.percentageLocal;
    }
    
    // Use local percentage for PayPal domestic
    if (gateway === 'paypal' && amount < 500000) {
        percentageFee = fees.percentageLocal;
    }
    
    const percentageAmount = (amount * percentageFee) / 100;
    const taxAmount = ((percentageAmount + fees.fixed) * fees.taxRate);
    const totalFees = percentageAmount + fees.fixed + taxAmount;
    
    return {
        total: Math.round(totalFees),
        breakdown: {
            percentage: Math.round(percentageAmount),
            fixed: fees.fixed,
            tax: Math.round(taxAmount),
            rate: percentageFee
        }
    };
};

// Validate payment amount
const validateAmount = (gateway, amount) => {
    const config = PAYMENT_GATEWAYS[gateway];
    if (!config) return { valid: false, error: 'Gateway not found' };
    
    const { minAmount, maxAmount } = config.settings;
    
    if (amount < minAmount) {
        return { 
            valid: false, 
            error: `Minimum amount is Rs. ${minAmount}` 
        };
    }
    
    if (amount > maxAmount) {
        return { 
            valid: false, 
            error: `Maximum amount is Rs. ${maxAmount}` 
        };
    }
    
    return { valid: true };
};

// Check COD availability
const checkCODAvailability = (city, orderAmount) => {
    const cityConfig = COD_CONFIG.cities[city.toLowerCase()];
    if (!cityConfig || !cityConfig.available) {
        return {
            available: false,
            message: 'COD not available in this city'
        };
    }
    
    if (orderAmount < cityConfig.minOrderAmount) {
        return {
            available: false,
            message: `Minimum order amount for COD is Rs. ${cityConfig.minOrderAmount}`
        };
    }
    
    if (orderAmount > cityConfig.maxOrderAmount) {
        return {
            available: false,
            message: `Maximum order amount for COD is Rs. ${cityConfig.maxOrderAmount}`
        };
    }
    
    return {
        available: true,
        deliveryDays: cityConfig.deliveryDays,
        charges: cityConfig.charges,
        message: `COD available. Delivery within ${cityConfig.deliveryDays} business days.`
    };
};

module.exports = {
    PAYMENT_GATEWAYS,
    COD_CONFIG,
    FRAUD_CONFIG,
    NOTIFICATION_CONFIG,
    SECURITY_CONFIG,
    CURRENCY_CONFIG,
    getGatewayConfig,
    getEnabledGateways,
    isGatewayEnabled,
    getGatewayEndpoint,
    calculateFees,
    validateAmount,
    checkCODAvailability
};
