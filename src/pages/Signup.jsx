import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authService } from '../services';

function Signup() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('normal_user'); // 'normal_user' or 'seller'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register({
        username,
        full_name: name,
        email,
        password,
        phone_number: phone || null,
        address: address || null,
        role: role, // Include role in registration
      });
      
      setSuccess(true);
      // Redirect based on role
      setTimeout(() => {
        if (role === 'seller') {
          navigate('/vendor-login');
        } else {
          navigate('/login');
        }
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Signup</h1>
        
        {success ? (
          <div style={styles.successBox}>
            <h2 style={styles.successTitle}>Registration Successful! 🎉</h2>
            <p style={styles.successMessage}>
              We've sent a verification email to <strong>{email}</strong>.
            </p>
            <p style={styles.successMessage}>
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p style={styles.successNote}>
              Redirecting to login page in 5 seconds...
            </p>
            <button 
              onClick={() => navigate('/login')} 
              style={styles.button}
            >
              Go to Login Now
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
              Didn't receive the email? <a href="/resend-verification">Resend verification</a>
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignup} style={styles.form}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
                disabled={loading}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
                disabled={loading}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                minLength={8}
                required
                disabled={loading}
              />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={styles.input}
                disabled={loading}
              >
                <option value="normal_user">Customer</option>
                <option value="seller">Seller</option>
              </select>
              <textarea
                placeholder="Address (optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{...styles.input, minHeight: '60px'}}
                disabled={loading}
              />
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {})
                }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Signup'}
              </button>
            </form>
            <p style={{ marginTop: '1rem' }}>
              Already have an account? <a href="/login">Login here</a>
            </p>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: { maxWidth: '500px', margin: '3rem auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.6rem', fontSize: '1rem', borderRadius: '6px', border: '1px solid #ccc' },
  button: { padding: '0.6rem', fontSize: '1rem', backgroundColor: '#ffcc00', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  buttonDisabled: { backgroundColor: '#ccc', cursor: 'not-allowed' },
  errorBox: { 
    padding: '1rem', 
    backgroundColor: '#f8d7da', 
    color: '#721c24', 
    border: '1px solid #f5c6cb', 
    borderRadius: '6px', 
    marginBottom: '1rem',
    fontSize: '0.9rem'
  },
  successBox: {
    padding: '1.5rem',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
  },
  successTitle: {
    color: '#155724',
    marginBottom: '1rem',
    fontSize: '1.5rem',
  },
  successMessage: {
    color: '#155724',
    marginBottom: '0.5rem',
    lineHeight: '1.5',
  },
  successNote: {
    color: '#155724',
    fontSize: '0.9rem',
    marginTop: '1rem',
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
};

export default Signup;