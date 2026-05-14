import { FileSearch, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function COABanner() {
  return (
    <section style={{ background: 'var(--bg)', padding: '0 var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="flex items-center justify-between flex-wrap gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(56,138,177,0.08), rgba(107,70,193,0.06))',
            border: '1px solid rgba(56,138,177,0.2)',
            borderRadius: '14px',
            padding: '16px 24px',
          }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center"
              style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56,138,177,0.12)', color: 'var(--accent)' }}>
              <FileSearch size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Free COA Included with Every Order</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Full Certificate of Analysis with batch-specific HPLC results</div>
            </div>
          </div>
          <Link to="/#products"
            className="flex items-center gap-2 no-underline transition-all duration-200"
            style={{ color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}
            onMouseEnter={e => e.currentTarget.style.gap = '8px'}
            onMouseLeave={e => e.currentTarget.style.gap = '4px'}>
            Shop Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
