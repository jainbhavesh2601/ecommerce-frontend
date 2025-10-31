import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../Api/api';

function VendorLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data && response.data.access_token) {
        // Store the auth token
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('vendorToken', response.data.access_token); // For backward compatibility
        
        // Store user data
        localStorage.setItem('vendorData', JSON.stringify({
          name: response.data.user.full_name,
          shopName: response.data.user.username, // Using username as shop name for now
          email: response.data.user.email,
          address: response.data.user.address || '',
          phone: response.data.user.phone_number || '',
          id: response.data.user.id,
          role: response.data.user.role
        }));

        // Check if user is a seller
        if (response.data.user.role === 'seller') {
          navigate('/Vendorprofile');
        } else {
          setError('This account is not registered as a vendor. Please sign up as a vendor.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Vendor Login</h1>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Vendor'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Don't have an account? <Link to="/Vendorsignup">Sign up here</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.6rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' },
  button: { 
    padding: '0.6rem', 
    fontSize: '1rem', 
    backgroundColor: '#ffcc00', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem'
  }
};

export default VendorLogin;
