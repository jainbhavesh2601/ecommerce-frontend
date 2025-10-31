import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../Api/api';

function VendorSignup() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    country: 'India'
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Register as seller
      const response = await api.post('/auth/register', {
        ...formData,
        role: 'seller'
      });

      if (response.data) {
        alert('Vendor registered successfully! Please login to continue.');
        navigate('/Vendorlogin');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Vendor Signup</h1>
        
        {error && (
          <div style={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={formData.full_name}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
            minLength="8"
          />
          <input
            type="tel"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up as Vendor'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Already have an account? <Link to="/Vendorlogin">Login here</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '500px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' },
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

export default VendorSignup;
