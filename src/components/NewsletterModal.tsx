import { useState, useEffect } from 'react';
import { X, Mail, Check, Bell } from 'lucide-react';

export default function NewsletterModal() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('ng_newsletter_dismissed');
    const subscribed = localStorage.getItem('ng_newsletter_subscribed');
    if (!dismissed && !subscribed) {
      const t = setTimeout(() => setShow(true), 8000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleSubmit = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    localStorage.setItem('ng_newsletter_subscribed', email);
    setSubmitted(true);
    setTimeout(() => setShow(false), 2000);
  };

  const dismiss = () => {
    localStorage.setItem('ng_newsletter_dismissed', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }} style={{ zIndex: 10000 }}>
      <div className="modal" style={{ maxWidth: '420px', width: '90vw', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
        <button onClick={dismiss} className="absolute bg-transparent border-none cursor-pointer" style={{ top: '16px', right: '16px', color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>

        <div className="mx-auto mb-4 flex items-center justify-center"
          style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(56,138,177,0.1)', color: 'var(--accent)' }}>
          <Bell size={24} />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Stay Ahead in Research</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
          Get exclusive deals, new product alerts, and research insights delivered to your inbox.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2" style={{ color: '#22c55e', fontWeight: 700 }}>
            <Check size={18} /> You're subscribed!
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <Mail size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your email" className="bg-transparent border-none outline-none w-full"
                  style={{ color: 'var(--text)', fontSize: '0.85rem' }} />
              </div>
              <button onClick={handleSubmit}
                className="cursor-pointer border-none"
                style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}>
                Subscribe
              </button>
            </div>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '10px' }}>
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
