import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../Api/api';

function ResendVerification() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post('/auth/resend-verification', { email });
      setStatus('success');
      setMessage(response.data.message || 'Verification email sent successfully! Please check your inbox.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data?.detail || 'Failed to send verification email. Please try again.';
      setMessage(errorMessage);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Resend Verification Email</h2>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a new verification link.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              required
              disabled={status === 'loading'}
              style={{
                ...styles.input,
                ...(status === 'loading' ? styles.inputDisabled : {}),
              }}
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              ...styles.button,
              ...(status === 'loading' ? styles.buttonDisabled : {}),
            }}
          >
            {status === 'loading' ? 'Sending...' : 'Send Verification Email'}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.messageBox,
              ...(status === 'success' ? styles.successBox : styles.errorBox),
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>
            Back to Login
          </Link>
          <span style={styles.separator}>•</span>
          <Link to="/signup" style={styles.link}>
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '30px',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
  messageBox: {
    padding: '12px',
    borderRadius: '4px',
    marginTop: '20px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  successBox: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '30px',
    fontSize: '14px',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '500',
  },
  separator: {
    color: '#ddd',
  },
};

export default ResendVerification;

