import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ZoneCard from '../../components/ZoneCard';
import CampusMap from '../../components/CampusMap';
import BookingPanel from '../../components/BookingPanel';
import { getZones, getRecommendation, getMyVehicle, selfCheckout } from '../../services/api';

export default function StudentDashboard() {
  const [zones,       setZones]       = useState([]);
  const [recommendation, setRec]      = useState(null);
  const [activeVehicle, setVehicle]   = useState(null);
  const [dismissed, setDismissed]     = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState('');
  const [synced,     setSynced]       = useState(null);

  const fetchData = async () => {
    try {
      const [z, r, v] = await Promise.all([getZones(), getRecommendation(), getMyVehicle()]);
      setZones(z); setRec(r); setVehicle(v);
      setSynced(new Date()); setError('');
    } catch (e) { setError('Failed to load parking data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const iv = setInterval(fetchData, 5000); return () => clearInterval(iv); }, []);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try { await selfCheckout(); setVehicle(null); await fetchData(); setDismissed(false); }
    catch (e) { setError(e.message || 'Checkout failed.'); }
    finally { setCheckingOut(false); }
  };

  const bestZone  = recommendation?.all_zones?.find(z => z.zone_name === recommendation?.best_zone);
  const recStatus  = bestZone?.status || 'GREEN';
  const recColor   = recStatus === 'RED' ? '#F85149' : recStatus === 'YELLOW' ? '#D29922' : '#3FB950';

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="main-content animate-slide-up">

        {/* ── Page Header */}
        <div className="page-header">
          <div>
            <div className="page-header__eyebrow">Campus Parking</div>
            <h1 className="page-header__title gradient-text">Your Parking Dashboard</h1>
            <p className="page-header__sub">
              AI-powered availability · Real-time sync · Smart pre-booking
            </p>
          </div>
          {synced && (
            <div style={s.syncBadge}>
              <span className="live-dot" />
              Live — {synced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}
        </div>

        {/* ── Error */}
        {error && <div className="alert alert--error mb-4">{error}</div>}

        {/* ── Active Session Alert */}
        {activeVehicle && activeVehicle.duration_minutes >= 5 && !dismissed && (
          <div style={s.sessionAlert} className="animate-slide-up">
            <div style={s.sessionAlertIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D29922" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={s.sessionAlertTitle}>Active Parking Session</div>
              <div style={s.sessionAlertSub}>
                <span className="mono" style={{ color: '#F0F6FC' }}>{activeVehicle.reg_number}</span>
                {' '}in <strong>{activeVehicle.zone_name}</strong> · {Math.floor(activeVehicle.duration_minutes)} min elapsed
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexShrink: 0 }}>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
                onClick={() => setDismissed(true)}>Still here</button>
              <button onClick={handleCheckout} disabled={checkingOut}
                style={{ ...s.vacateBtn, opacity: checkingOut ? 0.6 : 1 }}>
                {checkingOut ? '...' : 'Vacate spot'}
              </button>
            </div>
          </div>
        )}

        {/* ── AI Recommendation */}
        {recommendation?.best_zone && !loading && (
          <div style={{ ...s.recCard, borderColor: `${recColor}30` }} className="animate-slide-up">
            <div style={{ ...s.recAccent, background: recColor }} />
            <div style={{ ...s.recIconBox, background: `${recColor}18`, border: `1px solid ${recColor}30` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={recColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <div style={s.recLabel}>AI Recommendation</div>
              <div style={s.recZone}>
                Best zone: <span style={{ color: recColor, fontWeight: '800' }}>{recommendation.best_zone}</span>
              </div>
              <div style={s.recMsg}>{recommendation.message} · <strong style={{ color: '#F0F6FC' }}>{recommendation.free_space} spots</strong> available</div>
            </div>
          </div>
        )}

        {loading && zones.length === 0 ? (
          <div style={{ padding: '6rem', textAlign: 'center', color: '#484F58' }}>
            <div className="animate-pulse" style={{ fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace' }}>Fetching live data...</div>
          </div>
        ) : (
          <>
            {/* Map */}
            <section style={{ marginBottom: '2rem' }}>
              <CampusMap zones={zones} />
            </section>

            {/* Booking */}
            <section style={{ marginBottom: '2rem' }}>
              <BookingPanel zones={zones} onBooked={fetchData} />
            </section>

            {/* Zone grid */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F0F6FC', margin: 0, letterSpacing: '-0.02em' }}>
                  All Zones
                  <span style={{ marginLeft: '0.625rem', fontSize: '0.75rem', fontWeight: '600', letterSpacing: '0.06em', color: '#484F58', textTransform: 'uppercase' }}>{zones.length} zones</span>
                </h2>
              </div>
              <div style={s.grid}>
                {zones.map(z => <ZoneCard key={z.id} zone={z} />)}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

const s = {
  syncBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.45rem 0.875rem', borderRadius: '9999px',
    background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)',
    fontSize: '0.75rem', fontWeight: '600', color: '#3FB950',
    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em',
    alignSelf: 'flex-end',
  },
  sessionAlert: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '1.25rem 1.5rem',
    background: 'rgba(210,153,34,0.08)',
    border: '1px solid rgba(210,153,34,0.2)',
    borderRadius: '14px', marginBottom: '1.5rem',
    flexWrap: 'wrap',
    boxShadow: '0 4px 20px rgba(210,153,34,0.08)',
  },
  sessionAlertIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(210,153,34,0.12)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sessionAlertTitle: { fontSize: '0.875rem', fontWeight: '700', color: '#D29922', marginBottom: '0.2rem' },
  sessionAlertSub: { fontSize: '0.85rem', color: '#8B949E' },
  vacateBtn: {
    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
    background: 'rgba(248,81,73,0.15)', color: '#F85149',
    fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease',
    borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(248,81,73,0.3)',
  },
  recCard: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    position: 'relative', overflow: 'hidden',
    background: 'rgba(13,17,23,0.7)',
    backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
    border: '1px solid', borderRadius: '14px',
    padding: '1.25rem 1.5rem', marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  recAccent: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', borderRadius: '14px 0 0 14px',
  },
  recIconBox: {
    width: '44px', height: '44px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  recLabel: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#484F58', marginBottom: '0.2rem' },
  recZone: { fontSize: '1.05rem', fontWeight: '700', color: '#F0F6FC', marginBottom: '0.2rem', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' },
  recMsg: { fontSize: '0.85rem', color: '#8B949E' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' },
};
