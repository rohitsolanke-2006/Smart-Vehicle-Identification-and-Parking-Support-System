import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';

const DEMO = [
  { label: 'Student',  email: 'om@vit.edu',      password: 'testpass123', role: 'student' },
  { label: 'Guard',    email: 'guard@vit.edu',    password: 'testpass123', role: 'guard'   },
  { label: 'Manager',  email: 'manager@vit.edu',  password: 'testpass123', role: 'manager' },
];

export default function LoginPage() {
  const [tab,      setTab]      = useState('login'); // 'login' | 'register'
  const [message,  setMessage]  = useState({ text: '', type: '' });
  const [loading,  setLoading]  = useState(false);

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register state
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', vehicle_reg: '', student_id: '',
  });

  const { login } = useAuth();
  const navigate  = useNavigate();

  /* ── Helpers ─────────────────────────────────────────────── */
  const msg = (text, type = 'error') => setMessage({ text, type });

  const fillDemo = (d) => {
    setLoginForm({ email: d.email, password: d.password });
    setTab('login');
    setMessage({ text: '', type: '' });
  };

  /* ── Login ───────────────────────────────────────────────── */
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

  /* ── Register ────────────────────────────────────────────── */
  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      return msg('Passwords do not match.');
    }
    if (regForm.password.length < 6) {
      return msg('Password must be at least 6 characters.');
    }
    setLoading(true); msg('', '');
    try {
      await apiRegister({
        name:        regForm.name,
        email:       regForm.email,
        password:    regForm.password,
        role:        regForm.role,
        vehicle_reg: regForm.vehicle_reg || undefined,
        student_id:  regForm.student_id  || undefined,
      });
      // Auto-login after register
      const user = await login(regForm.email, regForm.password);
      if      (user.role === 'student') navigate('/student');
      else if (user.role === 'guard')   navigate('/guard');
      else if (user.role === 'manager') navigate('/manager');
    } catch (err) {
      msg(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div style={s.page}>
      {/* Left panel — branding */}
      <div style={s.brand}>
        <div style={s.brandInner}>
          <h1 style={s.brandTitle}>SmartCampus<br/>Parking</h1>
          <p style={s.brandSub}>
            AI-powered parking management for VIT Bibwewadi.<br/>
            Real-time zones · ANPR · Smart booking.
          </p>
          <div style={s.features}>
            {['Live Satellite Map','ML Occupancy Prediction','ANPR Plate Scan','Virtual Queue','PDF Reports'].map(f => (
              <div key={f} style={s.feat}>{f}</div>
            ))}
          </div>
          <div style={s.footer}>
            <span style={s.footerText}>Built for VIT Bibwewadi</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={s.formSide}>
        <div style={s.card}>
          {/* Project tag */}
          <div style={s.projectTag}>SE Course Project · VIT Bibwewadi</div>

          {/* Tab switcher */}
          <div style={s.tabs}>
            {['login','register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setMessage({ text:'',type:'' }); }}
                style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Alert */}
          {message.text && (
            <div style={{ ...s.alert, ...(message.type === 'success' ? s.alertSuccess : s.alertError) }}>
              {message.text}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={s.form}>
              <Field label="Email" type="email" placeholder="your@vit.edu" id="login-email"
                value={loginForm.email} onChange={v => setLoginForm(p => ({...p, email: v}))} />
              <Field label="Password" type="password" placeholder="••••••••" id="login-pass"
                value={loginForm.password} onChange={v => setLoginForm(p => ({...p, password: v}))} />

              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              {/* Demo quick-fill */}
              <div style={s.demoBox}>
                <p style={s.demoLabel}>Quick demo access:</p>
                <div style={s.demoBtns}>
                  {DEMO.map(d => (
                    <button key={d.label} type="button" onClick={() => fillDemo(d)} style={s.demoBtn}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <p style={s.demoHint}>
                  All demo passwords: <code style={s.code}>testpass123</code>
                </p>
              </div>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={s.form}>
              <Field label="Full Name" type="text" placeholder="e.g. Rahul Sharma" id="reg-name"
                value={regForm.name} onChange={v => setRegForm(p => ({...p, name: v}))} />
              <Field label="Email" type="email" placeholder="your@email.com" id="reg-email"
                value={regForm.email} onChange={v => setRegForm(p => ({...p, email: v}))} />

              <div style={s.grid2}>
                <Field label="Password" type="password" placeholder="Min 6 chars" id="reg-pass"
                  value={regForm.password} onChange={v => setRegForm(p => ({...p, password: v}))} />
                <Field label="Confirm Password" type="password" placeholder="Re-enter" id="reg-confirm"
                  value={regForm.confirmPassword} onChange={v => setRegForm(p => ({...p, confirmPassword: v}))} />
              </div>

              <div>
                <label style={s.label}>I am a</label>
                <div style={s.roleBtns}>
                  {['student','guard','manager'].map(r => (
                    <button key={r} type="button"
                      onClick={() => setRegForm(p => ({...p, role: r}))}
                      style={{ ...s.roleBtn, ...(regForm.role === r ? s.roleBtnActive : {}) }}>
                      {r === 'student' ? 'Student' : r === 'guard' ? 'Guard' : 'Manager'}
                    </button>
                  ))}
                </div>
              </div>

              {regForm.role === 'student' && (
                <div style={s.grid2}>
                  <Field label="Student ID (optional)" type="text" placeholder="e.g. STU044" id="reg-sid"
                    value={regForm.student_id} onChange={v => setRegForm(p => ({...p, student_id: v}))} />
                  <Field label="Vehicle Reg (optional)" type="text" placeholder="e.g. MH12AB1234" id="reg-vreg"
                    value={regForm.vehicle_reg} onChange={v => setRegForm(p => ({...p, vehicle_reg: v.toUpperCase()}))} />
                </div>
              )}

              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account & Sign In →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange, id }) {
  return (
    <div>
      <label htmlFor={id} style={s.label}>{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} required
        onChange={e => onChange(e.target.value)}
        style={s.input} />
    </div>
  );
}

const s = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Outfit, sans-serif',
    background: 'transparent',
  },

  /* Brand left */
  brand: {
    flex: '0 0 45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(59, 130, 246, 0.02)',
  },
  brandInner: { maxWidth: 400, position: 'relative', zIndex: 1 },
  logo: {
    fontSize: '4.5rem',
    marginBottom: '1.25rem',
    filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))',
  },
  brandTitle: {
    color: '#fff',
    fontSize: '3rem',
    fontWeight: '700',
    lineHeight: '1.1',
    margin: '0 0 1rem',
    letterSpacing: '-0.03em',
    fontFamily: 'Space Grotesk, sans-serif',
  },
  brandSub: {
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    fontWeight: '300',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  feat: {
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    padding: '0.85rem 1.25rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    backdropFilter: 'blur(10px)',
    transition: 'all var(--transition-fast)',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
  },
  footerText: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
  },

  /* Form right */
  formSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'transparent',
  },
  card: {
    width: '100%',
    maxWidth: 460,
    background: 'var(--bg-card)',
    backdropFilter: 'blur(16px)',
    borderRadius: '8px',
    padding: '2.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid var(--border-color)',
    position: 'relative',
  },
  projectTag: {
    fontSize: '0.75rem',
    color: 'var(--accent-hover)',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: '700',
    marginBottom: '1.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  /* Tabs */
  tabs: {
    display: 'flex',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 'var(--radius-lg)',
    padding: '6px',
    marginBottom: '2rem',
    gap: '6px',
    border: '1px solid var(--border-color)',
  },
  tab: {
    flex: 1,
    padding: '0.75rem 0',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    transition: 'all var(--transition-normal)',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    boxShadow: 'var(--shadow-sm)',
  },

  /* Alert */
  alert: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  alertError: {
    background: 'var(--status-red-light)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  alertSuccess: {
    background: 'var(--status-green-light)',
    color: '#86efac',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },

  /* Form */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
    transition: 'all var(--transition-normal)',
    boxSizing: 'border-box',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  submitBtn: {
    width: '100%',
    padding: '1.125rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Space Grotesk, sans-serif',
    letterSpacing: '0.02em',
    marginTop: '0.5rem',
    transition: 'all var(--transition-normal)',
  },

  /* Demo */
  demoBox: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    border: '1px solid var(--border-color)',
    marginTop: '1rem',
  },
  demoLabel: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    margin: '0 0 0.85rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  demoBtns: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  demoBtn: {
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: 'Outfit, sans-serif',
    color: 'var(--text-main)',
    transition: 'all var(--transition-fast)',
  },
  demoHint: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: '1rem 0 0',
  },
  code: {
    background: 'var(--accent-light)',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    color: 'var(--accent-hover)',
  },

  /* Role selector */
  roleBtns: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  roleBtn: {
    flex: 1,
    padding: '0.75rem 0',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: 'Outfit, sans-serif',
    color: 'var(--text-muted)',
    transition: 'all var(--transition-fast)',
  },
  roleBtnActive: {
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#60a5fa',
    border: '1px solid #3b82f6',
  },
};
