/**
 * Dashboard Service
 * Handles all dashboard and analytics API calls
 */

import api from '../Api/api';

const dashboardService = {
  // ============= Dashboard Analytics =============

  /**
   * Get dashboard statistics (seller/admin)
   * @returns {Promise}
   */
  getDashboardStats: async () => {
    const response = await api.get('/dashboard/seller');
    return response.data;
  },

  /**
   * Get revenue analytics (seller/admin)
   * @param {Object} params - Query parameters
   *   - start_date: Start date (YYYY-MM-DD)
   *   - end_date: End date (YYYY-MM-DD)
   *   - grouping: Grouping period (day, week, month, year)
   * @returns {Promise}
   */
  getRevenueAnalytics: async (params = {}) => {
    const response = await api.get('/dashboard/revenue', { params });
    return response.data;
  },

  /**
   * Get top selling products (seller/admin)
   * @param {Object} params - Query parameters { limit, period }
   * @returns {Promise}
   */
  getTopProducts: async (params = {}) => {
    const response = await api.get('/dashboard/top-products', { params });
    return response.data;
  },

  /**
   * Get order analytics (seller/admin)
   * @param {Object} params - Query parameters
   *   - start_date: Start date
   *   - end_date: End date
   * @returns {Promise}
   */
  getOrderAnalytics: async (params = {}) => {
    const response = await api.get('/dashboard/orders-analytics', { params });
    return response.data;
  },

  /**
   * Get customer analytics (admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  getCustomerAnalytics: async (params = {}) => {
    const response = await api.get('/dashboard/customer-analytics', { params });
    return response.data;
  },

  // ============= Invoice Management =============

  /**
   * Get all invoices
   * @param {Object} params - Query parameters { page, limit }
   * @returns {Promise}
   */
  getAllInvoices: async (params = {}) => {
    const response = await api.get('/dashboard/invoices', { params });
    return response.data;
  },

  /**
   * Get invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise}
   */
  getInvoiceById: async (invoiceId) => {
    const response = await api.get(`/dashboard/invoices/${invoiceId}`);
    return response.data;
  },

  /**
   * Create invoice from order
   * @param {Object} invoiceData - { order_id, due_days }
   * @returns {Promise}
   */
  createInvoice: async (invoiceData) => {
    const response = await api.post('/dashboard/invoices', invoiceData);
    return response.data;
  },

  /**
   * Update invoice status
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - New status
   * @returns {Promise}
   */
  updateInvoiceStatus: async (invoiceId, status) => {
    const response = await api.put(`/dashboard/invoices/${invoiceId}/status?status=${status}`);
    return response.data;
  },

  /**
   * Download invoice PDF
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} - Blob response
   */
  downloadInvoicePDF: async (invoiceId) => {
    const response = await api.get(`/dashboard/invoices/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // ============= Utility Functions =============

  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @returns {string} - Formatted currency
   */
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  },

  /**
   * Format percentage
   * @param {number} value - Value to format
   * @returns {string} - Formatted percentage
   */
  formatPercentage: (value) => {
    return `${value.toFixed(2)}%`;
  },

  /**
   * Calculate percentage change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} - { change, percentage, direction }
   */
  calculateChange: (current, previous) => {
    if (!previous || previous === 0) {
      return { change: current, percentage: 0, direction: 'neutral' };
    }

    const change = current - previous;
    const percentage = (change / previous) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return {
      change: Math.abs(change),
      percentage: Math.abs(percentage),
      direction
    };
  },

  /**
   * Format chart data for revenue analytics
   * @param {Array} data - Revenue data array
   * @returns {Object} - Chart-ready data
   */
  formatRevenueChartData: (data) => {
    return {
      labels: data.map(item => item.period),
      datasets: [{
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }]
    };
  },

  /**
   * Format chart data for order analytics
   * @param {Array} data - Order data array
   * @returns {Object} - Chart-ready data
   */
  formatOrderChartData: (data) => {
    return {
      labels: data.map(item => item.status),
      datasets: [{
        label: 'Orders',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }]
    };
  },

  /**
   * Download blob as file
   * @param {Blob} blob - File blob
   * @param {string} filename - File name
   */
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default dashboardService;

