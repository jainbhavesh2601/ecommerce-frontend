import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../Api/api';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    // Call verification endpoint
    api.post('/auth/verify-email', { token })
      .then((response) => {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch((error) => {
        setStatus('error');
        const errorMessage = error.response?.data?.detail || 'Verification failed. The link may be expired or invalid.';
        setMessage(errorMessage);
      });
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.content}>
          {status === 'verifying' && (
            <>
              <div style={styles.spinner}></div>
              <h2 style={styles.title}>Verifying Your Email</h2>
              <p style={styles.message}>Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={styles.successIcon}>✓</div>
              <h2 style={styles.title}>Email Verified!</h2>
              <p style={styles.message}>{message}</p>
              <p style={styles.submessage}>Redirecting to login page...</p>
              <Link to="/login" style={styles.link}>
                Click here if not redirected automatically
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={styles.errorIcon}>✕</div>
              <h2 style={styles.title}>Verification Failed</h2>
              <p style={styles.message}>{message}</p>
              <div style={styles.actions}>
                <Link to="/resend-verification" style={styles.button}>
                  Resend Verification Email
                </Link>
                <Link to="/signup" style={styles.linkButton}>
                  Back to Signup
                </Link>
              </div>
            </>
          )}
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
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
  },
  errorIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#f44336',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
  },
  message: {
    fontSize: '16px',
    color: '#666',
    margin: '0',
    lineHeight: '1.5',
  },
  submessage: {
    fontSize: '14px',
    color: '#999',
    margin: '0',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
    marginTop: '10px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  },
  linkButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#4CAF50',
    textDecoration: 'none',
    border: '2px solid #4CAF50',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontSize: '14px',
  },
};

export default VerifyEmail;

