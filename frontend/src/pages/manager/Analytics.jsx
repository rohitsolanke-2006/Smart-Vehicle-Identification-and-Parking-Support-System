import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import HeatmapChart from '../../components/HeatmapChart';
import { getHeatmap, getAnalytics, getZones, exportPdf, getPrediction } from '../../services/api';

export default function Analytics() {
  const [heatmapData,  setHeatmapData]  = useState(null);
  const [analytics,    setAnalytics]    = useState(null);
  const [prediction,   setPrediction]   = useState(null);
  const [zones,        setZones]        = useState([]);
  const [selectedZone, setSelectedZone] = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [exporting,    setExporting]    = useState(false);

  const fetchData = async (zone = 'all') => {
    setLoading(true);
    try {
      const [hm, an, zn, pred] = await Promise.all([
        getHeatmap(zone),
        getAnalytics(),
        getZones(),
        getPrediction(),
      ]);
      setHeatmapData(hm);
      setAnalytics(an);
      setZones(zn);
      setPrediction(pred);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleZoneChange = (e) => {
    setSelectedZone(e.target.value);
    fetchData(e.target.value);
  };

  const handleExport = async () => {
    setExporting(true);
    try { await exportPdf(); }
    finally { setExporting(false); }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="main-content" style={{ padding: '0 2rem 2rem' }}>

        {/* ── Header ──────────────────────────────── */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>📊 Parking Analytics</h1>
            <p style={styles.pageSubtitle}>Traffic patterns, ML predictions, and zone performance insights.</p>
          </div>
          <button onClick={handleExport} disabled={exporting} style={styles.exportBtn}>
            {exporting ? 'Generating…' : '⬇️ Export PDF Report'}
          </button>
        </div>

        {/* ── Summary Cards ─────────────────────────_ */}
        {analytics && (
          <div style={styles.statsGrid}>
            <StatCard label="Total Entries"     value={analytics.total_entries}    color="#3b82f6" icon="📥" />
            <StatCard label="Total Exits"       value={analytics.total_exits}      color="#10b981" icon="📤" />
            <StatCard label="Currently Parked"  value={analytics.currently_parked} color="#f59e0b" icon="🚗" />
            <StatCard label="Mis-Parked"        value={analytics.mis_parked_count} color="#ef4444" icon="⚠️" />
          </div>
        )}

        {/* ── ML Prediction Chart ──────────────────── */}
        {prediction && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  🤖 ML Occupancy Prediction — Today
                </h2>
                <p style={styles.cardSubtitle}>
                  {prediction.source === 'historical'
                    ? 'Trained on your real parking logs · 7×24 frequency matrix + 3-hr smoothing'
                    : 'Synthetic college-day curve (will switch to real ML once logs accumulate)'}
                  {' '}&nbsp;·&nbsp; Peak at <strong>{String(prediction.peak_hour).padStart(2,'0')}:00</strong>
                  {' '}(<span style={{ color: riskColor(prediction.peak_risk), fontWeight: 700 }}>{prediction.peak_risk}</span>)
                </p>
              </div>
              <span style={{ ...styles.mlBadge, background: prediction.source === 'historical' ? 'var(--status-green-light)' : 'var(--status-yellow-light)',
                color: prediction.source === 'historical' ? '#166534' : '#92400e' }}>
                {prediction.source === 'historical' ? '🟢 Live ML' : '🟡 Synthetic'}
              </span>
            </div>
            <PredictionChart predictions={prediction.predictions} />
          </div>
        )}

        {/* ── Activity Heatmap ─────────────────────── */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Activity Heatmap</h2>
              <p style={styles.cardSubtitle}>
                Parking activity by day of week and hour — darker = busier
              </p>
            </div>
            <select value={selectedZone} onChange={handleZoneChange} style={styles.select}>
              <option value="all">All Zones</option>
              {zones.map(z => (
                <option key={z.id} value={z.zone_name}>{z.zone_name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div style={styles.loadingState}>Loading…</div>
          ) : heatmapData ? (
            <>
              <HeatmapChart data={heatmapData} />
              {heatmapData.peak.count > 0 && (
                <div style={styles.peakBadge}>
                  🔥 Busiest slot: <strong>{heatmapData.peak.day}</strong> at{' '}
                  <strong>{String(heatmapData.peak.hour).padStart(2,'0')}:00</strong>
                  {' '}({heatmapData.peak.count} events)
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── Zone Traffic Table ───────────────────── */}
        {analytics && analytics.entries_per_zone.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Zone Traffic Breakdown</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Zone</th>
                    <th style={styles.th}>Entries</th>
                    <th style={styles.th}>Exits</th>
                    <th style={styles.th}>Net Staying</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.entries_per_zone.map(z => (
                    <tr key={z.zone_name}>
                      <td style={styles.td}>{z.zone_name}</td>
                      <td style={{ ...styles.td, color: '#3b82f6' }}>{z.entries}</td>
                      <td style={{ ...styles.td, color: '#10b981' }}>{z.exits}</td>
                      <td style={{ ...styles.td, fontWeight: '700' }}>{z.entries - z.exits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

/* ── ML Prediction Bar Chart ─────────────────────────── */
function PredictionChart({ predictions }) {
  const maxVal = Math.max(...predictions.map(p => p.predicted_occupancy), 1);
  return (
    <div style={styles.chartWrapper}>
      <div style={styles.chartBars}>
        {predictions.map(p => (
          <div key={p.hour} style={styles.barContainer}>
            <div
              title={`${String(p.hour).padStart(2,'0')}:00 — ${p.predicted_occupancy}% (${p.risk})`}
              style={{
                ...styles.bar,
                height: `${Math.max(4, (p.predicted_occupancy / maxVal) * 100)}%`,
                background: riskColor(p.risk),
              }}
            />
            {p.hour % 3 === 0 && (
              <span style={styles.barLabel}>
                {String(p.hour).padStart(2,'0')}h
              </span>
            )}
          </div>
        ))}
      </div>
      <div style={styles.legend}>
        {[['LOW','var(--status-green)'],['MEDIUM','var(--status-yellow)'],['HIGH','#f97316'],['PEAK','var(--status-red)']].map(([label, color]) => (
          <span key={label} style={styles.legendItem}>
            <span style={{ ...styles.legendDot, background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function riskColor(risk) {
  if (risk === 'PEAK')   return 'var(--status-red)';
  if (risk === 'HIGH')   return '#f97316';
  if (risk === 'MEDIUM') return 'var(--status-yellow)';
  return 'var(--status-green)';
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: 'var(--text-main)',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    margin: 0,
    fontSize: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    transition: 'all var(--transition-fast)',
  },
  statIcon: {
    fontSize: '1.75rem',
    marginBottom: '0.25rem',
  },
  statValue: {
    fontSize: '2.25rem',
    fontWeight: '800',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    marginTop: '0.25rem',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: 'var(--shadow-sm)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '0.25rem',
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  select: {
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 2rem 0.5rem 0.75rem',
    fontSize: '0.9rem',
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
  },
  exportBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all var(--transition-fast)',
    whiteSpace: 'nowrap',
  },
  mlBadge: {
    padding: '0.375rem 0.875rem',
    borderRadius: 'var(--radius-xl)',
    fontSize: '0.75rem',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  loadingState: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  peakBadge: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: 'var(--status-yellow-light)',
    border: '1px solid #fde047',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    color: '#713f12',
    fontWeight: '500',
  },
  chartWrapper: {
    overflowX: 'auto',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '3px',
    height: '140px',
    padding: '0 4px',
  },
  barContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
    transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    opacity: 0.85,
    minHeight: '4px',
  },
  barLabel: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    marginTop: '4px',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  legend: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
    display: 'inline-block',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    background: 'var(--bg-main)',
    borderBottom: '2px solid var(--border-color)',
    color: 'var(--text-muted)',
    fontWeight: '600',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  td: {
    padding: '1rem',
    color: 'var(--text-main)',
    borderBottom: '1px solid var(--border-light)',
    fontWeight: '600',
  },
};