import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';

const DEMO = [
  { label: 'Student', email: 'om@vit.edu',      password: 'testpass123', role: 'student' },
  { label: 'Guard',   email: 'guard@vit.edu',   password: 'testpass123', role: 'guard'   },
  { label: 'Manager', email: 'manager@vit.edu', password: 'testpass123', role: 'manager' },
];

const FEATURES = [
  {
    label: 'Live Satellite Map',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  {
    label: 'ML Occupancy AI',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    label: 'ANPR Vision',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  },
  {
    label: 'Spot Pre-Booking',
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
];

export default function LoginPage() {
  const [tab,     setTab]     = useState('login');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm,   setRegForm]   = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', vehicle_reg: '', student_id: '',
  });

  const { login } = useAuth();
  const navigate  = useNavigate();

  const msg = (text, type = 'error') => setMessage({ text, type });

  const fillDemo = (d) => {
    setLoginForm({ email: d.email, password: d.password });
    setTab('login');
    setMessage({ text: '', type: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); msg('', '');
    try {
      const user = await login(loginForm.email, loginForm.password);
      if      (user.role === 'student') navigate('/student');
      else if (user.role === 'guard')   navigate('/guard');
      else if (user.role === 'manager') navigate('/manager');
    } catch (err) {
      msg(err.message || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) return msg('Passwords do not match.');
    if (regForm.password.length < 6) return msg('Password must be at least 6 characters.');
    setLoading(true); msg('', '');
    try {
      await apiRegister({
        name: regForm.name, email: regForm.email,
        password: regForm.password, role: regForm.role,
        vehicle_reg: regForm.vehicle_reg || undefined,
        student_id:  regForm.student_id  || undefined,
      });
      const user = await login(regForm.email, regForm.password);
      if      (user.role === 'student') navigate('/student');
      else if (user.role === 'guard')   navigate('/guard');
      else if (user.role === 'manager') navigate('/manager');
    } catch (err) {
      msg(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.bgShardA} />
      <div style={s.bgShardB} />
      <div style={s.bgGrid} />

      {/* Left brand panel */}
      <div style={s.brand}>
        <div style={s.brandContent} className="animate-slide-up">
          <div style={s.brandLogo}>
            <div style={s.brandLogoInner}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2"/>
                <circle cx="7" cy="15" r="2"/>
                <circle cx="17" cy="15" r="2"/>
                <path d="M15 11V7a4 4 0 0 0-8 0v4"/>
              </svg>
            </div>
          </div>

          <div style={s.brandEyebrow}>VIT Bibwewadi — SE Course Project</div>
          <h1 style={s.brandTitle}>
            Smart<br />
            <span style={{ background: 'linear-gradient(135deg, #2F81F7 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'block', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', lineHeight: 'inherit' }}>
              Campus Parking
            </span>
          </h1>
          <p style={s.brandDesc}>
            Real-time occupancy monitoring, ML predictions, ANPR plate scanning, and intelligent spot pre-booking — all in one place.
          </p>

          <div style={s.featGrid}>
            {FEATURES.map(f => (
              <div key={f.label} style={s.feat}>
                <span style={{ color: '#2F81F7', display: 'flex', flexShrink: 0 }}>{f.icon}</span>
                <span style={s.featLabel}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={s.formSide}>
        <div style={s.card} className="animate-slide-up">

          <div style={s.tabs}>
            {[['login', 'Sign In'], ['register', 'Create Account']].map(([t, label]) => (
              <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}
                onClick={() => { setTab(t); setMessage({ text: '', type: '' }); }}>
                {label}
              </button>
            ))}
          </div>

          {message.text && (
            <div style={{ ...s.alert, ...(message.type === 'success' ? s.alertSuccess : s.alertError) }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {message.text}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <Field label="Email" type="email" placeholder="you@vit.edu" id="l-email"
                value={loginForm.email} onChange={v => setLoginForm(p => ({...p, email: v}))} />
              <Field label="Password" type="password" placeholder="••••••••" id="l-pass"
                value={loginForm.password} onChange={v => setLoginForm(p => ({...p, password: v}))} />
              <button type="submit" className="btn-primary mt-4" disabled={loading}>
                {loading ? <Spinner /> : 'Sign In'}
              </button>
              <div style={s.demoSection}>
                <div style={s.divider}><span style={s.dividerText}>Quick Demo Access</span></div>
                <div style={s.demoBtns}>
                  {DEMO.map(d => (
                    <button key={d.label} type="button" style={s.demoBtn} onClick={() => fillDemo(d)}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={s.grid2}>
                <Field label="Full Name" type="text" placeholder="Jane Doe" id="r-name"
                  value={regForm.name} onChange={v => setRegForm(p => ({...p, name: v}))} />
                <Field label="Email" type="email" placeholder="jane@vit.edu" id="r-email"
                  value={regForm.email} onChange={v => setRegForm(p => ({...p, email: v}))} />
              </div>
              <div style={s.grid2}>
                <Field label="Password" type="password" placeholder="Min 6 chars" id="r-pass"
                  value={regForm.password} onChange={v => setRegForm(p => ({...p, password: v}))} />
                <Field label="Confirm" type="password" placeholder="Repeat" id="r-confirm"
                  value={regForm.confirmPassword} onChange={v => setRegForm(p => ({...p, confirmPassword: v}))} />
              </div>
              <div style={{ marginTop: '0.25rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Role</label>
                <div style={s.rolePills}>
                  {['student', 'guard', 'manager'].map(r => (
                    <button key={r} type="button"
                      style={{ ...s.rolePill, ...(regForm.role === r ? s.rolePillActive : {}) }}
                      onClick={() => setRegForm(p => ({...p, role: r}))}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {regForm.role === 'student' && (
                <div style={s.grid2}>
                  <Field label="Student ID (optional)" type="text" placeholder="STU044" id="r-sid"
                    required={false} value={regForm.student_id} onChange={v => setRegForm(p => ({...p, student_id: v}))} />
                  <Field label="Vehicle Reg (optional)" type="text" placeholder="MH12AB1234" id="r-vreg"
                    required={false} value={regForm.vehicle_reg} onChange={v => setRegForm(p => ({...p, vehicle_reg: v.toUpperCase()}))} />
                </div>
              )}
              <button type="submit" className="btn-primary mt-4" disabled={loading}>
                {loading ? <Spinner /> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, id, required = true }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value}
        required={required} onChange={e => onChange(e.target.value)}
        className="form-control" />
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden', background: '#030507' },
  bgShardA: { position: 'absolute', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,129,247,0.11) 0%, transparent 65%)', top: '-20%', left: '-5%', pointerEvents: 'none' },
  bgShardB: { position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 65%)', bottom: '-20%', right: '35%', pointerEvents: 'none' },
  bgGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', maskImage: 'radial-gradient(ellipse 80% 80% at 20% 50%, black 30%, transparent 100%)' },
  brand: { flex: '0 0 48%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 4rem', position: 'relative', zIndex: 1, borderRight: '1px solid rgba(255,255,255,0.05)' },
  brandContent: { maxWidth: '420px' },
  brandLogo: { width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #2F81F7 0%, #7C3AED 100%)', padding: '3px', marginBottom: '2.5rem', boxShadow: '0 0 0 1px rgba(47,129,247,0.3), 0 8px 32px rgba(47,129,247,0.25)' },
  brandLogoInner: { width: '100%', height: '100%', borderRadius: '11px', background: '#0D1117', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandEyebrow: { fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(47,129,247,0.8)', marginBottom: '1rem', fontFamily: 'Inter, sans-serif' },
  brandTitle: { fontSize: 'clamp(2.75rem, 5vw, 3.75rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.05', color: '#F0F6FC', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif' },
  brandDesc: { fontSize: '1rem', lineHeight: '1.75', color: 'rgba(139,148,158,0.9)', marginBottom: '2.5rem', fontFamily: 'Inter, sans-serif' },
  featGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  feat: { display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' },
  featLabel: { fontSize: '0.85rem', fontWeight: '600', color: 'rgba(240,246,252,0.7)', fontFamily: 'Inter, sans-serif' },
  formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 },
  card: { width: '100%', maxWidth: '440px', padding: '2.5rem', background: 'rgba(13,17,23,0.92)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', backdropFilter: 'blur(48px)', WebkitBackdropFilter: 'blur(48px)', boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.07)' },
  tabs: { display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '10px', padding: '3px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.06)' },
  tab: { flex: 1, padding: '0.625rem 0', border: 'none', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', color: 'rgba(139,148,158,0.7)', transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif' },
  tabActive: { background: 'rgba(255,255,255,0.07)', color: '#F0F6FC', boxShadow: '0 1px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' },
  alert: { display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.875rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '500', marginBottom: '1.5rem', borderLeft: '3px solid transparent', fontFamily: 'Inter, sans-serif' },
  alertError:   { background: 'rgba(248,81,73,0.1)',  color: '#FF7B72', borderLeftColor: '#F85149' },
  alertSuccess: { background: 'rgba(63,185,80,0.1)',  color: '#7EE787', borderLeftColor: '#3FB950' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  rolePills: { display: 'flex', gap: '0.5rem' },
  rolePill: { flex: 1, padding: '0.625rem 0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'rgba(139,148,158,0.75)', transition: 'all 0.15s ease', fontFamily: 'Inter, sans-serif' },
  rolePillActive: { background: 'rgba(47,129,247,0.12)', color: '#79C0FF', borderColor: 'rgba(47,129,247,0.35)' },
  demoSection: { marginTop: '1.75rem' },
  divider: { position: 'relative', textAlign: 'center', marginBottom: '1rem' },
  dividerText: { fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(72,79,88,0.8)', background: 'rgba(13,17,23,0.92)', padding: '0 0.75rem', position: 'relative', zIndex: 1, fontFamily: 'Inter, sans-serif' },
  demoBtns: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' },
  demoBtn: { padding: '0.5rem 0', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600', color: 'rgba(139,148,158,0.75)', transition: 'all 0.15s ease', fontFamily: 'Inter, sans-serif' },
};
