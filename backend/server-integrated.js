require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

// Import services
const PaymentTrackingService = require('./services/paymentTrackingService');
const AbandonedCheckoutService = require('./services/abandonedCheckoutService');
const PaymentAnalyticsService = require('./services/paymentAnalyticsService');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Initialize services
const paymentTracking = new PaymentTrackingService();
const abandonedCheckout = new AbandonedCheckoutService();
const paymentAnalytics = new PaymentAnalyticsService();

// Middleware
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

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
            paymentTracking: paymentTracking.getTrackingStats(),
            abandonedCheckout: { running: abandonedCheckout.isRunning },
            analytics: paymentAnalytics.getCacheStats()
        }
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// Analytics endpoints
app.get('/api/analytics/payments', async (req, res) => {
    try {
        const { dateRange = '30d', gateway, status, minAmount, maxAmount } = req.query;
        
        const filters = {};
        if (gateway) filters.gateway = gateway;
        if (status) filters.status = status;
        if (minAmount) filters.minAmount = parseFloat(minAmount);
        if (maxAmount) filters.maxAmount = parseFloat(maxAmount);
        
        const analytics = await paymentAnalytics.getPaymentAnalytics(dateRange, filters);
        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
});

// Real-time metrics endpoint
app.get('/api/analytics/realtime', async (req, res) => {
    try {
        const metrics = await paymentAnalytics.getRealTimeMetrics();
        res.json({ success: true, data: metrics });
    } catch (error) {
        console.error('Real-time metrics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get real-time metrics' });
    }
});

// Report generation endpoint
app.get('/api/analytics/report', async (req, res) => {
    try {
        const { type = 'daily', format = 'json' } = req.query;
        const report = await paymentAnalytics.generatePaymentReport(type, format);
        
        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="payment-report-${type}.csv"`);
            res.send(report);
        } else if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="payment-report-${type}.pdf"`);
            res.send(report);
        } else {
            res.json({ success: true, data: report });
        }
    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate report' });
    }
});

// Manual abandoned checkout trigger
app.post('/api/admin/abandoned-checkout/trigger', async (req, res) => {
    try {
        const { cartId, ruleName = 'firstReminder' } = req.body;
        const result = await abandonedCheckout.triggerRecovery(cartId, ruleName);
        
        if (result) {
            res.json({ success: true, message: 'Recovery triggered successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to trigger recovery' });
        }
    } catch (error) {
        console.error('Manual recovery trigger error:', error);
        res.status(500).json({ success: false, message: 'Failed to trigger recovery' });
    }
});

// Order status update endpoint (for delivery partners)
app.post('/api/admin/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, trackingNumber, deliveryPartner, location } = req.body;
        
        await paymentTracking.updateOrderStatus(orderId, status, {
            trackingNumber,
            deliveryPartner,
            currentLocation: location
        });
        
        res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

// Location update endpoint (for delivery tracking)
app.post('/api/admin/orders/:orderId/location', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { location } = req.body;
        
        await paymentTracking.updateLocation(orderId, location);
        
        res.json({ success: true, message: 'Location updated' });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update location' });
    }
});

// Integration with delivery partners
app.post('/api/admin/orders/:orderId/ship', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { partner, trackingNumber } = req.body;
        
        await paymentTracking.integrateWithDeliveryPartner(orderId, partner, trackingNumber);
        
        res.json({ success: true, message: 'Shipping integration initiated' });
    } catch (error) {
        console.error('Shipping integration error:', error);
        res.status(500).json({ success: false, message: 'Failed to integrate shipping' });
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join order room for tracking
    socket.on('join-order', (orderId) => {
        socket.join(`order-${orderId}`);
        console.log(`Client ${socket.id} joined order ${orderId}`);
    });
    
    // Leave order room
    socket.on('leave-order', (orderId) => {
        socket.leave(`order-${orderId}`);
        console.log(`Client ${socket.id} left order ${orderId}`);
    });
    
    // Handle real-time order status updates
    socket.on('order-status-update', async (data) => {
        try {
            const { orderId, status, additionalData } = data;
            
            await paymentTracking.updateOrderStatus(orderId, status, additionalData);
            
            // Broadcast to all clients tracking this order
            io.to(`order-${orderId}`).emit('status-update', {
                orderId,
                status,
                timestamp: new Date(),
                ...additionalData
            });
        } catch (error) {
            console.error('Socket status update error:', error);
            socket.emit('error', { message: 'Failed to update status' });
        }
    });
    
    // Handle location updates
    socket.on('location-update', async (data) => {
        try {
            const { orderId, location } = data;
            
            await paymentTracking.updateLocation(orderId, location);
            
            // Broadcast to all clients tracking this order
            io.to(`order-${orderId}`).emit('location-update', {
                orderId,
                location,
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Socket location update error:', error);
            socket.emit('error', { message: 'Failed to update location' });
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }
    
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data format'
        });
    }
    
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate data found'
        });
    }
    
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gbdryfruits', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
    
    // Initialize payment tracking WebSocket server
    paymentTracking.initialize(server);
    
    // Start abandoned checkout service
    abandonedCheckout.start();
    
    // Start analytics cleanup (run every hour)
    setInterval(() => {
        paymentAnalytics.cleanupOldData();
    }, 60 * 60 * 1000);
    
    console.log('Payment services initialized');
})
.catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    abandonedCheckout.stop();
    paymentAnalytics.clearCache();
    
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    
    abandonedCheckout.stop();
    paymentAnalytics.clearCache();
    
    server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 GBDRYFRUITS Server running on port ${PORT}`);
    console.log(`📊 Payment Analytics: http://localhost:${PORT}/api/analytics/payments`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
    console.log(`🌰 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for testing
module.exports = { app, server, io };
