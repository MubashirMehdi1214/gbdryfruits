const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: false },
        phone: { type: String, required: true }
    },
    orderItems: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }],
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'Pakistan' }
    },
    shippingMethod: {
        type: String,
        enum: ['Local Pakistan', 'International Alibaba'],
        default: 'Local Pakistan'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Bank Transfer', 'Cash on Delivery', 'JazzCash', 'EasyPaisa', 'Meezan Bank', 'MasterCard', 'UnionPay', 'Bank Card', 'Stripe', 'PayPal', 'Visa', 'American Express', 'Discover']
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    itemsPrice: {
        type: Number,
        required: true,
        min: 0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    payment: {
        gateway: {
            type: String,
            enum: ['cod', 'jazzcash', 'easypaisa', 'bank', 'stripe', 'paypal', 'card']
        },
        deliveryCharges: {
            type: Number,
            default: 0
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        }
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    trackingNumber: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
