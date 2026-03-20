import React, { useState } from 'react';
import { joinQueue, leaveQueue, getQueueStatus } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ZoneCard({ zone }) {
  const { user } = useAuth();
  const [queued, setQueued]     = useState(false);
  const [queueMsg, setQueueMsg] = useState('');
  const [queueLoading, setQueueLoading] = useState(false);

  const pct = zone.occupancy_percent ?? Math.round(((zone.occupied ?? 0) / zone.capacity) * 100);
  const isFull = pct >= 90 || zone.status === 'RED';
  const freeSpots = zone.free_space !== undefined ? zone.free_space : (zone.capacity - (zone.occupied ?? 0));

  let statusColor = 'var(--status-green)';
  let statusBg = 'var(--status-green-light)';
  if (zone.status === 'RED'    || pct >= 90) { statusColor = 'var(--status-red)'; statusBg = 'var(--status-red-light)'; }
  else if (zone.status === 'YELLOW' || pct >= 60) { statusColor = 'var(--status-yellow)'; statusBg = 'var(--status-yellow-light)'; }

  const statusLabel = zone.status === 'RED' ? 'FULL' : zone.status === 'YELLOW' ? 'BUSY' : 'OPEN';

  const handleQueue = async () => {
    if (!user || user.role !== 'student') return;
    setQueueLoading(true);
    setQueueMsg('');
    try {
      if (queued) {
        await leaveQueue(zone.zone_name || zone.name);
        setQueued(false);
        setQueueMsg('Removed from waitlist.');
      } else {
        await joinQueue(zone.zone_name || zone.name);
        setQueued(true);
        setQueueMsg('You\'re on the waitlist — we\'ll notify you when a spot opens!');
      }
    } catch (err) {
      setQueueMsg(err.message || 'Failed to update queue.');
    } finally {
      setQueueLoading(false);
    }
  };

  return (
    <div style={{ ...styles.card, borderColor: statusColor, '--status-color': statusColor }}>
      {/* Status indicator bar */}
      <div style={{ ...styles.statusBar, background: statusBg }} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h3 style={styles.zoneName}>{zone.zone_name || zone.name}</h3>
          <span style={styles.zoneType}>{zone.capacity} spots</span>
        </div>
        <span style={{ ...styles.badge, background: statusColor, boxShadow: `0 2px 8px ${statusColor}40` }}>
          {statusLabel}
        </span>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Available</span>
          <span style={{ ...styles.statVal, color: statusColor }}>{freeSpots}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Occupied</span>
          <span style={styles.statVal}>{zone.occupied ?? 0}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.barContainer}>
        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${pct}%`, background: statusColor }} />
        </div>
        <span style={styles.pctLabel}>{pct}% full</span>
      </div>

      {/* Virtual Queue — only for students when zone is full */}
      {user?.role === 'student' && isFull && (
        <div style={styles.queueBox}>
          <button
            onClick={handleQueue}
            disabled={queueLoading}
            style={{
              ...styles.queueBtn,
              background: queued ? 'var(--status-red-light)' : 'var(--primary)',
              color: queued ? 'var(--status-red)' : '#ffffff',
              border: queued ? '1.5px solid var(--status-red)' : '1.5px solid transparent',
            }}>
            {queueLoading ? (
              <span style={styles.loadingDots}>Processing…</span>
            ) : queued ? (
              <>Leave Waitlist</>
            ) : (
              <>Notify Me When Open</>
            )}
          </button>
          {queueMsg && (
            <p style={{
              ...styles.queueMsg,
              color: queued ? 'var(--status-green)' : 'var(--text-muted)'
            }}>{queueMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
    padding: '0 0 1.25rem 0',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    position: 'relative',
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    transition: 'all var(--transition-normal)',
    boxShadow: 'var(--shadow-sm)',
  },
  statusBar: {
    height: '4px',
    width: '100%',
    boxShadow: '0 2px 8px var(--status-color)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.25rem 1.25rem 0',
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  zoneName: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  zoneType: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  badge: {
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    padding: '0 1.25rem',
    marginTop: '0.5rem',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: '600',
  },
  statVal: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  barContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1.25rem',
    marginTop: '0.5rem',
  },
  barBg: {
    flex: 1,
    height: '6px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.5s ease',
  },
  pctLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  queueBox: {
    marginTop: '0.5rem',
    padding: '1.25rem',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(0,0,0,0.2)',
  },
  queueBtn: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  loadingDots: {
    opacity: '0.8',
  },
  queueMsg: {
    margin: '0.75rem 0 0',
    fontSize: '0.85rem',
    textAlign: 'center',
    fontWeight: '500',
  },
};
