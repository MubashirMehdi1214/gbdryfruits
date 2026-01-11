const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        if (req.query.minPrice) {
            filter.price = { $gte: parseFloat(req.query.minPrice) };
        }
        
        if (req.query.maxPrice) {
            filter.price = { ...filter.price, $lte: parseFloat(req.query.maxPrice) };
        }
        
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }
        
        if (req.query.featured === 'true') {
            filter.isFeatured = true;
        }

        // Sort options
        let sort = {};
        if (req.query.sort) {
            switch (req.query.sort) {
                case 'price-low':
                    sort = { price: 1 };
                    break;
                case 'price-high':
                    sort = { price: -1 };
                    break;
                case 'name':
                    sort = { name: 1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        } else {
            sort = { createdAt: -1 };
        }

        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', protect, admin, [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['Nuts with Shell', 'Nuts without Shell', 'Dry Fruits', 'Mixed Dry Fruits', 'Flavoured Nuts', 'Honey & Spreads', 'Dates', 'Seeds & Cereals']).withMessage('Invalid category'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('weight').notEmpty().withMessage('Weight is required'),
    body('image').notEmpty().withMessage('Product image is required')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
