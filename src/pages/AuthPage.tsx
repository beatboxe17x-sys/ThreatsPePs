import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoggedIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate('/profile');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const result = await register(email, password, displayName || email.split('@')[0]);
      if (result.success) {
        // Show code and redirect to verify
        navigate('/verify');
        return;
      }
      setError(result.error || 'Registration failed');
    } else {
      const result = await login(email, password);
      if (result.success) {
        // Login successful
        return;
      }
      // Check if error is about verification
      if (result.error?.includes('verify')) {
        localStorage.setItem('ng_pending_email', email.toLowerCase());
        navigate('/verify');
        return;
      }
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/images/logo.png" alt="NG Research" style={{ height: '50px', marginBottom: '16px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {mode === 'login' ? 'Sign in to view your orders' : 'Register to track your purchases'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex" style={{ background: 'var(--bg-card)', borderRadius: '10px', padding: '4px', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer border-none transition-all duration-200"
            style={{
              background: mode === 'login' ? 'var(--accent)' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-muted)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <LogIn size={14} /> Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer border-none transition-all duration-200"
            style={{
              background: mode === 'register' ? 'var(--accent)' : 'transparent',
              color: mode === 'register' ? '#fff' : 'var(--text-muted)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            <UserPlus size={14} /> Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Display Name</label>
              <div className="flex items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                <User size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="bg-transparent border-none outline-none flex-1"
                  style={{ color: 'var(--text)', fontSize: '0.9rem', minWidth: 0 }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email</label>
            <div className="flex items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
              <Mail size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-transparent border-none outline-none flex-1"
                style={{ color: 'var(--text)', fontSize: '0.9rem', minWidth: 0 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
            <div className="flex items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
              <Lock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
                required
                className="bg-transparent border-none outline-none flex-1"
                style={{ color: 'var(--text)', fontSize: '0.9rem', minWidth: 0 }}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Confirm Password</label>
              <div className="flex items-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', gap: '10px' }}>
                <Lock size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="bg-transparent border-none outline-none flex-1"
                  style={{ color: 'var(--text)', fontSize: '0.9rem', minWidth: 0 }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#ef4444', fontSize: '0.8rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 cursor-pointer border-none transition-all duration-300"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
