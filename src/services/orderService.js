/**
 * Order Service
 * Handles all order-related API calls
 */

import api from '../Api/api';

const orderService = {
  // ============= Order Operations =============

  /**
   * Get all orders (filtered by user role)
   * @param {Object} params - Query parameters
   *   - page: Page number
   *   - limit: Items per page
   *   - status: Filter by status
   *   - user_id: Filter by user (admin only)
   * @returns {Promise}
   */
  getAllOrders: async (params = {}) => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },

  /**
   * Get current user's orders
   * @param {Object} params - Query parameters
   *   - skip: Skip number
   *   - limit: Items per page
   *   - status: Filter by status
   *   - payment_status: Filter by payment status
   * @returns {Promise}
   */
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders/my-orders', { params });
    return response.data;
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise}
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders/', orderData);
    return response.data;
  },

  /**
   * Update order status (seller/admin only)
   * @param {string} orderId - Order ID
   * @param {Object} statusData - { status }
   * @returns {Promise}
   */
  updateOrderStatus: async (orderId, statusData) => {
    // Backend expects status as a query parameter, not in the body
    const params = { status: statusData.status };
    const response = await api.put(`/orders/${orderId}/status`, null, { params });
    return response.data;
  },

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  cancelOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  // ============= Order Items =============

  /**
   * Get order items
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  getOrderItems: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/items`);
    return response.data;
  },

  // ============= Seller Orders =============

  /**
   * Get orders for seller's products
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getSellerOrders: async (params = {}) => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },

  // ============= Utility Functions =============

  /**
   * Format order status
   * @param {string} status - Order status
   * @returns {Object} - { text, color, badge }
   */
  formatStatus: (status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'orange', badge: '🕐' },
      confirmed: { text: 'Confirmed', color: 'blue', badge: '✓' },
      processing: { text: 'Processing', color: 'purple', badge: '⚙️' },
      shipped: { text: 'Shipped', color: 'teal', badge: '🚚' },
      delivered: { text: 'Delivered', color: 'green', badge: '✅' },
      cancelled: { text: 'Cancelled', color: 'red', badge: '❌' },
      refunded: { text: 'Refunded', color: 'gray', badge: '💰' },
    };

    return statusMap[status] || { text: status, color: 'gray', badge: '❓' };
  },

  /**
   * Calculate order total
   * @param {Array} orderItems - Array of order items
   * @returns {number} - Total price
   */
  calculateTotal: (orderItems) => {
    return orderItems.reduce((total, item) => {
      return total + (parseFloat(item.subtotal_price) || 0);
    }, 0);
  },

  /**
   * Format order date
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  formatOrderDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get available status transitions
   * @param {string} currentStatus - Current order status
   * @param {string} userRole - User role
   * @returns {Array} - Array of available next statuses
   */
  getAvailableStatusTransitions: (currentStatus, userRole) => {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: ['refunded'], // Only if there's an issue
      cancelled: [], // Terminal state
      refunded: [], // Terminal state
    };

    // Admins can do all transitions
    if (userRole === 'admin') {
      return transitions[currentStatus] || [];
    }

    // Sellers can manage most transitions except refunds
    if (userRole === 'seller') {
      return (transitions[currentStatus] || []).filter(s => s !== 'refunded');
    }

    // Normal users can only cancel pending/confirmed orders
    if (userRole === 'normal_user') {
      if (currentStatus === 'pending' || currentStatus === 'confirmed') {
        return ['cancelled'];
      }
    }

    return [];
  },
};

export default orderService;

