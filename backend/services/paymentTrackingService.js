const WebSocket = require('ws');
const Order = require('../models/Order');
const { sendWhatsAppMessage, sendOrderShippedEmail, sendOrderDeliveredEmail } = require('../utils/notifications');

class PaymentTrackingService {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // orderId -> Set of WebSocket connections
        this.trackingData = new Map(); // orderId -> tracking data
        this.deliveryPartners = {
            tcs: { name: 'TCS', trackingUrl: 'https://www.tcsexpress.com/track' },
            leopards: { name: 'Leopards', trackingUrl: 'https://www.leopardscourier.com/track' },
            blueex: { name: 'BlueEx', trackingUrl: 'https://www.blueex.com/track' }
        };
    }

    // Initialize WebSocket server
    initialize(server) {
        this.wss = new WebSocket.Server({ server });
        
        this.wss.on('connection', (ws, request) => {
            this.handleConnection(ws, request);
        });
        
        console.log('Payment tracking WebSocket server initialized');
    }

    // Handle new WebSocket connection
    handleConnection(ws, request) {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const orderId = url.searchParams.get('orderId');
        const userId = url.searchParams.get('userId');
        
        if (!orderId) {
            ws.close(1008, 'Order ID required');
            return;
        }

        // Add client to tracking
        if (!this.clients.has(orderId)) {
            this.clients.set(orderId, new Set());
        }
        this.clients.get(orderId).add(ws);
        
        // Store client info
        ws.orderId = orderId;
        ws.userId = userId;
        ws.isAlive = true;
        
        // Setup ping/pong for connection health
        ws.on('pong', () => {
            ws.isAlive = true;
        });
        
        // Handle incoming messages
        ws.on('message', (message) => {
            this.handleMessage(ws, message);
        });
        
        // Handle connection close
        ws.on('close', () => {
            this.handleDisconnection(ws);
        });
        
        // Send current status immediately
        this.sendCurrentStatus(ws, orderId);
        
        console.log(`Client connected for order ${orderId}`);
    }

    // Handle incoming messages
    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'subscribe':
                    this.handleSubscription(ws, data);
                    break;
                case 'location_update':
                    this.handleLocationUpdate(ws, data);
                    break;
                case 'delivery_feedback':
                    this.handleDeliveryFeedback(ws, data);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Handle client disconnection
    handleDisconnection(ws) {
        if (ws.orderId && this.clients.has(ws.orderId)) {
            this.clients.get(ws.orderId).delete(ws);
            
            // Clean up empty client sets
            if (this.clients.get(ws.orderId).size === 0) {
                this.clients.delete(ws.orderId);
            }
        }
        
        console.log(`Client disconnected for order ${ws.orderId}`);
    }

    // Send current status to client
    async function sendCurrentStatus(ws, orderId) {
        try {
            const order = await Order.findOne({ orderId });
            if (!order) {
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Order not found'
                }));
                return;
            }

            const status = await this.getOrderStatus(orderId);
            ws.send(JSON.stringify({
                type: 'status_update',
                ...status
            }));
        } catch (error) {
            console.error('Error sending current status:', error);
        }
    }

    // Get comprehensive order status
    async getOrderStatus(orderId) {
        try {
            const order = await Order.findOne({ orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            const tracking = this.trackingData.get(orderId) || {};
            
            return {
                orderId,
                status: order.status,
                paymentStatus: order.payment.status,
                paymentGateway: order.payment.gateway,
                amount: order.payment.amount,
                currency: 'PKR',
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                estimatedDelivery: tracking.estimatedDelivery,
                actualDelivery: tracking.actualDelivery,
                currentLocation: tracking.currentLocation,
                deliveryPartner: tracking.deliveryPartner,
                trackingNumber: tracking.trackingNumber,
                timeline: this.generateTimeline(order, tracking),
                milestones: this.getMilestones(order.status),
                nextSteps: this.getNextSteps(order.status),
                notifications: tracking.notifications || []
            };
        } catch (error) {
            console.error('Error getting order status:', error);
            throw error;
        }
    }

    // Generate order timeline
    generateTimeline(order, tracking) {
        const timeline = [];
        
        // Order placed
        timeline.push({
            event: 'order_placed',
            title: 'Order Placed',
            description: `Your order #${order.orderId} has been received`,
            timestamp: order.createdAt,
            status: 'completed',
            icon: '📝'
        });
        
        // Payment confirmed
        if (order.payment.status === 'completed') {
            timeline.push({
                event: 'payment_confirmed',
                title: 'Payment Confirmed',
                description: `Payment of Rs. ${order.payment.amount} received via ${order.payment.gateway}`,
                timestamp: order.payment.verifiedAt || order.createdAt,
                status: 'completed',
                icon: '💳'
            });
        }
        
        // Order confirmed
        if (order.status === 'confirmed') {
            timeline.push({
                event: 'order_confirmed',
                title: 'Order Confirmed',
                description: 'Your order has been confirmed and is being prepared',
                timestamp: order.updatedAt,
                status: 'completed',
                icon: '✅'
            });
        }
        
        // Order shipped
        if (tracking.shippedAt) {
            timeline.push({
                event: 'order_shipped',
                title: 'Order Shipped',
                description: `Your order has been shipped via ${tracking.deliveryPartner}`,
                timestamp: tracking.shippedAt,
                status: 'completed',
                icon: '🚚',
                trackingNumber: tracking.trackingNumber
            });
        }
        
        // Out for delivery
        if (tracking.outForDeliveryAt) {
            timeline.push({
                event: 'out_for_delivery',
                title: 'Out for Delivery',
                description: 'Your order is out for delivery and will arrive today',
                timestamp: tracking.outForDeliveryAt,
                status: 'completed',
                icon: '🏃'
            });
        }
        
        // Order delivered
        if (order.status === 'delivered') {
            timeline.push({
                event: 'order_delivered',
                title: 'Order Delivered',
                description: 'Your order has been successfully delivered',
                timestamp: order.actualDelivery || order.updatedAt,
                status: 'completed',
                icon: '🎉'
            });
        }
        
        return timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // Get milestones for current status
    getMilestones(status) {
        const allMilestones = [
            { key: 'order_placed', label: 'Order Placed', completed: true },
            { key: 'payment_confirmed', label: 'Payment Confirmed', completed: false },
            { key: 'order_confirmed', label: 'Order Confirmed', completed: false },
            { key: 'order_shipped', label: 'Order Shipped', completed: false },
            { key: 'out_for_delivery', label: 'Out for Delivery', completed: false },
            { key: 'order_delivered', label: 'Delivered', completed: false }
        ];
        
        const statusOrder = [
            'pending', 'payment_pending', 'confirmed', 'processing', 
            'shipped', 'out_for_delivery', 'delivered'
        ];
        
        const currentIndex = statusOrder.indexOf(status);
        
        return allMilestones.map((milestone, index) => {
            if (index === 0) return { ...milestone, completed: true };
            if (index <= currentIndex + 1) return { ...milestone, completed: true };
            return { ...milestone, completed: false };
        });
    }

    // Get next steps
    getNextSteps(status) {
        const nextSteps = {
            pending: ['Complete payment', 'Order confirmation'],
            payment_pending: ['Payment verification', 'Order confirmation'],
            confirmed: ['Order processing', 'Quality check', 'Packaging'],
            processing: ['Handover to delivery partner', 'Shipping'],
            shipped: ['In transit', 'Out for delivery'],
            out_for_delivery: ['Delivery to your address'],
            delivered: ['Rate your experience', 'Leave a review']
        };
        
        return nextSteps[status] || [];
    }

    // Update order status
    async updateOrderStatus(orderId, status, additionalData = {}) {
        try {
            const order = await Order.findOne({ orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            // Update order in database
            const updateData = { status, updatedAt: new Date() };
            
            if (status === 'shipped') {
                updateData.shippedAt = new Date();
                updateData.trackingNumber = additionalData.trackingNumber;
                updateData.deliveryPartner = additionalData.deliveryPartner;
            }
            
            if (status === 'delivered') {
                updateData.actualDelivery = new Date();
            }
            
            await Order.updateOne({ orderId }, { $set: updateData });
            
            // Update tracking data
            if (!this.trackingData.has(orderId)) {
                this.trackingData.set(orderId, {});
            }
            
            const tracking = this.trackingData.get(orderId);
            Object.assign(tracking, additionalData, { lastUpdated: new Date() });
            
            // Broadcast update to all connected clients
            this.broadcastUpdate(orderId, {
                type: 'status_update',
                status,
                timestamp: new Date(),
                ...additionalData
            });
            
            // Send notifications
            await this.sendStatusNotifications(order, status, additionalData);
            
            console.log(`Order ${orderId} status updated to ${status}`);
            
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Update location
    async updateLocation(orderId, location) {
        try {
            if (!this.trackingData.has(orderId)) {
                this.trackingData.set(orderId, {});
            }
            
            const tracking = this.trackingData.get(orderId);
            tracking.currentLocation = location;
            tracking.lastLocationUpdate = new Date();
            
            // Broadcast location update
            this.broadcastUpdate(orderId, {
                type: 'location_update',
                location,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Error updating location:', error);
        }
    }

    // Broadcast update to all clients for an order
    broadcastUpdate(orderId, update) {
        const clients = this.clients.get(orderId);
        if (!clients) return;
        
        const message = JSON.stringify(update);
        
        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    // Send status notifications
    async sendStatusNotifications(order, status, additionalData) {
        try {
            switch (status) {
                case 'confirmed':
                    // Already sent order confirmation email
                    break;
                    
                case 'shipped':
                    await sendOrderShippedEmail(order, additionalData);
                    await sendWhatsAppMessage(order, 'orderShipped');
                    break;
                    
                case 'delivered':
                    await sendOrderDeliveredEmail(order);
                    await sendWhatsAppMessage(order, 'orderDelivered');
                    break;
                    
                case 'payment_failed':
                    await sendPaymentFailureNotification(order);
                    break;
            }
        } catch (error) {
            console.error('Error sending status notifications:', error);
        }
    }

    // Handle subscription to order updates
    handleSubscription(ws, data) {
        const { orderId, events } = data;
        
        // Store subscription preferences
        ws.subscriptions = events || ['status_update', 'location_update'];
        
        // Send confirmation
        ws.send(JSON.stringify({
            type: 'subscription_confirmed',
            orderId,
            events: ws.subscriptions
        }));
    }

    // Handle location update from delivery partner
    handleLocationUpdate(ws, data) {
        const { orderId, location } = data;
        this.updateLocation(orderId, location);
    }

    // Handle delivery feedback
    async handleDeliveryFeedback(ws, data) {
        try {
            const { orderId, rating, feedback, photos } = data;
            
            // Store feedback in database
            await Order.updateOne(
                { orderId },
                { 
                    $set: {
                        'deliveryFeedback.rating': rating,
                        'deliveryFeedback.feedback': feedback,
                        'deliveryFeedback.photos': photos,
                        'deliveryFeedback.timestamp': new Date()
                    }
                }
            );
            
            // Broadcast feedback received
            this.broadcastUpdate(orderId, {
                type: 'feedback_received',
                rating,
                timestamp: new Date()
            });
            
        } catch (error) {
            console.error('Error handling delivery feedback:', error);
        }
    }

    // Start connection health check
    startHealthCheck() {
        setInterval(() => {
            this.clients.forEach((clientSet, orderId) => {
                clientSet.forEach(client => {
                    if (!client.isAlive) {
                        client.terminate();
                        clientSet.delete(client);
                        return;
                    }
                    
                    client.isAlive = false;
                    client.ping();
                });
                
                // Clean up empty client sets
                if (clientSet.size === 0) {
                    this.clients.delete(orderId);
                }
            });
        }, 30000); // Check every 30 seconds
    }

    // Get tracking statistics
    getTrackingStats() {
        return {
            connectedClients: Array.from(this.clients.values()).reduce((total, set) => total + set.size, 0),
            trackedOrders: this.clients.size,
            activeTrackingData: this.trackingData.size
        };
    }

    // Clean up old tracking data
    cleanupOldData() {
        const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        
        for (const [orderId, tracking] of this.trackingData.entries()) {
            if (tracking.lastUpdated && tracking.lastUpdated < cutoffDate) {
                this.trackingData.delete(orderId);
                console.log(`Cleaned up tracking data for order ${orderId}`);
            }
        }
    }

    // Integrate with delivery partner APIs
    async integrateWithDeliveryPartner(orderId, partner, trackingNumber) {
        try {
            const partnerConfig = this.deliveryPartners[partner.toLowerCase()];
            if (!partnerConfig) {
                throw new Error(`Unknown delivery partner: ${partner}`);
            }
            
            // This would integrate with the delivery partner's API
            // For now, we'll simulate tracking updates
            
            // Simulate shipping
            setTimeout(() => {
                this.updateOrderStatus(orderId, 'shipped', {
                    deliveryPartner: partnerConfig.name,
                    trackingNumber,
                    shippedAt: new Date()
                });
            }, 1000);
            
            // Simulate out for delivery
            setTimeout(() => {
                this.updateOrderStatus(orderId, 'out_for_delivery', {
                    outForDeliveryAt: new Date(),
                    currentLocation: 'Local Distribution Center'
                });
            }, 60000); // 1 minute later
            
            // Simulate delivery
            setTimeout(() => {
                this.updateOrderStatus(orderId, 'delivered', {
                    actualDelivery: new Date(),
                    currentLocation: 'Delivered'
                });
            }, 120000); // 2 minutes later
            
        } catch (error) {
            console.error('Error integrating with delivery partner:', error);
        }
    }

    // Get estimated delivery time
    getEstimatedDelivery(orderId) {
        const tracking = this.trackingData.get(orderId);
        if (!tracking) return null;
        
        return tracking.estimatedDelivery || this.calculateEstimatedDelivery(tracking);
    }

    // Calculate estimated delivery based on current status
    calculateEstimatedDelivery(tracking) {
        const now = new Date();
        let estimatedDate;
        
        if (tracking.shippedAt) {
            // Add 2-3 business days from shipping
            estimatedDate = new Date(tracking.shippedAt);
            estimatedDate.setDate(estimatedDate.getDate() + 3);
        } else if (tracking.orderConfirmed) {
            // Add 4-5 business days from confirmation
            estimatedDate = new Date(tracking.orderConfirmed);
            estimatedDate.setDate(estimatedDate.getDate() + 5);
        } else {
            // Add 7 business days from order placement
            estimatedDate = new Date();
            estimatedDate.setDate(estimatedDate.getDate() + 7);
        }
        
        return estimatedDate;
    }
}

module.exports = PaymentTrackingService;
