const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Payment gateway mapping function
const getPaymentGateway = (paymentMethod) => {
    console.log('Mapping payment method:', paymentMethod);
    const gatewayMap = {
        'Cash on Delivery': 'cod',
        'JazzCash': 'jazzcash',
        'EasyPaisa': 'easypaisa',
        'Meezan Bank': 'bank',
        'Bank Transfer': 'bank',
        'MasterCard': 'card',
        'UnionPay': 'card',
        'Bank Card': 'card',
        'Stripe': 'stripe',
        'PayPal': 'paypal',
        'Visa': 'card',
        'American Express': 'card',
        'Discover': 'card'
    };
    const gateway = gatewayMap[paymentMethod] || 'bank';
    console.log('Mapped to gateway:', gateway);
    return gateway;
};

// @route   POST /api/orders
// @desc    Create new order
// @access  Public
router.post('/', [
    body('orderItems').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('shippingAddress.name').notEmpty().withMessage('Shipping name is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Shipping phone is required'),
    body('shippingAddress.address').notEmpty().withMessage('Shipping address is required'),
    body('shippingAddress.city').notEmpty().withMessage('Shipping city is required'),
    body('paymentMethod').isIn(['Bank Transfer', 'Cash on Delivery', 'JazzCash', 'EasyPaisa', 'Meezan Bank', 'MasterCard', 'UnionPay', 'Bank Card', 'Stripe', 'PayPal', 'Visa', 'American Express', 'Discover']).withMessage('Invalid payment method')
], async (req, res) => {
    try {
        console.log('=== ORDER CREATION DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Payment method:', req.body.paymentMethod);
        
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { orderItems, shippingAddress, paymentMethod, notes } = req.body;
        
        console.log('Extracted data:', {
            orderItems: orderItems?.length || 0,
            shippingAddress: shippingAddress?.city,
            paymentMethod: paymentMethod,
            notes: notes
        });

        // Verify products exist and get current prices
        for (const item of orderItems) {
            let product = null;

            if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
                product = await Product.findById(item.product);
            }

            if (!product && item.name) {
                product = await Product.findOne({ name: item.name });
                if (product) {
                    item.product = product._id;
                }
            }

            if (!product && item.name) {
                product = await Product.findOne({ name: { $regex: new RegExp(`^${escapeRegex(item.name)}$`, 'i') } });
                if (product) {
                    item.product = product._id;
                }
            }

            if (!product) {
                return res.status(404).json({ 
                    message: `Product ${item.name} not found` 
                });
            }
            
            if (!product.inStock || product.stockQuantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Product ${item.name} is out of stock or insufficient quantity` 
                });
            }
            
            // Update product price to current price
            item.price = product.price;
        }

        // Calculate prices
        const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        
        // Calculate COD charges if applicable
        let codCharges = 0;
        if (paymentMethod === 'Cash on Delivery') {
            // COD charges by city
            const COD_CHARGES = {
                'karachi': 0,
                'lahore': 0,
                'islamabad': 250,
                'rawalpindi': 0,
                'faisalabad': 0,
                'multan': 100,
                'peshawar': 150,
                'quetta': 200
            };
            
            const cityLower = shippingAddress.city.toLowerCase();
            codCharges = COD_CHARGES[cityLower] || 0;
        }
        
        const shippingPrice = codCharges; // COD charges as shipping price
        const totalPrice = itemsPrice + shippingPrice;

        console.log('Order totals:', {
            itemsPrice: itemsPrice,
            codCharges: codCharges,
            shippingPrice: shippingPrice,
            totalPrice: totalPrice
        });

        // Create order
        const orderData = {
            user: req.user?.id,
            customer: {
                name: shippingAddress.name,
                email: req.body.customerEmail || shippingAddress.email || 'N/A',
                phone: shippingAddress.phone
            },
            orderItems,
            shippingAddress,
            paymentMethod,
            notes,
            itemsPrice,
            shippingPrice,
            totalPrice,
            payment: {
                gateway: getPaymentGateway(paymentMethod),
                deliveryCharges: codCharges,
                amount: totalPrice,
                status: paymentMethod === 'Cash on Delivery' ? 'pending' : 'pending'
            }
        };

        console.log('Final order data:', orderData);

        const order = await Order.create(orderData);

        // Update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stockQuantity: -item.quantity } }
            );
        }

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name image');

        res.status(201).json({
            success: true,
            order: populatedOrder
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user.id })
            .populate('orderItems.product', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.user.id });

        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name image');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns the order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
    body('orderStatus').isIn(['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid order status')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { orderStatus, trackingNumber } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order status
        order.orderStatus = orderStatus;
        
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        // Set delivered date if status is delivered
        if (orderStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.paymentStatus = 'Completed';
        }

        await order.save();

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/orders/all
// @desc    Get all orders (admin)
// @access  Private/Admin
router.get('/all/orders', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        
        if (req.query.status) {
            filter.orderStatus = req.query.status;
        }
        
        if (req.query.paymentStatus) {
            filter.paymentStatus = req.query.paymentStatus;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('orderItems.product', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
