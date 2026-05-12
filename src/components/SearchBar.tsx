import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';

export default function SearchBar() {
  const { products } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [open]);

  const results = query.length >= 1
    ? Object.entries(products).filter(([, p]) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.mg.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Search icon button */}
      <button
        onClick={() => setOpen(true)}
        className="bg-transparent border-none cursor-pointer p-2 transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <Search size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(5, 10, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '15vh',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="bg-transparent border-none cursor-pointer"
            style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)' }}
          >
            <X size={28} />
          </button>

          {/* Search input */}
          <div style={{ width: '100%', maxWidth: '600px', padding: '0 20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full outline-none"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '18px 20px 18px 50px',
                  color: 'var(--text)',
                  fontSize: '1.1rem',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.map(([id, p]) => (
                  <Link
                    key={id}
                    to={`/product/${id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-4 no-underline"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: 'var(--text)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <img src={p.img} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px' }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.mg} — ${p.price.toFixed(2)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {query.length >= 2 && results.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>
                No products found for &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
