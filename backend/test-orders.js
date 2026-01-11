const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gbdryfruits')
.then(() => {
    console.log('Connected to MongoDB');
    
    // Check orders collection
    const db = mongoose.connection.db;
    db.collection('orders').find({}).toArray(function(err, orders) {
        if (err) {
            console.error('Error:', err);
            process.exit(1);
        }
        
        console.log(`\nFound ${orders.length} orders in MongoDB:`);
        orders.forEach((order, index) => {
            console.log(`\nOrder #${index + 1}:`);
            console.log(`  ID: ${order._id}`);
            console.log(`  Customer: ${order.shippingAddress.name}`);
            console.log(`  Items: ${order.orderItems.length}`);
            console.log(`  Total: Rs. ${order.totalPrice}`);
            console.log(`  Status: ${order.orderStatus}`);
            console.log(`  Created: ${order.createdAt}`);
        });
        
        process.exit(0);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
