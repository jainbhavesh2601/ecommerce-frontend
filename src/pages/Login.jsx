import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authService } from '../services';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationError(false);

    console.log('Login.jsx - Attempting login with:', {
      username,
      passwordLength: password.length
    });

    try {
      const response = await authService.login({ username, password });
      console.log('Login.jsx - Login successful:', response);
      setLoading(false);
      navigate('/profile');
    } catch (err) {
      console.error('Login.jsx - Login error:', err);
      console.error('Login.jsx - Error details:', err.response?.data);
      if (err.response?.status === 403) {
        // Email not verified
        setVerificationError(true);
        setError('Please verify your email address before logging in. Check your inbox for the verification link.');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password.');
      } else if (err.response?.status === 422) {
        // Validation error
        const errorDetails = err.response?.data?.detail;
        if (Array.isArray(errorDetails)) {
          const errorMsg = errorDetails.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
          setError(errorMsg || 'Invalid input. Please check your credentials.');
        } else if (typeof errorDetails === 'string') {
          setError(errorDetails);
        } else {
          setError('Invalid input. Please check your credentials.');
        }
      } else {
        const errorMsg = err.response?.data?.detail;
        setError(typeof errorMsg === 'string' ? errorMsg : 'Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <h1>Login</h1>
        
        {error && (
          <div style={verificationError ? styles.warningBox : styles.errorBox}>
            {error}
            {verificationError && (
              <div style={styles.verificationActions}>
                <Link to="/resend-verification" style={styles.resendLink}>
                  Resend Verification Email
                </Link>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Username or Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Don't have an account? <a href="/signup">Signup here</a>
        </p>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '3rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
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
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  warningBox: { 
    padding: '1rem', 
    backgroundColor: '#fff3cd', 
    color: '#856404', 
    border: '1px solid #ffeaa7', 
    borderRadius: '6px', 
    marginBottom: '1rem',
    fontSize: '0.9rem',
    lineHeight: '1.5',
  },
  verificationActions: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #ffeaa7',
  },
  resendLink: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#ffcc00',
    color: '#333',
    textDecoration: 'none',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};

export default Login;
