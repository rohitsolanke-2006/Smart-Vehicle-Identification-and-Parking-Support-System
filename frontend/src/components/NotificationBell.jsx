import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getQueueStatus } from '../services/api';

/**
 * NotificationBell — polls the queue status API every 10 seconds.
 * If status === NOTIFIED, fires a toast and shows a badge on the bell icon.
 */
export default function NotificationBell() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);     // null | QueueStatusResponse
  const [toast, setToast] = useState(null);       // message string
  const [badgeCount, setBadgeCount] = useState(0);
  const notifiedZone = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    const poll = async () => {
      try {
        const data = await getQueueStatus();
        setStatus(data);

        if (data.status === 'NOTIFIED' && notifiedZone.current !== data.zone_name) {
          notifiedZone.current = data.zone_name;
          setToast(`🎉 A spot opened in ${data.zone_name}! Head there now.`);
          setBadgeCount(c => c + 1);
          setTimeout(() => setToast(null), 7000);
        }

        if (!data.in_queue) {
          notifiedZone.current = null;
          setBadgeCount(0);
        }
      } catch {
        // Silent fail — queue endpoint is optional
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user || user.role !== 'student') return null;

  return (
    <>
      {/* Bell icon */}
      <div style={styles.wrapper} title={status?.message || 'No active queue'}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {badgeCount > 0 && (
          <span style={styles.badge}>{badgeCount}</span>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={styles.toast}>
          <span>{toast}</span>
          <button onClick={() => setToast(null)} style={styles.toastClose}>✕</button>
        </div>
      )}
    </>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    borderRadius: '50%',
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#1e293b',
    color: '#fff',
    padding: '14px 20px',
    borderRadius: '10px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '360px',
    animation: 'slideInUp 0.3s ease',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    marginLeft: 'auto',
    flexShrink: 0,
  },
};
