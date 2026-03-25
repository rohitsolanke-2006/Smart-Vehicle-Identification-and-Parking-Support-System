import React from 'react';

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getColor(value, max) {
  if (max === 0 || value === 0) return '#f1f5f9';
  const intensity = value / max;
  if (intensity < 0.25)  return '#dbeafe'; // very light blue
  if (intensity < 0.5)   return '#93c5fd'; // light blue
  if (intensity < 0.75)  return '#3b82f6'; // medium blue
  return '#1d4ed8';                         // dark blue
}

/**
 * HeatmapChart
 * Props:
 *   data: { matrix: number[][], days: string[], peak: { day, hour, count } }
 */
export default function HeatmapChart({ data }) {
  if (!data || !data.matrix) return null;

  const { matrix } = data;
  const maxVal = Math.max(...matrix.flat(), 1);

  return (
    <div style={styles.wrapper}>
      {/* Hour labels (x-axis) */}
      <div style={styles.xAxis}>
        <div style={styles.dayLabelSpacer} />
        {HOURS.filter((_, i) => i % 3 === 0).map(h => (
          <div key={h} style={styles.hourLabel}>{h}</div>
        ))}
      </div>

      {/* Grid rows */}
      <div style={styles.grid}>
        {matrix.map((row, dayIdx) => (
          <div key={dayIdx} style={styles.row}>
            {/* Day label */}
            <div style={styles.dayLabel}>{SHORT_DAYS[dayIdx]}</div>
            {/* 24 hour cells */}
            {row.map((val, hour) => (
              <div
                key={hour}
                title={`${data.days[dayIdx]} ${String(hour).padStart(2, '0')}:00 — ${val} events`}
                style={{
                  ...styles.cell,
                  background: getColor(val, maxVal),
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Less</span>
        {['#f1f5f9', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'].map(c => (
          <div key={c} style={{ ...styles.legendCell, background: c }} />
        ))}
        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>More</span>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    overflowX: 'auto',
    fontFamily: 'Inter, sans-serif',
  },
  xAxis: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
    paddingLeft: '0',
  },
  dayLabelSpacer: {
    width: '36px',
    flexShrink: 0,
  },
  hourLabel: {
    flex: 1,
    minWidth: '0',
    fontSize: '9px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: '600px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
  },
  dayLabel: {
    width: '36px',
    flexShrink: 0,
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'right',
    paddingRight: '8px',
  },
  cell: {
    flex: 1,
    height: '16px',
    borderRadius: '3px',
    transition: 'transform 0.15s ease',
    cursor: 'default',
    minWidth: '12px',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '12px',
    justifyContent: 'flex-end',
  },
  legendCell: {
    width: '14px',
    height: '14px',
    borderRadius: '2px',
  },
};
