import React from 'react';

export default function ZoneCard({ zone }) {
  // Determine color based on status or occupancy
  let statusColor = 'var(--status-green)';
  let glowColor = 'rgba(16, 185, 129, 0.2)';
  
  if (zone.status === 'RED' || zone.occupancy_percent >= 90) {
    statusColor = 'var(--status-red)';
    glowColor = 'rgba(239, 68, 68, 0.2)';
  } else if (zone.status === 'YELLOW' || zone.occupancy_percent >= 60) {
    statusColor = 'var(--status-yellow)';
    glowColor = 'rgba(245, 158, 11, 0.2)';
  }

  return (
    <div 
      className="glass-card" 
      style={{
        ...styles.card,
        boxShadow: `0 4px 20px ${glowColor}`,
        borderColor: statusColor
      }}
    >
      <div style={styles.header}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{zone.name}</h3>
        <span style={{...styles.badge, backgroundColor: statusColor}}>
          {zone.status || (zone.occupancy_percent >= 90 ? 'FULL' : 'OPEN')}
        </span>
      </div>
      
      <div style={styles.stats}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Available</span>
          <span style={{...styles.statValue, color: statusColor}}>
            {zone.free_space !== undefined ? zone.free_space : (zone.capacity - zone.occupied)}
          </span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Total Spaces</span>
          <span style={styles.statValue}>{zone.capacity}</span>
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div 
          style={{
            ...styles.progressBar, 
            width: `${zone.occupancy_percent || ((zone.occupied / zone.capacity) * 100)}%`,
            backgroundColor: statusColor
          }}
        ></div>
      </div>
      
      <p style={{ textAlign: 'right', margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        {Math.round(zone.occupancy_percent || ((zone.occupied / zone.capacity) * 100))}% Occupied
      </p>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    cursor: 'default',
    borderWidth: '1px',
    borderStyle: 'solid'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem'
  },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: '1px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '0.5rem'
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700'
  },
  progressContainer: {
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.5rem'
  },
  progressBar: {
    height: '100%',
    transition: 'width 1s ease-in-out, background-color 0.5s ease'
  }
};
