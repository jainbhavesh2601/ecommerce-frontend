/**
 * Payment Service
 * Handles all payment-related API calls
 */

import api from '../Api/api';

const paymentService = {
  // ============= Payment Operations =============

  /**
   * Get all payments (user's own payments)
   * @param {Object} params - Query parameters { page, limit, status }
   * @returns {Promise}
   */
  getAllPayments: async (params = {}) => {
    const response = await api.get('/payments/', { params });
    return response.data;
  },

  /**
   * Get user's payment methods
   * @returns {Promise}
   */
  getUserPaymentMethods: async () => {
    const response = await api.get('/payments/methods/');
    return response.data;
  },

  /**
   * Create a payment method
   * @param {Object} methodData - Payment method data
   * @returns {Promise}
   */
  createPaymentMethod: async (methodData) => {
    const response = await api.post('/payments/methods', methodData);
    return response.data;
  },

  /**
   * Update a payment method
   * @param {string} methodId - Payment method ID
   * @param {Object} methodData - Update data
   * @returns {Promise}
   */
  updatePaymentMethod: async (methodId, methodData) => {
    const response = await api.put(`/payments/methods/${methodId}`, methodData);
    return response.data;
  },

  /**
   * Delete a payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise}
   */
  deletePaymentMethod: async (methodId) => {
    const response = await api.delete(`/payments/methods/${methodId}`);
    return response.data;
  },

  /**
   * Create a refund
   * @param {Object} refundData - { payment_id, amount, reason }
   * @returns {Promise}
   */
  createRefund: async (refundData) => {
    const response = await api.post('/payments/refunds', refundData);
    return response.data;
  },

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise}
   */
  getPaymentById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Create payment intent
   * @param {Object} paymentData - Payment information
   *   - order_id: Order ID (UUID string)
   *   - amount: Payment amount (Decimal)
   *   - currency: Currency code (default: INR)
   *   - payment_method: Payment method enum
   *   - payment_provider: Payment provider enum
   *   - customer_email: Customer email (optional)
   *   - metadata: Additional metadata (optional)
   * @returns {Promise}
   */
  createPaymentIntent: async (paymentData) => {
    const response = await api.post('/payments/intents', paymentData);
    return response.data;
  },

  /**
   * Confirm payment
   * @param {Object} paymentData - Payment confirmation data
   *   - payment_intent_id: Payment intent ID
   *   - payment_method_id: Payment method ID (for card payments)
   * @returns {Promise}
   */
  confirmPayment: async (paymentData) => {
    const response = await api.post('/payments/confirm', paymentData);
    return response.data;
  },

  /**
   * Legacy create payment method (kept for backward compatibility)
   */
  createPayment: async (paymentData) => {
    const response = await api.post('/payments/intents', paymentData);
    return response.data;
  },

  /**
   * Update payment status (admin only)
   * @param {string} paymentId - Payment ID
   * @param {Object} statusData - { status }
   * @returns {Promise}
   */
  updatePaymentStatus: async (paymentId, statusData) => {
    const response = await api.put(`/payments/${paymentId}`, statusData);
    return response.data;
  },

  // ============= Payment Processing =============

  /**
   * Process payment with specific provider
   * @param {string} paymentId - Payment ID
   * @param {string} provider - Payment provider (stripe, paypal, manual)
   * @param {Object} paymentDetails - Provider-specific payment details
   * @returns {Promise}
   */
  processPayment: async (paymentId, provider, paymentDetails) => {
    const response = await api.post(`/payments/${paymentId}/process`, {
      provider,
      payment_details: paymentDetails
    });
    return response.data;
  },

  /**
   * Verify payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise}
   */
  verifyPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/verify`);
    return response.data;
  },

  /**
   * Refund payment (admin only)
   * @param {string} paymentId - Payment ID
   * @param {Object} refundData - { amount, reason }
   * @returns {Promise}
   */
  refundPayment: async (paymentId, refundData) => {
    const response = await api.post(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  },

  // ============= Payment Methods =============

  /**
   * Get available payment methods
   * @returns {Array} - Array of payment method objects
   */
  getPaymentMethods: () => {
    return [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        icon: '💳',
        description: 'Pay securely with Stripe',
        enabled: true,
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '🅿️',
        description: 'Pay with your PayPal account',
        enabled: true,
      },
      {
        id: 'manual',
        name: 'Manual Payment',
        icon: '💵',
        description: 'Cash on Delivery or Bank Transfer',
        enabled: true,
      },
    ];
  },

  // ============= Utility Functions =============

  /**
   * Format payment status
   * @param {string} status - Payment status
   * @returns {Object} - { text, color, badge }
   */
  formatStatus: (status) => {
    const statusMap = {
      pending: { text: 'Pending', color: 'orange', badge: '🕐' },
      processing: { text: 'Processing', color: 'blue', badge: '⚙️' },
      completed: { text: 'Completed', color: 'green', badge: '✅' },
      failed: { text: 'Failed', color: 'red', badge: '❌' },
      refunded: { text: 'Refunded', color: 'gray', badge: '💰' },
      cancelled: { text: 'Cancelled', color: 'red', badge: '🚫' },
    };

    return statusMap[status] || { text: status, color: 'gray', badge: '❓' };
  },

  /**
   * Format amount
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted amount
   */
  formatAmount: (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  },

  /**
   * Validate payment details
   * @param {string} method - Payment method
   * @param {Object} details - Payment details
   * @returns {Object} - { valid, errors }
   */
  validatePaymentDetails: (method, details) => {
    const errors = [];

    if (method === 'stripe') {
      if (!details.card_number) errors.push('Card number is required');
      if (!details.card_expiry) errors.push('Card expiry is required');
      if (!details.card_cvc) errors.push('CVC is required');
    } else if (method === 'paypal') {
      if (!details.paypal_email) errors.push('PayPal email is required');
    } else if (method === 'manual') {
      if (!details.payment_type) errors.push('Payment type is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Format payment date
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  formatPaymentDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
};

export default paymentService;

