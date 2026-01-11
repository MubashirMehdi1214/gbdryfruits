// GBDRYFRUITS - Configuration
window.CONFIG = {
    // API Configuration
    API_URL: process.env.API_URL || 'https://gbdryfruits-api.onrender.com',
    LOCAL_API_URL: 'http://localhost:5000',
    
    // Environment Detection
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Get API URL based on environment
    getApiUrl: function() {
        return this.isDevelopment ? this.LOCAL_API_URL : this.API_URL;
    },
    
    // Site Configuration
    SITE_URL: process.env.SITE_URL || window.location.origin,
    
    // Contact Information
    CONTACT: {
        email: process.env.CONTACT_EMAIL || 'info@gbdryfruits.com',
        phone: process.env.CONTACT_PHONE || '+92-300-1234567'
    },
    
    // Cart Configuration
    CART: {
        storageKey: 'gbdryfruits_cart',
        maxQuantity: 99,
        freeShippingThreshold: 2000
    },
    
    // Payment Configuration
    PAYMENT: {
        methods: ['Cash on Delivery', 'JazzCash', 'EasyPaisa', 'Meezan Bank', 'Bank Transfer'],
        codCities: {
            'karachi': 0,
            'lahore': 0,
            'islamabad': 250,
            'rawalpindi': 0,
            'faisalabad': 0,
            'multan': 100,
            'peshawar': 150,
            'quetta': 200
        }
    },
    
    // UI Configuration
    UI: {
        loadingDelay: 300,
        notificationDuration: 3000,
        animationDuration: 300
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.CONFIG;
}
