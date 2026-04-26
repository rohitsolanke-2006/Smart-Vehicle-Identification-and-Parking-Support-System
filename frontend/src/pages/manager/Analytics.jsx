import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import HeatmapChart from '../../components/HeatmapChart';
import { getHeatmap, getAnalytics, getZones, exportPdf, getPrediction } from '../../services/api';

export default function Analytics() {
  const [heatmap,   setHeatmap]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [prediction,setPrediction]= useState(null);
  const [zones,     setZones]     = useState([]);
  const [zone,      setZone]      = useState('all');
  const [loading,   setLoading]   = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchData = async (z = 'all') => {
    setLoading(true);
    try {
      const [hm, an, zn, pred] = await Promise.all([getHeatmap(z), getAnalytics(), getZones(), getPrediction()]);
      setHeatmap(hm); setAnalytics(an); setZones(zn); setPrediction(pred);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleZone = (e) => { setZone(e.target.value); fetchData(e.target.value); };
  const handleExport = async () => { setExporting(true); try { await exportPdf(); } finally { setExporting(false); } };

  const statCards = analytics ? [
    { label: 'Total Entries',    value: analytics.total_entries,    color: '#2F81F7', icon: 'entries' },
    { label: 'Total Exits',      value: analytics.total_exits,      color: '#3FB950', icon: 'exits'   },
    { label: 'Currently Parked', value: analytics.currently_parked, color: '#D29922', icon: 'parked'  },
    { label: 'Mis-Parked',       value: analytics.mis_parked_count, color: '#F85149', icon: 'mis'     },
  ] : [];

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="main-content animate-slide-up">

        <div className="page-header">
          <div>
            <div className="page-header__eyebrow">Manager Console</div>
            <h1 className="page-header__title gradient-text">Parking Analytics</h1>
            <p className="page-header__sub">ML predictions, traffic patterns, and zone performance.</p>
          </div>
          <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            onClick={handleExport} disabled={exporting}>
            {exporting ? 'Generating…' : 'Export PDF Report'}
          </button>
        </div>

        {/* ── Stat cards */}
        {analytics && (
          <div style={s.statGrid}>
            {statCards.map(c => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>
        )}

        <div style={s.mainGrid}>
          {/* ── ML Chart */}
          {prediction && (
            <div style={s.panel}>
              <div style={s.panelHeader}>
                <div>
                  <div style={s.eyebrow}>Machine Learning</div>
                  <h3 style={s.panelTitle}>Occupancy Prediction — Today</h3>
                  <p style={s.panelSub}>
                    {prediction.source === 'historical' ? 'Trained on real logs · 7×24 matrix + 3hr smoothing' : 'Synthetic data (accumulating logs for ML)'}
                    {' · '}Peak <span style={{ color: riskColor(prediction.peak_risk), fontWeight: '700' }}>{String(prediction.peak_hour).padStart(2,'0')}:00</span>
                  </p>
                </div>
                <span style={{ ...s.mlBadge, background: prediction.source === 'historical' ? 'rgba(63,185,80,0.1)' : 'rgba(210,153,34,0.1)', color: prediction.source === 'historical' ? '#3FB950' : '#D29922', border: `1px solid ${prediction.source === 'historical' ? 'rgba(63,185,80,0.25)' : 'rgba(210,153,34,0.25)'}` }}>
                  {prediction.source === 'historical' ? 'Live ML' : 'Synthetic'}
                </span>
              </div>
              <PredictionBar predictions={prediction.predictions} />
            </div>
          )}

          {/* ── Zone traffic table */}
          {analytics?.entries_per_zone?.length > 0 && (
            <div style={s.panel}>
              <div style={s.eyebrow}>Breakdown</div>
              <h3 style={s.panelTitle}>Zone Traffic</h3>
              <table className="data-table" style={{ marginTop: '1.25rem' }}>
                <thead>
                  <tr><th>Zone</th><th>Entries</th><th>Exits</th><th>Net</th></tr>
                </thead>
                <tbody>
                  {analytics.entries_per_zone.map(z => (
                    <tr key={z.zone_name}>
                      <td style={{ fontWeight: '600' }}>{z.zone_name}</td>
                      <td><span className="mono" style={{ color: '#2F81F7' }}>{z.entries}</span></td>
                      <td><span className="mono" style={{ color: '#3FB950' }}>{z.exits}</span></td>
                      <td><span className="mono" style={{ fontWeight: '800' }}>{z.entries - z.exits}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Heatmap */}
        <div style={s.panel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.eyebrow}>Activity Heatmap</div>
              <h3 style={s.panelTitle}>Parking Activity by Time &amp; Day</h3>
              <p style={s.panelSub}>Darker cells = higher activity. Identify peak hours at a glance.</p>
            </div>
            <select value={zone} onChange={handleZone} className="form-control" style={{ width: 'auto', padding: '0.6rem 2.5rem 0.6rem 1rem' }}>
              <option value="all">All Zones</option>
              {zones.map(z => <option key={z.id} value={z.zone_name}>{z.zone_name}</option>)}
            </select>
          </div>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#484F58', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }} className="animate-pulse">Loading heatmap…</div>
          ) : heatmap ? (
            <>
              <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <HeatmapChart data={heatmap} />
              </div>
              {heatmap.peak.count > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(210,153,34,0.08)', border: '1px solid rgba(210,153,34,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#D29922' }}>
                  Peak slot: <strong>{heatmap.peak.day}</strong> at <strong>{String(heatmap.peak.hour).padStart(2,'0')}:00</strong> — {heatmap.peak.count} events
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}

/* ── ML Bar Chart */
function PredictionBar({ predictions }) {
  const max = Math.max(...predictions.map(p => p.predicted_occupancy), 1);
  return (
    <div style={{ overflowX: 'auto', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '160px', minWidth: '500px' }}>
        {predictions.map(p => (
          <div key={p.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div title={`${String(p.hour).padStart(2,'0')}:00 — ${p.predicted_occupancy}% (${p.risk})`}
              style={{ width: '100%', maxWidth: '14px', minHeight: '4px', borderRadius: '3px 3px 0 0',
                height: `${Math.max(3, (p.predicted_occupancy / max) * 100)}%`,
                background: riskColor(p.risk), transition: 'height 0.5s ease',
                boxShadow: `0 0 8px ${riskColor(p.risk)}50`,
              }} />
            {p.hour % 6 === 0 && <div style={{ fontSize: '9px', color: '#484F58', marginTop: '6px', fontFamily: 'JetBrains Mono, monospace' }}>{String(p.hour).padStart(2,'0')}h</div>}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        {[['LOW','#3FB950'],['MEDIUM','#D29922'],['HIGH','#FB8500'],['PEAK','#F85149']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', color: '#8B949E', textTransform: 'uppercase' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function riskColor(risk) {
  if (risk === 'PEAK')   return '#F85149';
  if (risk === 'HIGH')   return '#FB8500';
  if (risk === 'MEDIUM') return '#D29922';
  return '#3FB950';
}

function StatCard({ label, value, color, icon }) {
  const icons = {
    entries: <path d="M12 5v14M5 12l7-7 7 7"/>,
    exits:   <path d="M12 19V5M19 12l-7 7-7-7"/>,
    parked:  <><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="7" cy="15" r="2"/><circle cx="17" cy="15" r="2"/><path d="M15 11V7a4 4 0 0 0-8 0v4"/></>,
    mis:     <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  };

  return (
    <div style={{ ...s.statCard, borderTop: `2px solid ${color}` }}>
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.1 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[icon]}</svg>
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: '800', letterSpacing: '-0.05em', lineHeight: '1', color, fontFamily: 'Inter, sans-serif', marginBottom: '0.5rem' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.07em', textTransform: 'uppercase', color: '#484F58' }}>{label}</div>
    </div>
  );
}

const s = {
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { position: 'relative', background: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' },
  panel: { background: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' },
  eyebrow: { fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#484F58', marginBottom: '0.3rem' },
  panelTitle: { fontSize: '1.05rem', fontWeight: '700', color: '#F0F6FC', letterSpacing: '-0.025em', margin: '0 0 0.25rem', fontFamily: 'Inter, sans-serif' },
  panelSub: { fontSize: '0.82rem', color: '#8B949E', margin: 0 },
  mlBadge: { padding: '0.3rem 0.875rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.07em', textTransform: 'uppercase', flexShrink: 0, alignSelf: 'flex-start' },
};