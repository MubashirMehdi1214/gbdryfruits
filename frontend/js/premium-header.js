// Premium Header System - Nature's Basket / Anaajpur Style
// Advanced Search, Mega Menu, Mobile Responsive

class PremiumHeader {
    constructor() {
        this.isScrolled = false;
        this.megaMenuOpen = null;
        this.mobileMenuOpen = false;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSearchFunctionality();
        this.updateWishlistCount();
        this.updateCartCount();
    }

    // Setup event listeners
    setupEventListeners() {
        // Scroll detection for sticky header
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });
        
        // Close menus on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllMenus();
            }
        });
    }

    // Handle scroll for sticky header effect
    handleScroll() {
        const header = document.querySelector('.premium-header');
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50 && !this.isScrolled) {
            header.classList.add('scrolled');
            this.isScrolled = true;
        } else if (currentScroll <= 50 && this.isScrolled) {
            header.classList.remove('scrolled');
            this.isScrolled = false;
        }
    }

    // Setup search functionality with live suggestions
    setupSearchFunctionality() {
        const searchInput = document.getElementById('premiumSearch');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (!searchInput || !suggestionsContainer) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear existing timeout
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            if (query.length < 2) {
                this.hideSuggestions();
                return;
            }
            
            // Debounce search
            this.searchTimeout = setTimeout(() => {
                this.fetchSearchSuggestions(query);
            }, 300);
        });

        searchInput.addEventListener('focus', () => {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                this.fetchSearchSuggestions(query);
            }
        });

        // Add search on Enter key
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(searchInput.value.trim());
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    // Fetch search suggestions from MongoDB API
    async fetchSearchSuggestions(query) {
        try {
            // Fetch real products from MongoDB API
            const response = await fetch(`http://localhost:5000/api/products?search=${encodeURIComponent(query)}&limit=6`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch search suggestions');
            }
            
            const data = await response.json();
            const products = data.products || [];
            
            this.displaySuggestions(products, query);
        } catch (error) {
            console.error('Search suggestions error:', error);
            // Fallback to mock data if API fails
            const mockProducts = [
                { name: 'Premium Almonds', price: 850, category: 'Nuts', image: 'https://via.placeholder.com/40x40?text=Almonds' },
                { name: 'Organic Cashews', price: 1200, category: 'Nuts', image: 'https://via.placeholder.com/40x40?text=Cashews' },
                { name: 'Pakistani Dates', price: 650, category: 'Dry Fruits', image: 'https://via.placeholder.com/40x40?text=Dates' }
            ];
            
            const filteredProducts = mockProducts.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase())
            );
            
            this.displaySuggestions(filteredProducts, query);
        }
    }

    // Display search suggestions
    displaySuggestions(products, query) {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (!suggestionsContainer) return;

        if (products.length === 0) {
            this.hideSuggestions();
            return;
        }

        const suggestionsHTML = products.map(product => `
            <div class="suggestion-item" onclick="selectSuggestion('${product.name}', '${product.price}')">
                <img src="${product.image}" alt="${product.name}" class="suggestion-image">
                <div class="suggestion-info">
                    <div class="suggestion-name">${this.highlightMatch(product.name, query)}</div>
                    <div class="suggestion-price">Rs. ${product.price}</div>
                </div>
            </div>
        `).join('');

        suggestionsContainer.innerHTML = suggestionsHTML;
        suggestionsContainer.classList.add('active');
    }

    // Highlight matching text in suggestions
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // Hide search suggestions
    hideSuggestions() {
        const suggestionsContainer = document.getElementById('searchSuggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.remove('active');
            suggestionsContainer.innerHTML = '';
        }
    }

    // Select search suggestion
    selectSuggestion(productName, productPrice) {
        const searchInput = document.getElementById('premiumSearch');
        searchInput.value = productName;
        this.hideSuggestions();
        
        // Redirect to product or search results
        this.performSearch(productName);
    }

    // Perform search and redirect to results page
    async performSearch(query) {
        if (!query || query.trim() === '') {
            return;
        }
        
        this.hideSuggestions();
        
        // Redirect to products page with search query
        window.location.href = `products.html?search=${encodeURIComponent(query.trim())}`;
    }

    // Mega menu functions
    showMegaMenu(menuId) {
        this.closeAllMenus();
        this.megaMenuOpen = menuId;
        
        const megaMenu = document.getElementById(`${menuId}MegaMenu`);
        if (megaMenu) {
            megaMenu.classList.add('active');
        }
    }

    hideMegaMenu(menuId) {
        const megaMenu = document.getElementById(`${menuId}MegaMenu`);
        if (megaMenu) {
            megaMenu.classList.remove('active');
        }
        this.megaMenuOpen = null;
    }

    // Mobile menu functions
    toggleMobileMenu() {
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const hamburgerIcon = document.querySelector('.hamburger-icon');
        
        if (this.mobileMenuOpen) {
            mobileMenuOverlay.classList.remove('active');
            hamburgerIcon.classList.remove('active');
            this.mobileMenuOpen = false;
        } else {
            mobileMenuOverlay.classList.add('active');
            hamburgerIcon.classList.add('active');
            this.mobileMenuOpen = true;
        }
    }

    closeMobileMenu() {
        const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
        const hamburgerIcon = document.querySelector('.hamburger-icon');
        
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
        }
        if (hamburgerIcon) {
            hamburgerIcon.classList.remove('active');
        }
        this.mobileMenuOpen = false;
    }

    // Close all menus
    closeAllMenus() {
        this.hideSuggestions();
        
        if (this.megaMenuOpen) {
            this.hideMegaMenu(this.megaMenuOpen);
        }
        
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    // Handle click outside
    handleClickOutside(e) {
        const searchInput = document.getElementById('premiumSearch');
        const suggestionsContainer = document.getElementById('searchSuggestions');
        
        // Check if click is outside search
        if (searchInput && suggestionsContainer && 
            !searchInput.contains(e.target) && 
            !suggestionsContainer.contains(e.target)) {
            this.hideSuggestions();
        }
    }

    // Update wishlist count
    updateWishlistCount() {
        // Mock wishlist count - in real app, this would come from backend
        const wishlistCount = document.querySelector('.wishlist-count');
        if (wishlistCount) {
            const count = Math.floor(Math.random() * 5); // Mock count
            wishlistCount.textContent = count;
            wishlistCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Update cart count
    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCountElements = document.querySelectorAll('.cart-count, .cart-count-badge');
        
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Toggle wishlist (mock function)
    toggleWishlist() {
        // Mock wishlist functionality
        alert('Wishlist feature coming soon! This will allow you to save products for later.');
    }
}

// Initialize premium header
const premiumHeader = new PremiumHeader();

// Global functions for onclick handlers
function showMegaMenu(menuId) {
    premiumHeader.showMegaMenu(menuId);
}

function hideMegaMenu(menuId) {
    premiumHeader.hideMegaMenu(menuId);
}

function toggleMobileMenu() {
    premiumHeader.toggleMobileMenu();
}

function toggleWishlist() {
    premiumHeader.toggleWishlist();
}

function selectSuggestion(productName, productPrice) {
    premiumHeader.selectSuggestion(productName, productPrice);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumHeader;
}
