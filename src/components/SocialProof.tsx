import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

const events = [
  { name: 'Dr. Martinez', loc: 'California', product: 'BPC-157', time: 'just now' },
  { name: 'Sarah K.', loc: 'New York', product: 'GHK-Cu', time: '2 min ago' },
  { name: 'James T.', loc: 'Texas', product: 'Retatrutide', time: '5 min ago' },
  { name: 'Dr. Chen', loc: 'Florida', product: 'Sermorelin', time: '8 min ago' },
  { name: 'Alex R.', loc: 'Washington', product: 'Semax', time: '12 min ago' },
  { name: 'Dr. Patel', loc: 'Illinois', product: 'BPC-157', time: '15 min ago' },
  { name: 'Lisa M.', loc: 'Arizona', product: 'Selank', time: '18 min ago' },
  { name: 'Mike D.', loc: 'Oregon', product: 'Tirzepatide', time: '21 min ago' },
  { name: 'Dr. Wilson', loc: 'Colorado', product: 'GHK-Cu', time: '25 min ago' },
  { name: 'Chris B.', loc: 'Georgia', product: 'Retatrutide', time: '30 min ago' },
];

export default function SocialProof() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show first notification after 8 seconds
    const first = setTimeout(() => {
      setVisible(true);
    }, 8000);

    // Rotate every 12 seconds
    const rotate = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % events.length);
        setVisible(true);
      }, 500);
    }, 12000);

    return () => { clearTimeout(first); clearInterval(rotate); };
  }, []);

  const ev = events[current];

  if (!visible) return null;

  return (
    <div
      className="social-proof-toast"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        zIndex: 4000,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        maxWidth: '320px',
        animation: 'socialProofIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ShoppingBag size={16} color="#fff" />
      </div>
      <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
        <span style={{ fontWeight: 600 }}>{ev.name}</span> from <span style={{ color: 'var(--text-muted)' }}>{ev.loc}</span>
        <br />
        <span style={{ color: 'var(--accent)' }}>purchased {ev.product}</span>
        <br />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{ev.time}</span>
      </div>
    </div>
  );
}
