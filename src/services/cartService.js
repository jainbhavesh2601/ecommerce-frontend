/**
 * Cart Service
 * Handles all cart-related API calls
 */

import api from '../Api/api';

const cartService = {
  // ============= Primary Cart Operations (Recommended) =============

  /**
   * Get current user's cart
   * @returns {Promise} - Cart with items
   */
  getMyCart: async () => {
    const response = await api.get('/carts/me');
    return response.data;
  },

  /**
   * Add item to current user's cart
   * @param {Object} item - { product_id, quantity }
   * @returns {Promise}
   */
  addItemToMyCart: async (item) => {
    const response = await api.post('/carts/me/items', item);
    return response.data;
  },

  // ============= Cart Item Management =============

  /**
   * Update cart item quantity
   * @param {string} cartId - Cart ID
   * @param {string} itemId - Cart item ID
   * @param {Object} data - { quantity }
   * @returns {Promise}
   */
  updateCartItem: async (cartId, itemId, data) => {
    const response = await api.put(`/carts/${cartId}/items/${itemId}`, data);
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {string} cartId - Cart ID
   * @param {string} itemId - Cart item ID
   * @returns {Promise}
   */
  removeCartItem: async (cartId, itemId) => {
    const response = await api.delete(`/carts/${cartId}/items/${itemId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   * @param {string} cartId - Cart ID
   * @returns {Promise}
   */
  clearCart: async (cartId) => {
    const response = await api.delete(`/carts/${cartId}`);
    return response.data;
  },

  // ============= Legacy Cart Operations =============

  /**
   * Get cart by ID (legacy)
   * @param {string} cartId - Cart ID
   * @returns {Promise}
   */
  getCartById: async (cartId) => {
    const response = await api.get(`/carts/${cartId}`);
    return response.data;
  },

  /**
   * Add item to specific cart (legacy)
   * @param {string} cartId - Cart ID
   * @param {Object} item - { product_id, quantity }
   * @returns {Promise}
   */
  addItemToCart: async (cartId, item) => {
    const response = await api.post(`/carts/${cartId}/items`, item);
    return response.data;
  },

  // ============= Checkout Operations =============

  /**
   * Get checkout summary
   * @param {string} cartId - Cart ID
   * @param {Object} params - { tax_rate, shipping_cost }
   * @returns {Promise}
   */
  getCheckoutSummary: async (cartId, params = {}) => {
    const response = await api.get(`/carts/${cartId}/checkout/summary`, { params });
    return response.data;
  },

  /**
   * Validate cart for checkout
   * @param {string} cartId - Cart ID
   * @returns {Promise}
   */
  validateCartForCheckout: async (cartId) => {
    const response = await api.get(`/carts/${cartId}/checkout/validate`);
    return response.data;
  },

  /**
   * Checkout cart
   * @param {string} cartId - Cart ID
   * @param {Object} checkoutData - Checkout information
   * @returns {Promise}
   */
  checkout: async (cartId, checkoutData) => {
    const response = await api.post(`/carts/${cartId}/checkout`, checkoutData);
    return response.data;
  },

  // ============= Utility Functions =============

  /**
   * Calculate cart total
   * @param {Array} cartItems - Array of cart items
   * @returns {number} - Total price
   */
  calculateTotal: (cartItems) => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.subtotal_price) || 0);
    }, 0);
  },

  /**
   * Get cart item count
   * @param {Array} cartItems - Array of cart items
   * @returns {number} - Total items count
   */
  getItemCount: (cartItems) => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  },

  /**
   * Format price
   * @param {number} price - Price to format
   * @returns {string} - Formatted price
   */
  formatPrice: (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  },
};

export default cartService;

