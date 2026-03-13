import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

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
        <span style={styles.logoText}>
          <span style={styles.logoSmart}>Smart</span>
          <span style={styles.logoCampus}>Campus</span>
        </span>
      </div>

      {user && (
        <div style={styles.userInfo}>
          {user.role === 'manager' && (
            <a href="/manager/analytics" style={styles.navLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
              </svg>
              Analytics
            </a>
          )}
          <NotificationBell />
          <div style={styles.userSection}>
            <span style={styles.greeting}>Welcome, <strong>{user.name}</strong></span>
            <span style={styles.roleBadge}>{user.role.toUpperCase()}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
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
    padding: '0.75rem 1.5rem',
    margin: '1.5rem auto 2rem',
    maxWidth: '1200px',
    borderRadius: '100px',
    border: '1px solid var(--border-color)',
    position: 'sticky',
    top: '1.5rem',
    zIndex: 100,
    background: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontFamily: 'Space Grotesk, sans-serif',
    letterSpacing: '-0.02em',
  },
  logoSmart: {
    fontWeight: '800', 
    color: '#60a5fa',
  },
  logoCampus: {
    color: '#f8fafc', 
    fontWeight: '700',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.25rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '100px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  greeting: {
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    fontWeight: '400',
    fontFamily: 'Outfit, sans-serif',
  },
  roleBadge: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    color: '#f87171',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontWeight: '500',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    fontFamily: 'Outfit, sans-serif',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-main)',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '0.85rem',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'all var(--transition-fast)',
    fontFamily: 'Outfit, sans-serif',
  },
};
