import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { dashboardService, productService, orderService, categoryService, authService } from '../services';

function SellerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Product form for create/edit
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    brand: '',
    stock: '',
    discount_percentage: 0,
    rating: 0,
    thumbnail: '',
    images: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      alert('Please login to access the seller dashboard');
      navigate('/login');
      return;
    }

    // Check if user is seller
    if (!authService.isSeller() && !authService.isAdmin()) {
      alert('You must be a seller to access this page');
      navigate('/');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch categories first (no auth required for demo)
      let categoriesRes = null;
      try {
        categoriesRes = await categoryService.getAllCategories();
      } catch (err) {
        console.error('Categories error:', err);
      }

      // Extract categories
      if (categoriesRes) {
        const categoriesData = categoriesRes.data;
        if (categoriesData && categoriesData.data) {
          setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);
        } else if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      }

      // Fetch other data in parallel
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        dashboardService.getDashboardStats().catch(err => {
          console.error('Dashboard stats error:', err.response?.data || err.message);
          return null;
        }),
        productService.getMyProducts().catch(err => {
          console.error('Products error:', err.response?.data || err.message);
          return null;
        }),
        orderService.getSellerOrders().catch(err => {
          console.error('Orders error:', err.response?.data || err.message);
          return null;
        }),
      ]);

      // Extract dashboard stats
      if (statsRes && statsRes.data) {
        const statsData = statsRes.data.data || statsRes.data;
        setStats(statsData);
      } else {
        console.log('No dashboard stats available');
      }

      // Extract products
      console.log('Products response:', productsRes);
      if (productsRes) {
        // productsRes is already the data object from productService.getMyProducts()
        // Check multiple possible structures
        let productsArray = [];
        
        if (productsRes.data && Array.isArray(productsRes.data)) {
          productsArray = productsRes.data;
          console.log('Products from data.data:', productsArray);
        } else if (Array.isArray(productsRes)) {
          productsArray = productsRes;
          console.log('Products from direct array:', productsArray);
        } else if (productsRes.data && typeof productsRes.data === 'object') {
          // Try to extract from nested structure
          if (Array.isArray(productsRes.data.data)) {
            productsArray = productsRes.data.data;
            console.log('Products from data.data.data:', productsArray);
          }
        }
        
        console.log('Final products array length:', productsArray.length);
        setProducts(productsArray);
      } else {
        console.log('No products response available');
      }

      // Extract orders
      if (ordersRes && ordersRes.data) {
        const ordersData = ordersRes.data;
        if (ordersData && ordersData.data) {
          setOrders(Array.isArray(ordersData.data) ? ordersData.data : []);
        } else if (Array.isArray(ordersData)) {
          setOrders(ordersData);
        }
        console.log('Loaded orders:', orders.length);
      } else {
        console.log('No orders available');
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      price: '',
      category_id: '',
      brand: '',
      stock: '',
      discount_percentage: 0,
      rating: 0,
      thumbnail: '',
      images: '',
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      brand: product.brand || '',
      stock: product.stock,
      discount_percentage: product.discount_percentage || 0,
      rating: product.rating || 0,
      thumbnail: product.thumbnail || '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        discount_percentage: parseFloat(productForm.discount_percentage) || 0,
        rating: parseFloat(productForm.rating) || 0,
        images: productForm.images ? productForm.images.split(',').map(s => s.trim()).filter(s => s) : [],
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
        alert('✅ Product updated successfully!');
      } else {
        await productService.createProduct(productData);
        alert('✅ Product created successfully!');
      }

      setShowProductForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('❌ Failed to save product: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.deleteProduct(productId);
      alert('✅ Product deleted successfully!');
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('❌ Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      alert('✅ Order status updated!');
      fetchData();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('❌ Failed to update order status: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <h1>Seller Dashboard</h1>
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Seller Dashboard</h1>
          <p>Manage your products and orders</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Stats Cards */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>Total Products</h3>
              <p style={styles.statValue}>{stats.total_products || products.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Total Orders</h3>
              <p style={styles.statValue}>{stats.total_orders || orders.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Revenue</h3>
              <p style={styles.statValue}>₹{(typeof stats.total_revenue === 'number' || typeof stats.total_revenue === 'string') ? parseFloat(stats.total_revenue).toFixed(2) : '0.00'}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Pending Orders</h3>
              <p style={styles.statValue}>
                {stats.pending_orders || orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={activeTab === 'overview' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            style={activeTab === 'products' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            style={activeTab === 'orders' ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            style={styles.tab}
            onClick={() => navigate('/dashboard/invoices')}
          >
            Invoices
          </button>
          <button
            style={styles.tab}
            onClick={() => navigate('/cart')}
          >
            My Cart
          </button>
          <button
            style={styles.tab}
            onClick={() => navigate('/orders')}
          >
            My Orders
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={styles.tabContent}>
            <h2>Quick Overview</h2>
            <p>Welcome to your seller dashboard. Use the tabs above to manage your products and orders.</p>
            
            {stats && (
              <div style={styles.overviewSection}>
                <h3>Recent Activity</h3>
                <p>Total Sales: ₹{(typeof stats.total_revenue === 'number' || typeof stats.total_revenue === 'string') ? parseFloat(stats.total_revenue).toFixed(2) : '0.00'}</p>
                <p>Active Products: {products.filter(p => p.stock > 0).length}</p>
                <p>Out of Stock: {products.filter(p => p.stock === 0).length}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2>My Products</h2>
              <button onClick={handleCreateProduct} style={styles.addButton}>
                + Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div style={styles.modal}>
                <div style={styles.modalContent}>
                  <h3>{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
                  <div style={styles.formGrid}>
                    <input
                      type="text"
                      name="title"
                      placeholder="Product Title *"
                      value={productForm.title}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="text"
                      name="brand"
                      placeholder="Brand *"
                      value={productForm.brand}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      required
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="Price *"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      step="0.01"
                      required
                    />
                    <input
                      type="number"
                      name="stock"
                      placeholder="Stock *"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      required
                    />
                    <select
                      name="category_id"
                      value={productForm.category_id}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      required
                    >
                      <option value="">Select Category *</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="rating"
                      placeholder="Rating (0-5)"
                      value={productForm.rating}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      step="0.1"
                      min="0"
                      max="5"
                    />
                    <input
                      type="number"
                      name="discount_percentage"
                      placeholder="Discount %"
                      value={productForm.discount_percentage}
                      onChange={handleProductFormChange}
                      style={styles.input}
                      step="0.01"
                    />
                    <textarea
                      name="description"
                      placeholder="Description *"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      style={{ ...styles.input, gridColumn: '1 / -1', minHeight: '80px' }}
                      required
                    />
                    <input
                      type="text"
                      name="thumbnail"
                      placeholder="Thumbnail URL *"
                      value={productForm.thumbnail}
                      onChange={handleProductFormChange}
                      style={{ ...styles.input, gridColumn: '1 / -1' }}
                      required
                    />
                    <input
                      type="text"
                      name="images"
                      placeholder="Image URLs (comma-separated)"
                      value={productForm.images}
                      onChange={handleProductFormChange}
                      style={{ ...styles.input, gridColumn: '1 / -1' }}
                    />
                  </div>
                  <div style={styles.modalActions}>
                    <button onClick={() => setShowProductForm(false)} style={styles.cancelButton}>
                      Cancel
                    </button>
                    <button onClick={handleSaveProduct} style={styles.saveButton}>
                      {editingProduct ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Table */}
            <div style={styles.tableContainer}>
              {products.length === 0 ? (
                <p>No products yet. Click "Add Product" to create one.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      const category = categories.find(c => c.id === product.category_id);
                      return (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.thumbnail || 'https://via.placeholder.com/50'}
                              alt={product.title}
                              style={styles.productThumb}
                            />
                          </td>
                          <td>{product.title}</td>
                          <td>₹{product.price}</td>
                          <td style={{ color: product.stock === 0 ? 'red' : 'inherit' }}>
                            {product.stock}
                          </td>
                          <td>{category?.name || 'Unknown'}</td>
                          <td>
                            <button
                              onClick={() => handleEditProduct(product)}
                              style={styles.editButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              style={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={styles.tabContent}>
            <h2>My Orders</h2>
            
            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              <div style={styles.ordersContainer}>
                {orders.map(order => {
                  const statusInfo = orderService.formatStatus(order.status);
                  const currentUser = authService.getCurrentUser();
                  const availableStatuses = orderService.getAvailableStatusTransitions(
                    order.status,
                    currentUser?.role || 'seller'
                  );

                  return (
                    <div key={order.id} style={styles.orderCard}>
                      <div style={styles.orderHeader}>
                        <h3>Order #{order.order_number || order.id.substring(0, 8)}...</h3>
                        <span style={styles.orderStatus}>
                          {statusInfo.badge} {statusInfo.text}
                        </span>
                      </div>
                      <p>Date: {orderService.formatOrderDate(order.created_at)}</p>
                      <p>Total: ₹{order.total_amount}</p>
                      <p>Payment: {order.payment_status}</p>
                      <p>Shipping: {order.shipping_address}</p>

                      {availableStatuses.length > 0 && (
                        <div style={styles.orderActions}>
                          <label>Update Status: </label>
                          <select
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            style={styles.statusSelect}
                            defaultValue=""
                          >
                            <option value="">-- Select --</option>
                            {availableStatuses.map(status => {
                              const statusInfo = orderService.formatStatus(status);
                              return (
                                <option key={status} value={status}>
                                  {statusInfo.text}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '2rem auto',
    padding: '0 1rem',
  },
  header: {
    marginBottom: '2rem',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffcc00',
    margin: '0.5rem 0 0 0',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #ddd',
    marginBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#666', // Dark gray color for inactive tabs
  },
  tabActive: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid #ffcc00',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  tabContent: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    margin: '1rem 0',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    width: '100%',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#ffcc00',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  tableContainer: {
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  productThumb: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  editButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  ordersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  orderStatus: {
    fontWeight: 'bold',
  },
  orderActions: {
    marginTop: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusSelect: {
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  overviewSection: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
};

export default SellerDashboard;
