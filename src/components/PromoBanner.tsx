import { useState, useEffect } from 'react';
import { X, Tag, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ng_promo_dismissed');
    if (dismissed) setVisible(false);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('ng_promo_dismissed', 'true');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('PEP26');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, #388ab1, #2a7a9e, #388ab1)',
      position: 'relative',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        animation: 'shimmer 3s infinite',
      }} />
      
      <div className="max-w-7xl mx-auto px-4 py-2 relative" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <Sparkles size={14} style={{ color: '#fff', flexShrink: 0 }} />
        <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>
          First Order Special:
        </span>
        <button
          onClick={handleCopy}
          className="cursor-pointer border-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '1px dashed rgba(255,255,255,0.5)',
            color: '#fff',
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
        >
          <Tag size={10} style={{ display: 'inline', marginRight: '4px' }} />
          {copied ? 'Copied!' : 'PEP26'}
        </button>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
          25% off your first order!
        </span>
        <button
          onClick={handleDismiss}
          className="bg-transparent border-none cursor-pointer"
          style={{ color: 'rgba(255,255,255,0.6)', padding: '2px', marginLeft: '8px' }}
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
