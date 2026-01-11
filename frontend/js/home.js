// GBDRYFRUITS - Home JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Also scroll to top when page is shown (for back/forward navigation)
    window.onpageshow = function(event) {
        if (event.persisted) {
            window.scrollTo(0, 0);
        } else {
            window.scrollTo(0, 0);
        }
    };
    
    // Load featured products from MongoDB
    loadFeaturedProducts();
    
    // Update cart count
    updateCartCount();
    
    // Update auth UI
    if (window.authHelpers) {
        window.authHelpers.updateAuthUI();
    }
});

// Load featured products from MongoDB
async function loadFeaturedProducts() {
    try {
        console.log('Loading featured products from MongoDB...');
        
        // Fetch from real MongoDB API
        const response = await fetch('http://localhost:5000/api/products?featured=true&limit=4');
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const result = await response.json();
        
        if (result.success && result.products) {
            displayFeaturedProducts(result.products);
        } else {
            console.error('No products found');
            displayFeaturedProducts([]);
        }
    } catch (error) {
        console.error('Load featured products error:', error);
        // Fallback to empty state
        displayFeaturedProducts([]);
    }
}

// Display featured products
function displayFeaturedProducts(products) {
    const featuredGrid = document.getElementById('featuredProducts');
    
    if (!products || products.length === 0) {
        featuredGrid.innerHTML = '<p>No featured products available</p>';
        return;
    }
    
    featuredGrid.innerHTML = products.map(product => `
        <div class="featured-product-card">
            <img src="${product.image}" 
                 alt="${product.name}"
                 onerror="this.src='https://via.placeholder.com/280x200?text=No+Image'">
            <div class="featured-product-info">
                <h3 class="featured-product-name">${product.name}</h3>
                <div class="featured-product-price">Rs.${product.price}</div>
                <button class="add-to-cart-btn" 
                        data-product-id="${product._id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}"
                        data-product-image="${product.image}"
                        data-product-weight="${product.weight || '1kg'}"
                        onclick="handleAddToCart(event)">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Handle add to cart from homepage
function handleAddToCart(event) {
    const btn = event.target;
    const productId = btn.dataset.productId;
    const productName = btn.dataset.productName;
    const productPrice = parseFloat(btn.dataset.productPrice);
    
    // Get product details from button dataset or find from products
    const productImage = btn.dataset.productImage || 'https://images.unsplash.com/photo-1528205447524-6e465876b126?w=100';
    const productWeight = btn.dataset.productWeight || '1kg';
    
    // Use premium cart system
    if (typeof premiumCart !== 'undefined') {
        premiumCart.addToCart(productId, productName, productPrice, productImage, productWeight);
    } else {
        // Fallback to old system
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already in cart
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1,
                image: productImage,
                weight: productWeight
            });
        }
        
        // Save cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Show success message
        showNotification('Product added to cart!', 'success');
    }
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Make functions available globally
window.homeHelpers = {
    loadFeaturedProducts,
    handleAddToCart,
    updateCartCount
};
