import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, Mail, Phone, Instagram, Twitter, Youtube, Globe, Users, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { submitAffiliateApplication } from '@/discord/affiliateWebhook';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'tiktok', label: 'TikTok', icon: Users },
  { id: 'twitter', label: 'X / Twitter', icon: Twitter },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'other', label: 'Other', icon: Globe },
];

export default function AffiliatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', socialPlatform: 'instagram',
    socialHandle: '', followerCount: '', why: '', website: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.socialHandle || !form.why) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    const ok = await submitAffiliateApplication(form);
    if (ok) setSubmitted(true);
    else setError('Failed to submit. Please try again.');
    setLoading(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const inputStyle = { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--text)', fontSize: '0.9rem', outline: 'none' } as const;

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Application Submitted</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '12px 0 24px' }}>We'll review your application and get back to you via email within 48 hours.</p>
          <button onClick={() => navigate('/')} className="cursor-pointer border-none" style={{ background: 'var(--accent)', color: '#fff', padding: '12px 24px', borderRadius: '10px', fontWeight: 700 }}>Back to Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 16px' }}>
      <div style={{ maxWidth: '540px', margin: '0 auto', paddingTop: '80px' }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer border-none bg-transparent" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
          <ArrowLeft size={14} /> Back to Shop
        </button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '50px', padding: '4px 16px', fontSize: '0.7rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
            <Users size={12} /> Affiliate Program
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Become an Affiliate</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px' }}>Promote NG Research and earn commission on every sale</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="John Doe" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email *</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@email.com" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone *</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 234 567 8900" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Website (optional)</label>
              <input type="text" value={form.website} onChange={e => update('website', e.target.value)} placeholder="yourwebsite.com" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Primary Social Platform *</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map(p => {
                const Icon = p.icon;
                return (
                  <button key={p.id} type="button" onClick={() => update('socialPlatform', p.id)}
                    className="cursor-pointer border-none flex items-center gap-1.5"
                    style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: form.socialPlatform === p.id ? '#8b5cf6' : 'var(--bg-card)', color: form.socialPlatform === p.id ? '#fff' : 'var(--text-muted)', border: form.socialPlatform === p.id ? 'none' : '1px solid var(--border)', transition: 'all 0.2s' }}>
                    <Icon size={12} /> {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Social Handle *</label>
              <input type="text" value={form.socialHandle} onChange={e => update('socialHandle', e.target.value)} placeholder="@yourhandle" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Follower Count</label>
              <input type="text" value={form.followerCount} onChange={e => update('followerCount', e.target.value)} placeholder="10K+" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Why do you want to be an affiliate? *</label>
            <textarea value={form.why} onChange={e => update('why', e.target.value)} placeholder="Tell us about your audience and why you'd be a good fit..." rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {error && <div className="flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#ef4444', fontSize: '0.8rem' }}><AlertCircle size={14} /> {error}</div>}

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 cursor-pointer border-none" style={{ background: '#8b5cf6', color: '#fff', padding: '14px', borderRadius: '10px', fontWeight: 700, fontSize: '0.95rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting...' : 'Submit Application'} <Send size={16} />
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>Applications are reviewed within 48 hours. You'll receive a response via email.</p>
        </form>
      </div>
    </div>
  );
}
