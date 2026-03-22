import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import { getZones, recordEntry, recordExit, scanPlate, searchVehicle, markMisparked, getAllBookings, confirmBooking } from '../../services/api';

export default function EntryExit() {
  const [zones, setZones]               = useState([]);
  const [bookings, setBookings]          = useState([]);
  const [entryReg, setEntryReg]         = useState('');
  const [entryZone, setEntryZone]       = useState('');
  const [exitReg, setExitReg]           = useState('');
  const [searchReg, setSearchReg]       = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError]   = useState('');

  const [entryMsg, setEntryMsg] = useState({ text: '', type: '' });
  const [exitMsg,  setExitMsg]  = useState({ text: '', type: '' });
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadZones();
    loadBookings();
    const iv = setInterval(loadBookings, 10000);
    return () => clearInterval(iv);
  }, []);

  const loadZones = async () => {
    try {
      const data = await getZones();
      setZones(data);
      if (data.length > 0) setEntryZone(data[0].zone_name || data[0].name);
    } catch (err) { console.error(err); }
  };

  const loadBookings = async () => {
    try { setBookings(await getAllBookings()); }
    catch { /* guard may not have bookings perm yet */ }
  };

  const handleConfirmBooking = async (id, reg, zone) => {
    try {
      await confirmBooking(id);
      setEntryReg(reg || '');
      setEntryZone(zone);
      loadBookings();
      setEntryMsg({ text: `✓ Booking confirmed. Record entry for ${reg || 'unknown plate'}.`, type: 'success' });
    } catch (err) {
      setEntryMsg({ text: err.message, type: 'error' });
    }
  };

  /* ── ANPR scan ─────────────────────────────────── */
  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true); setScanResult(null);
    try {
      const data = await scanPlate(file);
      if (data.plate) {
        setEntryReg(data.plate);
        setScanResult({ text: `✓ ${data.plate}${data.mock ? ' (demo)' : ''}`, type: 'success' });
      } else {
        setScanResult({ text: 'No plate detected — retake closer.', type: 'error' });
      }
    } catch (err) {
      setScanResult({ text: 'Scan error: ' + err.message, type: 'error' });
    } finally {
      setScanning(false);
      fileInputRef.current.value = '';
    }
  };

  /* ── Entry ─────────────────────────────────────── */
  const handleEntry = async (e) => {
    e.preventDefault();
    setEntryMsg({ text: 'Processing…', type: 'info' });
    try {
      await recordEntry(entryReg, entryZone);
      setEntryMsg({ text: `✓ ${entryReg} entered ${entryZone}`, type: 'success' });
      setEntryReg(''); setScanResult(null);
      loadZones();
    } catch (err) {
      setEntryMsg({ text: err.message || 'Entry failed', type: 'error' });
    }
  };

  /* ── Exit ──────────────────────────────────────── */
  const handleExit = async (e) => {
    e.preventDefault();
    setExitMsg({ text: 'Processing…', type: 'info' });
    try {
      const res = await recordExit(exitReg);
      const queueNote = res.queue_notified ? ` Queue notified: ${res.queue_notified}` : '';
      setExitMsg({ text: `✓ ${exitReg} exited (${res.duration_minutes} min).${queueNote}`, type: 'success' });
      setExitReg('');
      loadZones();
    } catch (err) {
      setExitMsg({ text: err.message || 'Exit failed', type: 'error' });
    }
  };

  /* ── Vehicle search ────────────────────────────── */
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchResult(null); setSearchError('');
    try {
      const data = await searchVehicle(searchReg);
      setSearchResult(data);
    } catch (err) {
      setSearchError(err.message || 'Vehicle not found on campus');
    }
  };

  /* ── Mis-park ──────────────────────────────────── */
  const handleMispark = async (reg) => {
    try {
      await markMisparked(reg);
      setSearchResult(prev => ({ ...prev, is_mis_parked: true }));
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      <main className="main-content" style={{ padding: '0 2rem 2rem' }}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>🛡️ Security Guard Panel</h1>
            <p style={styles.pageSubtitle}>Record vehicle entry/exit and flag mis-parked vehicles.</p>
          </div>
        </header>

        {/* ── Incoming Pre-Bookings ────────────── */}
        {bookings.length > 0 && (
          <div style={styles.bookingsCard}>
            <div style={styles.bookingsHeader}>
              <h2 style={styles.bookingsTitle}>
                🔖 Incoming Pre-Bookings
                <span style={styles.bookingsBadge}>{bookings.length}</span>
              </h2>
            </div>
            <div style={styles.bookingsList}>
              {bookings.map(b => {
                const expiresIn = Math.max(0, Math.round((new Date(b.expires_at + 'Z') - new Date()) / 60000));
                return (
                  <div key={b.id} style={styles.bookingItem}>
                    <div style={styles.bookingInfo}>
                      <div style={styles.bookingField}>
                        <span style={styles.bookingLabel}>Student</span>
                        <span style={styles.bookingValue}>{b.student_name}</span>
                        <span style={styles.bookingSub}>{b.student_email}</span>
                      </div>
                      <div style={styles.bookingField}>
                        <span style={styles.bookingLabel}>Plate</span>
                        <span style={styles.bookingMono}>{b.vehicle_reg || '—'}</span>
                      </div>
                      <div style={styles.bookingField}>
                        <span style={styles.bookingLabel}>Zone</span>
                        <span style={styles.bookingValue}>{b.zone_name}</span>
                      </div>
                      <div style={styles.bookingField}>
                        <span style={styles.bookingLabel}>Expires</span>
                        <span style={{ ...styles.bookingValue, color: expiresIn < 30 ? 'var(--status-red)' : 'var(--status-yellow)' }}>
                          in {expiresIn} min
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleConfirmBooking(b.id, b.vehicle_reg, b.zone_name)} style={styles.confirmBtn}>
                      ✓ Confirm Arrival
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ROW 1: Entry + Exit ─────────────── */}
        <div style={styles.grid}>

          {/* ENTRY */}
          <div className="glass-card" style={styles.entryCard}>
            <h2 style={styles.cardTitleGreen}>🚗 Vehicle Entry</h2>
            {entryMsg.text && <div style={styles.alert(entryMsg.type)}>{entryMsg.text}</div>}

            <form onSubmit={handleEntry}>
              <div className="form-group">
                <label>Registration Number</label>
                <div style={styles.scanRow}>
                  <button type="button" onClick={() => fileInputRef.current.click()}
                    disabled={scanning} style={styles.scanBtn}>
                    {scanning ? '⏳ Scanning…' : '📷 Scan Plate'}
                  </button>
                  {scanResult && (
                    <span style={styles.scanResult(scanResult.type)}>{scanResult.text}</span>
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef}
                  onChange={handleScan} style={{ display: 'none' }} />
                <input type="text" className="form-control"
                  value={entryReg}
                  onChange={e => setEntryReg(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12AB1234 — or Scan Plate"
                  required />
              </div>

              <div className="form-group">
                <label>Parking Zone</label>
                <select className="form-control" value={entryZone}
                  onChange={e => setEntryZone(e.target.value)}
                  style={{ cursor: 'pointer' }}>
                  {zones.map(z => (
                    <option key={z.id} value={z.zone_name || z.name}>
                      {z.zone_name || z.name} — {z.free_space ?? (z.capacity - z.occupied)} free
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-primary"
                disabled={entryMsg.type === 'info'}
                style={{ ...styles.submitBtn, background: 'var(--status-green)' }}>
                ✓ Record Entry
              </button>
            </form>
          </div>

          {/* EXIT */}
          <div className="glass-card" style={styles.exitCard}>
            <h2 style={styles.cardTitleYellow}>🚪 Vehicle Exit</h2>
            {exitMsg.text && <div style={styles.alert(exitMsg.type)}>{exitMsg.text}</div>}

            <form onSubmit={handleExit}>
              <div className="form-group">
                <label>Registration Number</label>
                <input type="text" className="form-control"
                  value={exitReg}
                  onChange={e => setExitReg(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12AB1234"
                  required />
              </div>
              <button type="submit" className="btn-primary"
                disabled={exitMsg.type === 'info'}
                style={{ ...styles.submitBtn, background: 'var(--status-yellow)', marginTop: '1rem' }}>
                ↩ Record Exit
              </button>
            </form>
          </div>
        </div>

        {/* ── ROW 2: Vehicle Search + Mis-park ── */}
        <div className="glass-card" style={styles.searchCard}>
          <h2 style={styles.sectionTitle}>🔍 Vehicle Search &amp; Mis-Park Flag</h2>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input type="text" className="form-control"
              value={searchReg}
              onChange={e => setSearchReg(e.target.value.toUpperCase())}
              placeholder="Enter registration number…"
              style={styles.searchInput}
              required />
            <button type="submit" className="btn-primary" style={styles.searchBtn}>
              Search
            </button>
          </form>

          {searchError && <div style={styles.alert('error')}>{searchError}</div>}

          {searchResult && (
            <div style={styles.resultCard}>
              <div style={styles.resultGrid}>
                <ResultRow label="Registration" value={searchResult.reg_number} />
                <ResultRow label="Zone" value={searchResult.zone_name} />
                <ResultRow label="Entry Time" value={new Date(searchResult.entry_time + 'Z').toLocaleString()} />
                <ResultRow label="Duration" value={`${searchResult.duration_minutes} min`} />
                <ResultRow
                  label="Status"
                  value={searchResult.is_mis_parked ? '⚠️ Mis-Parked' : '✓ Correctly Parked'}
                  color={searchResult.is_mis_parked ? 'var(--status-red)' : 'var(--status-green)'}
                />
              </div>
              {!searchResult.is_mis_parked && (
                <button onClick={() => handleMispark(searchResult.reg_number)} style={styles.misparkBtn}>
                  ⚠️ Flag as Mis-Parked
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Zone Status Summary ─────────────── */}
        <div className="glass-card" style={styles.zonesCard}>
          <h2 style={styles.sectionTitle}>📊 Live Zone Status</h2>
          <div style={styles.zonesGrid}>
            {zones.map(z => {
              const pct = z.occupancy_percent ?? Math.round((z.occupied / z.capacity) * 100);
              const color = pct >= 90 ? 'var(--status-red)' : pct >= 60 ? 'var(--status-yellow)' : 'var(--status-green)';
              const colorLight = pct >= 90 ? 'var(--status-red-light)' : pct >= 60 ? 'var(--status-yellow-light)' : 'var(--status-green-light)';
              return (
                <div key={z.id} style={{ ...styles.zoneItem, borderColor: color, background: colorLight }}>
                  <div style={styles.zoneHeader}>
                    <span style={styles.zoneName}>{z.zone_name || z.name}</span>
                    <span style={{ ...styles.zoneBadge, background: color }}>
                      {z.free_space ?? (z.capacity - z.occupied)} free
                    </span>
                  </div>
                  <div style={styles.zoneProgress}>
                    <div style={{ ...styles.zoneProgressFill, width: `${pct}%`, background: color }} />
                  </div>
                  <span style={styles.zoneCount}>{z.occupied ?? 0} / {z.capacity} occupied</span>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

function ResultRow({ label, value, color }) {
  return (
    <div style={styles.resultRow}>
      <span style={styles.resultLabel}>{label}</span>
      <span style={{ ...styles.resultValue, color: color || 'var(--text-main)' }}>{value}</span>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: 'var(--text-main)',
  },
  pageSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  alert: (type) => ({
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    background: type === 'error' ? 'var(--status-red-light)' : type === 'success' ? 'var(--status-green-light)' : 'var(--accent-light)',
    color: type === 'error' ? '#991b1b' : type === 'success' ? '#166534' : '#1e40af',
    border: `1px solid ${type === 'error' ? '#fca5a5' : type === 'success' ? '#86efac' : '#93c5fd'}`,
  }),
  cardTitleGreen: {
    color: 'var(--status-green)',
    marginBottom: '1.25rem',
    fontSize: '1.15rem',
    fontWeight: '700',
  },
  cardTitleYellow: {
    color: 'var(--status-yellow)',
    marginBottom: '1.25rem',
    fontSize: '1.15rem',
    fontWeight: '700',
  },
  entryCard: {
    borderTop: '3px solid var(--status-green)',
  },
  exitCard: {
    borderTop: '3px solid var(--status-yellow)',
  },
  scanRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  scanBtn: {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
  },
  scanResult: (type) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.375rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: type === 'success' ? 'var(--status-green-light)' : 'var(--status-red-light)',
    color: type === 'success' ? '#166534' : '#991b1b',
  }),
  submitBtn: {
    width: '100%',
    marginTop: '0.5rem',
  },
  searchCard: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    marginBottom: '1.25rem',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  searchForm: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '220px',
  },
  searchBtn: {
    whiteSpace: 'nowrap',
    background: 'var(--primary)',
    width: 'auto',
    paddingHorizontal: '1.5rem',
  },
  resultCard: {
    background: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  resultRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  resultLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  resultValue: {
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  misparkBtn: {
    background: 'var(--status-red-light)',
    color: 'var(--status-red)',
    border: '1.5px solid var(--status-red)',
    borderRadius: 'var(--radius-md)',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all var(--transition-fast)',
  },
  zonesCard: {
    marginTop: '0',
  },
  zonesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  zoneItem: {
    border: '2px solid',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'var(--bg-card)',
    transition: 'all var(--transition-fast)',
  },
  zoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneName: {
    fontWeight: '700',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
  },
  zoneBadge: {
    padding: '0.25rem 0.625rem',
    borderRadius: 'var(--radius-xl)',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.03em',
  },
  zoneProgress: {
    height: '6px',
    background: 'var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  zoneProgressFill: {
    height: '100%',
    borderRadius: 'var(--radius-sm)',
    transition: 'width 0.5s ease',
  },
  zoneCount: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  bookingsCard: {
    marginBottom: '1.5rem',
    borderLeft: '4px solid var(--accent)',
  },
  bookingsHeader: {
    marginBottom: '1rem',
  },
  bookingsTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  bookingsBadge: {
    background: 'var(--accent)',
    color: '#fff',
    borderRadius: 'var(--radius-xl)',
    padding: '0.125rem 0.625rem',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  bookingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-main)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem 1.25rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
    border: '1px solid var(--border-light)',
  },
  bookingInfo: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  bookingField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  bookingLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  bookingValue: {
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-main)',
  },
  bookingSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  bookingMono: {
    fontWeight: '700',
    fontFamily: 'monospace',
    fontSize: '0.95rem',
    color: 'var(--text-main)',
  },
  confirmBtn: {
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)',
  },
};
