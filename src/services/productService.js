/**
 * Product Service
 * Handles all product-related API calls
 */

import api from '../Api/api';

const productService = {
  // ============= Product Operations =============

  /**
   * Get all products with optional filtering
   * @param {Object} params - Query parameters
   *   - page: Page number
   *   - limit: Items per page
   *   - search: Search term
   *   - user_lat: User latitude
   *   - user_lon: User longitude
   *   - max_distance_km: Maximum distance filter
   *   - sort_by_distance: Sort by distance
   * @returns {Promise}
   */
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  /**
   * Get seller's own products
   * @param {Object} params - Query parameters
   *   - page: Page number
   *   - limit: Items per page
   *   - search: Search term
   * @returns {Promise}
   */
  getMyProducts: async (params = {}) => {
    const response = await api.get('/products/my-products', { params });
    return response.data;
  },

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise}
   */
  getProductById: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Create new product (seller/admin only)
   * @param {Object} productData - Product data
   * @returns {Promise}
   */
  createProduct: async (productData) => {
    const response = await api.post('/products/', productData);
    return response.data;
  },

  /**
   * Update product (seller/admin only)
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise}
   */
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  /**
   * Delete product (seller/admin only)
   * @param {string} productId - Product ID
   * @returns {Promise}
   */
  deleteProduct: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  // ============= Search & Filter =============

  /**
   * Search products
   * @param {string} searchTerm - Search term
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise}
   */
  searchProducts: async (searchTerm, page = 1, limit = 10) => {
    return productService.getAllProducts({ search: searchTerm, page, limit });
  },

  /**
   * Get products by location
   * @param {number} lat - User latitude
   * @param {number} lon - User longitude
   * @param {number} maxDistance - Maximum distance in km
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise}
   */
  getProductsByLocation: async (lat, lon, maxDistance, page = 1, limit = 10) => {
    return productService.getAllProducts({
      user_lat: lat,
      user_lon: lon,
      max_distance_km: maxDistance,
      sort_by_distance: true,
      page,
      limit
    });
  },

  /**
   * Get nearby products
   * @param {number} lat - User latitude
   * @param {number} lon - User longitude
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise}
   */
  getNearbyProducts: async (lat, lon, page = 1, limit = 10) => {
    return productService.getAllProducts({
      user_lat: lat,
      user_lon: lon,
      sort_by_distance: true,
      page,
      limit
    });
  },

  // ============= Utility Functions =============

  /**
   * Format product price
   * @param {number} price - Product price
   * @param {number} discountPercentage - Discount percentage
   * @returns {Object} - { original, discounted, savings }
   */
  formatPrice: (price, discountPercentage = 0) => {
    const original = parseFloat(price);
    const discounted = original - (original * discountPercentage / 100);
    const savings = original - discounted;

    return {
      original: `₹${original.toFixed(2)}`,
      discounted: `₹${discounted.toFixed(2)}`,
      savings: `₹${savings.toFixed(2)}`,
      percentage: discountPercentage
    };
  },

  /**
   * Check if product is in stock
   * @param {Object} product - Product object
   * @returns {boolean}
   */
  isInStock: (product) => {
    return product && product.stock > 0;
  },

  /**
   * Get stock status
   * @param {Object} product - Product object
   * @returns {string} - 'in-stock', 'low-stock', 'out-of-stock'
   */
  getStockStatus: (product) => {
    if (!product || product.stock === 0) return 'out-of-stock';
    if (product.stock < 10) return 'low-stock';
    return 'in-stock';
  },

  /**
   * Format distance
   * @param {number} distanceKm - Distance in kilometers
   * @returns {string} - Formatted distance
   */
  formatDistance: (distanceKm) => {
    if (!distanceKm) return 'N/A';
    if (distanceKm < 1) return `${(distanceKm * 1000).toFixed(0)} m`;
    return `${distanceKm.toFixed(1)} km`;
  },

  /**
   * Get rating stars
   * @param {number} rating - Rating value
   * @returns {string} - Star representation
   */
  getRatingStars: (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '');
  },
};

export default productService;

