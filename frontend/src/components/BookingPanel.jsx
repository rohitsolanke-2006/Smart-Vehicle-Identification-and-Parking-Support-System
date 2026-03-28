import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBooking, getMyBooking, cancelMyBooking } from '../services/api';

/**
 * BookingPanel — theatre-style spot grid for students.
 * Shows free / booked / occupied slots. Student can book one slot per zone.
 */
export default function BookingPanel({ zones, onBooked }) {
  const { user } = useAuth();
  const [myBooking,  setMyBooking]  = useState(null);
  const [loading,    setLoading]    = useState(true);   // only true on first mount
  const [actionZone, setActionZone] = useState(null);
  const [message,    setMessage]    = useState({ text: '', type: '' });

  // Initial load
  useEffect(() => {
    if (!user || user.role !== 'student') { setLoading(false); return; }
    getMyBooking()
      .then(b  => setMyBooking(b))
      .catch(() => setMyBooking(null))
      .finally(() => setLoading(false));
  }, [user]);

  // Silent re-sync whenever parent refreshes zones (every 5 s)
  useEffect(() => {
    if (!user || user.role !== 'student' || loading) return;
    getMyBooking()
      .then(b  => setMyBooking(b))
      .catch(() => {});
  }, [zones]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user || user.role !== 'student') return null;

  const msg = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleBook = async (zone) => {
    setActionZone(zone.zone_name);
    try {
      const booking = await createBooking(zone.zone_name, user.vehicle_reg);
      setMyBooking(booking);
      msg(`Spot booked in ${zone.zone_name}! You have 2 hours to arrive.`, 'success');
      onBooked?.();   // trigger parent zones refresh
    } catch (err) {
      msg(err.message || 'Booking failed.');
    } finally { setActionZone(null); }
  };

  const handleCancel = async () => {
    setActionZone('cancel');
    try {
      await cancelMyBooking();
      setMyBooking(null);
      msg('Booking cancelled — spot released.', 'info');
      onBooked?.();
    } catch (err) {
      msg(err.message || 'Cancellation failed.');
    } finally { setActionZone(null); }
  };

  if (loading) return null;

  const expiresIn = myBooking
    ? Math.max(0, Math.round((new Date(myBooking.expires_at + 'Z') - new Date()) / 60000))
    : 0;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Pre-Book a Spot</h2>
          <p style={styles.subtitle}>
            Reserve a spot now — holds for <strong>2 hours</strong>. Guard sees your booking instantly.
          </p>
        </div>
        {myBooking && (
          <div style={styles.activePill}>
            <span style={styles.pulseDot} />
            Booked · {expiresIn}m left
          </div>
        )}
      </div>

      {/* Alert */}
      {message.text && (
        <div style={{
          ...styles.alert,
          background: message.type === 'success' ? 'var(--status-green-light)' : message.type === 'info' ? 'var(--accent-light)' : 'var(--status-red-light)',
          color: message.type === 'success' ? '#166534' : message.type === 'info' ? '#1e40af' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#86efac' : message.type === 'info' ? '#93c5fd' : '#fca5a5'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Active booking card */}
      {myBooking && (
        <div style={styles.bookingCard}>
          <div style={styles.bookingHeader}>
            <span style={styles.bookingLabel}>Active Reservation</span>
          </div>
          <div style={styles.bookingDetails}>
            <BookDetail label="Zone" value={myBooking.zone_name} />
            <BookDetail label="Expires" value={`in ${expiresIn} minutes`} />
            <BookDetail label="Plate/Vehicle" value={myBooking.vehicle_reg || '—'} />
            <BookDetail label="Status" value="PENDING · Guard notified" />
          </div>
          <button onClick={handleCancel} disabled={actionZone === 'cancel'} style={styles.cancelBtn}>
            {actionZone === 'cancel' ? 'Processing…' : '✕ Cancel Booking'}
          </button>
        </div>
      )}

      {/* Zone grid — shown only when no active booking exists */}
      {!myBooking && (
        <div style={styles.grid}>
          {zones.map(zone => {
            const pct   = zone.occupancy_percent ?? Math.round(((zone.occupied ?? 0) / zone.capacity) * 100);
            const free  = zone.free_space ?? (zone.capacity - (zone.occupied ?? 0));
            const isFull = free <= 0;
            const color  = pct >= 90 ? 'var(--status-red)' : pct >= 60 ? 'var(--status-yellow)' : 'var(--status-green)';
            const colorLight = pct >= 90 ? 'var(--status-red-light)' : pct >= 60 ? 'var(--status-yellow-light)' : 'var(--status-green-light)';

            return (
              <div key={zone.id} style={{ ...styles.zoneCard, borderColor: color, background: colorLight }}>
                {/* Header */}
                <div style={styles.zoneHeader}>
                  <span style={styles.zoneName}>{zone.zone_name || zone.name}</span>
                  <span style={{ ...styles.pill, background: color, opacity: isFull ? 1 : 0.9 }}>
                    {isFull ? 'FULL' : 'OPEN'}
                  </span>
                </div>

                {/* Seat grid — visual representation */}
                <SeatGrid total={zone.capacity} occupied={zone.occupied ?? 0} color={color} />

                <div style={styles.zoneFooter}>
                  <span style={styles.zoneCount}>
                    <strong style={{ color }}>{free}</strong> / {zone.capacity} free
                  </span>
                  <button
                    onClick={() => handleBook(zone)}
                    disabled={isFull || actionZone === zone.zone_name}
                    style={{
                      ...styles.bookBtn,
                      background: isFull ? 'var(--border-light)' : 'var(--primary)',
                      color: isFull ? 'var(--text-muted)' : '#fff',
                      cursor: isFull ? 'not-allowed' : 'pointer',
                      opacity: actionZone === zone.zone_name ? 0.7 : 1,
                    }}>
                    {actionZone === zone.zone_name ? 'Booking…' : isFull ? 'Full' : 'Book Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Seat Grid — like a theatre ──────────────────────────── */
function SeatGrid({ total, occupied, color }) {
  // Cap display to max 40 seats for visual clarity
  const display = Math.min(total, 40);
  const scale   = total > 40 ? total / 40 : 1;
  const occDisp = Math.round(occupied / scale);

  return (
    <div style={styles.seatGrid}>
      {Array.from({ length: display }).map((_, i) => {
        const isOccupied = i < occDisp;
        return (
          <div key={i} title={isOccupied ? 'Occupied' : 'Free'} style={{
            ...styles.seat,
            background: isOccupied ? color : 'var(--border-light)',
            boxShadow: isOccupied ? `0 1px 3px ${color}40` : 'none',
          }} />
        );
      })}
      {total > 40 && (
        <span style={styles.seatOverflow}>+{total - 40}</span>
      )}
    </div>
  );
}

function BookDetail({ label, value }) {
  return (
    <div style={styles.detailItem}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    marginBottom: '2.5rem',
    boxShadow: 'var(--shadow-md)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  activePill: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(16, 185, 129, 0.05)',
    color: 'var(--status-green)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '4px',
    padding: '0.375rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    gap: '0.5rem',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--status-green)',
    animation: 'pulseGlow 2s ease-in-out infinite',
  },
  alert: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    fontWeight: '500',
  },
  bookingCard: {
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  },
  bookingHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid var(--border-light)',
  },
  bookingLabel: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  bookingDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  cancelBtn: {
    padding: '0.625rem 1.25rem',
    borderRadius: '4px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    background: 'rgba(239, 68, 68, 0.05)',
    color: '#f87171',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.5rem',
  },
  zoneCard: {
    border: '2px solid',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    transition: 'all var(--transition-fast)',
    cursor: 'default',
    background: 'transparent',
    backdropFilter: 'blur(10px)',
  },
  zoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  zoneName: {
    fontWeight: '700',
    fontSize: '1.05rem',
    color: 'var(--text-main)',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  pill: {
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  seatGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '1rem',
  },
  seat: {
    width: 14,
    height: 14,
    borderRadius: '4px',
    transition: 'all var(--transition-fast)',
  },
  seatOverflow: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    alignSelf: 'center',
    marginLeft: '0.25rem',
    fontWeight: '600',
  },
  zoneFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border-color)',
  },
  zoneCount: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  bookBtn: {
    padding: '0.625rem 1.25rem',
    borderRadius: '100px',
    border: 'none',
    fontWeight: '600',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontWeight: '700',
    fontSize: '1rem',
    color: 'var(--text-main)',
  },
};
