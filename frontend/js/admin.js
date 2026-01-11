// GBDRYFRUITS - Admin JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // API base URL
    const API_URL = 'http://localhost:5000/api';
    
    // Check if user is admin
    checkAdminAccess();
    
    // Initialize
    loadProducts();
    
    // Event listeners
    setupEventListeners();
    
    // Modal setup
    setupModal();
    
    // Auto refresh
    setupAutoRefresh();
});

// Setup modal
function setupModal() {
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProductSubmit);
    }
}

// Setup auto refresh
function setupAutoRefresh() {
    // Auto refresh every 5 minutes
    setInterval(() => {
        loadProducts();
    }, 300000);
}

// Setup event listeners
function setupEventListeners() {
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Search functionality
    const searchValue = productSearch.value.trim();
    const categoryFilterValue = document.getElementById('categoryFilter').value;
    
    loadProducts(searchValue, categoryFilterValue);
    
    // Debounce search
    let searchTimeout;
    productSearch.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadProducts(productSearch.value.trim(), categoryFilter.value);
        }, 500);
    });
    
    categoryFilter.addEventListener('change', () => {
        loadProducts(productSearch.value.trim(), categoryFilter.value);
    });
}

// Check admin access
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// Load products
async function loadProducts(search = '', category = '') {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: 1,
            limit: 50
        });
        
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayProducts(result.products);
        } else {
            showError('Failed to load products');
        }
    } catch (error) {
        console.error('Load products error:', error);
        showError('Network error. Please try again.');
    }
}

// Display products in admin table
function displayProducts(products) {
    const tableBody = document.getElementById('productsTableBody');
    
    if (!products || products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="admin-empty">
                    <h3>No products found</h3>
                    <p>Add your first product to get started</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image || 'https://via.placeholder.com/50x50?text=Product'}" 
                     alt="${product.name}"
                     onerror="this.src='https://via.placeholder.com/50x50?text=No+Image'">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>Rs.${product.price}</td>
            <td>${product.stockQuantity}</td>
            <td>
                <span class="status-badge ${product.inStock ? 'active' : 'inactive'}">
                    ${product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editProduct('${product._id}')">
                        Edit
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product._id}')">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Show add product modal
function showAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

// Hide add product modal
function hideAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    document.getElementById('addProductForm').reset();
}

// Handle add product form submission
async function handleAddProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        weight: formData.get('weight'),
        stockQuantity: parseInt(formData.get('stockQuantity')),
        image: formData.get('image') || 'https://via.placeholder.com/280x200?text=Product'
    };
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product added successfully!', 'success');
            hideAddProductModal();
            loadProducts();
        } else {
            showNotification(result.message || 'Failed to add product', 'error');
        }
    } catch (error) {
        console.error('Add product error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Edit product
async function editProduct(productId) {
    // For now, just show an alert
    alert(`Edit functionality for product ${productId} would be implemented here`);
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Product deleted successfully!', 'success');
            loadProducts();
        } else {
            showNotification(result.message || 'Failed to delete product', 'error');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        showNotification('Network error. Please try again.', 'error');
    }
}

// Show loading state
function showLoading() {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="admin-loading">Loading products...</td>
        </tr>
    `;
}

// Show error state
function showError(message) {
    const tableBody = document.getElementById('productsTableBody');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="admin-empty">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="loadProducts()" class="admin-btn">Try Again</button>
            </td>
        </tr>
    `;
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

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Make functions available globally
window.adminHelpers = {
    showAddProductModal,
    hideAddProductModal,
    editProduct,
    deleteProduct,
    logout
};
