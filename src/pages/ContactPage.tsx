import { useState } from 'react';
import { Mail, MessageCircle, Send, Check, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.firstName || !form.email || !form.message) return;
    // Send to Discord webhook
    const payload = {
      content: `**New Contact Form Submission**\n**Name:** ${form.firstName} ${form.lastName}\n**Email:** ${form.email}\n**Phone:** ${form.phone || 'N/A'}\n**Message:** ${form.message}`,
    };
    const WEBHOOK_URL = 'https://discordapp.com/api/webhooks/1362854895940022284/mtJd2kKT8bQH02JeN1io5mTFmK21lF_4wdN0skDzDMi2aRTuLnNlFDfuE-7Fpx_g5LJq';
    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    setSent(true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', paddingTop: '140px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 var(--container-pad)' }}>
        <Link to="/" className="flex items-center gap-2 mb-8 no-underline transition-colors duration-300"
          style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <h1 className="mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1px' }}>Get in Touch</h1>
        <p className="mb-8" style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px' }}>
          Have questions about our products, shipping, or research applications? We're here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: <Mail size={20} />, title: 'Email', val: 'atlasecomsales@gmail.com', href: 'mailto:atlasecomsales@gmail.com' },
            { icon: <MessageCircle size={20} />, title: 'Discord', val: 'Join Community', href: 'https://discord.gg/4hENXJWUax' },
            { icon: <Clock size={20} />, title: 'Response Time', val: 'Within 24 hours', href: undefined },
          ].map(c => (
            <a key={c.title} href={c.href} target={c.href?.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              className="no-underline flex flex-col items-center text-center gap-2 transition-all duration-200"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', color: 'var(--text)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div style={{ color: 'var(--accent)' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.val}</div>
            </a>
          ))}
        </div>

        {sent ? (
          <div className="text-center py-10" style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div className="mx-auto mb-4 flex items-center justify-center"
              style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}>
              <Check size={28} style={{ color: '#22c55e' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Message Sent!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>First Name *</label>
                <input type="text" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  className="w-full outline-none" placeholder="John"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', fontSize: '0.9rem' }} />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Name</label>
                <input type="text" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  className="w-full outline-none" placeholder="Doe"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', fontSize: '0.9rem' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full outline-none" placeholder="john@example.com"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', fontSize: '0.9rem' }} />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full outline-none" placeholder="(555) 123-4567"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', fontSize: '0.9rem' }} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1.5" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={5} placeholder="How can we help you?"
                className="w-full outline-none resize-none"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', color: 'var(--text)', fontSize: '0.9rem' }} />
            </div>
            <button onClick={handleSubmit}
              className="w-full cursor-pointer border-none flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff', padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}>
              <Send size={16} /> Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
