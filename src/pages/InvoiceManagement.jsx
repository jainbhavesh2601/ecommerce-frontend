import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import './InvoiceManagement.css';

const InvoiceManagement = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      const skip = (filters.page - 1) * filters.limit;
      
      const params = {
        skip: skip,
        limit: filters.limit
      };
      
      if (filters.status && filters.status !== '') {
        params.status = filters.status;
      }
      
      const response = await dashboardService.getAllInvoices(params);
      setInvoices(response.data || []);
    } catch (err) {
      setError('Failed to fetch invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/dashboard/invoices/${invoiceId}`);
  };

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const blob = await dashboardService.downloadInvoicePDF(invoiceId);
      dashboardService.downloadBlob(blob, `invoice_${invoiceId}.pdf`);
    } catch (err) {
      setError('Failed to download PDF');
      console.error('Error downloading PDF:', err);
    }
  };

  const handleUpdateStatus = async (invoiceId) => {
    const currentInvoice = invoices.find(inv => inv.id === invoiceId);
    if (!currentInvoice) return;
    
    const statusOptions = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    const currentStatusIndex = statusOptions.indexOf(currentInvoice.status);
    const nextStatusOptions = statusOptions.filter((_, index) => index !== currentStatusIndex);
    
    const newStatus = window.prompt(
      `Current status: ${currentInvoice.status.toUpperCase()}\n\nChange status to:\n- ${nextStatusOptions.join('\n- ')}\n\nEnter new status:`,
      currentInvoice.status
    );
    
    if (!newStatus || newStatus.toLowerCase() === currentInvoice.status.toLowerCase()) {
      return;
    }
    
    if (!statusOptions.includes(newStatus.toLowerCase())) {
      alert('Invalid status. Please use: ' + statusOptions.join(', '));
      return;
    }
    
    try {
      await dashboardService.updateInvoiceStatus(invoiceId, newStatus.toLowerCase());
      alert('Invoice status updated successfully!');
      fetchInvoices(); // Refresh the list
    } catch (err) {
      alert('Failed to update invoice status: ' + (err.response?.data?.detail || err.message));
      console.error('Error updating status:', err);
    }
  };

  const handleCreateInvoice = () => {
    navigate('/dashboard/invoices/create');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    return `status-${status}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="invoice-container">
      <div className="invoice-wrapper">
        {/* Header Section */}
        <div className="invoice-header">
          <div className="header-top">
            <div className="header-text">
              <h1 className="header-title">Invoice Management</h1>
              <p className="header-subtitle">Manage and track all your invoices</p>
            </div>
            <button onClick={handleCreateInvoice} className="create-button">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Invoice
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total</p>
              <p className="stat-value">{invoices.length}</p>
            </div>
            
            <div className="stat-card">
              <p className="stat-label">Paid</p>
              <p className="stat-value">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
            
            <div className="stat-card">
              <p className="stat-label">Pending</p>
              <p className="stat-value">
                {invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length}
              </p>
            </div>
            
            <div className="stat-card">
              <p className="stat-label">Overdue</p>
              <p className="stat-value">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-container">
            <div className="filters-grid">
              <div className="filter-group">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="filter-select"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <button onClick={fetchInvoices} className="refresh-button">
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {invoices.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">No invoices found</p>
            <p className="empty-submessage">
              {filters.status ? `No invoices with status "${filters.status}"` : 'Create your first invoice to get started'}
            </p>
            <button onClick={handleCreateInvoice} className="empty-button">
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="invoices-list">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="invoice-card">
                {/* Invoice Header */}
                <div className="card-header">
                  <div className="header-content">
                    <div>
                      <h3 className="invoice-number-title">{invoice.invoice_number}</h3>
                      <p className="invoice-order">Order: {invoice.order_id?.slice(0, 8)}...</p>
                    </div>
                    <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>

                {/* Invoice Body */}
                <div className="card-body">
                  <div className="info-grid">
                    {/* Customer Info */}
                    <div className="info-card">
                      <p className="info-label">BILLED TO</p>
                      <p className="info-value">{invoice.customer_name}</p>
                      <p className="info-email">{invoice.customer_email}</p>
                      <p className="info-address">{invoice.customer_address}</p>
                    </div>

                    {/* Dates */}
                    <div className="info-card">
                      <p className="info-label">ISSUE DATE</p>
                      <p className="info-value">{formatDate(invoice.issue_date)}</p>
                      <p className="info-label" style={{ marginTop: '12px' }}>DUE DATE</p>
                      <p className="info-value">{formatDate(invoice.due_date)}</p>
                    </div>

                    {/* Amount */}
                    <div className="info-card">
                      <p className="info-label">TOTAL AMOUNT</p>
                      <p className="amount-value">{formatCurrency(invoice.total_amount)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button
                      onClick={() => handleViewInvoice(invoice.id)}
                      className="action-button"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(invoice.id)}
                      className="action-button green"
                    >
                      Download PDF
                    </button>
                    {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(invoice.id)}
                        className="action-button yellow"
                      >
                        Update Status
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {invoices.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-page">Page {filters.page}</span>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={invoices.length < filters.limit}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;
