import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  dashboardService,
  authService,
  productService,
  categoryService,
  orderService,
  paymentService,
} from '../services';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  useEffect(() => {
    // Check if user is admin
    if (!authService.isAdmin()) {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsRes, usersRes, productsRes, categoriesRes, ordersRes, paymentsRes] =
        await Promise.all([
          dashboardService.getDashboardStats().catch(() => ({ data: null })),
          authService.getAllUsers({ limit: 100 }).catch(() => ({ data: [] })),
          productService.getAllProducts({ limit: 100 }).catch(() => ({ data: [] })),
          categoryService.getAllCategories().catch(() => ({ data: [] })),
          orderService.getAllOrders({ limit: 100 }).catch(() => ({ data: [] })),
          paymentService.getAllPayments({ limit: 100 }).catch(() => ({ data: [] })),
        ]);

      setStats(statsRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Category management
  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      alert('Category name is required');
      return;
    }

    try {
      await categoryService.createCategory(categoryForm);
      alert('✅ Category created successfully!');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      alert('❌ Failed to create category: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure? This will affect all products in this category.')) return;

    try {
      await categoryService.deleteCategory(categoryId);
      alert('✅ Category deleted successfully!');
      fetchData();
    } catch (err) {
      alert('❌ Failed to delete category');
    }
  };

  // User management
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await authService.deleteUser(userId);
      alert('✅ User deleted successfully!');
      fetchData();
    } catch (err) {
      alert('❌ Failed to delete user');
    }
  };

  // Product management
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productService.deleteProduct(productId);
      alert('✅ Product deleted successfully!');
      fetchData();
    } catch (err) {
      alert('❌ Failed to delete product');
    }
  };

  // Order management
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      alert('✅ Order status updated!');
      fetchData();
    } catch (err) {
      alert('❌ Failed to update order status');
    }
  };

  // Payment management
  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await paymentService.updatePaymentStatus(paymentId, { status: newStatus });
      alert('✅ Payment status updated!');
      fetchData();
    } catch (err) {
      alert('❌ Failed to update payment status');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <h1>Admin Dashboard</h1>
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
          <h1>🛠️ Admin Dashboard</h1>
          <p>Manage all aspects of your marketplace</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Stats Grid */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>Total Users</h3>
              <p style={styles.statValue}>{stats.total_users || users.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Total Products</h3>
              <p style={styles.statValue}>{stats.total_products || products.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Total Orders</h3>
              <p style={styles.statValue}>{stats.total_orders || orders.length}</p>
            </div>
            <div style={styles.statCard}>
              <h3>Total Revenue</h3>
              <p style={styles.statValue}>₹{(typeof stats.total_revenue === 'number' || typeof stats.total_revenue === 'string') ? parseFloat(stats.total_revenue).toFixed(2) : '0.00'}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={styles.tabs}>
          {['overview', 'users', 'products', 'categories', 'orders', 'payments'].map((tab) => (
            <button
              key={tab}
              style={activeTab === tab ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
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
        <div style={styles.tabContent}>
          {activeTab === 'overview' && (
            <div>
              <h2>System Overview</h2>
              <div style={styles.overviewGrid}>
                <div style={styles.overviewCard}>
                  <h3>👥 Users</h3>
                  <p>Total: {users.length}</p>
                  <p>Sellers: {users.filter((u) => u.role === 'seller').length}</p>
                  <p>Customers: {users.filter((u) => u.role === 'normal_user').length}</p>
                </div>
                <div style={styles.overviewCard}>
                  <h3>📦 Products</h3>
                  <p>Total: {products.length}</p>
                  <p>In Stock: {products.filter((p) => p.stock > 0).length}</p>
                  <p>Out of Stock: {products.filter((p) => p.stock === 0).length}</p>
                </div>
                <div style={styles.overviewCard}>
                  <h3>🛒 Orders</h3>
                  <p>Total: {orders.length}</p>
                  <p>Pending: {orders.filter((o) => o.status === 'pending').length}</p>
                  <p>Delivered: {orders.filter((o) => o.status === 'delivered').length}</p>
                </div>
                <div style={styles.overviewCard}>
                  <h3>💰 Payments</h3>
                  <p>Total: {payments.length}</p>
                  <p>Completed: {payments.filter((p) => p.status === 'completed').length}</p>
                  <p>Pending: {payments.filter((p) => p.status === 'pending').length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2>User Management</h2>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span style={styles.badge}>{user.role}</span>
                        </td>
                        <td>{user.email_verified ? '✅' : '❌'}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2>Product Management</h2>
              <div style={styles.tableContainer}>
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
                    {products.map((product) => {
                      const category = categories.find((c) => c.id === product.category_id);
                      return (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.thumbnail || 'https://via.placeholder.com/50'}
                              alt={product.title}
                              style={styles.thumbnail}
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
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div style={styles.sectionHeader}>
                <h2>Category Management</h2>
                <button onClick={() => setShowCategoryForm(true)} style={styles.addButton}>
                  + Add Category
                </button>
              </div>

              {showCategoryForm && (
                <div style={styles.formBox}>
                  <h3>Create New Category</h3>
                  <input
                    type="text"
                    placeholder="Category Name *"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    style={{ ...styles.input, minHeight: '80px' }}
                  />
                  <div style={styles.formActions}>
                    <button onClick={() => setShowCategoryForm(false)} style={styles.cancelButton}>
                      Cancel
                    </button>
                    <button onClick={handleCreateCategory} style={styles.saveButton}>
                      Create
                    </button>
                  </div>
                </div>
              )}

              <div style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <div key={category.id} style={styles.categoryCard}>
                    <h3>{category.name}</h3>
                    <p>{category.description || 'No description'}</p>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2>Order Management</h2>
              {orders.map((order) => {
                const statusInfo = orderService.formatStatus(order.status);
                const availableStatuses = orderService.getAvailableStatusTransitions(
                  order.status,
                  'admin'
                );

                return (
                  <div key={order.id} style={styles.orderCard}>
                    <div style={styles.orderHeader}>
                      <h3>Order #{order.id.substring(0, 8)}...</h3>
                      <span style={styles.orderStatus}>
                        {statusInfo.badge} {statusInfo.text}
                      </span>
                    </div>
                    <p>Date: {orderService.formatOrderDate(order.created_at)}</p>
                    <p>Total: ₹{order.total_amount}</p>
                    <p>Payment: {order.payment_status}</p>

                    {availableStatuses.length > 0 && (
                      <div style={styles.orderActions}>
                        <label>Update Status: </label>
                        <select
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={styles.statusSelect}
                          defaultValue=""
                        >
                          <option value="">-- Select --</option>
                          {availableStatuses.map((status) => {
                            const info = orderService.formatStatus(status);
                            return (
                              <option key={status} value={status}>
                                {info.text}
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

          {activeTab === 'payments' && (
            <div>
              <h2>Payment Management</h2>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const statusInfo = paymentService.formatStatus(payment.status);
                      return (
                        <tr key={payment.id}>
                          <td>{payment.id.substring(0, 8)}...</td>
                          <td>₹{payment.amount}</td>
                          <td>{payment.payment_method}</td>
                          <td>
                            <span style={styles.badge}>
                              {statusInfo.badge} {statusInfo.text}
                            </span>
                          </td>
                          <td>{paymentService.formatPaymentDate(payment.created_at)}</td>
                          <td>
                            {payment.status === 'pending' && (
                              <select
                                onChange={(e) =>
                                  handleUpdatePaymentStatus(payment.id, e.target.value)
                                }
                                style={styles.statusSelect}
                                defaultValue=""
                              >
                                <option value="">Update...</option>
                                <option value="completed">Complete</option>
                                <option value="failed">Fail</option>
                                <option value="cancelled">Cancel</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
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
    color: '#dc3545',
    margin: '0.5rem 0 0 0',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #ddd',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#333333', // Dark gray for visibility
    transition: 'all 0.2s',
  },
  tabActive: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid #dc3545',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#dc3545',
  },
  tabContent: {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  overviewCard: {
    backgroundColor: '#f9f9f9',
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
  formBox: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    width: '100%',
    marginBottom: '1rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
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
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem',
  },
  categoryCard: {
    backgroundColor: '#f9f9f9',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
  },
  tableContainer: {
    overflow: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  thumbnail: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    backgroundColor: '#e9ecef',
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
  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
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
};

export default AdminDashboard;

