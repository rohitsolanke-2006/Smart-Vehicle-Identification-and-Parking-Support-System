import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const ROLE_CONFIG = {
  student: { color: '#3FB950', label: 'Student',  bg: 'rgba(63,185,80,0.12)',  border: 'rgba(63,185,80,0.25)' },
  guard:   { color: '#D29922', label: 'Guard',    bg: 'rgba(210,153,34,0.12)', border: 'rgba(210,153,34,0.25)' },
  manager: { color: '#2F81F7', label: 'Manager',  bg: 'rgba(47,129,247,0.12)', border: 'rgba(47,129,247,0.25)' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;

  return (
    <nav style={s.nav} className="animate-slide-up">
      {/* Logo */}
      <div style={s.logo}>
        <div style={s.logoMark}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"/>
            <circle cx="7" cy="15" r="2"/>
            <circle cx="17" cy="15" r="2"/>
            <path d="M15 11V7a4 4 0 0 0-8 0v4"/>
          </svg>
        </div>
        <span style={s.logoText}>SmartCampus</span>
      </div>

      {/* Right side */}
      {user && (
        <div style={s.right}>
          {user.role === 'manager' && (
            <a href="/manager/analytics" style={s.navLink}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Analytics
            </a>
          )}

          <NotificationBell />

          <div style={s.userChip}>
            {/* Avatar */}
            <div style={s.avatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={s.userMeta}>
              <span style={s.userName}>{user.name?.split(' ')[0]}</span>
              <span style={{ ...s.rolePill, color: role.color, background: role.bg, border: `1px solid ${role.border}` }}>
                {role.label}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} style={s.logoutBtn} title="Sign out">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.625rem 0.875rem 0.625rem 1.125rem',
    margin: '1.25rem auto 2rem',
    maxWidth: '1200px',
    width: 'calc(100% - 3rem)',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.08)',
    position: 'sticky',
    top: '1.25rem',
    zIndex: 200,
    background: 'rgba(8, 12, 18, 0.75)',
    backdropFilter: 'blur(40px) saturate(160%)',
    WebkitBackdropFilter: 'blur(40px) saturate(160%)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  logoMark: {
    width: '30px', height: '30px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #2F81F7 0%, #7C3AED 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 0 1px rgba(47,129,247,0.3), 0 4px 12px rgba(47,129,247,0.3)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '0.95rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    color: '#F0F6FC',
    letterSpacing: '-0.02em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    color: 'rgba(240,246,252,0.75)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
    padding: '0.45rem 1rem',
    borderRadius: '9999px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.15s ease',
    fontFamily: 'Inter, sans-serif',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.375rem 0.875rem 0.375rem 0.375rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '9999px',
  },
  avatar: {
    width: '28px', height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2F81F7, #7C3AED)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 0 0 2px rgba(255,255,255,0.1)',
  },
  userMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#F0F6FC',
    fontFamily: 'Inter, sans-serif',
  },
  rolePill: {
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px', height: '34px',
    borderRadius: '50%',
    background: 'rgba(248,81,73,0.08)',
    border: '1px solid rgba(248,81,73,0.18)',
    color: '#F85149',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
};
