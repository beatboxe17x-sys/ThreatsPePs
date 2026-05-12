import { useState } from 'react';
import { Search, FileCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const VALID_BATCHES: Record<string, { product: string; purity: string; date: string; lab: string; coa: string }> = {
  'BPC-2026-001': { product: 'BPC-157 10mg', purity: '99.4%', date: '2026-04-15', lab: 'ProVerde Labs', coa: '/images/coa-bpc157.png' },
  'RET-2026-003': { product: 'Retatrutide 20mg', purity: '99.1%', date: '2026-05-01', lab: 'Columbia Labs', coa: '/images/coa-retatrutide.png' },
  'SER-2026-002': { product: 'Sermorelin 10mg', purity: '99.6%', date: '2026-04-28', lab: 'ProVerde Labs', coa: '/images/coa-sermorelin.png' },
  'SEMAX-2026-001': { product: 'Semax 10mg', purity: '99.2%', date: '2026-05-05', lab: 'Columbia Labs', coa: '/images/coa-semax.png' },
  'SEL-2026-001': { product: 'Selank 10mg', purity: '99.3%', date: '2026-05-08', lab: 'ProVerde Labs', coa: '/images/coa-selank.png' },
  'TIRZ-2026-001': { product: 'Tirzepatide 10mg', purity: '99.0%', date: '2026-05-10', lab: 'Columbia Labs', coa: '/images/coa-tirz.png' },
};

export default function BatchLookup() {
  const [batch, setBatch] = useState('');
  const [result, setResult] = useState<typeof VALID_BATCHES[string] | null | 'notfound'>(null);

  const handleLookup = () => {
    const trimmed = batch.trim().toUpperCase();
    if (!trimmed) return;
    const found = VALID_BATCHES[trimmed];
    setResult(found || 'notfound');
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <FileCheck size={20} style={{ color: 'var(--accent)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Batch COA Lookup</h3>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Enter your batch number to verify purity and view the Certificate of Analysis.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={batch}
          onChange={(e) => { setBatch(e.target.value); setResult(null); }}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          placeholder="e.g. BPC-2026-001"
          className="flex-1 outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: 'var(--text)',
            fontSize: '0.9rem',
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <button
          onClick={handleLookup}
          className="cursor-pointer border-none inline-flex items-center gap-1"
          style={{ background: 'var(--accent)', color: '#fff', padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <Search size={16} /> Verify
        </button>
      </div>

      {/* Result */}
      {result && result !== 'notfound' && (
        <div style={{ marginTop: '20px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>Batch Verified</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Product:</span> <strong>{result.product}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Purity:</span> <strong style={{ color: 'var(--success)' }}>{result.purity}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Tested:</span> {result.date}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Lab:</span> {result.lab}</div>
          </div>
          <a
            href={result.coa}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: '12px', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
          >
            View Full COA &rarr;
          </a>
        </div>
      )}

      {result === 'notfound' && (
        <div style={{ marginTop: '20px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} style={{ color: 'rgba(239,68,68,0.7)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Batch number not found. Please check the number on your vial label and try again.
          </span>
        </div>
      )}
    </div>
  );
}
