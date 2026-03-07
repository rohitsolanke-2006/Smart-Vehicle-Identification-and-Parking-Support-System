import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import ZoneCard from '../../components/ZoneCard';
import { getZones, getRecommendation } from '../../services/api';

export default function StudentDashboard() {
  const [zones, setZones] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      // Fetch concurrently for speed
      const [zonesData, recData] = await Promise.all([
        getZones(),
        getRecommendation()
      ]);
      
      setZones(zonesData);
      setRecommendation(recData);
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
    
    // Auto refresh every 15 seconds for real-time vibe
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      
      <main className="main-content" style={{ padding: '0 2rem 2rem' }}>
        <header className="mb-4">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Campus Parking Status</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Real-time availability and smart recommendations for your vehicle.
          </p>
        </header>

        {error && (
          <div className="glass-card" style={{ borderColor: 'var(--status-red)', color: 'var(--status-red)', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* AI Recommendation Banner */}
        {recommendation && !loading && (
          <div className="glass-card" style={styles.recommendationBanner(recommendation.zone.status)}>
            <div style={styles.recIcon}>✨</div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                Smart Recommendation: <span style={{ color: getStatusColor(recommendation.zone.status) }}>{recommendation.zone.name}</span>
              </h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
                {recommendation.message} — We found {recommendation.zone.free_space} spots available!
              </p>
            </div>
          </div>
        )}

        {loading && zones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>
            <h2>Loading live parking data...</h2>
          </div>
        ) : (
          <div>
            <h2 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem'
  },
  recommendationBanner: (status) => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(10, 14, 39, 0.4) 100%)',
    borderLeft: `4px solid ${getStatusColor(status)}`,
    padding: '2rem',
    marginBottom: '2rem'
  }),
  recIcon: {
    fontSize: '2.5rem',
    background: 'rgba(59, 130, 246, 0.2)',
    padding: '1rem',
    borderRadius: '50%',
    lineHeight: 1
  }
};
