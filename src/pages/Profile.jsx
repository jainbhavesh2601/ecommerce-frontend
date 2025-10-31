import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modals
  const [editProfile, setEditProfile] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const token = localStorage.getItem('authToken');

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }
        
        const res = await fetch('http://127.0.0.1:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile.');
        const data = await res.json();
        setUser({
          id: data.id,
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          role: data.role || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          email_notifications_enabled: data.email_notifications_enabled !== undefined ? data.email_notifications_enabled : true,
          order_notifications_enabled: data.order_notifications_enabled !== undefined ? data.order_notifications_enabled : true,
          marketing_emails_enabled: data.marketing_emails_enabled !== undefined ? data.marketing_emails_enabled : false,
        });
      } catch (err) {
        alert(err.message);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate]);

  // Update profile
  const handleEditProfile = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          phone_number: user.phone_number,
          address: user.address,
          city: user.city,
          state: user.state,
          country: user.country,
          email_notifications_enabled: user.email_notifications_enabled,
          order_notifications_enabled: user.order_notifications_enabled,
          marketing_emails_enabled: user.marketing_emails_enabled,
        }),
      });
      if (!res.ok) throw new Error('Update failed.');
      alert('Profile updated!');
      setEditProfile(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New and confirm password do not match.');
      return;
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      });
      if (!res.ok) throw new Error('Password change failed.');
      alert('Password changed!');
      setChangePassword(false);
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div style={styles.loadingContainer}><div style={styles.loader}></div><p>Loading profile...</p></div>;
  if (!user) return <p style={styles.errorText}>No user found.</p>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>My Profile</h1>
          <p style={styles.headerSubtitle}>Manage your account settings and preferences</p>
        </div>

        <div style={styles.profileGrid}>
          {/* User Information Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Personal Information</h2>
              <button style={styles.editButton} onClick={() => setEditProfile(true)}>✏️ Edit</button>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <span style={styles.label}>Full Name</span>
                <span style={styles.value}>{user.full_name}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Username</span>
                <span style={styles.value}>{user.username}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Email</span>
                <span style={styles.value}>{user.email}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Phone Number</span>
                <span style={styles.value}>{user.phone_number || 'Not provided'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Role</span>
                <span style={{...styles.value, ...styles.roleBadge}}>{user.role || 'Customer'}</span>
              </div>
            </div>
          </div>

          {/* Location Information Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Location Details</h2>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.infoRow}>
                <span style={styles.label}>Address</span>
                <span style={styles.value}>{user.address || 'No address added'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>City</span>
                <span style={styles.value}>{user.city || 'Not provided'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>State</span>
                <span style={styles.value}>{user.state || 'Not provided'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.label}>Country</span>
                <span style={styles.value}>{user.country || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editProfile && (
          <div style={styles.modal}>
            <h3>Edit Profile</h3>
            <input placeholder="Name" value={user.full_name} onChange={(e) => setUser({ ...user, full_name: e.target.value })} style={styles.input} />
            <input placeholder="Username" value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} style={styles.input} />
            <input placeholder="Email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} style={styles.input} />
            <input placeholder="Phone" value={user.phone_number || ''} onChange={(e) => setUser({ ...user, phone_number: e.target.value })} style={styles.input} />
            <textarea placeholder="Address" value={user.address || ''} onChange={(e) => setUser({ ...user, address: e.target.value })} style={{...styles.input, minHeight: '60px'}} />
            <input placeholder="City" value={user.city || ''} onChange={(e) => setUser({ ...user, city: e.target.value })} style={styles.input} />
            <input placeholder="State" value={user.state || ''} onChange={(e) => setUser({ ...user, state: e.target.value })} style={styles.input} />
            <input placeholder="Country" value={user.country || ''} onChange={(e) => setUser({ ...user, country: e.target.value })} style={styles.input} />
            <div style={styles.modalButtons}>
              <button style={styles.button} onClick={handleEditProfile}>Save</button>
              <button style={styles.buttonSecondary} onClick={() => setEditProfile(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Notification Settings</h2>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.switchContainer}>
              <div style={styles.switchRow}>
                <div>
                  <span style={styles.switchLabel}>Email Notifications</span>
                  <p style={styles.switchDescription}>Receive email alerts for account activity</p>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={user.email_notifications_enabled}
                    onChange={(e) => setUser({ ...user, email_notifications_enabled: e.target.checked })}
                    style={styles.switchInput}
                  />
                  <span style={{
                    ...styles.switchSlider,
                    backgroundColor: user.email_notifications_enabled ? '#28a745' : '#ccc'
                  }}></span>
                </label>
              </div>
              <div style={styles.switchRow}>
                <div>
                  <span style={styles.switchLabel}>Order Notifications</span>
                  <p style={styles.switchDescription}>Get notified about your order status</p>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={user.order_notifications_enabled}
                    onChange={(e) => setUser({ ...user, order_notifications_enabled: e.target.checked })}
                    style={styles.switchInput}
                  />
                  <span style={{
                    ...styles.switchSlider,
                    backgroundColor: user.order_notifications_enabled ? '#28a745' : '#ccc'
                  }}></span>
                </label>
              </div>
              <div style={styles.switchRow}>
                <div>
                  <span style={styles.switchLabel}>Marketing Emails</span>
                  <p style={styles.switchDescription}>Receive promotional offers and updates</p>
                </div>
                <label style={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={user.marketing_emails_enabled}
                    onChange={(e) => setUser({ ...user, marketing_emails_enabled: e.target.checked })}
                    style={styles.switchInput}
                  />
                  <span style={{
                    ...styles.switchSlider,
                    backgroundColor: user.marketing_emails_enabled ? '#28a745' : '#ccc'
                  }}></span>
                </label>
              </div>
            </div>
            <button style={styles.primaryButton} onClick={() => {
              handleEditProfile();
            }}>💾 Save Notification Settings</button>
          </div>
        </div>

        {/* Security Settings */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Security</h2>
          </div>
          <div style={styles.cardBody}>
            <button style={styles.secondaryButton} onClick={() => setChangePassword(true)}>🔑 Change Password</button>
          </div>
        </div>

        {changePassword && (
          <div style={styles.modal}>
            <h3>Change Password</h3>
            <input type="password" placeholder="Old Password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} style={styles.input} />
            <input type="password" placeholder="New Password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} style={styles.input} />
            <input type="password" placeholder="Confirm Password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} style={styles.input} />
            <div style={styles.modalButtons}>
              <button style={styles.button} onClick={handleChangePassword}>Save</button>
              <button style={styles.buttonSecondary} onClick={() => setChangePassword(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem',
    minHeight: '80vh'
  },
  header: {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #e5e7eb'
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 0.5rem 0'
  },
  headerSubtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    margin: '0'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0'
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ffcc00',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6'
  },
  infoRowLast: {
    borderBottom: 'none'
  },
  label: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  value: {
    fontSize: '0.875rem',
    color: '#1f2937',
    fontWeight: '500',
    textAlign: 'right'
  },
  roleBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  switchContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  switchRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  switchLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    display: 'block',
    marginBottom: '0.25rem'
  },
  switchDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0'
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '26px'
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0
  },
  switchSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: '0.3s',
    borderRadius: '26px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 3px'
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '1rem',
    transition: 'all 0.2s',
    width: '100%'
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    width: '100%'
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    zIndex: 1000,
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem'
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffcc00',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  buttonSecondary: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    fontSize: '1.125rem',
    color: '#6b7280'
  },
  loader: {
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #ffcc00',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  errorText: {
    textAlign: 'center',
    fontSize: '1.125rem',
    color: '#dc2626',
    padding: '2rem'
  }
};

export default Profile;

// Add CSS for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
