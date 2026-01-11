// GBDRYFRUITS - Demo Product Data Seeder
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Demo products data
const demoProducts = [
    {
        name: 'Premium Almonds (California)',
        description: 'High-quality California almonds, rich in nutrients and perfect for snacking or cooking.',
        category: 'Nuts without Shell',
        price: 1200,
        originalPrice: 1500,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1528205447524-6e465876b126?w=400',
        stockQuantity: 100,
        inStock: true,
        isFeatured: true,
        rating: 4.5,
        numReviews: 23,
        tags: ['almonds', 'premium', 'california']
    },
    {
        name: 'Cashew Nuts (W240 Grade)',
        description: 'Premium W240 grade cashew nuts, creamy and delicious. Perfect for cooking and snacking.',
        category: 'Nuts without Shell',
        price: 1800,
        originalPrice: 2200,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1599496374035-65e84254723d?w=400',
        stockQuantity: 75,
        inStock: true,
        isFeatured: true,
        rating: 4.7,
        numReviews: 18,
        tags: ['cashew', 'premium', 'w240']
    },
    {
        name: 'Pistachios (Salted)',
        description: 'Delicious salted pistachios, rich in flavor and perfect for healthy snacking.',
        category: 'Nuts with Shell',
        price: 2500,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1594753242357-30f6981e3c0d?w=400',
        stockQuantity: 50,
        inStock: true,
        isFeatured: true,
        rating: 4.8,
        numReviews: 31,
        tags: ['pistachios', 'salted', 'premium']
    },
    {
        name: 'Walnuts (Kashmiri)',
        description: 'Premium Kashmiri walnuts known for their rich flavor and brain-boosting properties.',
        category: 'Nuts with Shell',
        price: 1600,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1615145659705-66e236c3d7b3?w=400',
        stockQuantity: 60,
        inStock: true,
        rating: 4.6,
        numReviews: 15,
        tags: ['walnuts', 'kashmiri', 'premium']
    },
    {
        name: 'Raisins (Black Seedless)',
        description: 'Sweet and juicy black seedless raisins, perfect for cooking or as a healthy snack.',
        category: 'Dry Fruits',
        price: 400,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=400',
        stockQuantity: 200,
        inStock: true,
        rating: 4.4,
        numReviews: 12,
        tags: ['raisins', 'black', 'seedless']
    },
    {
        name: 'Dates (Medjool)',
        description: 'Premium Medjool dates, naturally sweet and packed with nutrients.',
        category: 'Dates',
        price: 800,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1605379399863-5835a891d435?w=400',
        stockQuantity: 80,
        inStock: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 27,
        tags: ['dates', 'medjool', 'premium']
    },
    {
        name: 'Dried Apricots (Turkish)',
        description: 'Sweet and tangy Turkish dried apricots, rich in vitamins and fiber.',
        category: 'Dry Fruits',
        price: 900,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400',
        stockQuantity: 70,
        inStock: true,
        rating: 4.3,
        numReviews: 19,
        tags: ['apricots', 'turkish', 'dried']
    },
    {
        name: 'Pine Nuts (Chilgoza)',
        description: 'Premium Chilgoza pine nuts, delicate flavor and rich in healthy fats.',
        category: 'Nuts without Shell',
        price: 3500,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1596172678812-2e94a4a0e7fb?w=400',
        stockQuantity: 40,
        inStock: true,
        rating: 4.7,
        numReviews: 8,
        tags: ['pine nuts', 'chilgoza', 'premium']
    },
    {
        name: 'Mixed Dry Fruits (Premium)',
        description: 'A premium mix of almonds, cashews, pistachios, walnuts, and raisins.',
        category: 'Mixed Dry Fruits',
        price: 2200,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
        stockQuantity: 100,
        inStock: true,
        isFeatured: true,
        rating: 4.6,
        numReviews: 34,
        tags: ['mixed', 'premium', 'variety']
    },
    {
        name: 'Peanuts (Roasted & Salted)',
        description: 'Crunchy roasted and salted peanuts, perfect for snacking.',
        category: 'Nuts with Shell',
        price: 300,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd7?w=400',
        stockQuantity: 150,
        inStock: true,
        rating: 4.2,
        numReviews: 16,
        tags: ['peanuts', 'roasted', 'salted']
    },
    {
        name: 'Almonds (In Shell)',
        description: 'Fresh almonds in shell, perfect for cracking and enjoying fresh.',
        category: 'Nuts with Shell',
        price: 800,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400',
        stockQuantity: 90,
        inStock: true,
        rating: 4.4,
        numReviews: 11,
        tags: ['almonds', 'shell', 'fresh']
    },
    {
        name: 'Dried Figs (Anjeer)',
        description: 'Sweet and chewy dried figs, rich in fiber and essential minerals.',
        category: 'Dry Fruits',
        price: 1200,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
        stockQuantity: 65,
        inStock: true,
        rating: 4.5,
        numReviews: 20,
        tags: ['figs', 'anjeer', 'dried']
    },
    {
        name: 'Sunflower Seeds',
        description: 'Premium sunflower seeds, perfect for snacking and garnishing.',
        category: 'Seeds & Cereals',
        price: 250,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1596172678812-2e94a4a0e7fb?w=400',
        stockQuantity: 120,
        inStock: true,
        rating: 4.1,
        numReviews: 9,
        tags: ['sunflower', 'seeds', 'healthy']
    },
    {
        name: 'Pumpkin Seeds',
        description: 'Nutritious pumpkin seeds, rich in magnesium and zinc.',
        category: 'Seeds & Cereals',
        price: 450,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400',
        stockQuantity: 85,
        inStock: true,
        rating: 4.3,
        numReviews: 14,
        tags: ['pumpkin', 'seeds', 'nutritious']
    },
    {
        name: 'Honey (Acacia)',
        description: 'Pure acacia honey, light and delicate with a mild floral taste.',
        category: 'Honey & Spreads',
        price: 1500,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 55,
        inStock: true,
        isFeatured: true,
        rating: 4.8,
        numReviews: 22,
        tags: ['honey', 'acacia', 'pure']
    }
];

// Seed products function
async function seedProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gbdryfruits');
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert demo products
        const insertedProducts = await Product.insertMany(demoProducts);
        console.log(`Inserted ${insertedProducts.length} demo products`);

        // Display inserted products
        console.log('Demo products added:');
        insertedProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - Rs.${product.price}`);
        });

        console.log('\nProduct seeding completed successfully!');
        
    } catch (error) {
        console.error('Error seeding products:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run seeder if called directly
if (require.main === module) {
    seedProducts();
}

module.exports = { seedProducts, demoProducts };
