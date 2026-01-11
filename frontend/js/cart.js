// GBDRYFRUITS - Cart JavaScript
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
    
    // Initialize cart
    loadCart();
    
    // Update auth UI
    if (window.authHelpers) {
        window.authHelpers.updateAuthUI();
    }
});

// Load cart from localStorage
async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        updateSummary(0, 0);
        return;
    }
    
    cartItems.style.display = 'block';
    cartEmpty.style.display = 'none';
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image || 'https://images.unsplash.com/photo-1528205447524-6e465876b126?w=100'}" 
                 alt="${item.name}" 
                 class="cart-item-image"
                 onerror="this.src='https://via.placeholder.com/100x100?text=Product'">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <div class="cart-item-price">Rs.${item.price}</div>
                <div class="cart-item-weight">${item.weight || '1kg'}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" 
                           onchange="setQuantity(${index}, this.value)" min="1" max="99">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="cart-item-total">Rs.${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <button class="cart-item-remove" onclick="removeItem(${index})">
                ×
            </button>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Update COD charges based on selected city
    updateCODCharges(subtotal);
}

// Update COD charges based on selected city and payment method
async function updateCODCharges(subtotal = null) {
    const citySelect = document.getElementById('citySelect');
    const selectedCity = citySelect?.value || '';
    
    // Check if payment method is selected
    const paymentMethod = getSelectedPaymentMethod();
    
    // Only calculate COD charges if payment method is Cash on Delivery
    if (!selectedCity || paymentMethod !== 'Cash on Delivery') {
        updateSummary(subtotal || 0, 0);
        return;
    }
    
    // Get COD charges from backend
    let codCharges = 0;
    try {
        const response = await fetch('http://localhost:5000/api/payments/cod/check-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                city: selectedCity,
                totalAmount: subtotal || 0
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.charges) {
                codCharges = data.charges;
            }
        }
    } catch (error) {
        console.error('Failed to fetch COD charges:', error);
        // Fallback to local calculation
        const COD_CHARGES = {
            'karachi': 0,
            'lahore': 0,
            'islamabad': 250,
            'rawalpindi': 0,
            'faisalabad': 0,
            'multan': 100,
            'peshawar': 150,
            'quetta': 200
        };
        codCharges = COD_CHARGES[selectedCity] || 0;
    }
    
    // Calculate subtotal if not provided
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const currentSubtotal = subtotal || cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const total = currentSubtotal + codCharges;
    updateSummary(currentSubtotal, codCharges, total);
}

// Get selected payment method
function getSelectedPaymentMethod() {
    // This will be implemented when we add payment method selection
    // For now, default to no COD charges until payment method is selected
    const paymentMethodElement = document.getElementById('paymentMethod');
    return paymentMethodElement ? paymentMethodElement.value : null;
}

// Update item quantity
function updateQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        // Remove item if quantity is 0 or less
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        // Save cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Reload cart and recalculate COD charges
        loadCart();
        updateCartCount();
    }
}

// Set specific quantity
function setQuantity(index, value) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const quantity = parseInt(value);
    
    if (cart[index] && quantity > 0 && quantity <= 99) {
        cart[index].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Reload cart and recalculate COD charges
        loadCart();
        updateCartCount();
    }
}

// Remove item from cart
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Reload cart and recalculate COD charges
        loadCart();
        updateCartCount();
        
        // Show notification
        showNotification(`${itemName} removed from cart`, 'info');
    }
}

// Update order summary
function updateSummary(subtotal, codCharges, total) {
    console.log('=== DEBUG updateSummary ===');
    console.log('subtotal:', subtotal);
    console.log('codCharges:', codCharges);
    console.log('total:', total);
    
    const paymentMethod = getSelectedPaymentMethod();
    const selectedCity = document.getElementById('citySelect')?.value || '';
    
    console.log('paymentMethod:', paymentMethod);
    console.log('selectedCity:', selectedCity);
    
    document.getElementById('subtotal').textContent = `Rs.${subtotal.toFixed(2)}`;
    
    if (paymentMethod === 'Cash on Delivery' && selectedCity) {
        if (codCharges > 0) {
            document.getElementById('shipping').innerHTML = `COD Charges: <small>Rs.${codCharges.toFixed(2)}</small>`;
        } else {
            document.getElementById('shipping').innerHTML = `Free <small>(COD for ${selectedCity})</small>`;
        }
    } else if (paymentMethod && paymentMethod !== 'Cash on Delivery') {
        document.getElementById('shipping').innerHTML = `Free <small>(Online payment)</small>`;
    } else {
        document.getElementById('shipping').innerHTML = 'Select payment method';
    }
    
    document.getElementById('total').textContent = `Rs.${total.toFixed(2)}`;
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    checkoutBtn.disabled = subtotal === 0 || !paymentMethod || !selectedCity;
    
    // Discount logic remains unchanged
    if (subtotal > 2000) {
        const discountElement = document.getElementById('discount');
        if (!discountElement) {
            const discountRow = document.createElement('div');
            discountRow.className = 'summary-row discount';
            discountRow.innerHTML = `
                <span>Discount (5% off)</span>
                <span id="discount">-Rs.${(subtotal * 0.05).toFixed(2)}</span>
            `;
            document.getElementById('total').parentElement.insertBefore(discountRow, document.getElementById('total').parentElement.lastElementChild);
            document.getElementById('total').textContent = `Rs.${(total - subtotal * 0.05).toFixed(2)}`;
        }
    }
}

// Update cart count in navigation
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
}

// Proceed to checkout
function proceedToCheckout() {
    // Check if cart is not empty
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Redirect to professional checkout page
    window.location.href = 'checkout-professional.html';
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

// Clear cart
function clearCart() {
    localStorage.removeItem('cart');
    loadCart();
    updateCartCount();
    showNotification('Cart cleared', 'info');
}

// Make functions available globally
window.cartHelpers = {
    loadCart,
    updateQuantity,
    setQuantity,
    removeItem,
    clearCart,
    proceedToCheckout
};
