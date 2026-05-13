import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, ArrowRight, Shield, RefreshCw, Copy } from 'lucide-react';
import { verifyEmail, resendVerificationCode } from '@/firebase/userAuth';

export default function VerifyPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [displayCode, setDisplayCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('ng_pending_email');
    const savedCode = sessionStorage.getItem('ng_verify_code');
    if (!pendingEmail) {
      navigate('/login');
      return;
    }
    setEmail(pendingEmail);
    if (savedCode) setDisplayCode(savedCode);
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verifyEmail(email, code);
    if (result.success) {
      setSuccess(true);
      sessionStorage.removeItem('ng_verify_code');
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
    if (result.success && result.code) {
      setDisplayCode(result.code);
      sessionStorage.setItem('ng_verify_code', result.code);
      setError('');
    } else {
      setError(result.error || 'Failed to generate new code');
    }
    setResending(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Shield size={22} style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Verify Your Email</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            We sent a code to <strong style={{ color: 'var(--text)' }}>{email}</strong>
          </p>
        </div>

        {/* Verification Code Display */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '10px' }}>Your Verification Code</p>
          <div className="flex items-center justify-center gap-3">
            <div style={{ display: 'flex', gap: '6px' }}>
              {displayCode.split('').map((digit, i) => (
                <div
                  key={i}
                  style={{
                    width: '40px',
                    height: '48px',
                    borderRadius: '8px',
                    background: 'rgba(56,138,177,0.08)',
                    border: '1px solid rgba(56,138,177,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    color: 'var(--accent)',
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <button
              onClick={copyCode}
              className="cursor-pointer border-none bg-transparent"
              style={{ color: copied ? '#22c55e' : 'var(--text-muted)', padding: '6px', transition: 'color 0.2s' }}
              title="Copy code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '10px' }}>Enter this code below to verify</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="bg-transparent border-none outline-none"
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
              color: 'var(--text)',
              fontSize: '1.3rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.3em',
              textAlign: 'center',
            }}
          />

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
            {loading ? 'Verifying...' : 'Verify'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4" style={{ marginTop: '18px' }}>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <RefreshCw size={12} /> {resending ? 'Generating...' : 'New Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
