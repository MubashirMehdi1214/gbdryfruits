module.exports = async (req, res) => {
    try {
        // Health check response
        res.status(200).json({
            status: 'ok',
            service: 'GBDRYFRUITS API',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            error: error.message
        });
    }
};
