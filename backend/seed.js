const mongoose = require('mongoose');
const Product = require('./models/Product');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/gbdryfruits');

// Product data from your frontend
const products = [
    {
        name: 'Premium Almonds (California)',
        description: 'High-quality California almonds, rich in nutrients and perfect for snacking or cooking.',
        category: 'Nuts without Shell',
        price: 1200,
        originalPrice: 1500,
        weight: '1kg',
        image: 'images/Nuts without Shell Premium Almonds (California).png',
        stockQuantity: 100,
        inStock: true,
        isFeatured: true,
        rating: 4.5,
        numReviews: 23
    },
    {
        name: 'Walnuts (Kashmiri)',
        description: 'Premium Kashmiri walnuts known for their rich flavor and high omega-3 content.',
        category: 'Nuts without Shell',
        price: 1800,
        originalPrice: 2200,
        weight: '1kg',
        image: 'images/Nuts without Shell Walnuts (Kashmiri).png',
        stockQuantity: 75,
        inStock: true,
        isFeatured: true,
        rating: 4.7,
        numReviews: 18
    },
    {
        name: 'Premium Cashews (W240)',
        description: 'Large, crunchy cashews perfect for cooking and snacking. Rich in vitamins and minerals.',
        category: 'Nuts without Shell',
        price: 1600,
        originalPrice: 2000,
        weight: '1kg',
        image: 'images/Nuts without Shell Premium Cashews (W240).png',
        stockQuantity: 80,
        inStock: true,
        isFeatured: true,
        rating: 4.6,
        numReviews: 31
    },
    {
        name: 'Pistachios (Salted)',
        description: 'Delicious salted pistachios, rich in flavor and perfect for healthy snacking.',
        category: 'Nuts with Shell',
        price: 2500,
        weight: '500g',
        image: 'images/Nuts with Shell Pistachios (Salted).png',
        stockQuantity: 50,
        inStock: true,
        isFeatured: true,
        rating: 4.8,
        numReviews: 31
    },
    {
        name: 'Raisins (Black Seedless)',
        description: 'Sweet and juicy black seedless raisins, perfect for cooking or as a healthy snack.',
        category: 'Dry Fruits',
        price: 400,
        weight: '1kg',
        image: 'images/Dry Fruits Raisins (Black Seedless).png',
        stockQuantity: 200,
        inStock: true,
        rating: 4.4,
        numReviews: 12
    },
    {
        name: 'Dates (Medjool)',
        description: 'Premium Medjool dates, naturally sweet and packed with nutrients.',
        category: 'Dates',
        price: 800,
        weight: '500g',
        image: 'images/Dates Dates (Medjool).png',
        stockQuantity: 80,
        inStock: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 27
    },
    {
        name: 'Dried Apricots (Turkish)',
        description: 'Sweet and tangy Turkish dried apricots, rich in vitamins and fiber.',
        category: 'Dry Fruits',
        price: 900,
        weight: '500g',
        image: 'images/Dry Fruits Dried Apricots (Turkish).png',
        stockQuantity: 70,
        inStock: true,
        rating: 4.3,
        numReviews: 19
    },
    {
        name: 'Pine Nuts (Chilgoza)',
        description: 'Premium Chilgoza pine nuts, delicate flavor and rich in healthy fats.',
        category: 'Nuts without Shell',
        price: 3500,
        weight: '250g',
        image: 'images/Nuts without Shell Pine Nuts (Chilgoza).png',
        stockQuantity: 40,
        inStock: true,
        rating: 4.7,
        numReviews: 8
    },
    {
        name: 'Mixed Dry Fruits (Premium)',
        description: 'A premium mix of almonds, cashews, pistachios, walnuts, and raisins.',
        category: 'Mixed Dry Fruits',
        price: 2200,
        weight: '1kg',
        image: 'images/Mixed Dry Fruits Mixed Dry Fruits (Premium).png',
        stockQuantity: 100,
        inStock: true,
        isFeatured: true,
        rating: 4.6,
        numReviews: 34
    },
    {
        name: 'Peanuts (Roasted & Salted)',
        description: 'Crunchy roasted and salted peanuts, perfect for snacking.',
        category: 'Nuts with Shell',
        price: 300,
        weight: '500g',
        image: 'images/Nuts with Shell Peanuts (Roasted & Salted).png',
        stockQuantity: 150,
        inStock: true,
        rating: 4.2,
        numReviews: 16
    },
    {
        name: 'Almonds (In Shell)',
        description: 'Fresh almonds in shell, perfect for cracking and enjoying fresh.',
        category: 'Nuts with Shell',
        price: 800,
        weight: '1kg',
        image: 'images/Nuts with Shell Almonds (In Shell).png',
        stockQuantity: 90,
        inStock: true,
        rating: 4.4,
        numReviews: 11
    },
    {
        name: 'Dried Figs (Anjeer)',
        description: 'Sweet and chewy dried figs, rich in fiber and essential minerals.',
        category: 'Dry Fruits',
        price: 1200,
        weight: '500g',
        image: 'images/Dry Fruits Dried Figs (Anjeer).png',
        stockQuantity: 65,
        inStock: true,
        rating: 4.5,
        numReviews: 20
    },
    {
        name: 'Sunflower Seeds',
        description: 'Premium sunflower seeds, perfect for snacking and garnishing.',
        category: 'Seeds & Cereals',
        price: 250,
        weight: '500g',
        image: 'images/Seeds & Cereals Sunflower Seeds.png',
        stockQuantity: 120,
        inStock: true,
        rating: 4.1,
        numReviews: 9
    }
];

// Clear existing products and insert new ones
async function seedDatabase() {
    try {
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        await Product.insertMany(products);
        console.log('Successfully seeded 14 products to GBDRYFRUITS database');
        
        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.connection.close();
    }
}

seedDatabase();
