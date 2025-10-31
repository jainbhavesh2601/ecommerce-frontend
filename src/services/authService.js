/**
 * Authentication Service
 * Handles all authentication and user management API calls
 */

import api from '../Api/api';

const authService = {
  // ============= Authentication =============
  
  /**
   * User login
   * @param {Object} credentials - { username, password }
   * @returns {Promise} - { access_token, token_type, expires_in, user }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', {
      username: credentials.username,
      password: credentials.password
    });
    
    // Store token and user info
    if (response.data.access_token) {
      localStorage.setItem('authToken', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * User logout
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cartId');
  },

  /**
   * User registration
   * @param {Object} userData - User registration data
   * @returns {Promise}
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise}
   */
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise}
   */
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  /**
   * Get current user info
   * @returns {Object|null} - User object or null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // ============= User Management =============

  /**
   * Get all users (admin only)
   * @param {Object} params - { page, limit, search, role }
   * @returns {Promise}
   */
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise}
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    
    // Update stored user info if updating current user
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
    }
    
    return response.data;
  },

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise}
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Change password
   * @param {string} userId - User ID
   * @param {Object} passwordData - { current_password, new_password }
   * @returns {Promise}
   */
  changePassword: async (userId, passwordData) => {
    const response = await api.post(`/users/${userId}/change-password`, passwordData);
    return response.data;
  },

  // ============= Utility Functions =============

  /**
   * Check if user has role
   * @param {string} role - Role to check (normal_user, seller, admin)
   * @returns {boolean}
   */
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Check if user is seller
   * @returns {boolean}
   */
  isSeller: () => {
    return authService.hasRole('seller');
  },

  /**
   * Check if user is admin
   * @returns {boolean}
   */
  isAdmin: () => {
    return authService.hasRole('admin');
  },
};

export default authService;

