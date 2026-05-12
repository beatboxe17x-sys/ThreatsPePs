import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldAlert, FlaskConical, FileText, AlertTriangle } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import { markVisitorConsented } from '@/firebase/visitor';
import type { ConsentLog } from '@/types';

export default function AgeGate() {
  const navigate = useNavigate();
  const { saveConsentLog } = useApp();
  const [age21, setAge21] = useState(false);
  const [researchOnly, setResearchOnly] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [logging, setLogging] = useState(false);

  const allChecked = age21 && researchOnly && agreeTos;

  const handleEnter = async () => {
    if (!allChecked || logging) return;
    setLogging(true);

    // Fetch IP address
    let ip = 'unknown';
    try {
      const res = await fetch('https://api64.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      ip = data.ip || 'unknown';
    } catch {
      ip = 'unavailable';
    }

    // Build rich consent log
    const logEntry: ConsentLog = {
      id: 'consent-' + Date.now(),
      ip,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      age21,
      researchOnly,
      agreeTos,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: Array.from(navigator.languages || []).join(', '),
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: String(navigator.doNotTrack || 'unspecified'),
      online: navigator.onLine,
      vendor: navigator.vendor || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      referrer: 'site-entry',
      plugins: Array.from(navigator.plugins || []).map(p => p.name).slice(0, 10),
      status: 'active',
    };

    // Save to Firebase (with localStorage fallback built into context)
    await saveConsentLog(logEntry);

    // Track visitor consent in visitor session
    markVisitorConsented(logEntry.id);

    // Mark age verified
    sessionStorage.setItem('ng_age_verified', 'true');

    // Go to intro
    navigate('/intro', { replace: true });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 10, 20, 0.97)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,138,177,0.15), transparent 70%)', top: '-10%', left: '-10%', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(77,184,232,0.1), transparent 70%)', bottom: '-5%', right: '-5%', filter: 'blur(80px)' }} />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '560px',
          background: 'linear-gradient(135deg, rgba(15,31,53,0.95), rgba(13,47,70,0.8))',
          border: '1px solid rgba(56,138,177,0.2)',
          borderRadius: '24px',
          padding: 'clamp(28px, 4vw, 48px)',
          boxShadow: '0 20px 80px rgba(0,0,0,0.6), 0 0 60px rgba(56,138,177,0.08)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(56,138,177,0.1)',
              border: '1px solid rgba(56,138,177,0.2)',
              borderRadius: '50px',
              padding: '6px 18px',
              marginBottom: '16px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent)',
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <ShieldAlert size={14} />
            Age & Legal Verification Required
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Verify Before Entering
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            You must meet the following requirements to access this website. Please read each statement carefully.
          </p>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
          <AgeCheck
            checked={age21}
            onChange={setAge21}
            icon={<AlertTriangle size={18} />}
            label="I am at least 21 years of age or older."
          />

          <AgeCheck
            checked={researchOnly}
            onChange={setResearchOnly}
            icon={<FlaskConical size={18} />}
            label="I understand these products are NOT for human consumption. They are intended for laboratory research purposes only."
          />

          <AgeCheck
            checked={agreeTos}
            onChange={setAgreeTos}
            icon={<FileText size={18} />}
            label="I have read and agree to the Terms of Service and Disclaimer below."
          />
        </div>

        {/* TOS Text */}
        <div
          style={{
            maxHeight: '160px',
            overflowY: 'auto',
            background: 'rgba(10,22,40,0.6)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '28px',
            fontSize: '0.75rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
          }}
        >
          <strong style={{ color: 'var(--text)' }}>TERMS OF SERVICE & DISCLAIMER</strong>
          <br /><br />
          By accessing this website, you agree to the following terms:
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>1. Age Requirement.</strong> You must be at least 21 years of age to purchase products from this website.
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>2. Research Use Only.</strong> All products sold on this website are intended strictly for laboratory research purposes. They are NOT for human consumption, veterinary use, or any other application involving living organisms.
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>3. No Medical Claims.</strong> None of the products on this website have been evaluated by the FDA or any other regulatory body. We make no claims regarding their safety or efficacy for any purpose.
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>4. Liability.</strong> NG Research is a chemical supplier. We are not a compounding pharmacy or outsourcing facility. We are not liable for any misuse of products purchased from this website.
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>5. Compliance.</strong> You are responsible for ensuring compliance with all applicable local, state, and federal laws regarding the purchase, possession, and use of research chemicals in your jurisdiction.
          <br /><br />
          <strong style={{ color: 'var(--text)' }}>6. Disclaimer.</strong> The statements and products on this website have not been evaluated by the Food and Drug Administration. The products are not intended to diagnose, treat, cure, or prevent any disease. All products are supplied exclusively for research and development purposes.
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          disabled={!allChecked || logging}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            cursor: allChecked && !logging ? 'pointer' : 'not-allowed',
            background: allChecked && !logging ? 'var(--accent)' : 'rgba(56,138,177,0.15)',
            color: allChecked && !logging ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseEnter={e => {
            if (allChecked && !logging) {
              e.currentTarget.style.background = '#2d6f8f';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(56,138,177,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = allChecked && !logging ? 'var(--accent)' : 'rgba(56,138,177,0.15)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {logging ? 'Recording Consent...' : allChecked ? 'Enter Website' : 'Please Check All Boxes to Continue'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Your consent will be logged with your IP address and timestamp for legal compliance. This verification is required by law.
        </p>
      </div>
    </div>
  );
}

/* Checkbox component */
function AgeCheck({ checked, onChange, icon, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        width: '100%',
        padding: '16px',
        borderRadius: '14px',
        border: checked ? '1px solid var(--accent)' : '1px solid var(--border)',
        background: checked ? 'rgba(56,138,177,0.08)' : 'rgba(10,22,40,0.4)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.25s',
      }}
      onMouseEnter={e => {
        if (!checked) e.currentTarget.style.borderColor = 'rgba(56,138,177,0.4)';
      }}
      onMouseLeave={e => {
        if (!checked) e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: checked ? '2px solid var(--accent)' : '2px solid var(--border)',
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px',
          transition: 'all 0.25s',
        }}
      >
        <Check
          size={14}
          style={{
            color: '#fff',
            opacity: checked ? 1 : 0,
            transform: checked ? 'scale(1)' : 'scale(0.5)',
            transition: 'all 0.2s',
          }}
        />
      </div>

      <div style={{ color: checked ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, marginTop: '2px', transition: 'color 0.25s' }}>
        {icon}
      </div>

      <span style={{ fontSize: '0.85rem', lineHeight: 1.5, color: checked ? 'var(--text)' : 'var(--text-muted)', transition: 'color 0.25s' }}>
        {label}
      </span>
    </button>
  );
}
