import React from 'react';
import { format } from 'date-fns';

const InvoiceCard = ({ invoice, onView, onDownload, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
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
      // Fallback to native formatting
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-900 truncate">
              {invoice.invoice_number}
            </h3>
            <p className="text-xs text-gray-500">
              Order: {invoice.order_id?.slice(0, 8)}...
            </p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-2 mb-4">
          <div className="text-xs text-gray-500">Customer</div>
          <div className="text-sm font-medium text-gray-900">{invoice.customer_name}</div>
          
          <div className="text-xs text-gray-500">Issue Date</div>
          <div className="text-sm text-gray-700">{formatDate(invoice.issue_date)}</div>
          
          <div className="text-xs text-gray-500">Due Date</div>
          <div className="text-sm text-gray-700">{formatDate(invoice.due_date)}</div>
          
          <div className="border-t pt-2 mt-2">
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(invoice.total_amount)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onView(invoice.id)}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            View
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => onDownload(invoice.id)}
              className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700"
            >
              Download
            </button>
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(invoice.id)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded text-sm font-medium hover:bg-yellow-600"
              >
                Update
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
