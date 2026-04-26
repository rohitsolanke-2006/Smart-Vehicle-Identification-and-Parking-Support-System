import React, { useState } from 'react';
import { joinQueue, leaveQueue } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ZoneCard({ zone }) {
  const { user } = useAuth();
  const [queued, setQueued]         = useState(false);
  const [queueMsg, setQueueMsg]     = useState('');
  const [queueLoading, setQueueLoading] = useState(false);

  const occupied = zone.occupied ?? 0;
  const pct = zone.occupancy_percent ?? Math.round((occupied / zone.capacity) * 100);
  const free = zone.free_space !== undefined ? zone.free_space : (zone.capacity - occupied);
  const isFull = pct >= 90 || zone.status === 'RED';

  // Precise status system
  let statusColor, statusLabel, statusBg, statusBorder, statusGlow;
  if (pct >= 90 || zone.status === 'RED') {
    statusColor  = '#F85149'; statusLabel = 'FULL';
    statusBg     = 'rgba(248,81,73,0.1)';
    statusBorder = 'rgba(248,81,73,0.25)';
    statusGlow   = 'rgba(248,81,73,0.15)';
  } else if (pct >= 60 || zone.status === 'YELLOW') {
    statusColor  = '#D29922'; statusLabel = 'BUSY';
    statusBg     = 'rgba(210,153,34,0.1)';
    statusBorder = 'rgba(210,153,34,0.25)';
    statusGlow   = 'rgba(210,153,34,0.12)';
  } else {
    statusColor  = '#3FB950'; statusLabel = 'OPEN';
    statusBg     = 'rgba(63,185,80,0.1)';
    statusBorder = 'rgba(63,185,80,0.25)';
    statusGlow   = 'rgba(63,185,80,0.12)';
  }

  const handleQueue = async () => {
    if (!user || user.role !== 'student') return;
    setQueueLoading(true); setQueueMsg('');
    try {
      if (queued) {
        await leaveQueue(zone.zone_name || zone.name);
        setQueued(false);
        setQueueMsg('Removed from waitlist.');
      } else {
        await joinQueue(zone.zone_name || zone.name);
        setQueued(true);
        setQueueMsg("You're on the waitlist!");
      }
    } catch (err) {
      setQueueMsg(err.message || 'Failed.');
    } finally { setQueueLoading(false); }
  };

  return (
    <div style={{ ...card, borderColor: statusBorder }}>
      {/* Top accent line */}
      <div style={{ ...topLine, background: statusColor, boxShadow: `0 0 12px ${statusColor}` }} />

      {/* Header */}
      <div style={header}>
        <div>
          <div style={zoneName}>{zone.zone_name || zone.name}</div>
          <div style={zoneCapacity}>{zone.capacity} spots total</div>
        </div>
        <div style={{ ...pill, color: statusColor, background: statusBg, border: `1px solid ${statusBorder}` }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block', boxShadow: `0 0 6px ${statusColor}` }} />
          {statusLabel}
        </div>
      </div>

      {/* Big numbers */}
      <div style={statsRow}>
        <div style={stat}>
          <div style={{ ...statNum, color: statusColor }}>{free}</div>
          <div style={statLabel}>Free</div>
        </div>
        <div style={statDivider} />
        <div style={stat}>
          <div style={statNum}>{occupied}</div>
          <div style={statLabel}>Occupied</div>
        </div>
        <div style={statDivider} />
        <div style={stat}>
          <div style={statNum}>{zone.capacity}</div>
          <div style={statLabel}>Total</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={barSection}>
        <div style={barTrack}>
          <div style={{ ...barFill, width: `${pct}%`, background: statusColor, boxShadow: `0 0 10px ${statusColor}80` }} />
        </div>
        <span style={barLabel}>{pct}%</span>
      </div>

      {/* Queue section */}
      {user?.role === 'student' && isFull && (
        <div style={queueSection}>
          <button onClick={handleQueue} disabled={queueLoading} style={queued ? queueBtnLeave : queueBtnJoin}>
            {queueLoading ? '...' : queued ? 'Leave Waitlist' : 'Notify When Open'}
          </button>
          {queueMsg && <p style={{ marginTop: '0.625rem', fontSize: '0.8rem', color: queued ? '#3FB950' : '#8B949E', textAlign: 'center' }}>{queueMsg}</p>}
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */
const card = {
  position: 'relative',
  background: 'rgba(13,17,23,0.7)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border: '1px solid',
  borderRadius: '16px',
  overflow: 'hidden',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
};
const topLine = { height: '2px', width: '100%', transition: 'box-shadow 0.3s ease' };
const header = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  padding: '1.25rem 1.25rem 0',
};
const zoneName = {
  fontSize: '1.05rem', fontWeight: '700', color: '#F0F6FC',
  fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '0.2rem',
};
const zoneCapacity = {
  fontSize: '0.78rem', color: '#484F58', fontWeight: '500', fontFamily: 'Inter, sans-serif',
};
const pill = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
  padding: '0.25rem 0.625rem', borderRadius: '9999px',
  fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.08em',
  fontFamily: 'Inter, sans-serif',
};
const statsRow = {
  display: 'flex', alignItems: 'center',
  padding: '1.25rem',
  gap: 0,
};
const stat = { flex: 1, textAlign: 'center' };
const statNum = {
  fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em',
  lineHeight: '1', color: '#F0F6FC',
  fontFamily: 'Inter, sans-serif', marginBottom: '0.25rem',
};
const statLabel = {
  fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#484F58', fontFamily: 'Inter, sans-serif',
};
const statDivider = { width: '1px', height: '2.5rem', background: 'rgba(255,255,255,0.06)', margin: '0 0.5rem' };
const barSection = {
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  padding: '0 1.25rem 1.25rem',
};
const barTrack = {
  flex: 1, height: '4px', borderRadius: '9999px',
  background: 'rgba(255,255,255,0.06)',
  overflow: 'hidden',
};
const barFill = {
  height: '100%', borderRadius: '9999px',
  transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
};
const barLabel = { fontSize: '0.75rem', color: '#484F58', fontWeight: '600', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' };
const queueSection = {
  padding: '1rem 1.25rem',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  background: 'rgba(0,0,0,0.25)',
};
const queueBtnBase = {
  width: '100%', padding: '0.625rem 1rem', borderRadius: '8px',
  fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
  fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const queueBtnJoin = {
  ...queueBtnBase,
  background: 'linear-gradient(135deg, #2F81F7, #7C3AED)',
  color: '#fff', border: 'none',
  boxShadow: '0 4px 14px rgba(47,129,247,0.3)',
};
const queueBtnLeave = {
  ...queueBtnBase,
  background: 'rgba(248,81,73,0.08)',
  color: '#F85149',
  border: '1px solid rgba(248,81,73,0.25)',
};
