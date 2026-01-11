// GBDRYFRUITS - API Helper Functions
class API {
    constructor() {
        this.baseUrl = CONFIG.getApiUrl();
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Handle HTTP errors
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // Health check
    async healthCheck() {
        try {
            return await this.get('/health');
        } catch (error) {
            console.error('Health check failed:', error);
            return null;
        }
    }

    // Products API
    products = {
        getAll: (params = {}) => this.get('/api/products', params),
        getFeatured: (limit = 4) => this.get('/api/products', { featured: true, limit }),
        getById: (id) => this.get(`/api/products/${id}`),
        search: (query) => this.get('/api/products', { search: query })
    };

    // Orders API
    orders = {
        create: (orderData) => this.post('/api/orders', orderData),
        getAll: (params = {}) => this.get('/api/orders/all/orders', params),
        getById: (id) => this.get(`/api/orders/${id}`),
        updateStatus: (id, status) => this.put(`/api/orders/${id}/status`, { orderStatus: status }),
        getUserOrders: () => this.get('/api/orders/my-orders')
    };

    // Auth API
    auth = {
        login: (credentials) => this.post('/api/auth/login', credentials),
        register: (userData) => this.post('/api/auth/register', userData),
        profile: () => this.get('/api/auth/profile'),
        updateProfile: (userData) => this.put('/api/auth/profile', userData)
    };

    // Payments API
    payments = {
        checkCOD: (data) => this.post('/api/payments/cod/check-availability', data),
        processCOD: (data) => this.post('/api/payments/cod/process', data)
    };

    // Users API
    users = {
        getProfile: () => this.get('/api/users/profile'),
        updateProfile: (data) => this.put('/api/users/profile', data)
    };
}

// Create global API instance
window.api = new API();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
