// Full Cart Page - Premium Checkout Experience
// GBDRYFRUITS - High-Converting Cart System

class FullCart {
    constructor() {
        this.cart = [];
        this.promoCode = '';
        this.discount = 0;
        this.init();
    }

    init() {
        this.loadCart();
        this.setupEventListeners();
        this.updateCartUI();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Setup event listeners
    setupEventListeners() {
        // Apply promo code on Enter key
        document.getElementById('promoCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyPromoCode();
            }
        });
    }

    // Apply promo code
    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const code = promoInput.value.trim().toUpperCase();
        
        if (!code) {
            promoMessage.textContent = 'Please enter a promo code';
            promoMessage.className = 'promo-message error';
            return;
        }

        // Simulate promo code validation (in real app, this would be an API call)
        const validPromos = {
            'WELCOME10': { discount: 0.10, message: '10% discount applied!' },
            'SAVE20': { discount: 0.20, message: '20% discount applied!' },
            'FREESHIP': { discount: 0, message: 'Free shipping applied!' },
            'PREMIUM15': { discount: 0.15, message: '15% discount applied!' }
        };

        if (validPromos[code]) {
            this.discount = validPromos[code].discount;
            this.promoCode = code;
            promoMessage.textContent = validPromos[code].message;
            promoMessage.className = 'promo-message success';
        } else {
            promoMessage.textContent = 'Invalid promo code';
            promoMessage.className = 'promo-message error';
            this.discount = 0;
            this.promoCode = '';
        }

        this.updateCartUI();
    }

    // Calculate subtotal
    getSubtotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Calculate shipping
    getShipping() {
        // Always free shipping
        return 0;
    }

    // Calculate discount amount
    getDiscountAmount() {
        const subtotal = this.getSubtotal();
        return subtotal * this.discount;
    }

    // Calculate grand total
    getGrandTotal() {
        const subtotal = this.getSubtotal();
        const shipping = this.getShipping();
        const discountAmount = this.getDiscountAmount();
        return subtotal + shipping - discountAmount;
    }

    // Update cart UI
    updateCartUI() {
        this.updateCartItems();
        this.updateUpsell();
        this.updateOrderSummary();
        this.updateMobileBar();
    }

    // Update cart items table
    updateCartItems() {
        const cartTableBody = document.getElementById('cartTableBody');
        
        if (this.cart.length === 0) {
            cartTableBody.innerHTML = `
                <div class="empty-cart-state">
                    <div class="empty-cart-icon">🛒</div>
                    <div class="empty-cart-title">Your cart is empty</div>
                    <div class="empty-cart-text">Looks like you haven't added any premium dry fruits yet</div>
                    <button class="empty-cart-btn" onclick="window.location.href='products.html'">
                        Start Shopping
                    </button>
                </div>
            `;
            return;
        }

        cartTableBody.innerHTML = this.cart.map(item => `
            <div class="cart-row">
                <div class="cart-row-product">
                    <img src="${item.image}" alt="${item.name}" class="cart-row-image">
                    <div class="cart-row-details">
                        <div class="cart-row-name">${item.name}</div>
                        <div class="cart-row-weight">${item.weight}</div>
                    </div>
                </div>
                <div class="cart-row-price">Rs. ${item.price.toLocaleString()}</div>
                <div class="cart-row-quantity">
                    <div class="quantity-selector-large">
                        <button class="quantity-btn-large" onclick="fullCart.updateQuantity('${item.id}', -1)">−</button>
                        <span class="quantity-value-large">${item.quantity}</span>
                        <button class="quantity-btn-large" onclick="fullCart.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div class="cart-row-total">Rs. ${(item.price * item.quantity).toLocaleString()}</div>
                <div class="cart-row-actions">
                    <button class="remove-btn-large" onclick="fullCart.removeFromCart('${item.id}')">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update quantity
    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveCart();
                this.updateCartUI();
            }
        }
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Product removed from cart');
    }

    // Update upsell section
    updateUpsell() {
        const upsellGrid = document.getElementById('upsellGrid');
        
        // Get current cart product IDs
        const cartProductIds = this.cart.map(item => item.id);
        
        // Sample upsell products (in real app, this would come from API)
        const upsellProducts = [
            {
                id: 'upsell1',
                name: 'Premium Almond Mix',
                price: 850,
                image: 'https://via.placeholder.com/200x120?text=Almond+Mix',
                weight: '500g'
            },
            {
                id: 'upsell2', 
                name: 'Organic Cashew Collection',
                price: 1200,
                image: 'https://via.placeholder.com/200x120?text=Cashew+Collection',
                weight: '1kg'
            },
            {
                id: 'upsell3',
                name: 'Premium Date Box',
                price: 950,
                image: 'https://via.placeholder.com/200x120?text=Date+Box',
                weight: '750g'
            }
        ].filter(product => !cartProductIds.includes(product.id));

        if (upsellProducts.length === 0) {
            upsellGrid.parentElement.style.display = 'none';
            return;
        }

        upsellGrid.parentElement.style.display = 'block';
        upsellGrid.innerHTML = upsellProducts.map(product => `
            <div class="upsell-item" onclick="fullCart.addUpsell('${product.id}', '${product.name}', ${product.price}, '${product.image}', '${product.weight}')">
                <img src="${product.image}" alt="${product.name}" class="upsell-item-image">
                <div class="upsell-item-name">${product.name}</div>
                <div class="upsell-item-price">Rs. ${product.price.toLocaleString()}</div>
            </div>
        `).join('');
    }

    // Add upsell item to cart
    addUpsell(id, name, price, image, weight) {
        const existingItem = this.cart.find(item => item.id === id);
        
        if (!existingItem) {
            this.cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                weight: weight,
                quantity: 1
            });
            
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Added to cart: ' + name);
        }
    }

    // Update order summary
    updateOrderSummary() {
        const subtotal = this.getSubtotal();
        const shipping = this.getShipping();
        const discountAmount = this.getDiscountAmount();
        const grandTotal = this.getGrandTotal();

        // Update summary values
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const discountElement = document.getElementById('discount');
        const grandTotalElement = document.getElementById('grandTotal');
        const discountRow = document.getElementById('discountRow');

        if (subtotalElement) subtotalElement.textContent = `Rs. ${subtotal.toLocaleString()}`;
        if (shippingElement) shippingElement.textContent = `Rs. ${shipping.toLocaleString()}`;
        
        if (discountAmount > 0 && discountElement && discountRow) {
            discountElement.textContent = `-Rs. ${discountAmount.toLocaleString()}`;
            discountRow.style.display = 'flex';
        } else if (discountRow) {
            discountRow.style.display = 'none';
        }
        
        if (grandTotalElement) grandTotalElement.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }

    // Update mobile checkout bar
    updateMobileBar() {
        const mobileTotal = document.getElementById('mobileTotal');
        const grandTotal = this.getGrandTotal();
        
        if (mobileTotal) {
            mobileTotal.textContent = `Rs. ${grandTotal.toLocaleString()}`;
        }
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Proceed to payment
    proceedToPayment() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Redirect to professional checkout page
        window.location.href = 'checkout-professional.html';
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.discount = 0;
        this.promoCode = '';
        this.saveCart();
        this.updateCartUI();
        
        // Clear promo input
        const promoInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        if (promoInput) promoInput.value = '';
        if (promoMessage) promoMessage.textContent = '';
    }
}

// Initialize full cart
const fullCart = new FullCart();

// Global functions for onclick handlers
function applyPromoCode() {
    fullCart.applyPromoCode();
}

function proceedToPayment() {
    fullCart.proceedToPayment();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FullCart;
}
