import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBooking, getMyBooking, cancelMyBooking } from '../services/api';

export default function BookingPanel({ zones, onBooked }) {
  const { user } = useAuth();
  const [myBooking,  setMyBooking]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [actionZone, setActionZone] = useState(null);
  const [msg,        setMsg]        = useState(null); // { text, type }

  useEffect(() => {
    if (!user || user.role !== 'student') { setLoading(false); return; }
    getMyBooking().then(b => setMyBooking(b)).catch(() => setMyBooking(null)).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'student' || loading) return;
    getMyBooking().then(b => setMyBooking(b)).catch(() => {});
  }, [zones]); // eslint-disable-line

  if (!user || user.role !== 'student' || loading) return null;

  const flash = (text, type) => { setMsg({ text, type }); setTimeout(() => setMsg(null), 5000); };

  const handleBook = async (zone) => {
    setActionZone(zone.zone_name);
    try {
      const booking = await createBooking(zone.zone_name, user.vehicle_reg);
      setMyBooking(booking);
      flash(`Spot reserved in ${zone.zone_name}. You have 2 hours to arrive.`, 'success');
      onBooked?.();
    } catch (e) { flash(e.message || 'Booking failed.', 'error'); }
    finally { setActionZone(null); }
  };

  const handleCancel = async () => {
    setActionZone('cancel');
    try {
      await cancelMyBooking(); setMyBooking(null);
      flash('Reservation cancelled — spot released.', 'info');
      onBooked?.();
    } catch (e) { flash(e.message || 'Cancellation failed.', 'error'); }
    finally { setActionZone(null); }
  };

  const expiresIn = myBooking
    ? Math.max(0, Math.round((new Date(myBooking.expires_at + 'Z') - new Date()) / 60000))
    : 0;

  const expirePct = myBooking ? Math.min(100, Math.round((1 - expiresIn / 120) * 100)) : 0;

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <div>
          <div style={s.eyebrow}>Pre-Booking</div>
          <h2 style={s.title}>Reserve a Parking Spot</h2>
          <p style={s.sub}>Secures a spot for <strong style={{ color: '#F0F6FC' }}>2 hours</strong>. Guard sees your booking instantly.</p>
        </div>
        {myBooking && (
          <div style={s.activePill}>
            <span className="live-dot" />
            Reserved · {expiresIn}m left
          </div>
        )}
      </div>

      {/* Alert */}
      {msg && (
        <div className={`alert alert--${msg.type}`} style={{ marginBottom: '1.5rem' }}>
          {msg.text}
        </div>
      )}

      {/* Active booking view */}
      {myBooking && (
        <div style={s.bookingCard}>
          {/* Timer bar */}
          <div style={s.timerTrack}>
            <div style={{ ...s.timerFill, width: `${expirePct}%`, background: expiresIn < 20 ? '#F85149' : '#2F81F7' }} />
          </div>

          <div style={s.bookingBody}>
            <div style={s.bookingGrid}>
              <BookDetail label="Zone"       value={myBooking.zone_name} />
              <BookDetail label="Expires In" value={`${expiresIn} min`} valueColor={expiresIn < 20 ? '#F85149' : undefined} />
              <BookDetail label="Vehicle"    value={myBooking.vehicle_reg || 'Guest'} mono />
              <BookDetail label="Status"     value="Guard Notified" valueColor="#3FB950" />
            </div>

            <button onClick={handleCancel} disabled={actionZone === 'cancel'} style={s.cancelBtn}>
              {actionZone === 'cancel' ? 'Releasing...' : 'Cancel Reservation'}
            </button>
          </div>
        </div>
      )}

      {/* Zone picker grid */}
      {!myBooking && (
        <div style={s.zoneGrid}>
          {zones.map(zone => {
            const pct  = zone.occupancy_percent ?? Math.round(((zone.occupied ?? 0) / zone.capacity) * 100);
            const free = zone.free_space ?? (zone.capacity - (zone.occupied ?? 0));
            const full = free <= 0;
            const color = pct >= 90 ? '#F85149' : pct >= 60 ? '#D29922' : '#3FB950';
            const colorDim = pct >= 90 ? 'rgba(248,81,73,0.1)' : pct >= 60 ? 'rgba(210,153,34,0.1)' : 'rgba(63,185,80,0.1)';
            const colorBorder = pct >= 90 ? 'rgba(248,81,73,0.2)' : pct >= 60 ? 'rgba(210,153,34,0.2)' : 'rgba(63,185,80,0.2)';
            const isBusy = actionZone === zone.zone_name;

            return (
              <div key={zone.id} style={{ ...s.zoneCard, borderColor: colorBorder }}>
                {/* Header */}
                <div style={s.zoneHeader}>
                  <span style={s.zoneCardName}>{zone.zone_name || zone.name}</span>
                  <span style={{ ...s.zoneStatus, color, background: colorDim, border: `1px solid ${colorBorder}` }}>
                    {full ? 'FULL' : 'OPEN'}
                  </span>
                </div>

                {/* Seat dots */}
                <SeatMap total={zone.capacity} occupied={zone.occupied ?? 0} color={color} />

                {/* Footer */}
                <div style={s.zoneFooter}>
                  <span style={{ fontSize: '0.8rem', color: '#8B949E' }}>
                    <span style={{ color, fontSize: '1.1rem', fontWeight: '800', fontFamily: 'Inter, sans-serif' }}>{free}</span>
                    /{zone.capacity} free
                  </span>
                  <button
                    disabled={full || isBusy}
                    onClick={() => handleBook(zone)}
                    style={full ? s.bookBtnDisabled : s.bookBtn}>
                                {isBusy ? 'Booking...' : full ? 'Full' : 'Book'}
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

function SeatMap({ total, occupied, color }) {
  const cap = Math.min(total, 36);
  const scale = total > 36 ? total / 36 : 1;
  const occ = Math.round(occupied / scale);
  return (
    <div style={sm.grid}>
      {Array.from({ length: cap }).map((_, i) => (
        <div key={i} style={{
          ...sm.dot,
          background: i < occ ? color : 'rgba(255,255,255,0.05)',
          boxShadow: i < occ ? `0 0 6px ${color}60` : 'none',
          border: i < occ ? 'none' : '1px solid rgba(255,255,255,0.07)',
        }} />
      ))}
      {total > 36 && <span style={sm.more}>+{total - 36}</span>}
    </div>
  );
}

const sm = {
  grid: { display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  dot: { width: '14px', height: '14px', borderRadius: '4px', transition: 'all 0.3s ease' },
  more: { fontSize: '0.7rem', color: '#484F58', alignSelf: 'center', marginLeft: '4px', fontFamily: 'JetBrains Mono, monospace' },
};

function BookDetail({ icon, label, value, valueColor, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#484F58' }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: '700', color: valueColor || '#F0F6FC', fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif', letterSpacing: mono ? '0.04em' : '-0.01em' }}>{value}</div>
    </div>
  );
}

const s = {
  wrapper: {
    background: 'rgba(13,17,23,0.7)',
    backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexWrap: 'wrap', gap: '1rem',
    padding: '1.5rem 1.5rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  eyebrow: { fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2F81F7', marginBottom: '0.375rem' },
  title: { fontSize: '1.15rem', fontWeight: '700', color: '#F0F6FC', letterSpacing: '-0.025em', marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif' },
  sub: { fontSize: '0.85rem', color: '#8B949E', margin: 0 },
  activePill: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.4rem 0.875rem', borderRadius: '9999px',
    background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)',
    fontSize: '0.78rem', fontWeight: '700', color: '#3FB950',
    fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start',
  },
  bookingCard: { overflow: 'hidden' },
  timerTrack: { height: '3px', background: 'rgba(255,255,255,0.06)' },
  timerFill: { height: '100%', transition: 'width 1s linear, background 0.5s ease' },
  bookingBody: { padding: '1.5rem' },
  bookingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  cancelBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.625rem 1.25rem', borderRadius: '8px',
    background: 'rgba(248,81,73,0.07)', color: '#F85149',
    border: '1px solid rgba(248,81,73,0.2)',
    fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease',
  },
  zoneGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' },
  zoneCard: {
    background: 'rgba(8,12,18,0.8)',
    border: '1px solid transparent',
    overflow: 'hidden',
    transition: 'background 0.2s ease',
  },
  zoneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1rem 0.75rem' },
  zoneCardName: { fontSize: '0.95rem', fontWeight: '700', color: '#F0F6FC', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' },
  zoneStatus: { fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', borderRadius: '9999px' },
  zoneFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem' },
  bookBtn: {
    padding: '0.45rem 1rem', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #2F81F7, #7C3AED)',
    color: '#fff', fontSize: '0.8rem', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 12px rgba(47,129,247,0.25)',
    transition: 'all 0.15s ease',
  },
  bookBtnDisabled: {
    padding: '0.45rem 1rem', borderRadius: '8px',
    background: 'rgba(255,255,255,0.04)', color: '#484F58',
    border: '1px solid rgba(255,255,255,0.06)',
    fontSize: '0.8rem', fontWeight: '600', cursor: 'not-allowed',
    fontFamily: 'Inter, sans-serif',
  },
};
