import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/orderService';
import dashboardService from '../services/dashboardService';
import './CreateInvoice.css';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    order_id: '',
    due_days: 30
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'due_days' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.order_id) {
      setError('Please select an order');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await dashboardService.createInvoice(formData);
      
      navigate(`/dashboard/invoices/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create invoice');
      console.error('Error creating invoice:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="create-invoice-container">
      <div className="create-invoice-wrapper">
        <div className="create-header">
          <h1>Create Invoice</h1>
          <p className="create-subtitle">Select an order to create an invoice</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Order Selection */}
          <div className="form-section">
            <h2 className="section-title">Select Order</h2>
            
            {orders.length === 0 ? (
              <div className="empty-state">
                <p className="empty-message">No orders available for invoicing</p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/orders')}
                  className="empty-button"
                >
                  View Orders
                </button>
              </div>
            ) : (
              <div className="order-options">
                {orders.map((order) => (
                  <label key={order.id} className={`order-option ${formData.order_id === order.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="order_id"
                      value={order.id}
                      checked={formData.order_id === order.id}
                      onChange={handleInputChange}
                    />
                    <div className="order-info">
                      <div className="order-main-info">
                        <span className="order-title">{order.order_number}</span>
                        <span className="order-amount">{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="order-details">
                        Customer: {order.user?.full_name || 'Unknown'} • Date: {formatDate(order.created_at)} • Status: {order.status}
                      </div>
                      <div className="order-details">
                        Items: {order.order_items?.length || 0} items
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Invoice Settings */}
          <div className="form-section">
            <h2 className="section-title">Invoice Settings</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Payment Due (Days)</label>
                <input
                  type="number"
                  name="due_days"
                  value={formData.due_days}
                  onChange={handleInputChange}
                  min="1"
                  max="365"
                  className="form-input"
                  required
                />
                <p className="form-help">
                  Number of days from invoice date until payment is due
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Due Date Preview</label>
                <div className="preview-box">
                  {formData.due_days ? 
                    new Date(Date.now() + formData.due_days * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'Select days above'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard/invoices')}
              className="action-button secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.order_id}
              className="action-button primary"
            >
              {submitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
