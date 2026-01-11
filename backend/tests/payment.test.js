const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server-integrated');
const Order = require('../models/Order');
const User = require('../models/User');
const Cart = require('../models/Cart');

describe('Payment System Integration Tests', () => {
    let mongoServer;
    let testUser;
    let authToken;
    let testOrder;

    beforeAll(async () => {
        // Start in-memory MongoDB server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        await mongoose.connect(mongoUri);
        
        // Create test user
        testUser = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            phone: '+923001234567',
            password: 'password123'
        });
        
        // Get auth token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });
        
        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clean up orders and carts before each test
        await Order.deleteMany({});
        await Cart.deleteMany({});
    });

    describe('COD Payment Flow', () => {
        test('Should check COD availability for valid city', async () => {
            const response = await request(app)
                .post('/api/payments/cod/check-availability')
                .send({
                    city: 'Karachi',
                    totalAmount: 2000
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.available).toBe(true);
            expect(response.body.deliveryDays).toBe(2);
            expect(response.body.charges).toBe(0);
        });

        test('Should reject COD for invalid city', async () => {
            const response = await request(app)
                .post('/api/payments/cod/check-availability')
                .send({
                    city: 'UnknownCity',
                    totalAmount: 2000
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.available).toBe(false);
            expect(response.body.alternativePaymentMethods).toBeDefined();
        });

        test('Should reject COD for amount below minimum', async () => {
            const response = await request(app)
                .post('/api/payments/cod/check-availability')
                .send({
                    city: 'Karachi',
                    totalAmount: 200
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.available).toBe(false);
            expect(response.body.message).toContain('Minimum order amount');
        });

        test('Should process COD order successfully', async () => {
            const testOrderData = {
                orderId: 'COD123456',
                shippingInfo: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '+923001234567',
                    address: '123 Test Street',
                    city: 'Karachi',
                    postalCode: '75000'
                },
                orderTotal: 2000,
                items: [
                    {
                        productId: 'prod123',
                        name: 'Test Product',
                        price: 1000,
                        quantity: 2,
                        weight: '250g'
                    }
                ]
            };

            const response = await request(app)
                .post('/api/payments/cod/process')
                .send(testOrderData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('COD order placed successfully');
            expect(response.body.deliveryDays).toBe(2);
            expect(response.body.charges).toBe(0);
        });
    });

    describe('JazzCash Payment Flow', () => {
        test('Should initiate JazzCash payment', async () => {
            const paymentData = {
                amount: 1000,
                orderId: 'JC123456',
                mobileNumber: '+923001234567',
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/api/payments/jazzcash/initiate')
                .send(paymentData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.paymentUrl).toBeDefined();
            expect(response.body.transactionId).toBeDefined();
            expect(response.body.transactionId).toMatch(/^JC/);
        });

        test('Should validate payment amount', async () => {
            const response = await request(app)
                .post('/api/payments/jazzcash/initiate')
                .send({
                    amount: -100,
                    orderId: 'JC123456'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid amount');
        });
    });

    describe('EasyPaisa Payment Flow', () => {
        test('Should initiate EasyPaisa payment', async () => {
            const paymentData = {
                amount: 1000,
                orderId: 'EP123456',
                mobileNumber: '+923001234567',
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/api/payments/easypaisa/initiate')
                .send(paymentData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.paymentUrl).toBeDefined();
            expect(response.body.transactionId).toBeDefined();
        });
    });

    describe('Stripe Payment Flow', () => {
        test('Should create Stripe payment intent', async () => {
            const paymentData = {
                amount: 1000,
                orderId: 'ST123456',
                email: 'test@example.com'
            };

            const response = await request(app)
                .post('/api/payments/stripe/create-intent')
                .send(paymentData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.clientSecret).toBeDefined();
            expect(response.body.transactionId).toBeDefined();
        });
    });

    describe('PayPal Payment Flow', () => {
        test('Should create PayPal order', async () => {
            const paymentData = {
                amount: 1000,
                orderId: 'PP123456'
            };

            const response = await request(app)
                .post('/api/payments/paypal/create-order')
                .send(paymentData);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.paypalOrderId).toBeDefined();
            expect(response.body.approvalUrl).toBeDefined();
        });
    });

    describe('Payment Status Tracking', () => {
        beforeEach(async () => {
            // Create a test order
            testOrder = await Order.create({
                orderId: 'TRACK123',
                userId: testUser._id,
                items: [
                    {
                        productId: 'prod123',
                        name: 'Test Product',
                        price: 1000,
                        quantity: 1,
                        weight: '250g'
                    }
                ],
                payment: {
                    gateway: 'cod',
                    status: 'pending',
                    amount: 1000
                },
                status: 'confirmed',
                shipping: {
                    firstName: 'John',
                    lastName: 'Doe',
                    address: '123 Test Street',
                    city: 'Karachi'
                }
            });
        });

        test('Should get payment status', async () => {
            const response = await request(app)
                .get(`/api/payments/status/${testOrder.orderId}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.paymentStatus).toBe('pending');
            expect(response.body.paymentGateway).toBe('cod');
            expect(response.body.orderStatus).toBe('confirmed');
            expect(response.body.amount).toBe(1000);
        });

        test('Should return 404 for non-existent order', async () => {
            const response = await request(app)
                .get('/api/payments/status/NONEXISTENT');
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Order not found');
        });
    });

    describe('Payment Retry', () => {
        beforeEach(async () => {
            // Create a failed order
            testOrder = await Order.create({
                orderId: 'RETRY123',
                userId: testUser._id,
                items: [
                    {
                        productId: 'prod123',
                        name: 'Test Product',
                        price: 1000,
                        quantity: 1,
                        weight: '250g'
                    }
                ],
                payment: {
                    gateway: 'stripe',
                    status: 'failed',
                    amount: 1000,
                    responseMessage: 'Card declined'
                },
                status: 'payment_failed'
            });
        });

        test('Should retry failed payment', async () => {
            const response = await request(app)
                .post(`/api/payments/retry/${testOrder.orderId}`)
                .send({
                    newPaymentMethod: 'jazzcash'
                });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Payment reset for retry');
            expect(response.body.newPaymentMethod).toBe('jazzcash');
        });

        test('Should reject retry for successful payment', async () => {
            // Update order to successful
            await Order.updateOne(
                { orderId: testOrder.orderId },
                { 'payment.status': 'completed' }
            );

            const response = await request(app)
                .post(`/api/payments/retry/${testOrder.orderId}`)
                .send({
                    newPaymentMethod: 'jazzcash'
                });
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Only failed payments can be retried');
        });
    });

    describe('Payment Analytics', () => {
        beforeEach(async () => {
            // Create test orders for analytics
            await Order.create([
                {
                    orderId: 'ANALYTICS1',
                    userId: testUser._id,
                    items: [{ name: 'Product 1', price: 1000, quantity: 1 }],
                    payment: {
                        gateway: 'jazzcash',
                        status: 'completed',
                        amount: 1000,
                        fees: { total: 50 }
                    },
                    status: 'delivered',
                    createdAt: new Date('2024-01-01')
                },
                {
                    orderId: 'ANALYTICS2',
                    userId: testUser._id,
                    items: [{ name: 'Product 2', price: 2000, quantity: 1 }],
                    payment: {
                        gateway: 'stripe',
                        status: 'completed',
                        amount: 2000,
                        fees: { total: 100 }
                    },
                    status: 'delivered',
                    createdAt: new Date('2024-01-02')
                },
                {
                    orderId: 'ANALYTICS3',
                    userId: testUser._id,
                    items: [{ name: 'Product 3', price: 1500, quantity: 1 }],
                    payment: {
                        gateway: 'easypaisa',
                        status: 'failed',
                        amount: 1500,
                        fees: { total: 0 }
                    },
                    status: 'payment_failed',
                    createdAt: new Date('2024-01-03')
                }
            ]);
        });

        test('Should get payment analytics', async () => {
            const response = await request(app)
                .get('/api/analytics/payments')
                .query({ dateRange: '30d' });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.overview).toBeDefined();
            expect(response.body.data.gatewayStats).toBeDefined();
            expect(response.body.data.dailyStats).toBeDefined();
            expect(response.body.data.overview.totalOrders).toBe(3);
            expect(response.body.data.overview.successfulPayments).toBe(2);
            expect(response.body.data.overview.failedPayments).toBe(1);
            expect(response.body.data.overview.totalRevenue).toBe(3000);
        });

        test('Should get real-time metrics', async () => {
            const response = await request(app)
                .get('/api/analytics/realtime');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.ordersLast24h).toBeDefined();
            expect(response.body.data.revenueLast24h).toBeDefined();
            expect(response.body.data.activeOrders).toBeDefined();
            expect(response.body.data.timestamp).toBeDefined();
        });

        test('Should generate CSV report', async () => {
            const response = await request(app)
                .get('/api/analytics/report')
                .query({ type: 'daily', format: 'csv' });
            
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('text/csv; charset=utf-8');
            expect(response.headers['content-disposition']).toContain('attachment');
            expect(response.text).toContain('Metric,Value');
        });
    });

    describe('Security Tests', () => {
        test('Should reject requests without rate limiting', async () => {
            const requests = [];
            
            // Make multiple requests quickly
            for (let i = 0; i < 105; i++) {
                requests.push(
                    request(app)
                        .post('/api/payments/cod/check-availability')
                        .send({
                            city: 'Karachi',
                            totalAmount: 2000
                        })
                );
            }
            
            const responses = await Promise.all(requests);
            
            // Some requests should be rate limited
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        test('Should have proper security headers', async () => {
            const response = await request(app)
                .get('/health');
            
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-xss-protection']).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('Should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/payments/cod/check-availability')
                .send('invalid json')
                .set('Content-Type', 'application/json');
            
            expect(response.status).toBe(400);
        });

        test('Should handle missing required fields', async () => {
            const response = await request(app)
                .post('/api/payments/cod/check-availability')
                .send({}); // Empty object
            
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Should handle database connection errors gracefully', async () => {
            // Close database connection temporarily
            await mongoose.connection.close();
            
            const response = await request(app)
                .post('/api/payments/cod/process')
                .send({
                    orderId: 'TEST123',
                    shippingInfo: {
                        firstName: 'John',
                        lastName: 'Doe',
                        address: '123 Test Street',
                        city: 'Karachi'
                    },
                    orderTotal: 2000
                });
            
            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            
            // Reconnect for other tests
            await mongoose.connect(mongoServer.getUri());
        });
    });

    describe('WebSocket Payment Tracking', () => {
        let clientSocket;
        let serverSocket;

        beforeAll(() => {
            // Mock WebSocket connection for testing
            const { io } = require('../server-integrated');
            
            io.on('connection', (socket) => {
                serverSocket = socket;
            });
        });

        afterAll(() => {
            if (clientSocket) clientSocket.close();
            if (serverSocket) serverSocket.close();
        });

        test('Should handle order status updates via WebSocket', (done) => {
            const testData = {
                orderId: 'WS123',
                status: 'shipped',
                additionalData: {
                    trackingNumber: 'TRACK123',
                    deliveryPartner: 'TCS'
                }
            };

            serverSocket.on('status-update', (data) => {
                expect(data.orderId).toBe(testData.orderId);
                expect(data.status).toBe(testData.status);
                expect(data.trackingNumber).toBe(testData.additionalData.trackingNumber);
                done();
            });

            serverSocket.emit('order-status-update', testData);
        });

        test('Should handle location updates via WebSocket', (done) => {
            const testData = {
                orderId: 'WS123',
                location: {
                    lat: 24.8607,
                    lng: 67.0011,
                    address: 'Karachi, Pakistan'
                }
            };

            serverSocket.on('location-update', (data) => {
                expect(data.orderId).toBe(testData.orderId);
                expect(data.location.lat).toBe(testData.location.lat);
                expect(data.location.lng).toBe(testData.location.lng);
                done();
            });

            serverSocket.emit('location-update', testData);
        });
    });
});
