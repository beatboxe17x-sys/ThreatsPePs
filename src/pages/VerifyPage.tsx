import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Check, AlertCircle, RefreshCw, ArrowRight, Shield } from 'lucide-react';
import { verifyEmail, resendVerificationCode } from '@/firebase/userAuth';

export default function VerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('ng_pending_email');
    if (!pendingEmail) {
      navigate('/login');
      return;
    }
    setEmail(pendingEmail);
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyEmail(email, code);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } else {
      setError(result.error || 'Verification failed');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    const result = await resendVerificationCode(email);
    if (result.success) {
      setError('');
      // Show new code for now (until email service is added)
      alert(`Your new verification code is: ${result.code}\n\n(For testing - this will be emailed in production)`);
    } else {
      setError(result.error || 'Failed to resend');
    }
    setResending(false);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={28} style={{ color: '#22c55e' }} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Email Verified</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Redirecting you to the shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Shield size={24} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Verify Your Email</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            We sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>
        </div>

        {/* Code display for testing */}
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
            DEV MODE: Check your console for the code or click Resend
          </p>
        </div>

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="bg-transparent border-none outline-none"
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '14px 16px',
                color: 'var(--text)',
                fontSize: '1.5rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textAlign: 'center',
              }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#ef4444', fontSize: '0.8rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full flex items-center justify-center gap-2 cursor-pointer border-none transition-all duration-300"
            style={{
              background: code.length === 6 ? 'var(--accent)' : 'rgba(56,138,177,0.15)',
              color: code.length === 6 ? '#fff' : 'var(--text-muted)',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: code.length === 6 ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600, margin: '0 auto' }}
          >
            <RefreshCw size={12} /> {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
