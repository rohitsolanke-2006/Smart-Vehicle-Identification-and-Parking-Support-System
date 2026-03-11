import React, { useState, useRef } from 'react';

/**
 * CampusMap — Real Google Maps satellite photo of VIT Bibwewadi as background.
 * Image: /campus_map.jpg (831 × 862 px)
 *
 * 📍 COORDINATE PICKER MODE: Click the "Pick Coordinates" button in the header,
 * then hover over any parking area on the map. The x,y pixel coordinates will
 * display live — read them out to place zones perfectly.
 */

const ZONE_KEY_MAP = {
  'Zone A': 'zoneA',
  'Zone B': 'zoneB',
  'Zone C': 'zoneC',
  'Zone D': 'zoneD',
  'Zone E': 'zoneE',
};

const IMG_W = 831;
const IMG_H = 862;

function getZoneKey(zoneName = '') {
  for (const [k, v] of Object.entries(ZONE_KEY_MAP)) {
    if (zoneName.startsWith(k)) return v;
  }
  return null;
}

function statusColor(pct) {
  if (pct >= 90) return { fill: '#fca5a5', stroke: '#dc2626', text: '#7f1d1d', label: 'FULL' };
  if (pct >= 60) return { fill: '#fde68a', stroke: '#d97706', text: '#78350f', label: 'BUSY' };
  return { fill: '#6ee7b7', stroke: '#059669', text: '#064e3b', label: 'OPEN' };
}

export default function CampusMap({ zones = [] }) {
  const [tooltip, setTooltip] = useState(null);
  const [pickerMode, setPickerMode] = useState(false);
  const [pickerCoords, setPickerCoords] = useState(null);
  const svgRef = useRef(null);

  const zoneData = {};
  zones.forEach(z => {
    const key = getZoneKey(z.name || z.zone_name || '');
    if (key) zoneData[key] = z;
  });

  function getColors(key) {
    const z = zoneData[key];
    if (!z) return { fill: '#e2e8f0', stroke: '#94a3b8', text: '#475569', label: '–', opacity: 0.55 };
    const pct = z.occupancy_percent ?? Math.round((z.occupied / z.capacity) * 100);
    return { ...statusColor(pct), opacity: 0.60 };
  }

  function handleHover(e, key) {
    const z = zoneData[key];
    if (!z) return;
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    setTooltip({
      svgX: (e.clientX - svgRect.left) * (IMG_W / svgRect.width),
      svgY: (e.clientY - svgRect.top) * (IMG_H / svgRect.height),
      zone: z,
    });
  }

  function handlePickerMove(e) {
    if (!pickerMode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (IMG_W / rect.width));
    const y = Math.round((e.clientY - rect.top) * (IMG_H / rect.height));
    setPickerCoords({ x, y });
  }

  /** Renders a single interactive parking zone polygon */
  function Zone({ id, points, label, cx, cy, dashed = false, staff = false }) {
    const c = getColors(id);
    const opacity = staff ? (c.opacity * 0.6) : c.opacity;
    return (
      <g
        style={{ cursor: 'pointer' }}
        onMouseMove={e => handleHover(e, id)}
        onMouseLeave={() => setTooltip(null)}
      >
        <polygon
          points={points}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth={dashed ? '2' : '2.5'}
          strokeDasharray={dashed ? '7 4' : undefined}
          opacity={opacity}
          style={{ transition: 'opacity 0.25s' }}
        />
        {label && (
          <>
            <text
              x={cx} y={cy - 7}
              textAnchor="middle" fontSize="12" fontWeight="800"
              stroke="white" strokeWidth="4" paintOrder="stroke"
              fill={c.text}
              fontStyle={staff ? 'italic' : 'normal'}
              style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
            >{label}</text>
            <text
              x={cx} y={cy + 9}
              textAnchor="middle" fontSize="11" fontWeight="700"
              stroke="white" strokeWidth="3" paintOrder="stroke"
              fill={c.text}
              style={{ pointerEvents: 'none', fontFamily: 'Inter, sans-serif' }}
            >{c.label}</text>
          </>
        )}
      </g>
    );
  }

  /* ── TOOLTIP ─────────────────────────────────────────────── */
  function Tooltip() {
    if (!tooltip) return null;
    const z = tooltip.zone;
    const pct = z.occupancy_percent ?? Math.round((z.occupied / z.capacity) * 100);
    const c = statusColor(pct);
    const free = z.free_space ?? (z.capacity - z.occupied);
    const tw = 200, th = 100;
    const tx = Math.min(Math.max(tooltip.svgX + 14, 6), IMG_W - tw - 6);
    const ty = Math.max(tooltip.svgY - th - 10, 6);
    return (
      <g style={{ pointerEvents: 'none' }}>
        <rect x={tx + 2} y={ty + 2} width={tw} height={th} rx="8" fill="black" opacity="0.18" />
        <rect x={tx} y={ty} width={tw} height={th} rx="8" fill="white" stroke="#e2e8f0" strokeWidth="1" />
        <rect x={tx} y={ty} width={tw} height="5" rx="4" fill={c.stroke} />
        <text x={tx + 11} y={ty + 23} fontSize="12" fontWeight="700" fill="#1e293b" fontFamily="Inter, sans-serif">
          {z.name || z.zone_name}
        </text>
        <text x={tx + 11} y={ty + 41} fontSize="11" fill="#64748b" fontFamily="Inter, sans-serif">
          {`${free} free · ${z.capacity} total`}
        </text>
        <rect x={tx + 11} y={ty + 52} width={tw - 22} height="8" rx="4" fill="#f1f5f9" />
        <rect x={tx + 11} y={ty + 52} width={Math.max(4, (pct / 100) * (tw - 22))} height="8" rx="4" fill={c.stroke} opacity="0.8" />
        <text x={tx + 11} y={ty + 78} fontSize="11" fontWeight="700" fill={c.text} fontFamily="Inter, sans-serif">
          ● {c.label} — {pct}% occupied
        </text>
      </g>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div style={styles.header}>
        <h2 style={styles.title}>Live Campus Parking Map</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setPickerMode(p => !p); setPickerCoords(null); }}
          style={{
            background: pickerMode ? '#1e293b' : '#f1f5f9',
            color: pickerMode ? '#ffffff' : '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '7px',
            padding: '5px 13px',
            fontSize: '0.78rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {pickerMode ? 'Exit Picker' : 'Pick Coordinates'}
        </button>
        <div style={styles.legend}>
          <LegendDot color="#6ee7b7" stroke="#059669" label="Available" />
          <LegendDot color="#fde68a" stroke="#d97706" label="Busy 60%+" />
          <LegendDot color="#fca5a5" stroke="#dc2626" label="Full 90%+" />
        </div>
        </div>
      </div>

      {/* ── MAP ─────────────────────────────────────────────── */}
      <div style={styles.mapWrap}>
        {pickerMode && pickerCoords && (
          <div style={styles.coordBanner}>
            x: <strong>{pickerCoords.x}</strong> &nbsp; y: <strong>{pickerCoords.y}</strong>
            <span style={{ marginLeft: '10px', color: '#94a3b8', fontSize: '0.72rem' }}>
              — hover corners of a parking area, then tell me each coordinate
            </span>
          </div>
        )}
        {pickerMode && !pickerCoords && (
          <div style={{ ...styles.coordBanner, color: '#f59e0b' }}>
            Picker active — hover over the parking spots on the map
          </div>
        )}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          style={{ ...styles.svg, cursor: pickerMode ? 'crosshair' : 'default' }}
          xmlns="http://www.w3.org/2000/svg"
          onMouseMove={handlePickerMove}
          onMouseLeave={() => setPickerCoords(null)}
        >
          {/* Real satellite photo */}
          <image
            href="/campus_map.jpg"
            x="0" y="0"
            width={IMG_W} height={IMG_H}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* ── PARKING ZONES ─────────────────────────────────── */}

          {/* Zone A — 2-Wheeler Lot (big, parallel to main building) */}
          <Zone
            id="zoneA"
            points="516,291 491,351 701,344 736,284"
            label="Zone A · 2W"
            cx={611} cy={318}
          />

          {/* Zone B — Car Parking */}
          <Zone
            id="zoneB"
            points="423,409 700,396 715,445 423,439"
            label="Zone B · Cars"
            cx={565} cy={422}
          />

          {/* Zone C — Road-side 2W Parking (traces the full road corridor;
                       dashed stroke = road with parking on both sides, open centre) */}
          <Zone
            id="zoneC"
            points="415,476 708,470 794,187 824,186 823,304 794,309 781,485 418,490"
            label="Zone C · 2W Road"
            cx={700} cy={330}
            dashed={true}
          />

          {/* Zone D — Staff 2-Wheeler (optional, lower opacity) */}
          <Zone
            id="zoneD"
            points="158,630 229,715 310,669 249,640"
            label="Zone D · Staff"
            cx={236} cy={663}
            staff={true}
          />

          {/* Live crosshair in picker mode */}
          {pickerMode && pickerCoords && (
            <g style={{ pointerEvents: 'none' }}>
              <line x1={pickerCoords.x} y1={0} x2={pickerCoords.x} y2={IMG_H} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
              <line x1={0} y1={pickerCoords.y} x2={IMG_W} y2={pickerCoords.y} stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
              <circle cx={pickerCoords.x} cy={pickerCoords.y} r="5" fill="#f43f5e" opacity="0.9" />
              <rect
                x={Math.min(pickerCoords.x + 8, IMG_W - 120)}
                y={Math.max(pickerCoords.y - 28, 4)}
                width="112" height="24" rx="5"
                fill="#1e293b" opacity="0.9"
              />
              <text
                x={Math.min(pickerCoords.x + 14, IMG_W - 114)}
                y={Math.max(pickerCoords.y - 11, 20)}
                fontSize="12" fontWeight="700" fill="white"
                fontFamily="Inter, monospace"
              >
                {pickerCoords.x}, {pickerCoords.y}
              </text>
            </g>
          )}

          <Tooltip />
        </svg>
      </div>
    </div>
  );
}

function LegendDot({ color, stroke, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <div style={{ width: 13, height: 13, borderRadius: 3, background: color, border: `2px solid ${stroke}` }} />
      <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>{label}</span>
    </div>
  );
}

const styles = {
  wrapper: {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '2.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.75rem',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  legend: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  mapWrap: {
    background: '#020617',
  },
  coordBanner: {
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#f8fafc',
    padding: '0.625rem 1.25rem',
    fontSize: '0.85rem',
    fontFamily: 'Space Grotesk, monospace',
    borderBottom: '1px solid var(--border-color)',
    backdropFilter: 'blur(10px)',
  },
  svg: {
    width: '100%',
    height: 'auto',
    maxHeight: '600px',
    display: 'block',
  },
};
