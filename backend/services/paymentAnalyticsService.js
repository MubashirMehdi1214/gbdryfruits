const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

class PaymentAnalyticsService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Get comprehensive payment analytics
    async getPaymentAnalytics(dateRange = '30d', filters = {}) {
        try {
            const cacheKey = `analytics_${dateRange}_${JSON.stringify(filters)}`;
            
            // Check cache first
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            const { startDate, endDate } = this.parseDateRange(dateRange);
            const analytics = await this.generateAnalytics(startDate, endDate, filters);
            
            // Cache the result
            this.cache.set(cacheKey, {
                data: analytics,
                timestamp: Date.now()
            });
            
            return analytics;
        } catch (error) {
            console.error('Error getting payment analytics:', error);
            throw error;
        }
    }

    // Generate comprehensive analytics
    async generateAnalytics(startDate, endDate, filters) {
        const matchStage = {
            createdAt: { $gte: startDate, $lte: endDate }
        };

        // Apply filters
        if (filters.gateway) {
            matchStage['payment.gateway'] = filters.gateway;
        }
        if (filters.status) {
            matchStage['payment.status'] = filters.status;
        }
        if (filters.minAmount) {
            matchStage['payment.amount'] = { $gte: filters.minAmount };
        }
        if (filters.maxAmount) {
            matchStage['payment.amount'] = { ...matchStage['payment.amount'], $lte: filters.maxAmount };
        }

        const [
            overview,
            gatewayStats,
            dailyStats,
            hourlyStats,
            failureAnalysis,
            customerMetrics,
            conversionMetrics,
            revenueMetrics
        ] = await Promise.all([
            this.getOverviewStats(matchStage),
            this.getGatewayStats(matchStage),
            this.getDailyStats(matchStage),
            this.getHourlyStats(matchStage),
            this.getFailureAnalysis(matchStage),
            this.getCustomerMetrics(matchStage),
            this.getConversionMetrics(matchStage),
            this.getRevenueMetrics(matchStage)
        ]);

        return {
            overview,
            gatewayStats,
            dailyStats,
            hourlyStats,
            failureAnalysis,
            customerMetrics,
            conversionMetrics,
            revenueMetrics,
            dateRange: { startDate, endDate },
            generatedAt: new Date()
        };
    }

    // Get overview statistics
    async getOverviewStats(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    successfulPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, 1, 0] }
                    },
                    failedPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'failed'] }, 1, 0] }
                    },
                    pendingPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'pending'] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', 0] }
                    },
                    averageOrderValue: {
                        $avg: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', null] }
                    },
                    totalFees: { $sum: '$payment.fees.total' }
                }
            }
        ];

        const result = await Order.aggregate(pipeline);
        const stats = result[0] || {};

        return {
            totalOrders: stats.totalOrders || 0,
            successfulPayments: stats.successfulPayments || 0,
            failedPayments: stats.failedPayments || 0,
            pendingPayments: stats.pendingPayments || 0,
            totalRevenue: stats.totalRevenue || 0,
            averageOrderValue: stats.averageOrderValue || 0,
            totalFees: stats.totalFees || 0,
            successRate: stats.totalOrders > 0 ? (stats.successfulPayments / stats.totalOrders) * 100 : 0,
            failureRate: stats.totalOrders > 0 ? (stats.failedPayments / stats.totalOrders) * 100 : 0,
            netRevenue: (stats.totalRevenue || 0) - (stats.totalFees || 0)
        };
    }

    // Get gateway-specific statistics
    async getGatewayStats(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$payment.gateway',
                    totalOrders: { $sum: 1 },
                    successfulPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, 1, 0] }
                    },
                    failedPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'failed'] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', 0] }
                    },
                    averageOrderValue: {
                        $avg: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', null] }
                    },
                    totalFees: { $sum: '$payment.fees.total' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ];

        const results = await Order.aggregate(pipeline);
        
        return results.map(result => ({
            gateway: result._id,
            totalOrders: result.totalOrders || 0,
            successfulPayments: result.successfulPayments || 0,
            failedPayments: result.failedPayments || 0,
            totalRevenue: result.totalRevenue || 0,
            averageOrderValue: result.averageOrderValue || 0,
            totalFees: result.totalFees || 0,
            successRate: result.totalOrders > 0 ? (result.successfulPayments / result.totalOrders) * 100 : 0,
            marketShare: 0 // Will be calculated after total is known
        }));
    }

    // Get daily statistics
    async getDailyStats(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    totalOrders: { $sum: 1 },
                    successfulPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, 1, 0] }
                    },
                    failedPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'failed'] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Order.aggregate(pipeline);
        
        return results.map(result => ({
            date: result._id,
            totalOrders: result.totalOrders || 0,
            successfulPayments: result.successfulPayments || 0,
            failedPayments: result.failedPayments || 0,
            totalRevenue: result.totalRevenue || 0,
            successRate: result.totalOrders > 0 ? (result.successfulPayments / result.totalOrders) * 100 : 0
        }));
    }

    // Get hourly statistics
    async getHourlyStats(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $hour: '$createdAt'
                    },
                    totalOrders: { $sum: 1 },
                    successfulPayments: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, 1, 0] }
                    },
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const results = await Order.aggregate(pipeline);
        
        return results.map(result => ({
            hour: result._id,
            totalOrders: result.totalOrders || 0,
            successfulPayments: result.successfulPayments || 0,
            totalRevenue: result.totalRevenue || 0
        }));
    }

    // Get failure analysis
    async getFailureAnalysis(matchStage) {
        const failureMatch = {
            ...matchStage,
            'payment.status': 'failed'
        };

        const [
            failureReasons,
            gatewayFailures,
            failureTrends
        ] = await Promise.all([
            this.getFailureReasons(failureMatch),
            this.getGatewayFailures(failureMatch),
            this.getFailureTrends(failureMatch)
        ]);

        return {
            failureReasons,
            gatewayFailures,
            failureTrends
        };
    }

    // Get failure reasons
    async getFailureReasons(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$payment.responseMessage',
                    count: { $sum: 1 },
                    percentage: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ];

        const results = await Order.aggregate(pipeline);
        const totalFailures = results.reduce((sum, item) => sum + item.count, 0);

        return results.map(result => ({
            reason: result._id || 'Unknown',
            count: result.count,
            percentage: totalFailures > 0 ? (result.count / totalFailures) * 100 : 0
        }));
    }

    // Get gateway failures
    async getGatewayFailures(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$payment.gateway',
                    failures: { $sum: 1 },
                    totalOrders: {
                        $sum: {
                            $cond: [{ $eq: ['$payment.status', 'failed'] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { failures: -1 } }
        ];

        return Order.aggregate(pipeline);
    }

    // Get failure trends
    async getFailureTrends(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    failures: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        return Order.aggregate(pipeline);
    }

    // Get customer metrics
    async getCustomerMetrics(matchStage) {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: '$userId',
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', 0] }
                    },
                    averageOrderValue: {
                        $avg: { $cond: [{ $eq: ['$payment.status', 'completed'] }, '$payment.amount', null] }
                    },
                    firstOrderDate: { $min: '$createdAt' },
                    lastOrderDate: { $max: '$createdAt' }
                }
            }
        ];

        const customerStats = await Order.aggregate(pipeline);
        
        const totalCustomers = customerStats.length;
        const newCustomers = customerStats.filter(c => 
            new Date(c.firstOrderDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;
        
        const repeatCustomers = customerStats.filter(c => c.totalOrders > 1).length;
        
        const totalSpent = customerStats.reduce((sum, c) => sum + c.totalSpent, 0);
        const averageCustomerValue = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

        return {
            totalCustomers,
            newCustomers,
            repeatCustomers,
            repeatCustomerRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
            averageCustomerValue,
            averageOrdersPerCustomer: totalCustomers > 0 ? 
                customerStats.reduce((sum, c) => sum + c.totalOrders, 0) / totalCustomers : 0
        };
    }

    // Get conversion metrics
    async getConversionMetrics(matchStage) {
        // This would typically involve tracking cart abandonment and conversion funnels
        // For now, we'll provide basic conversion metrics
        
        const totalOrders = await Order.countDocuments(matchStage);
        const successfulOrders = await Order.countDocuments({
            ...matchStage,
            'payment.status': 'completed'
        });

        // Simulate cart data (in real implementation, this would come from cart tracking)
        const totalCarts = totalOrders * 1.5; // Assume 1.5 carts per order
        const abandonedCarts = totalCarts - totalOrders;

        return {
            totalCarts,
            completedOrders: totalOrders,
            abandonedCarts,
            cartAbandonmentRate: totalCarts > 0 ? (abandonedCarts / totalCarts) * 100 : 0,
            checkoutConversionRate: totalCarts > 0 ? (totalOrders / totalCarts) * 100 : 0,
            paymentConversionRate: totalOrders > 0 ? (successfulOrders / totalOrders) * 100 : 0
        };
    }

    // Get revenue metrics
    async getRevenueMetrics(matchStage) {
        const pipeline = [
            { $match: { ...matchStage, 'payment.status': 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$payment.amount' },
                    totalFees: { $sum: '$payment.fees.total' },
                    netRevenue: { $sum: { $subtract: ['$payment.amount', '$payment.fees.total'] } },
                    averageOrderValue: { $avg: '$payment.amount' },
                    medianOrderValue: { $median: '$payment.amount' }
                }
            }
        ];

        const result = await Order.aggregate(pipeline);
        const stats = result[0] || {};

        // Calculate revenue growth (compare with previous period)
        const previousPeriod = this.getPreviousPeriod(matchStage);
        const previousRevenue = await this.getRevenueForPeriod(previousPeriod);

        return {
            totalRevenue: stats.totalRevenue || 0,
            totalFees: stats.totalFees || 0,
            netRevenue: stats.netRevenue || 0,
            averageOrderValue: stats.averageOrderValue || 0,
            medianOrderValue: stats.medianOrderValue || 0,
            revenueGrowth: previousRevenue > 0 ? 
                ((stats.totalRevenue - previousRevenue) / previousRevenue) * 100 : 0,
            profitMargin: stats.totalRevenue > 0 ? 
                ((stats.netRevenue / stats.totalRevenue) * 100) : 0
        };
    }

    // Get revenue for specific period
    async getRevenueForPeriod(matchStage) {
        const pipeline = [
            { $match: { ...matchStage, 'payment.status': 'completed' } },
            { $group: { _id: null, total: { $sum: '$payment.amount' } } }
        ];

        const result = await Order.aggregate(pipeline);
        return result[0]?.total || 0;
    }

    // Get previous period for comparison
    getPreviousPeriod(matchStage) {
        const currentStart = matchStage.createdAt.$gte;
        const currentEnd = matchStage.createdAt.$lte;
        const duration = currentEnd - currentStart;
        
        return {
            createdAt: {
                $gte: new Date(currentStart.getTime() - duration),
                $lte: new Date(currentEnd.getTime() - duration)
            }
        };
    }

    // Parse date range
    parseDateRange(range) {
        const now = new Date();
        let startDate, endDate;

        switch (range) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        endDate = now;

        return { startDate, endDate };
    }

    // Get real-time metrics
    async getRealTimeMetrics() {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [
            last24hOrders,
            last24hRevenue,
            activeOrders,
            pendingPayments
        ] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: last24Hours } }),
            Order.aggregate([
                { $match: { createdAt: { $gte: last24Hours }, 'payment.status': 'completed' } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } }
            ]),
            Order.countDocuments({ 
                status: { $in: ['confirmed', 'processing', 'shipped'] },
                'payment.status': 'completed'
            }),
            Order.countDocuments({ 'payment.status': 'pending' })
        ]);

        return {
            ordersLast24h: last24hOrders,
            revenueLast24h: last24hOrders[0]?.total || 0,
            activeOrders,
            pendingPayments,
            timestamp: now
        };
    }

    // Generate payment report
    async generatePaymentReport(type = 'daily', format = 'json') {
        const dateRange = type === 'daily' ? '1d' : type === 'weekly' ? '7d' : '30d';
        const analytics = await this.getPaymentAnalytics(dateRange);

        if (format === 'csv') {
            return this.convertToCSV(analytics);
        } else if (format === 'pdf') {
            return this.convertToPDF(analytics);
        }

        return analytics;
    }

    // Convert analytics to CSV
    convertToCSV(analytics) {
        const csvData = [];
        
        // Overview data
        csvData.push(['Metric', 'Value']);
        csvData.push(['Total Orders', analytics.overview.totalOrders]);
        csvData.push(['Total Revenue', analytics.overview.totalRevenue]);
        csvData.push(['Success Rate', analytics.overview.successRate + '%']);
        csvData.push(['Average Order Value', analytics.overview.averageOrderValue]);
        
        // Gateway data
        csvData.push([]);
        csvData.push(['Gateway', 'Orders', 'Revenue', 'Success Rate']);
        analytics.gatewayStats.forEach(gateway => {
            csvData.push([
                gateway.gateway,
                gateway.totalOrders,
                gateway.totalRevenue,
                gateway.successRate + '%'
            ]);
        });

        return csvData.map(row => row.join(',')).join('\n');
    }

    // Convert analytics to PDF (placeholder)
    async convertToPDF(analytics) {
        // This would use a PDF generation library like puppeteer or jsPDF
        return {
            type: 'pdf',
            data: analytics,
            generatedAt: new Date()
        };
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
        console.log('Payment analytics cache cleared');
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout
        };
    }
}

module.exports = PaymentAnalyticsService;
