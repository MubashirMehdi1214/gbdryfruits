// Premium Cart System - GBDRYFRUITS
// High-Converting Cart with Premium UX

class PremiumCart {
    constructor() {
        this.cart = [];
        this.isOpen = false;
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
        this.updateCartCount();
    }

    // Setup event listeners
    setupEventListeners() {
        // Close drawer on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });

        // Close drawer on overlay click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-overlay') && this.isOpen) {
                this.closeCart();
            }
        });
    }

    // Toggle cart drawer
    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    // Open cart drawer
    openCart() {
        const overlay = document.querySelector('.cart-overlay');
        const drawer = document.querySelector('.cart-drawer');
        
        overlay.classList.add('active');
        drawer.classList.add('active');
        this.isOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    // Close cart drawer
    closeCart() {
        const overlay = document.querySelector('.cart-overlay');
        const drawer = document.querySelector('.cart-drawer');
        
        overlay.classList.remove('active');
        drawer.classList.remove('active');
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Add item to cart
    addToCart(productId, name, price, image, weight) {
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: productId,
                name: name,
                price: price,
                image: image,
                weight: weight,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Product added to cart!');
        
        // Open cart drawer for better UX
        setTimeout(() => this.openCart(), 300);
    }

    // Update item quantity
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

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }

    // Calculate subtotal
    getSubtotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Calculate free shipping progress
    getShippingProgress() {
        const subtotal = this.getSubtotal();
        const freeShippingThreshold = 1000; // Rs. 1000 for free shipping
        const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
        const amountNeeded = Math.max(freeShippingThreshold - subtotal, 0);
        
        return {
            progress: progress,
            amountNeeded: amountNeeded,
            hasFreeShipping: subtotal >= freeShippingThreshold
        };
    }

    // Update cart UI
    updateCartUI() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateShippingProgress();
        this.updateSubtotal();
    }

    // Update cart count badge
    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Update cart items display
    updateCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        
        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <div class="empty-cart-text">Your cart is empty</div>
                    <button class="empty-cart-btn" onclick="window.location.href='products.html'">
                        Continue Shopping
                    </button>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-weight">${item.weight}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-selector">
                            <button class="quantity-btn" onclick="premiumCart.updateQuantity('${item.id}', -1)">−</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="premiumCart.updateQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-item" onclick="premiumCart.removeFromCart('${item.id}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update shipping progress
    updateShippingProgress() {
        const progress = this.getShippingProgress();
        const progressText = document.querySelector('.progress-text');
        const amountNeeded = document.querySelector('.amount-needed');
        const progressPercentage = document.querySelector('.progress-percentage');
        const progressFill = document.querySelector('.progress-fill');
        
        if (progressText && amountNeeded && progressPercentage && progressFill) {
            if (progress.hasFreeShipping) {
                progressText.innerHTML = '<span style="color: var(--success-green);">🎉 You qualify for FREE delivery!</span>';
                amountNeeded.textContent = '0';
                progressPercentage.textContent = '100%';
                progressFill.style.width = '100%';
            } else {
                progressText.innerHTML = `Add Rs. <span class="amount-needed">${progress.amountNeeded}</span> more for FREE delivery`;
                amountNeeded.textContent = progress.amountNeeded;
                progressPercentage.textContent = `${Math.round(progress.progress)}%`;
                progressFill.style.width = `${progress.progress}%`;
            }
        }
    }

    // Update subtotal
    updateSubtotal() {
        const subtotal = this.getSubtotal();
        const subtotalAmount = document.querySelector('.subtotal-amount');
        
        if (subtotalAmount) {
            subtotalAmount.textContent = `Rs. ${subtotal.toLocaleString()}`;
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

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // In real implementation, redirect to checkout page
        window.location.href = 'checkout-professional.html';
    }
}

// Initialize premium cart
const premiumCart = new PremiumCart();

// Global functions for onclick handlers
function toggleCart() {
    premiumCart.toggleCart();
}

function closeCart() {
    premiumCart.closeCart();
}

function proceedToCheckout() {
    premiumCart.proceedToCheckout();
}

// Add to cart function for product pages
function addToCart(productId, name, price, image, weight) {
    premiumCart.addToCart(productId, name, price, image, weight);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumCart;
}
