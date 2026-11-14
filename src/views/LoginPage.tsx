import { useState, FormEvent } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

const VALID_EMAIL = 'admin@sentinel.io';
const VALID_PASSWORD = 'Sentinel@2026';

export function LoginPage({ onLoginSuccess, onBackToHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        onLoginSuccess();
      } else {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'inherit' }}>
      <style>{`
        .login-input {
          width: 100%;
          background: #1f2937;
          color: #fff;
          border: 1px solid #374151;
          border-radius: 6px;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #4b5563; }
        .login-input:focus { border-color: #0051d5; }
        .signin-btn {
          width: 100%;
          background: linear-gradient(135deg, #1e3a8a, #0051d5);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 13px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: filter 0.2s;
        }
        .signin-btn:hover:not(:disabled) { filter: brightness(1.2); }
        .signin-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .back-link {
          background: transparent;
          border: none;
          color: #60a5fa;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          font-weight: 500;
        }
        .back-link:hover { color: #93c5fd; }
      `}</style>

      {/* Branding */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, letterSpacing: '0.12em', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
          SENTINEL
        </div>
        <div style={{ color: '#64748b', fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em' }}>
          Enterprise Security Operations
        </div>
      </div>

      {/* Login Card */}
      <div style={{ width: '100%', maxWidth: '420px', background: '#111827', border: '1px solid #1e3a8a', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', padding: '36px 32px' }}>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 28px', textAlign: 'center' }}>
          Operator Sign In
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '7px', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <input
              className="login-input"
              type="email"
              placeholder="admin@sentinel.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '7px', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid #dc2626', borderRadius: '6px', padding: '10px 14px', marginBottom: '18px', color: '#f87171', fontSize: '13px', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <button className="signin-btn" type="submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo hint */}
        <div style={{ marginTop: '18px', textAlign: 'center', color: '#374151', fontSize: '12px', lineHeight: 1.6 }}>
          Demo: <span style={{ color: '#4b5563', fontFamily: 'monospace' }}>admin@sentinel.io</span> /{' '}
          <span style={{ color: '#4b5563', fontFamily: 'monospace' }}>Sentinel@2026</span>
        </div>
      </div>

      {/* Back to Home */}
      <div style={{ marginTop: '24px' }}>
        <button className="back-link" onClick={onBackToHome}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
