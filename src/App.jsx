import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Products from './pages/Products';
import Cart from './pages/Cart';
import CheckoutNew from './pages/CheckoutNew';
import Orders from './pages/Orders';
import VendorLogin from './pages/VendorLogin';
import VendorSignup from './pages/VendorSignup';
import VendorProfile from './pages/VendorProfile';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InvoiceManagement from './pages/InvoiceManagement';
import InvoiceDetail from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';

// ProtectedRoute component - requires authentication
function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// SellerRoute - requires seller or admin role
function SellerRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!authService.isSeller() && !authService.isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// AdminRoute - requires admin role
function AdminRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (!authService.isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Legacy vendor protected (keeping for backward compatibility)
function VendorProtected({ children }) {
  const token = localStorage.getItem('vendorToken');
  return token ? children : <Navigate to="/Vendorlogin" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* ========== Public Routes ========== */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        
        {/* Legacy Vendor Routes (backward compatibility) */}
        <Route path="/Vendorlogin" element={<VendorLogin />} />
        <Route path="/Vendorsignup" element={<VendorSignup />} />
        <Route
          path="/Vendorprofile"
          element={
            <VendorProtected>
              <VendorProfile />
            </VendorProtected>
          }
        />

        {/* ========== Protected User Routes ========== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        
        {/* Checkout Route */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutNew />
            </ProtectedRoute>
          }
        />

        {/* ========== Seller Routes ========== */}
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />

        {/* ========== Invoice Routes ========== */}
        <Route
          path="/dashboard/invoices"
          element={
            <SellerRoute>
              <InvoiceManagement />
            </SellerRoute>
          }
        />
        <Route
          path="/dashboard/invoices/create"
          element={
            <SellerRoute>
              <CreateInvoice />
            </SellerRoute>
          }
        />
        <Route
          path="/dashboard/invoices/:invoiceId"
          element={
            <SellerRoute>
              <InvoiceDetail />
            </SellerRoute>
          }
        />

        {/* ========== Admin Routes ========== */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* ========== Fallback ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
