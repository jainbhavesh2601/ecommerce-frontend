/**
 * Category Service
 * Handles all category-related API calls
 */

import api from '../Api/api';

const categoryService = {
  // ============= Category Operations =============

  /**
   * Get all categories
   * @param {Object} params - Query parameters { page, limit }
   * @returns {Promise}
   */
  getAllCategories: async (params = {}) => {
    const response = await api.get('/categories/', { params });
    return response.data;
  },

  /**
   * Get category by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise}
   */
  getCategoryById: async (categoryId) => {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data;
  },

  /**
   * Create new category (admin only)
   * @param {Object} categoryData - { name, description }
   * @returns {Promise}
   */
  createCategory: async (categoryData) => {
    const response = await api.post('/categories/', categoryData);
    return response.data;
  },

  /**
   * Update category (admin only)
   * @param {string} categoryId - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise}
   */
  updateCategory: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  /**
   * Delete category (admin only)
   * @param {string} categoryId - Category ID
   * @returns {Promise}
   */
  deleteCategory: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  // ============= Category Products =============

  /**
   * Get products by category
   * @param {string} categoryId - Category ID
   * @param {Object} params - Query parameters { page, limit }
   * @returns {Promise}
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/categories/${categoryId}/products`, { params });
    return response.data;
  },

  // ============= Utility Functions =============

  /**
   * Format categories for dropdown
   * @param {Array} categories - Array of category objects
   * @returns {Array} - Array of { value, label } objects
   */
  formatForDropdown: (categories) => {
    return categories.map(cat => ({
      value: cat.id,
      label: cat.name
    }));
  },

  /**
   * Get category name by ID from list
   * @param {Array} categories - Array of category objects
   * @param {string} categoryId - Category ID
   * @returns {string} - Category name or 'Unknown'
   */
  getCategoryName: (categories, categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  },
};

export default categoryService;

