const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Nuts with Shell',
            'Nuts without Shell', 
            'Dry Fruits',
            'Mixed Dry Fruits',
            'Flavoured Nuts',
            'Honey & Spreads',
            'Dates',
            'Seeds & Cereals'
        ]
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative']
    },
    weight: {
        type: String,
        required: [true, 'Weight is required'],
        default: '1kg'
    },
    image: {
        type: String,
        required: [true, 'Product image is required']
    },
    images: [{
        type: String
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    stockQuantity: {
        type: Number,
        default: 100,
        min: [0, 'Stock cannot be negative']
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5']
    },
    numReviews: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

// Create indexes for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
