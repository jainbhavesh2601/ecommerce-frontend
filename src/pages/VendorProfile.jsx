import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { vendorAPI } from '../Api/api';

function VendorProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  
  // Products data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  
  // Orders data
  const [orders, setOrders] = useState([]);
  
  // Invoices data
  const [invoices, setInvoices] = useState([]);

  // Product form state
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    discount_percentage: 0,
    rating: 0,
    stock: 0,
    brand: '',
    thumbnail: '',
    images: [],
    category_id: ''
  });

  // Load vendor info from localStorage
  const [vendor, setVendor] = useState({
    name: '',
    shopName: '',
    email: '',
    address: '',
    phone: '',
    id: '',
    role: ''
  });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('vendorData'));
    if (storedData) setVendor(storedData);
    else navigate('/vendorlogin');
    
    // Load initial data
    loadDashboardData();
    loadProducts();
    loadCategories();
    loadOrders();
    loadInvoices();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await vendorAPI.getDashboard(30);
      setDashboardData(data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (search = '') => {
    try {
      const data = await vendorAPI.getMyProducts(1, 100, search);
      setProducts(data.data || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Products error:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await vendorAPI.getCategories();
      setCategories(data.data || []);
    } catch (err) {
      console.error('Categories error:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const data = await vendorAPI.getMyOrders(0, 50);
      setOrders(data.data || []);
    } catch (err) {
      console.error('Orders error:', err);
    }
  };

  const loadInvoices = async () => {
    try {
      const data = await vendorAPI.getInvoices();
      setInvoices(data.data || []);
    } catch (err) {
      console.error('Invoices error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('vendorData');
    navigate('/');
  };

  const handleEditVendor = () => {
    const name = prompt('Your Name:', vendor.name) || vendor.name;
    const shopName = prompt('Shop Name:', vendor.shopName) || vendor.shopName;
    const email = prompt('Email:', vendor.email) || vendor.email;
    const address = prompt('Address:', vendor.address) || vendor.address;
    const phone = prompt('Phone:', vendor.phone) || vendor.phone;

    const updatedVendor = { ...vendor, name, shopName, email, address, phone };
    setVendor(updatedVendor);
    localStorage.setItem('vendorData', JSON.stringify(updatedVendor));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate required fields
      if (!productForm.title || !productForm.brand || !productForm.price || 
          !productForm.stock || !productForm.thumbnail || !productForm.category_id) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate category_id is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(productForm.category_id)) {
        setError('Please select a valid category');
        return;
      }

      const productData = {
        title: productForm.title.trim(),
        description: productForm.description?.trim() || '',
        price: parseFloat(productForm.price),
        discount_percentage: parseFloat(productForm.discount_percentage) || 0,
        rating: parseFloat(productForm.rating) || 0,
        stock: parseInt(productForm.stock),
        brand: productForm.brand.trim(),
        thumbnail: productForm.thumbnail.trim(),
        images: productForm.images.filter(img => img.trim() !== '').map(img => img.trim()),
        category_id: productForm.category_id
      };

      console.log('Sending product data:', productData);

      // Validate numeric fields
      if (isNaN(productData.price) || productData.price <= 0) {
        setError('Price must be a positive number');
        return;
      }
      if (isNaN(productData.stock) || productData.stock < 0) {
        setError('Stock must be a non-negative number');
        return;
      }
      if (productData.discount_percentage < 0 || productData.discount_percentage > 100) {
        setError('Discount percentage must be between 0 and 100');
        return;
      }
      if (productData.rating < 0 || productData.rating > 5) {
        setError('Rating must be between 0 and 5');
        return;
      }

      if (editingProduct) {
        // Check if the product belongs to the current user
        if (editingProduct.seller_id !== vendor.id) {
          setError('You can only edit products that you created');
          return;
        }
        await vendorAPI.updateProduct(editingProduct.id, productData);
        setEditingProduct(null);
      } else {
        await vendorAPI.createProduct(productData);
      }

      setShowProductForm(false);
      setProductForm({
        title: '',
        description: '',
        price: '',
        discount_percentage: 0,
        rating: 0,
        stock: 0,
        brand: '',
        thumbnail: '',
        images: [],
        category_id: ''
      });
      setError('');
      loadProducts(productSearch);
    } catch (err) {
      console.error('Product save error:', err);
      let errorMessage = 'Failed to save product';
      
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(e => e.msg || e).join(', ');
        } else if (typeof err.response.data.detail === 'object') {
          errorMessage = JSON.stringify(err.response.data.detail);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    // Check if the product belongs to the current user
    if (product.seller_id !== vendor.id) {
      setError('You can only edit products that you created. This product belongs to another seller.');
      return;
    }
    
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description || '',
      price: product.price.toString(),
      discount_percentage: product.discount_percentage,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand,
      thumbnail: product.thumbnail,
      images: product.images || [],
      category_id: product.category_id
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    // Find the product to check ownership
    const product = products.find(p => p.id === productId);
    if (product && product.seller_id !== vendor.id) {
      setError('You can only delete products that you created. This product belongs to another seller.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await vendorAPI.deleteProduct(productId);
        loadProducts(productSearch);
        setError(''); // Clear any previous errors
      } catch (err) {
        if (err.response?.status === 403) {
          setError('You can only delete products that you created. This product belongs to another seller.');
        } else {
          setError(`Failed to delete product: ${err.response?.data?.detail || err.message}`);
        }
        console.error('Product delete error:', err);
      }
    }
  };

  const handleProductSearch = (e) => {
    e.preventDefault();
    loadProducts(productSearch);
  };

  const addImageField = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, '']
    });
  };

  const updateImageField = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const removeImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading && !dashboardData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Vendor Dashboard</h1>
          <div style={styles.headerActions}>
            <button style={styles.editButton} onClick={handleEditVendor}>
              Edit Profile
            </button>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            {error}
            <button onClick={() => setError('')} style={styles.closeError}>×</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={styles.tabContainer}>
          <button
            style={{...styles.tab, ...(activeTab === 'dashboard' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'products' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'orders' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            style={{...styles.tab, ...(activeTab === 'invoices' ? styles.activeTab : {})}}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={styles.tabContent}>
            <h2>Dashboard Overview</h2>
            {dashboardData ? (
              <div style={styles.dashboardGrid}>
                <div style={styles.statCard}>
                  <h3>Total Products</h3>
                  <p style={styles.statNumber}>{dashboardData.total_products || 0}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Total Orders</h3>
                  <p style={styles.statNumber}>{dashboardData.total_orders || 0}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Total Revenue</h3>
                  <p style={styles.statNumber}>{formatCurrency(dashboardData.total_revenue || 0)}</p>
                </div>
                <div style={styles.statCard}>
                  <h3>Recent Orders</h3>
                  <p style={styles.statNumber}>{dashboardData.recent_orders?.length || 0}</p>
                </div>
              </div>
            ) : (
              <p>No dashboard data available</p>
            )}

        {/* Vendor Info */}
        <div style={styles.section}>
              <h3>Vendor Information</h3>
              <div style={styles.vendorInfo}>
          <p><strong>Name:</strong> {vendor.name}</p>
          <p><strong>Shop Name:</strong> {vendor.shopName}</p>
          <p><strong>Email:</strong> {vendor.email}</p>
          <p><strong>Address:</strong> {vendor.address}</p>
          <p><strong>Phone:</strong> {vendor.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <h2>All Products</h2>
              <button
                style={styles.addButton}
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    description: '',
                    price: '',
                    discount_percentage: 0,
                    rating: 0,
                    stock: 0,
                    brand: '',
                    thumbnail: '',
                    images: [],
                    category_id: ''
                  });
                  setShowProductForm(true);
                }}
              >
                Add Product
              </button>
            </div>

            {/* Product Search */}
            <div style={styles.searchContainer}>
              <form onSubmit={handleProductSearch} style={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search all products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  style={styles.searchInput}
                />
                <button type="submit" style={styles.searchButton}>
                  Search
                </button>
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      loadProducts('');
                    }}
                    style={styles.clearButton}
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {showProductForm && (
              <div style={styles.formContainer}>
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleProductSubmit} style={styles.productForm}>
                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label>Product Title *</label>
                      <input
                        type="text"
                        value={productForm.title}
                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                        required
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Brand *</label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                        required
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        required
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={productForm.discount_percentage}
                        onChange={(e) => setProductForm({...productForm, discount_percentage: e.target.value})}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.formGroup}>
                      <label>Stock *</label>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                        required
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label>Rating (0-5)</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={productForm.rating}
                        onChange={(e) => setProductForm({...productForm, rating: e.target.value})}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label>Category *</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                      required
                      style={styles.input}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows="3"
                      style={styles.textarea}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Thumbnail URL *</label>
                    <input
                      type="url"
                      value={productForm.thumbnail}
                      onChange={(e) => setProductForm({...productForm, thumbnail: e.target.value})}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label>Product Images</label>
                    {productForm.images.map((image, index) => (
                      <div key={index} style={styles.imageInputGroup}>
                        <input
                          type="url"
                          value={image}
                          onChange={(e) => updateImageField(index, e.target.value)}
                          placeholder="Image URL"
                          style={styles.input}
                        />
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          style={styles.removeButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addImageField}
                      style={styles.addImageButton}
                    >
                      Add Image
                    </button>
        </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={styles.submitButton}
                    >
                      {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                    </button>
                  </div>
                </form>
              </div>
            )}


            {products.length === 0 ? (
              <div style={styles.emptyState}>
                <h3>No Products Found</h3>
                <p>
                  {productSearch 
                    ? `No products match your search "${productSearch}". Try a different search term.`
                    : "No products found in the system. Click 'Add Product' to add your first product!"
                  }
                </p>
                {!productSearch && (
                  <button
                    style={styles.addButton}
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({
                        title: '',
                        description: '',
                        price: '',
                        discount_percentage: 0,
                        rating: 0,
                        stock: 0,
                        brand: '',
                        thumbnail: '',
                        images: [],
                        category_id: ''
                      });
                      setShowProductForm(true);
                    }}
                  >
                    Add Your First Product
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.productsGrid}>
                  {products.map((product) => (
                    <div key={product.id} style={styles.productCard}>
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        style={styles.productImage}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                        }}
                      />
                      <div style={styles.productInfo}>
                        <h4>{product.title}</h4>
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Price:</strong> {formatCurrency(product.price)}</p>
                        <p><strong>Discount:</strong> {product.discount_percentage}%</p>
                        <p><strong>Stock:</strong> {product.stock}</p>
                        <p><strong>Rating:</strong> {product.rating}/5</p>
                        {product.description && (
                          <p><strong>Description:</strong> {product.description}</p>
                        )}
                        
                        {/* Ownership indicator */}
                        <div style={styles.ownershipInfo}>
                          {product.seller_id === vendor.id ? (
                            <span style={styles.ownProduct}>✓ Your Product</span>
                          ) : (
                            <span style={styles.otherProduct}>Other Seller's Product</span>
                          )}
                        </div>
                        
                        {/* Action buttons - only show for own products */}
                        {product.seller_id === vendor.id && (
                          <div style={styles.productActions}>
                            <button
                              style={styles.editButton}
                              onClick={() => handleEditProduct(product)}
                            >
                              Edit
                            </button>
                            <button
                              style={styles.deleteButton}
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              Delete
                            </button>
      </div>
                        )}
    </div>
  </div>
))}
                </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div style={styles.tabContent}>
            <h2>Recent Orders</h2>
            <div style={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} style={styles.orderCard}>
                  <div style={styles.orderHeader}>
                    <h4>Order #{order.order_number}</h4>
                    <span style={styles.orderStatus}>{order.status}</span>
                  </div>
                  <p><strong>Customer:</strong> {order.customer_name}</p>
                  <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
                  <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                  <p><strong>Payment Status:</strong> {order.payment_status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div style={styles.tabContent}>
            <h2>Invoices</h2>
            <div style={styles.invoicesList}>
              {invoices.map((invoice) => (
                <div key={invoice.id} style={styles.invoiceCard}>
                  <div style={styles.invoiceHeader}>
                    <h4>Invoice #{invoice.invoice_number}</h4>
                    <span style={styles.invoiceStatus}>{invoice.status}</span>
                  </div>
                  <p><strong>Customer:</strong> {invoice.customer_name}</p>
                  <p><strong>Amount:</strong> {formatCurrency(invoice.total_amount)}</p>
                  <p><strong>Issue Date:</strong> {formatDate(invoice.issue_date)}</p>
                  <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
                </div>
              ))}
            </div>
        </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh'
  },
  loadingSpinner: {
    fontSize: '1.2rem',
    color: '#666'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #eee'
  },
  headerActions: {
    display: 'flex',
    gap: '1rem'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeError: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#c62828'
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '2rem',
    borderBottom: '1px solid #ddd'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    fontSize: '1rem'
  },
  activeTab: {
    borderBottomColor: '#0077ff',
    color: '#0077ff',
    fontWeight: 'bold'
  },
  tabContent: {
    minHeight: '400px'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#0077ff',
    margin: '0.5rem 0'
  },
  section: {
    backgroundColor: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  vendorInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem'
  },
  productForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    resize: 'vertical'
  },
  imageInputGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem'
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  productCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column'
  },
  productImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  productInfo: {
    flex: 1
  },
  productActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  ownershipInfo: {
    marginTop: '0.5rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  ownProduct: {
    color: '#2e7d32',
    backgroundColor: '#e8f5e8',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    display: 'inline-block'
  },
  otherProduct: {
    color: '#f57c00',
    backgroundColor: '#fff3e0',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    display: 'inline-block'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  orderCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f8f9fa'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  orderStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    backgroundColor: '#e3f2fd',
    color: '#1976d2'
  },
  invoicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  invoiceCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f8f9fa'
  },
  invoiceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  invoiceStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: 'bold',
    backgroundColor: '#e8f5e8',
    color: '#2e7d32'
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0077ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#00cc66',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  logoutButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ff4d4d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  addImageButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  removeButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  submitButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  searchContainer: {
    marginBottom: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  searchForm: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0077ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  clearButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '2px dashed #dee2e6'
  }
};

export default VendorProfile;