// GBDRYFRUITS - Mock Data for Testing
const mockProducts = [
    {
        _id: '1',
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
        bestseller: true,
        rating: 4.5,
        numReviews: 23
    },
    {
        _id: '2',
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
        _id: '3',
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
        _id: '4',
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
        _id: '5',
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
        _id: '6',
        name: 'Dates (Medjool)',
        description: 'Premium Medjool dates, naturally sweet and packed with nutrients.',
        category: 'Dates',
        price: 800,
        weight: '500g',
        image: 'images/Dates Dates (Medjool).png',
        stockQuantity: 80,
        inStock: true,
        isFeatured: true,
        organic: true,
        rating: 4.9,
        numReviews: 27
    },
    {
        _id: '7',
        name: 'Dried Apricots (Turkish Imported)',
        description: 'Sweet and tangy Turkish dried apricots, rich in vitamins and fiber.',
        category: 'Dry Fruits',
        price: 900,
        weight: '500g',
        image: 'images/Dry Fruits Dried Apricots (Turkish).png',
        stockQuantity: 70,
        inStock: true,
        imported: true,
        rating: 4.3,
        numReviews: 19
    },
    {
        _id: '8',
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
        _id: '9',
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
        _id: '10',
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
        _id: '11',
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
        _id: '12',
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
        _id: '13',
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
    },
    {
        _id: '14',
        name: 'Pumpkin Seeds',
        description: 'Nutritious pumpkin seeds, rich in magnesium and zinc.',
        category: 'Seeds & Cereals',
        price: 450,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400',
        stockQuantity: 85,
        inStock: true,
        rating: 4.3,
        numReviews: 14
    },
    {
        _id: '15',
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
        numReviews: 22
    },
    {
        _id: '16',
        name: 'Brazil Nuts',
        description: 'Rich, creamy Brazil nuts packed with selenium and healthy fats.',
        category: 'Nuts without Shell',
        price: 2800,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1596172678812-2e94a4a0e7fb?w=400',
        stockQuantity: 45,
        inStock: true,
        rating: 4.6,
        numReviews: 13
    },
    {
        _id: '17',
        name: 'Hazelnuts (Filberts)',
        description: 'Sweet, crunchy hazelnuts perfect for baking and snacking.',
        category: 'Nuts without Shell',
        price: 1900,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1596172678812-2e94a4a0e7fb?w=400',
        stockQuantity: 70,
        inStock: true,
        rating: 4.5,
        numReviews: 17
    },
    {
        _id: '18',
        name: 'Macadamia Nuts',
        description: 'Buttery, delicious macadamia nuts, the king of nuts.',
        category: 'Nuts without Shell',
        price: 4200,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1596172678812-2e94a4a0e7fb?w=400',
        stockQuantity: 35,
        inStock: true,
        rating: 4.9,
        numReviews: 25
    },
    {
        _id: '19',
        name: 'Dried Cranberries',
        description: 'Tart and sweet dried cranberries, perfect for snacking and baking.',
        category: 'Dry Fruits',
        price: 750,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
        stockQuantity: 95,
        inStock: true,
        rating: 4.4,
        numReviews: 18
    },
    {
        _id: '20',
        name: 'Dried Blueberries',
        description: 'Sweet and antioxidant-rich dried blueberries.',
        category: 'Dry Fruits',
        price: 950,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
        stockQuantity: 60,
        inStock: true,
        rating: 4.6,
        numReviews: 12
    },
    {
        _id: '21',
        name: 'Cashew Butter',
        description: 'Creamy, all-natural cashew butter without additives.',
        category: 'Honey & Spreads',
        price: 1100,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 80,
        inStock: true,
        rating: 4.7,
        numReviews: 15
    },
    {
        _id: '22',
        name: 'Almond Butter',
        description: 'Smooth, nutritious almond butter perfect for spreads.',
        category: 'Honey & Spreads',
        price: 1300,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 75,
        inStock: true,
        rating: 4.8,
        numReviews: 20
    },
    {
        _id: '23',
        name: 'Pecan Nuts',
        description: 'Sweet, buttery pecans perfect for pies and snacking.',
        category: 'Nuts without Shell',
        price: 2400,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1596172678812-2e94a4a0e7fb?w=400',
        stockQuantity: 55,
        inStock: true,
        rating: 4.6,
        numReviews: 14
    },
    {
        _id: '24',
        name: 'Dried Mango Slices',
        description: 'Sweet and chewy dried mango slices, tropical delight.',
        category: 'Dry Fruits',
        price: 650,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
        stockQuantity: 85,
        inStock: true,
        rating: 4.5,
        numReviews: 19
    },
    {
        _id: '25',
        name: 'Mixed Nuts (Salted)',
        description: 'Delicious mix of salted almonds, cashews, pistachios, and walnuts.',
        category: 'Mixed Dry Fruits',
        price: 1800,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
        stockQuantity: 110,
        inStock: true,
        isFeatured: true,
        rating: 4.7,
        numReviews: 28
    },
    {
        _id: '26',
        name: 'Flavoured Almonds (Masala)',
        description: 'Spicy masala coated almonds, perfect for snacking.',
        category: 'Flavoured Nuts',
        price: 1400,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1528205447524-6e465876b126?w=400',
        stockQuantity: 80,
        inStock: true,
        rating: 4.5,
        numReviews: 16
    },
    {
        _id: '27',
        name: 'Peri Peri Cashews',
        description: 'Zesty peri peri flavored cashews with a spicy kick.',
        category: 'Flavoured Nuts',
        price: 2000,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1599496374035-65e84254723d?w=400',
        stockQuantity: 60,
        inStock: true,
        rating: 4.6,
        numReviews: 12
    },
    {
        _id: '28',
        name: 'Chocolate Coated Almonds',
        description: 'Premium almonds coated in rich dark chocolate.',
        category: 'Flavoured Nuts',
        price: 1600,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1528205447524-6e465876b126?w=400',
        stockQuantity: 70,
        inStock: true,
        rating: 4.8,
        numReviews: 22
    },
    {
        _id: '29',
        name: 'Premium Gift Box (Dry Fruits)',
        description: 'Elegant gift box with assorted premium dry fruits.',
        category: 'Gifting',
        price: 3500,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
        stockQuantity: 40,
        inStock: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 18
    },
    {
        _id: '30',
        name: 'Corporate Gift Hamper',
        description: 'Professional gift hamper with premium nuts and dry fruits.',
        category: 'Gifting',
        price: 5000,
        weight: '2kg',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
        stockQuantity: 25,
        inStock: true,
        rating: 5.0,
        numReviews: 8
    },
    {
        _id: '31',
        name: 'Mango Pickle (Raw)',
        description: 'Traditional raw mango pickle with authentic spices.',
        category: 'Pickle & Chutney',
        price: 450,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
        stockQuantity: 90,
        inStock: true,
        rating: 4.4,
        numReviews: 15
    },
    {
        _id: '32',
        name: 'Mixed Vegetable Pickle',
        description: 'Tangy mixed vegetable pickle with seasonal vegetables.',
        category: 'Pickle & Chutney',
        price: 380,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400',
        stockQuantity: 85,
        inStock: true,
        rating: 4.3,
        numReviews: 11
    },
    {
        _id: '33',
        name: 'Desi Gur (Jaggery)',
        description: 'Pure traditional jaggery, rich in nutrients.',
        category: 'Desi Delights & Condiments',
        price: 280,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 120,
        inStock: true,
        rating: 4.6,
        numReviews: 20
    },
    {
        _id: '34',
        name: 'Suji (Semolina Fine)',
        description: 'Premium quality fine semolina for perfect halwa and upma.',
        category: 'Desi Delights & Condiments',
        price: 220,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 150,
        inStock: true,
        rating: 4.5,
        numReviews: 14
    },
    {
        _id: '35',
        name: 'Maida (Refined Flour)',
        description: 'Premium refined flour perfect for baking and cooking.',
        category: 'Desi Delights & Condiments',
        price: 180,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 200,
        inStock: true,
        rating: 4.4,
        numReviews: 9
    },
    {
        _id: '36',
        name: 'Basen (Gram Flour)',
        description: 'Pure gram flour for pakoras and traditional dishes.',
        category: 'Desi Delights & Condiments',
        price: 260,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 100,
        inStock: true,
        rating: 4.5,
        numReviews: 12
    },
    {
        _id: '37',
        name: 'Desi Brown Shakkar',
        description: 'Traditional brown sugar with natural molasses.',
        category: 'Desi Delights & Condiments',
        price: 320,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 80,
        inStock: true,
        rating: 4.7,
        numReviews: 16
    },
    {
        _id: '38',
        name: 'Green Tea Premium',
        description: 'Premium green tea leaves with antioxidant properties.',
        category: 'Teas & Nimko',
        price: 850,
        weight: '250g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 60,
        inStock: true,
        rating: 4.6,
        numReviews: 18
    },
    {
        _id: '39',
        name: 'Kashmiri Kahwa Tea',
        description: 'Traditional Kashmiri kahwa with saffron and spices.',
        category: 'Teas & Nimko',
        price: 1200,
        weight: '200g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 45,
        inStock: true,
        rating: 4.8,
        numReviews: 22
    },
    {
        _id: '40',
        name: 'Desi Ghee (Buffalo)',
        description: 'Pure homemade buffalo ghee, rich in flavor and nutrition.',
        category: 'Oils & Ghee',
        price: 1800,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 50,
        inStock: true,
        rating: 4.9,
        numReviews: 25
    },
    {
        _id: '41',
        name: 'Turmeric Powder (Pure)',
        description: 'Pure turmeric powder with natural curcumin.',
        category: 'Spices & Herbs',
        price: 350,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 90,
        inStock: true,
        rating: 4.5,
        numReviews: 13
    },
    {
        _id: '42',
        name: 'Red Chili Powder',
        description: 'Premium red chili powder with perfect heat level.',
        category: 'Spices & Herbs',
        price: 280,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 110,
        inStock: true,
        rating: 4.4,
        numReviews: 17
    },
    {
        _id: '43',
        name: 'Basmati Rice (Premium)',
        description: 'Extra long grain premium basmati rice.',
        category: 'Rice',
        price: 650,
        weight: '5kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 70,
        inStock: true,
        rating: 4.7,
        numReviews: 19
    },
    {
        _id: '44',
        name: 'Whole Wheat Flour',
        description: 'Stone-ground whole wheat flour for healthy rotis.',
        category: 'Flour',
        price: 240,
        weight: '5kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 85,
        inStock: true,
        rating: 4.6,
        numReviews: 21
    },
    {
        _id: '45',
        name: 'Chana Dal (Split Bengal Gram)',
        description: 'Premium quality chana dal for delicious dal recipes.',
        category: 'Pulses',
        price: 180,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 120,
        inStock: true,
        rating: 4.5,
        numReviews: 15
    },
    {
        _id: '46',
        name: 'Masoor Dal (Red Lentils)',
        description: 'Nutritious red lentils perfect for everyday cooking.',
        category: 'Pulses',
        price: 160,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 130,
        inStock: true,
        rating: 4.4,
        numReviews: 12
    },
    {
        _id: '47',
        name: 'Toor Dal (Pigeon Pea)',
        description: 'Premium toor dal for authentic dal recipes.',
        category: 'Pulses',
        price: 190,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 100,
        inStock: true,
        rating: 4.6,
        numReviews: 18
    },
    {
        _id: '48',
        name: 'Moong Dal (Green Gram)',
        description: 'Healthy green gram dal rich in protein.',
        category: 'Pulses',
        price: 170,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 115,
        inStock: true,
        rating: 4.5,
        numReviews: 14
    },
    {
        _id: '49',
        name: 'Urad Dal (Black Gram)',
        description: 'Premium urad dal for dal makhani and idli batter.',
        category: 'Pulses',
        price: 210,
        weight: '1kg',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 95,
        inStock: true,
        rating: 4.7,
        numReviews: 16
    },
    {
        _id: '50',
        name: 'Chana Dal Roasted',
        description: 'Crunchy roasted chana dal perfect for snacking.',
        category: 'Teas & Nimko',
        price: 320,
        weight: '500g',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
        stockQuantity: 75,
        inStock: true,
        rating: 4.4,
        numReviews: 10
    }
];

// Mock API functions
window.mockAPI = {
    getProducts: async (filters = {}) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filteredProducts = [...mockProducts];
                
                if (filters.category) {
                    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
                }
                
                if (filters.categories && filters.categories.length > 0) {
                    filteredProducts = filteredProducts.filter(p => filters.categories.includes(p.category));
                }
                
                if (filters.search) {
                    filteredProducts = filteredProducts.filter(p => 
                        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        p.description.toLowerCase().includes(filters.search.toLowerCase())
                    );
                }
                
                resolve({
                    success: true,
                    products: filteredProducts,
                    pagination: {
                        page: 1,
                        limit: 12,
                        total: filteredProducts.length,
                        pages: 1
                    }
                });
            }, 500);
        });
    },
    
    login: async (credentials) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock-token-123',
                    user: {
                        id: 'user123',
                        name: 'Test User',
                        email: credentials.email,
                        role: 'user'
                    }
                });
            }, 500);
        });
    },
    
    register: async (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock-token-123',
                    user: {
                        id: 'user123',
                        name: userData.name,
                        email: userData.email,
                        role: 'user'
                    }
                });
            }, 500);
        });
    }
};
