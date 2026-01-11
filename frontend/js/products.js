// GBDRYFRUITS - Products JavaScript
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
    
    // Check if mock data is available
    if (!window.mockAPI) {
        console.error('Mock data not loaded');
        return;
    }
    
    // State management
    let currentPage = 1;
    let currentFilters = {
        minPrice: null,
        maxPrice: null,
        search: '',
        sort: 'newest',
        quickFilters: []
    };
    
    // DOM elements
    const productsGrid = document.getElementById('productsGrid');
    const pagination = document.getElementById('pagination');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const applyPriceFilterBtn = document.getElementById('applyPriceFilter');
    const sortSelect = document.getElementById('sortSelect');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    // Initialize
    function init() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Set search from URL if present
        if (urlParams.get('search')) {
            currentFilters.search = urlParams.get('search');
            searchInput.value = currentFilters.search;
        }
        
        // Load products
        loadProducts();
        
        // Event listeners
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        
        applyPriceFilterBtn.addEventListener('click', applyPriceFilter);
        sortSelect.addEventListener('change', handleSort);
        
        // Quick filters event listeners
        const quickFilters = document.querySelectorAll('.quick-filter');
        quickFilters.forEach(filter => {
            filter.addEventListener('change', handleQuickFilters);
        });
        
        // Clear filters button
        clearFiltersBtn.addEventListener('click', clearAllFilters);
        
        // View options
        viewBtns.forEach(btn => {
            btn.addEventListener('click', handleViewChange);
        });
        
        // Update cart count
        updateCartCount();
    }
    
    // Load products from MongoDB API
    async function loadProducts() {
        try {
            console.log('loadProducts() called');
            showLoading();
            
            // Debug: Log current URL and parameters
            console.log('Current URL:', window.location.href);
            console.log('Current filters:', currentFilters);
            
            // Build query parameters for API
            const params = new URLSearchParams();
            
            if (currentFilters.search) {
                params.append('search', currentFilters.search);
            }
            
            // Handle special case for "best-products" - show all products based on images
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            
            console.log('Category parameter:', categoryParam);
            
            // Initialize products array
            let products = [];
            
            if (categoryParam === 'best-products' || urlParams.get('quick') === 'bestproducts') {
                console.log('Loading best products from images...');
                // Create products based on actual image files
                const imageFiles = [
                    'Dates Dates (Medjool).png',
                    'Dry Fruits Dried Apricots (Turkish).png', 
                    'Dry Fruits Dried Figs (Anjeer).png',
                    'Dry Fruits Raisins (Black Seedless).png',
                    'Mixed Dry Fruits Mixed Dry Fruits (Premium).png',
                    'Nuts with Shell Almonds (In Shell).png',
                    'Nuts with Shell Peanuts (Roasted & Salted).png',
                    'Nuts with Shell Pistachios (Salted).png',
                    'Nuts without Shell Pine Nuts (Chilgoza).png',
                    'Nuts without Shell Premium Almonds (California).png',
                    'Nuts without Shell Premium Cashews (W240).png',
                    'Nuts without Shell Walnuts (Kashmiri).png',
                    'Seeds & Cereals Sunflower Seeds.png'
                ];
                
                products = imageFiles.map((filename, index) => {
                    // Extract product name from filename
                    let name = filename.replace(/\.(png|jpg|jpeg)$/i, '');
                    name = name.replace(/^images\//i, '');
                    
                    // Determine category and clean name
                    let category = 'other';
                    let cleanName = name;
                    let weight = '500g';
                    let price = 800;
                    
                    if (name.includes('Dates')) {
                        category = 'dry-fruits';
                        cleanName = 'Dates (Medjool)';
                        weight = '1kg';
                        price = 800;
                    } else if (name.includes('Apricots')) {
                        category = 'dry-fruits';
                        cleanName = 'Dried Apricots (Turkish)';
                        weight = '500g';
                        price = 900;
                    } else if (name.includes('Figs')) {
                        category = 'dry-fruits';
                        cleanName = 'Dried Figs (Anjeer)';
                        weight = '500g';
                        price = 950;
                    } else if (name.includes('Raisins')) {
                        category = 'dry-fruits';
                        cleanName = 'Raisins (Black Seedless)';
                        weight = '500g';
                        price = 750;
                    } else if (name.includes('Mixed Dry Fruits')) {
                        category = 'dry-fruits';
                        cleanName = 'Mixed Dry Fruits (Premium)';
                        weight = '1kg';
                        price = 1200;
                    } else if (name.includes('Almonds (In Shell)')) {
                        category = 'nuts';
                        cleanName = 'Almonds (In Shell)';
                        weight = '500g';
                        price = 1200;
                    } else if (name.includes('Peanuts')) {
                        category = 'nuts';
                        cleanName = 'Peanuts (Roasted & Salted)';
                        weight = '500g';
                        price = 700;
                    } else if (name.includes('Pistachios')) {
                        category = 'nuts';
                        cleanName = 'Pistachios (Salted)';
                        weight = '500g';
                        price = 1800;
                    } else if (name.includes('Pine Nuts')) {
                        category = 'nuts';
                        cleanName = 'Pine Nuts (Chilgoza)';
                        weight = '500g';
                        price = 1100;
                    } else if (name.includes('Premium Almonds')) {
                        category = 'nuts';
                        cleanName = 'Premium Almonds (California)';
                        weight = '500g';
                        price = 1500;
                    } else if (name.includes('Premium Cashews')) {
                        category = 'nuts';
                        cleanName = 'Premium Cashews (W240)';
                        weight = '500g';
                        price = 1600;
                    } else if (name.includes('Walnuts')) {
                        category = 'nuts';
                        cleanName = 'Walnuts (Kashmiri)';
                        weight = '500g';
                        price = 1400;
                    } else if (name.includes('Sunflower Seeds')) {
                        category = 'seeds';
                        cleanName = 'Sunflower Seeds';
                        weight = '500g';
                        price = 600;
                    }
                    
                    return {
                        id: filename.replace(/\.(png|jpg|jpeg)$/i, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase(),
                        name: cleanName,
                        category: category,
                        price: price,
                        weight: weight,
                        image: 'images/' + filename,
                        description: `Premium quality ${cleanName.toLowerCase()}`,
                        inStock: true,
                        rating: 4.0 + (Math.random() * 0.9), // Random rating between 4.0-4.9
                        reviews: Math.floor(Math.random() * 200) + 50 // Random reviews between 50-250
                    };
                });
                
                console.log('Created products:', products.length, products);
                
                // Apply category filter if specific category is requested
                if (categoryParam && categoryParam !== 'best-products') {
                    products = products.filter(product => {
                        // Map category names to match URL parameters
                        const categoryMap = {
                            'almonds': ['almonds'],
                            'cashews': ['cashews'],
                            'welnuts': ['walnuts'],
                            'pistachios': ['pistachios'],
                            'dates': ['dates'],
                            'apricots': ['apricots'],
                            'figs': ['figs'],
                            'raisins': ['raisins'],
                            'mixed-nuts': ['mixed'],
                            'mixed-dry-fruits': ['mixed'],
                            'seeds': ['seeds'],
                            'sunflower-seeds': ['sunflower'],
                            'pumpkin-seeds': ['pumpkin'],
                            'chia-seeds': ['chia'],
                            'flax-seeds': ['flax'],
                            'gifting': ['gifting']
                        };
                        
                        const keywords = categoryMap[categoryParam] || [];
                        return keywords.some(keyword => 
                            product.name.toLowerCase().includes(keyword.toLowerCase()) ||
                            product.category.toLowerCase().includes(keyword.toLowerCase())
                        );
                    });
                }
                
                // Apply filters to best products
                if (currentFilters.search) {
                    const searchTerm = currentFilters.search.toLowerCase();
                    products = products.filter(product => 
                        product.name.toLowerCase().includes(searchTerm) ||
                        product.description.toLowerCase().includes(searchTerm)
                    );
                }
                
                // Apply quick filters
                if (currentFilters.quickFilters && currentFilters.quickFilters.length > 0) {
                    products = products.filter(product => {
                        return currentFilters.quickFilters.some(filter => {
                            switch(filter) {
                                case 'bestseller':
                                    return product.bestseller || product.isFeatured;
                                case 'organic':
                                    return product.organic;
                                case 'imported':
                                    return product.imported || product.name.toLowerCase().includes('imported');
                                case 'sale':
                                    return product.originalPrice && product.originalPrice > product.price;
                                case 'new':
                                    return product.isNew || product.name.toLowerCase().includes('new');
                                default:
                                    return false;
                            }
                        });
                    });
                }
                
                // Apply price filters
                if (currentFilters.minPrice !== null) {
                    products = products.filter(product => product.price >= currentFilters.minPrice);
                }
                
                if (currentFilters.maxPrice !== null) {
                    products = products.filter(product => product.price <= currentFilters.maxPrice);
                }
                
                // Apply sorting
                products.sort((a, b) => {
                    switch (currentFilters.sort) {
                        case 'price-low':
                            return a.price - b.price;
                        case 'price-high':
                            return b.price - a.price;
                        case 'name':
                            return a.name.localeCompare(b.name);
                        case 'newest':
                        default:
                            return a.name.localeCompare(b.name); // Sort alphabetically for best products
                    }
                });
            } else {
                // Try backend first, fallback to mock data
                try {
                    // Fetch from real MongoDB API
                    const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch products');
                    }
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        products = data.products;
                    } else {
                        throw new Error('API returned error');
                    }
                } catch (backendError) {
                    console.log('Backend not available, using mock data:', backendError);
                    
                    // Use mock data as fallback
                    if (window.mockAPI && window.mockAPI.getProducts) {
                        const mockData = await window.mockAPI.getProducts({
                            search: currentFilters.search
                        });
                        
                        if (mockData.success) {
                            products = mockData.products;
                            
                            // Apply category filter if specific category is requested
                            if (categoryParam && categoryParam !== 'best-products') {
                                products = products.filter(product => {
                                    // Map category names to match URL parameters
                                    const categoryMap = {
                                        'almonds': ['almonds'],
                                        'cashews': ['cashews'],
                                        'welnuts': ['walnuts'],
                                        'pistachios': ['pistachios'],
                                        'dates': ['dates'],
                                        'apricots': ['apricots'],
                                        'figs': ['figs'],
                                        'raisins': ['raisins'],
                                        'mixed-nuts': ['mixed'],
                                        'mixed-dry-fruits': ['mixed'],
                                        'seeds': ['seeds'],
                                        'sunflower-seeds': ['sunflower'],
                                        'pumpkin-seeds': ['pumpkin'],
                                        'chia-seeds': ['chia'],
                                        'flax-seeds': ['flax'],
                                        'gifting': ['gifting']
                                    };
                                    
                                    const keywords = categoryMap[categoryParam] || [];
                                    return keywords.some(keyword => 
                                        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
                                        product.category.toLowerCase().includes(keyword.toLowerCase())
                                    );
                                });
                            }
                            
                            // Apply price filters
                            if (currentFilters.minPrice !== null) {
                                products = products.filter(product => product.price >= currentFilters.minPrice);
                            }
                            
                            if (currentFilters.maxPrice !== null) {
                                products = products.filter(product => product.price <= currentFilters.maxPrice);
                            }
                            
                            // Apply quick filters
                            if (currentFilters.quickFilters && currentFilters.quickFilters.length > 0) {
                                products = products.filter(product => {
                                    return currentFilters.quickFilters.some(filter => {
                                        switch(filter) {
                                            case 'bestseller':
                                                return product.bestseller || product.isFeatured;
                                            case 'organic':
                                                return product.organic;
                                            case 'imported':
                                                return product.imported || product.name.toLowerCase().includes('imported');
                                            case 'sale':
                                                return product.originalPrice && product.originalPrice > product.price;
                                            case 'new':
                                                return product.isNew || product.name.toLowerCase().includes('new');
                                            default:
                                                return false;
                                        }
                                    });
                                });
                            }
                            
                            // Apply sorting
                            products.sort((a, b) => {
                                switch (currentFilters.sort) {
                                    case 'price-low':
                                        return a.price - b.price;
                                    case 'price-high':
                                        return b.price - a.price;
                                    case 'name':
                                        return a.name.localeCompare(b.name);
                                    case 'newest':
                                    default:
                                        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                                }
                            });
                        }
                    }
                }
            }
        
        // Display products
        console.log('Final products to display:', products.length, products);
        
        // Update page title based on category
        if (categoryParam && categoryParam !== 'best-products') {
            const categoryTitles = {
                'almonds': 'Almonds',
                'cashews': 'Cashews',
                'welnuts': 'Walnuts',
                'pistachios': 'Pistachios',
                'dates': 'Dates',
                'apricots': 'Apricots',
                'figs': 'Figs',
                'raisins': 'Raisins',
                'mixed-nuts': 'Mixed Nuts',
                'mixed-dry-fruits': 'Combo Packs',
                'seeds': 'Seeds',
                'gifting': 'Gift Packs',
                'combo-packs': 'Combo Packs',
                'gift-packs': 'Gift Packs',
                'corporate-gifting': 'Corporate Gifting'
            };
            
            const title = categoryTitles[categoryParam] || 'Products';
            const productsHeader = document.querySelector('.products-header h2');
            if (productsHeader) {
                productsHeader.textContent = title;
            }
            
            // Update page title
            document.title = `Buy Premium ${title} Online Pakistan | GBDRYFRUITS`;
        }
        
        displayProducts(products);
        displayPagination({
            page: currentPage,
            pages: Math.ceil(products.length / 12),
            totalProducts: products.length
        });
        
    } catch (error) {
        console.error('Load products error:', error);
        showError('Network error. Please try again.');
    }
    }
    
    // Display products
    function displayProducts(products) {
        console.log('displayProducts called with:', products.length, products);
        console.log('productsGrid element:', productsGrid);
        
        if (!products || products.length === 0) {
            console.log('No products found, showing empty message');
            productsGrid.innerHTML = `
                <div class="no-products">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }
        
        console.log('Creating product HTML for', products.length, 'products');
        const productsHTML = products.map(product => {
            // Create weight options based on product
            let weightOptions = '';
            let basePrice = product.price;
            
            if (product.category === 'dry-fruits' || product.category === 'nuts') {
                weightOptions = `
                    <option value="500g" data-price="${basePrice}">500g - Rs.${basePrice}</option>
                    <option value="1kg" data-price="${basePrice * 2}">1kg - Rs.${basePrice * 2}</option>
                `;
            } else if (product.category === 'seeds') {
                weightOptions = `
                    <option value="250g" data-price="${Math.round(basePrice * 0.6)}">250g - Rs.${Math.round(basePrice * 0.6)}</option>
                    <option value="500g" data-price="${basePrice}">500g - Rs.${basePrice}</option>
                    <option value="1kg" data-price="${basePrice * 2}">1kg - Rs.${basePrice * 2}</option>
                `;
            } else {
                weightOptions = `
                    <option value="500g" data-price="${basePrice}">500g - Rs.${basePrice}</option>
                    <option value="1kg" data-price="${basePrice * 2}">1kg - Rs.${basePrice * 2}</option>
                `;
            }
            
            return `
            <div class="product-card">
                ${product.premium ? '<div class="product-badge premium">Premium</div>' : ''}
                ${product.bestseller ? '<div class="product-badge bestseller">Best Seller</div>' : ''}
                ${product.isNew ? '<div class="product-badge new">New</div>' : ''}
                ${product.organic ? '<div class="product-badge organic">Organic</div>' : ''}
                
                <div class="product-image-container">
                    <img src="${product.image || 'https://via.placeholder.com/400x200?text=Product'}" 
                         alt="${product.name}" 
                         class="product-image"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    
                    <div class="product-weight-selector">
                        <select class="weight-dropdown" onchange="updatePrice(this)">
                            ${weightOptions}
                        </select>
                    </div>
                    
                    <div class="product-rating">
                        <span class="stars">⭐⭐⭐⭐</span>
                        <span class="rating-count">(${product.reviews || '125'})</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="current-price" id="price-${product.id}">Rs.${basePrice}</span>
                        ${product.originalPrice ? `<span class="original-price">Rs.${product.originalPrice}</span>` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" 
                                ${!product.inStock ? 'disabled' : ''}
                                data-product-id="${product.id}"
                                data-product-name="${product.name}"
                                data-product-price="${basePrice}"
                                data-product-weight="500g"
                                data-product-image="${product.image || 'https://via.placeholder.com/400x200?text=Product'}">
                            ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');
        
        console.log('Setting productsGrid.innerHTML...');
        productsGrid.innerHTML = productsHTML;
        console.log('productsGrid.innerHTML set successfully');
        
        // Add event listeners to product buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', handleAddToCart);
        });
        
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', handleViewDetails);
        });
    }
    
    // Display pagination
    function displayPagination(paginationData) {
        if (!paginationData || paginationData.pages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        const { page, pages } = paginationData;
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${page <= 1 ? 'disabled' : ''} onclick="changePage(${page - 1})">
                Previous
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - 2 && i <= page + 2)) {
                paginationHTML += `
                    <button class="${i === page ? 'active' : ''}" onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === page - 3 || i === page + 3) {
                paginationHTML += '<span>...</span>';
            }
        }
        
        // Next button
        paginationHTML += `
            <button ${page >= pages ? 'disabled' : ''} onclick="changePage(${page + 1})">
                Next
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    // Handle search
    function handleSearch() {
        currentFilters.search = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
    }
    
    // Apply price filter
    function applyPriceFilter() {
        currentFilters.minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        currentFilters.maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        currentPage = 1;
        loadProducts();
    }
    
    // Handle sort
    function handleSort() {
        currentFilters.sort = sortSelect.value;
        currentPage = 1;
        loadProducts();
    }
    
    // Handle quick filters
    function handleQuickFilters() {
        const checkedFilters = Array.from(document.querySelectorAll('.quick-filter:checked'))
            .map(filter => filter.value);
        
        currentFilters.quickFilters = checkedFilters;
        currentPage = 1;
        loadProducts();
    }
    
    // Clear all filters
    function clearAllFilters() {
        searchInput.value = '';
        minPriceInput.value = '';
        maxPriceInput.value = '';
        sortSelect.value = 'newest';
        
        // Clear quick filter checkboxes
        const quickFilters = document.querySelectorAll('.quick-filter');
        quickFilters.forEach(filter => {
            filter.checked = false;
        });
        
        // Reset filters
        currentFilters = {
            minPrice: null,
            maxPrice: null,
            search: '',
            sort: 'newest',
            quickFilters: []
        };
        
        currentPage = 1;
        loadProducts();
    }
    
    // Handle view change
    function handleViewChange(e) {
        viewBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const view = e.target.dataset.view;
        if (view === 'list') {
            productsGrid.classList.add('list-view');
        } else {
            productsGrid.classList.remove('list-view');
        }
    }
    
    // Update price based on weight selection
    window.updatePrice = function(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        const newPrice = selectedOption.dataset.price;
        const newWeight = selectedOption.value;
        
        // Find the product card and update price display
        const productCard = selectElement.closest('.product-card');
        const priceElement = productCard.querySelector('.current-price');
        const addButton = productCard.querySelector('.add-to-cart-btn');
        
        // Update price display
        priceElement.textContent = `Rs.${newPrice}`;
        
        // Update add to cart button data
        addButton.dataset.productPrice = newPrice;
        addButton.dataset.productWeight = newWeight;
    };
    
    // Handle add to cart
    function handleAddToCart(e) {
        const btn = e.target;
        const productId = btn.dataset.productId;
        const productName = btn.dataset.productName;
        const productPrice = parseFloat(btn.dataset.productPrice);
        const productWeight = btn.dataset.productWeight;
        
        // Get product details from product card
        const productCard = btn.closest('.product-card');
        const productImage = productCard.querySelector('.product-image').src;
        
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
    
    // Handle view details
    function handleViewDetails(e) {
        const productId = e.target.dataset.productId;
        window.location.href = `product-detail.html?id=${productId}`;
    }
    
    // Change page
    window.changePage = function(page) {
        currentPage = page;
        loadProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Show loading state
    function showLoading() {
        productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
    }
    
    // Show error message
    function showError(message) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="loadProducts()" class="auth-btn">Try Again</button>
            </div>
        `;
    }
    
    // Update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
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
    
    // Initialize the app
    init();
});
