import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertTriangle } from 'lucide-react';

export default function AgeGate() {
  const navigate = useNavigate();
  const [age21, setAge21] = useState(false);
  const [researchOnly, setResearchOnly] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);

  const allChecked = age21 && researchOnly && agreeTos;

  const handleEnter = () => {
    if (!allChecked) return;
    sessionStorage.setItem('ng_age_verified', 'true');
    navigate('/intro', { replace: true });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 10, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(15,31,53,0.95)',
          border: '1px solid rgba(56,138,177,0.15)',
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56,138,177,0.1)',
              border: '1px solid rgba(56,138,177,0.2)',
              borderRadius: '50px',
              padding: '4px 14px',
              marginBottom: '12px',
              fontSize: '0.65rem',
              fontWeight: 600,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <AlertTriangle size={10} />
            Age Verification
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Verify Before Entering</h1>
        </div>

        {/* Compact Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <CompactCheck checked={age21} onChange={setAge21} text="I am at least 21 years old" />
          <CompactCheck checked={researchOnly} onChange={setResearchOnly} text="Research use only — NOT for human consumption" />
          <CompactCheck checked={agreeTos} onChange={setAgreeTos} text="I agree to the Terms of Service" />
        </div>

        {/* Mini TOS */}
        <div
          style={{
            maxHeight: '100px',
            overflowY: 'auto',
            background: 'rgba(10,22,40,0.5)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '16px',
            fontSize: '0.65rem',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
          }}
        >
          <strong style={{ color: 'var(--text)', fontSize: '0.7rem' }}>TERMS</strong> All products are for laboratory research only. Not for human consumption. No medical claims. Must be 21+. You are responsible for compliance with all applicable laws. Products have not been evaluated by the FDA.
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          disabled={!allChecked}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: allChecked ? 'pointer' : 'not-allowed',
            background: allChecked ? 'var(--accent)' : 'rgba(56,138,177,0.15)',
            color: allChecked ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            if (allChecked) e.currentTarget.style.background = '#2d6f8f';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = allChecked ? 'var(--accent)' : 'rgba(56,138,177,0.15)';
          }}
        >
          {allChecked ? 'Enter Website' : 'Check all boxes to continue'}
        </button>
      </div>
    </div>
  );
}

function CompactCheck({ checked, onChange, text }: { checked: boolean; onChange: (v: boolean) => void; text: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '8px 10px',
        borderRadius: '8px',
        border: checked ? '1px solid rgba(56,138,177,0.4)' : '1px solid var(--border)',
        background: checked ? 'rgba(56,138,177,0.06)' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: checked ? '2px solid var(--accent)' : '2px solid var(--border)',
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
      >
        {checked && <Check size={11} style={{ color: '#fff' }} />}
      </div>
      <span style={{ fontSize: '0.8rem', color: checked ? 'var(--text)' : 'var(--text-muted)' }}>{text}</span>
    </button>
  );
}
