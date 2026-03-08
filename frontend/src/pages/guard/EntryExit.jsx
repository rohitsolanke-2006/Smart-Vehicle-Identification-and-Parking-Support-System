import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { getZones, recordEntry, recordExit } from '../../services/api';

export default function EntryExit() {
  const [zones, setZones] = useState([]);
  const [entryReg, setEntryReg] = useState('');
  const [entryZone, setEntryZone] = useState('');
  const [exitReg, setExitReg] = useState('');
  
  const [entryMessage, setEntryMessage] = useState({ text: '', type: '' });
  const [exitMessage, setExitMessage] = useState({ text: '', type: '' });
  
  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const data = await getZones();
      setZones(data);
      if (data.length > 0) setEntryZone(data[0].name);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEntry = async (e) => {
    e.preventDefault();
    setEntryMessage({ text: 'Processing...', type: 'info' });
    try {
      await recordEntry(entryReg, entryZone);
      setEntryMessage({ text: `Vehicle ${entryReg} entered ${entryZone}`, type: 'success' });
      setEntryReg('');
      loadZones(); // Refresh capacity
    } catch (err) {
      setEntryMessage({ text: err.message || 'Failed to record entry', type: 'error' });
    }
  };

  const handleExit = async (e) => {
    e.preventDefault();
    setExitMessage({ text: 'Processing...', type: 'info' });
    try {
      await recordExit(exitReg);
      setExitMessage({ text: `Vehicle ${exitReg} exited successfully`, type: 'success' });
      setExitReg('');
      loadZones();
    } catch (err) {
      setExitMessage({ text: err.message || 'Failed to record exit', type: 'error' });
    }
  };

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      
      <main className="main-content" style={{ padding: '0 2rem 2rem' }}>
        <header className="mb-4">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Security Guard Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Record vehicle entry and exit events.</p>
        </header>

        <div style={styles.grid}>
          {/* ENTRY FORM */}
          <div className="glass-card">
            <h2 style={{ color: 'var(--status-green)' }}>Vehicle Entry</h2>
            {entryMessage.text && (
              <div style={styles.alert(entryMessage.type)}>{entryMessage.text}</div>
            )}
            
            <form onSubmit={handleEntry}>
              <div className="form-group">
                <label>Registration Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={entryReg}
                  onChange={(e) => setEntryReg(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12AB1234"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Target Parking Zone</label>
                <select 
                  className="form-control"
                  value={entryZone}
                  onChange={(e) => setEntryZone(e.target.value)}
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', cursor: 'pointer' }}
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.name}>
                      {z.name} ({z.free_space !== undefined ? z.free_space : (z.capacity - z.occupied)} spots free)
                    </option>
                  ))}
                </select>
              </div>
              
              <button disabled={entryMessage.type === 'info'} type="submit" className="btn-primary" style={{ backgroundColor: 'var(--status-green)' }}>
                Record Entry
              </button>
            </form>
          </div>

          {/* EXIT FORM */}
          <div className="glass-card">
            <h2 style={{ color: 'var(--status-yellow)' }}>Vehicle Exit</h2>
            {exitMessage.text && (
              <div style={styles.alert(exitMessage.type)}>{exitMessage.text}</div>
            )}
            
            <form onSubmit={handleExit}>
              <div className="form-group">
                <label>Registration Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={exitReg}
                  onChange={(e) => setExitReg(e.target.value.toUpperCase())}
                  placeholder="e.g. MH12AB1234"
                  required 
                />
              </div>
              
              <button disabled={exitMessage.type === 'info'} type="submit" className="btn-primary" style={{ backgroundColor: 'var(--status-yellow)' }}>
                Record Exit
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem'
  },
  alert: (type) => ({
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    backgroundColor: type === 'error' ? 'rgba(239, 68, 68, 0.1)' : type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    color: type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : '#60a5fa',
    border: `1px solid ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'}`
  })
};
