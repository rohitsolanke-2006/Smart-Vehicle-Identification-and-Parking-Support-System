import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.navbar} className="glass-card">
      <div style={styles.logo}>
        <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Smart</span>Campus Parking
      </div>
      
      {user && (
        <div style={styles.userInfo}>
          <span style={styles.greeting}>Welcome, {user.name}</span>
          <span style={styles.roleBadge}>{user.role.toUpperCase()}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderRadius: '0 0 12px 12px',
    borderTop: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    marginBottom: '2rem'
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  greeting: {
    color: 'var(--text-main)',
    fontWeight: '500'
  },
  roleBadge: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid var(--border-color)',
    color: 'var(--text-muted)',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};
