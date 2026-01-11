// GBDRYFRUITS - Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if mock API is available
    if (!window.mockAPI) {
        console.error('Mock API not loaded');
        return;
    }
    
    // Get current page
    const currentPage = window.location.pathname.split('/').pop();
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Login handler
    async function handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        // Clear previous errors
        clearErrors();
        
        try {
            const result = await window.mockAPI.login(loginData);
            
            if (result.success) {
                // Store token and user data
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Show success message
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect to products page
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1500);
            } else {
                // Show error message
                showNotification(result.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
    
    // Register handler
    async function handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const registerData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone'),
            address: formData.get('address')
        };
        
        // Validate passwords match
        const confirmPassword = formData.get('confirmPassword');
        if (registerData.password !== confirmPassword) {
            showError('confirmPasswordError', 'Passwords do not match');
            return;
        }
        
        // Clear previous errors
        clearErrors();
        
        try {
            const result = await window.mockAPI.register(registerData);
            
            if (result.success) {
                // Store token and user data
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                
                // Show success message
                showNotification('Registration successful! Redirecting...', 'success');
                
                // Redirect to products page
                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1500);
            } else {
                showNotification(result.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
    
    // Show error message
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
    
    // Clear all error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
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
    
    // Check if user is logged in
    function isLoggedIn() {
        const token = localStorage.getItem('token');
        return token !== null;
    }
    
    // Redirect to login if not authenticated
    function requireAuth() {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
    
    // Logout function
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        window.location.href = 'login.html';
    }
    
    // Get current user
    function getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    // Update UI based on authentication status
    function updateAuthUI() {
        const user = getCurrentUser();
        const loginLinks = document.querySelectorAll('.login-link');
        const registerLinks = document.querySelectorAll('.register-link');
        const logoutLinks = document.querySelectorAll('.logout-link');
        const profileLinks = document.querySelectorAll('.profile-link');
        
        if (user) {
            // User is logged in
            loginLinks.forEach(link => link.style.display = 'none');
            registerLinks.forEach(link => link.style.display = 'none');
            logoutLinks.forEach(link => link.style.display = 'block');
            profileLinks.forEach(link => link.style.display = 'block');
        } else {
            // User is not logged in
            loginLinks.forEach(link => link.style.display = 'block');
            registerLinks.forEach(link => link.style.display = 'block');
            logoutLinks.forEach(link => link.style.display = 'none');
            profileLinks.forEach(link => link.style.display = 'none');
        }
    }
    
    // Initialize auth UI
    updateAuthUI();
    
    // Make functions available globally
    window.authHelpers = {
        isLoggedIn,
        requireAuth,
        logout,
        getCurrentUser,
        updateAuthUI
    };
});
