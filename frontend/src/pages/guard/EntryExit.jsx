import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { getZones, recordEntry, recordExit, scanPlate, searchVehicle, markMisparked, getAllBookings, confirmBooking } from '../../services/api';

export default function EntryExit() {
  const [zones,    setZones]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [entryReg,  setEntryReg]  = useState('');
  const [entryZone, setEntryZone] = useState('');
  const [exitReg,   setExitReg]   = useState('');
  const [searchReg, setSearchReg] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError,  setSearchError]  = useState('');
  const [entryMsg, setEntryMsg] = useState(null);
  const [exitMsg,  setExitMsg]  = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { loadZones(); loadBookings(); const iv = setInterval(loadBookings, 10000); return () => clearInterval(iv); }, []);

  const loadZones = async () => {
    try { const d = await getZones(); setZones(d); if (d.length > 0) setEntryZone(d[0].zone_name || d[0].name); } catch {}
  };
  const loadBookings = async () => {
    try { setBookings(await getAllBookings()); } catch {}
  };

  const flash = (setter, text, type) => { setter({ text, type }); setTimeout(() => setter(null), 5000); };

  const handleConfirm = async (id, reg, zone) => {
    try {
      await confirmBooking(id);
      setEntryReg(reg || ''); setEntryZone(zone); loadBookings();
      flash(setEntryMsg, `Confirmed. Record entry for ${reg || 'unknown plate'}.`, 'success');
    } catch (e) { flash(setEntryMsg, e.message, 'error'); }
  };

  const handleScan = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setScanning(true); setScanResult(null);
    try {
      const d = await scanPlate(file);
      if (d.plate) { setEntryReg(d.plate); setScanResult({ text: `Detected: ${d.plate}${d.mock ? ' (demo)' : ''}`, type: 'success' }); }
      else          { setScanResult({ text: 'No plate detected — try closer', type: 'error' }); }
    } catch (e) { setScanResult({ text: 'Scan error: ' + e.message, type: 'error' }); }
    finally { setScanning(false); fileRef.current.value = ''; }
  };

  const handleEntry = async (e) => {
    e.preventDefault(); flash(setEntryMsg, 'Processing…', 'info');
    try { await recordEntry(entryReg, entryZone); flash(setEntryMsg, `${entryReg} entered ${entryZone}`, 'success'); setEntryReg(''); setScanResult(null); loadZones(); }
    catch (e) { flash(setEntryMsg, e.message || 'Entry failed', 'error'); }
  };

  const handleExit = async (e) => {
    e.preventDefault(); flash(setExitMsg, 'Processing…', 'info');
    try { const r = await recordExit(exitReg); flash(setExitMsg, `${exitReg} exited (${r.duration_minutes} min)${r.queue_notified ? ` · Notified ${r.queue_notified}` : ''}`, 'success'); setExitReg(''); loadZones(); }
    catch (e) { flash(setExitMsg, e.message || 'Exit failed', 'error'); }
  };

  const handleSearch = async (e) => {
    e.preventDefault(); setSearchResult(null); setSearchError('');
    try { setSearchResult(await searchVehicle(searchReg)); }
    catch (e) { setSearchError(e.message || 'Vehicle not found'); }
  };

  const handleMispark = async (reg) => {
    try { await markMisparked(reg); setSearchResult(p => ({...p, is_mis_parked: true})); }
    catch (e) { alert('Failed: ' + e.message); }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="main-content animate-slide-up">
        <div className="page-header">
          <div>
            <div className="page-header__eyebrow">Guard Terminal</div>
            <h1 className="page-header__title gradient-text">Entry &amp; Exit Control</h1>
            <p className="page-header__sub">Log vehicle movements, confirm pre-bookings, and flag violations.</p>
          </div>
        </div>

        {/* ── Incoming Bookings */}
        {bookings.length > 0 && (
          <div style={s.bookingsBanner}>
            <div style={s.bookingsBannerHeader}>
              <span style={s.eyebrow}>Incoming Pre-Bookings</span>
              <span style={s.countBadge}>{bookings.length}</span>
            </div>
            <div style={s.bookingsList}>
              {bookings.map(b => {
                const exp = Math.max(0, Math.round((new Date(b.expires_at + 'Z') - new Date()) / 60000));
                const urgent = exp < 30;
                return (
                  <div key={b.id} style={s.bookingItem}>
                    <div style={s.bookingData}>
                      <Cell label="Student" value={b.student_name} sub={b.student_email} />
                      <Cell label="Plate" value={b.vehicle_reg || '—'} mono />
                      <Cell label="Zone" value={b.zone_name} />
                      <Cell label="Expires" value={`${exp} min`} color={urgent ? '#F85149' : '#D29922'} />
                    </div>
                    <button style={s.confirmBtn} onClick={() => handleConfirm(b.id, b.vehicle_reg, b.zone_name)}>
                      Confirm Arrival
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Entry + Exit row */}
        <div style={s.twoCol}>
          {/* ENTRY */}
          <div style={{ ...s.panel, borderTop: '2px solid #3FB950' }}>
            <h3 style={{ ...s.panelTitle, color: '#3FB950' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.562z"/></svg>
              Vehicle Entry
            </h3>
            {entryMsg && <div className={`alert alert--${entryMsg.type}`} style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>{entryMsg.text}</div>}
            <form onSubmit={handleEntry}>
              <div className="form-group">
                <label>Registration Number</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <button type="button" disabled={scanning} onClick={() => fileRef.current.click()} style={s.scanBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'0.375rem'}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    {scanning ? 'Scanning...' : 'Scan Plate'}
                  </button>
                  {scanResult && <span style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem', borderRadius: '6px', fontWeight: '600', background: scanResult.type === 'success' ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)', color: scanResult.type === 'success' ? '#3FB950' : '#F85149', alignSelf: 'center' }}>{scanResult.text}</span>}
                </div>
                <input type="file" accept="image/*" ref={fileRef} onChange={handleScan} style={{ display: 'none' }} />
                <input type="text" className="form-control mono" value={entryReg} onChange={e => setEntryReg(e.target.value.toUpperCase())} placeholder="MH12AB1234" required />
              </div>
              <div className="form-group">
                <label>Parking Zone</label>
                <select className="form-control" value={entryZone} onChange={e => setEntryZone(e.target.value)}>
                  {zones.map(z => <option key={z.id} value={z.zone_name || z.name}>{z.zone_name || z.name} - {z.free_space ?? (z.capacity - z.occupied)} free</option>)}
                </select>
              </div>
              <button type="submit" style={{ ...s.actionBtn, background: 'rgba(63,185,80,0.12)', color: '#3FB950', border: '1px solid rgba(63,185,80,0.25)' }}>
                Record Entry
              </button>
            </form>
          </div>

          {/* EXIT */}
          <div style={{ ...s.panel, borderTop: '2px solid #D29922' }}>
            <h3 style={{ ...s.panelTitle, color: '#D29922' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Vehicle Exit
            </h3>
            {exitMsg && <div className={`alert alert--${exitMsg.type}`} style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>{exitMsg.text}</div>}
            <form onSubmit={handleExit}>
              <div className="form-group">
                <label>Registration Number</label>
                <input type="text" className="form-control mono" value={exitReg} onChange={e => setExitReg(e.target.value.toUpperCase())} placeholder="MH12AB1234" required />
              </div>
              <button type="submit" style={{ ...s.actionBtn, background: 'rgba(210,153,34,0.10)', color: '#D29922', border: '1px solid rgba(210,153,34,0.25)', marginTop: '3.15rem' }}>
                Record Exit
              </button>
            </form>
          </div>
        </div>

        {/* ── Search & Mis-park */}
        <div style={s.panel}>
          <h3 style={s.panelTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Vehicle Search &amp; Violation Flag
          </h3>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input type="text" className="form-control mono" value={searchReg} onChange={e => setSearchReg(e.target.value.toUpperCase())} placeholder="Enter registration..." style={{ flex: 1, minWidth: '200px' }} required />
            <button type="submit" style={{ ...s.actionBtn, padding: '0 2rem', width: 'auto', background: 'rgba(47,129,247,0.12)', color: '#2F81F7', border: '1px solid rgba(47,129,247,0.25)' }}>Search</button>
          </form>
          {searchError && <div className="alert alert--error" style={{ fontSize: '0.85rem' }}>{searchError}</div>}
          {searchResult && (
            <div style={s.resultCard}>
              <div style={s.resultGrid}>
                <Cell label="Registration" value={searchResult.reg_number} mono large />
                <Cell label="Zone" value={searchResult.zone_name} large />
                <Cell label="Entry Time" value={new Date(searchResult.entry_time + 'Z').toLocaleString()} large />
                <Cell label="Duration" value={`${searchResult.duration_minutes} min`} large />
                <Cell label="Status" value={searchResult.is_mis_parked ? 'Mis-Parked' : 'Correct Zone'} color={searchResult.is_mis_parked ? '#F85149' : '#3FB950'} large />
              </div>
              {!searchResult.is_mis_parked && (
                <button onClick={() => handleMispark(searchResult.reg_number)} style={{ ...s.actionBtn, background: 'rgba(248,81,73,0.07)', color: '#F85149', border: '1px solid rgba(248,81,73,0.2)', width: 'auto', padding: '0.6rem 1.25rem', marginTop: '1rem' }}>
                  Flag as Mis-Parked
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Live zone status */}
        <div style={s.panel}>
          <h3 style={s.panelTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Live Zone Status
          </h3>
          <div style={s.zonesGrid}>
            {zones.map(z => {
              const pct = z.occupancy_percent ?? Math.round((z.occupied / z.capacity) * 100);
              const color = pct >= 90 ? '#F85149' : pct >= 60 ? '#D29922' : '#3FB950';
              const colorDim = pct >= 90 ? 'rgba(248,81,73,0.08)' : pct >= 60 ? 'rgba(210,153,34,0.08)' : 'rgba(63,185,80,0.08)';
              const free = z.free_space ?? (z.capacity - z.occupied);
              return (
                <div key={z.id} style={{ ...s.zoneChip, background: colorDim, borderColor: color + '30' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#F0F6FC', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>{z.zone_name || z.name}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', color, letterSpacing: '0.06em' }}>{free} free</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.375rem' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.8s ease', boxShadow: `0 0 8px ${color}` }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#484F58', fontFamily: 'JetBrains Mono, monospace' }}>{z.occupied}/{z.capacity} occupied</span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function Cell({ label, value, sub, color, mono, large }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.09em', textTransform: 'uppercase', color: '#484F58' }}>{label}</div>
      <div style={{ fontSize: large ? '1.05rem' : '0.9rem', fontWeight: '700', color: color || '#F0F6FC', fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif', letterSpacing: mono ? '0.04em' : '-0.01em' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#484F58' }}>{sub}</div>}
    </div>
  );
}

const s = {
  eyebrow: { fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8B949E' },
  countBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '22px', height: '22px', borderRadius: '9999px', background: 'rgba(124,58,237,0.15)', color: '#7C3AED', fontSize: '0.75rem', fontWeight: '800', border: '1px solid rgba(124,58,237,0.3)', padding: '0 6px' },
  bookingsBanner: { background: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(32px)', border: '1px solid rgba(124,58,237,0.15)', borderLeft: '3px solid #7C3AED', borderRadius: '14px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(124,58,237,0.08)' },
  bookingsBannerHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  bookingsList: { display: 'flex', flexDirection: 'column' },
  bookingItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: '1rem' },
  bookingData: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  confirmBtn: { padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2F81F7, #7C3AED)', color: '#fff', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 12px rgba(47,129,247,0.25)', transition: 'all 0.15s ease', whiteSpace: 'nowrap' },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' },
  panel: { background: 'rgba(13,17,23,0.7)', backdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  panelTitle: { fontSize: '1rem', fontWeight: '700', color: '#F0F6FC', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  scanBtn: { padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid rgba(47,129,247,0.3)', background: 'rgba(47,129,247,0.08)', color: '#2F81F7', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', transition: 'all 0.15s ease' },
  actionBtn: { width: '100%', padding: '0.75rem 1.5rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease', letterSpacing: '0.01em' },
  resultCard: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1.25rem' },
  resultGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' },
  zonesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' },
  zoneChip: { padding: '1rem', border: '1px solid', borderRadius: '10px' },
};
