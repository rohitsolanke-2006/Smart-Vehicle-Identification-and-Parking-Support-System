import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ZoneCard from '../../components/ZoneCard';
import CampusMap from '../../components/CampusMap';
import BookingPanel from '../../components/BookingPanel';
import { getZones, getRecommendation, getMyVehicle, selfCheckout } from '../../services/api';

export default function StudentDashboard() {
  const [zones, setZones] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const [zonesData, recData, vehicleData] = await Promise.all([
        getZones(),
        getRecommendation(),
        getMyVehicle()
      ]);
      
      setZones(zonesData);
      setRecommendation(recData);
      setActiveVehicle(vehicleData);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load parking data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds — map colours update in near real-time
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelfCheckout = async () => {
    setCheckingOut(true);
    try {
      await selfCheckout();
      setActiveVehicle(null);
      await fetchData(); // refresh zones immediately
      setSessionDismissed(false);
    } catch (err) {
      setError(err.message || 'Failed to checkout.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      
      <main className="main-content" style={{ padding: '0 2rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <header className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Campus Parking Status</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem' }}>
              Real-time AI availability and intelligent zone routing.
            </p>
          </div>
          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--status-green)', paddingBottom: '0.5rem', fontFamily: 'Space Grotesk, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
              <span className="animate-pulse" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--status-green)', boxShadow: '0 0 6px var(--status-green)' }} />
              Live Sync · {Math.round((new Date() - lastUpdated) / 1000)}s ago
            </div>
          )}
        </header>

        {error && (
          <div className="glass-card" style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* Session Expiration Prompt */}
        {activeVehicle && activeVehicle.duration_minutes >= 5 && !sessionDismissed && (
          <div className="glass-card" style={{ borderColor: 'var(--status-yellow)', marginBottom: '2.5rem', background: 'rgba(245, 158, 11, 0.05)' }}>
            <h3 style={{ color: 'var(--status-yellow)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem' }}>
               Active Session Expiration
            </h3>
            <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: '500' }}>
              Your vehicle ({activeVehicle.reg_number}) has been parked in {activeVehicle.zone_name} for over {Math.floor(activeVehicle.duration_minutes)} minutes. Are you still on campus?
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setSessionDismissed(true)} 
                style={{ ...styles.btnBase, background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                Yes, still here
              </button>
              <button 
                onClick={handleSelfCheckout} 
                disabled={checkingOut}
                style={{ ...styles.btnBase, background: '#ef4444', color: '#fff', border: 'none' }}>
                {checkingOut ? 'Processing...' : 'No, I\'ve left (Vacate)'}
              </button>
            </div>
          </div>
        )}

        {/* AI Recommendation Banner */}
        {recommendation && recommendation.best_zone && !loading && (
          <div className="glass-card" style={styles.recommendationBanner(
            recommendation.all_zones?.find(z => z.zone_name === recommendation.best_zone)?.status || 'GREEN'
          )}>
            <div style={styles.recIcon}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                Smart Recommendation: <span style={{ color: getStatusColor(
                  recommendation.all_zones?.find(z => z.zone_name === recommendation.best_zone)?.status || 'GREEN'
                ) }}>{recommendation.best_zone}</span>
              </h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
                {recommendation.message} — We found {recommendation.free_space} spots available!
              </p>
            </div>
          </div>
        )}

        {loading && (!zones || zones.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>
            <h2>Loading live parking data...</h2>
          </div>
        ) : (
          <div>
            {/* Interactive Campus Map */}
            <CampusMap zones={zones} />

            {/* Spot Booking Panel */}
            <BookingPanel zones={zones} onBooked={fetchData} />

            {/* Zone Cards Grid */}
            <h2 style={{ marginTop: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              All Parking Zones
            </h2>
            <div style={styles.grid}>
              {zones.map(zone => (
                <ZoneCard key={zone.id} zone={zone} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper for banner styling
function getStatusColor(status) {
  if (status === 'RED') return 'var(--status-red)';
  if (status === 'YELLOW') return 'var(--status-yellow)';
  return 'var(--status-green)';
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '2rem'
  },
  recommendationBanner: (status) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2.5rem',
    transition: 'all var(--transition-normal)',
    position: 'relative',
    overflow: 'hidden',
  }),
  recIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '4px',
    color: '#60a5fa',
    flexShrink: 0,
  },
  btnBase: {
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all var(--transition-fast)',
  }
};
