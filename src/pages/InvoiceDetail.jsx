import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import dashboardService from '../services/dashboardService';
import './InvoiceDetail.css';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getInvoiceById(invoiceId);
      setInvoice(response.data.invoice);
      setItems(response.data.items || []);
    } catch (err) {
      setError('Failed to fetch invoice details');
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await dashboardService.downloadInvoicePDF(invoiceId);
      dashboardService.downloadBlob(blob, `invoice_${invoice.invoice_number}.pdf`);
    } catch (err) {
      setError('Failed to download PDF');
      console.error('Error downloading PDF:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="error-container">
        <div className="error-message">{error || 'Invoice not found'}</div>
        <button onClick={() => navigate('/dashboard/invoices')} className="error-button">
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="invoice-detail-container">
      <div className="invoice-detail-wrapper">
        {/* Header */}
        <div className="detail-header">
          <div>
            <h1>Invoice Details</h1>
            <p className="detail-subtitle">{invoice.invoice_number}</p>
          </div>
          <div className="detail-actions">
            <button
              onClick={() => navigate('/dashboard/invoices')}
              className="detail-button primary"
            >
              Back to Invoices
            </button>
            <button
              onClick={handleDownloadPDF}
              className="detail-button success"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Invoice Status */}
        <div className="status-card">
          <div className="status-content">
            <div className="status-info">
              <h2>Invoice Status</h2>
              <p>Current status of this invoice</p>
            </div>
            <span className={`detail-status-badge ${getStatusClass(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Invoice Information */}
        <div className="info-grid">
          {/* Invoice Details */}
          <div className="info-section">
            <h3 className="section-title">Invoice Information</h3>
            <ul className="info-list">
              <li className="info-item">
                <span className="info-label">Invoice Number:</span>
                <span className="info-value">{invoice.invoice_number}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Issue Date:</span>
                <span className="info-value">{formatDate(invoice.issue_date)}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Due Date:</span>
                <span className="info-value">{formatDate(invoice.due_date)}</span>
              </li>
              {invoice.paid_date && (
                <li className="info-item">
                  <span className="info-label">Paid Date:</span>
                  <span className="info-value">{formatDate(invoice.paid_date)}</span>
                </li>
              )}
              <li className="info-item">
                <span className="info-label">Order ID:</span>
                <span className="info-value">{invoice.order_id?.slice(0, 8)}...</span>
              </li>
            </ul>
          </div>

          {/* Financial Summary */}
          <div className="info-section">
            <h3 className="section-title">Financial Summary</h3>
            <ul className="info-list">
              <li className="info-item">
                <span className="info-label">Subtotal:</span>
                <span className="info-value">{formatCurrency(invoice.subtotal)}</span>
              </li>
              <li className="info-item">
                <span className="info-label">Tax Amount:</span>
                <span className="info-value">{formatCurrency(invoice.tax_amount)}</span>
              </li>
              <li className="info-item">
                <span className="info-label total-label final">Total Amount:</span>
                <span className="info-value total-amount final">{formatCurrency(invoice.total_amount)}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Customer and Seller Information */}
        <div className="info-grid">
          {/* Customer Information */}
          <div className="info-section">
            <h3 className="section-title">Customer Information</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.75' }}>
              <p style={{ fontWeight: '500', marginBottom: '8px' }}>{invoice.customer_name}</p>
              <p style={{ color: '#6b7280', marginBottom: '4px' }}>{invoice.customer_email}</p>
              <p style={{ color: '#6b7280' }}>{invoice.customer_address}</p>
            </div>
          </div>

          {/* Seller Information */}
          <div className="info-section">
            <h3 className="section-title">Seller Information</h3>
            <div style={{ fontSize: '14px', lineHeight: '1.75' }}>
              <p style={{ fontWeight: '500', marginBottom: '8px' }}>{invoice.seller_name}</p>
              <p style={{ color: '#6b7280', marginBottom: '4px' }}>{invoice.seller_email}</p>
              {invoice.seller_address && (
                <p style={{ color: '#6b7280', marginBottom: '4px' }}>{invoice.seller_address}</p>
              )}
              {invoice.seller_phone && (
                <p style={{ color: '#6b7280' }}>{invoice.seller_phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="items-section">
          <h3 className="section-title">Invoice Items</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="item-product">{item.product_name}</td>
                    <td className="item-description">{item.product_description || '-'}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="totals-section">
          <table className="totals-table">
            <tbody>
              <tr className="total-row">
                <td className="total-label">Subtotal</td>
                <td className="total-amount">{formatCurrency(invoice.subtotal)}</td>
              </tr>
              <tr className="total-row">
                <td className="total-label">Tax</td>
                <td className="total-amount">{formatCurrency(invoice.tax_amount)}</td>
              </tr>
              <tr className="total-row">
                <td className="total-label final">Total</td>
                <td className="total-amount final">{formatCurrency(invoice.total_amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {(invoice.notes || invoice.terms) && (
          <div className="notes-section">
            <h3 className="section-title">Additional Information</h3>
            {invoice.notes && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Notes
                </h4>
                <p className="notes-content">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Terms & Conditions
                </h4>
                <p className="notes-content">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
