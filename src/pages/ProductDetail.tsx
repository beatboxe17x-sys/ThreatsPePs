import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Check, Star, FileCheck } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';
import CoaViewer from '@/components/CoaViewer';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart } = useApp();
  const product = id ? products[id] : null;
  const [coaOpen, setCoaOpen] = useState(false);
  const [vialAnimating, setVialAnimating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const relatedProducts = Object.entries(products)
    .filter(([pid]) => pid !== id)
    .slice(0, 3);

  const handleVialClick = () => {
    if (!product?.coa || vialAnimating) return;
    setVialAnimating(true);
    setTimeout(() => {
      setCoaOpen(true);
      setVialAnimating(false);
    }, 1200);
  };

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '120px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Product Not Found</h2>
        <Link to="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '24px var(--container-pad) 0', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-transparent border-none cursor-pointer"
          style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          Back to Products
        </button>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center" style={{ padding: '32px var(--container-pad) 60px', maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Product Image — Clickable Vial */}
        <div
          className="product-img-enter"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '40px 24px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow orb behind */}
          <div
            className={`vial-glow-orb ${vialAnimating ? 'active' : ''}`}
            style={{
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56,138,177,0.2), transparent 70%)',
              position: 'absolute',
              transition: 'all 0.6s',
            }}
          />

          {/* Vial Image */}
          <button
            onClick={handleVialClick}
            className="relative bg-transparent border-none p-0"
            style={{
              cursor: product.coa ? 'pointer' : 'default',
              zIndex: 2,
              outline: 'none',
            }}
            aria-label={product.coa ? 'Click to view Certificate of Analysis' : product.name}
          >
            <img
              src={product.img}
              alt={product.name}
              className={`vial-image ${vialAnimating ? 'vial-morphing' : ''}`}
              style={{
                maxHeight: '350px',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 60px rgba(56,138,177,0.25))',
                transition: 'transform 0.5s, filter 0.5s',
              }}
              draggable={false}
            />

            {/* Hover hint */}
            {product.coa && !vialAnimating && (
              <div className="vial-hint">
                <FileCheck size={14} />
                <span>View COA</span>
              </div>
            )}

            {/* Animating particles */}
            {vialAnimating && (
              <>
                <div className="vial-particle p1" />
                <div className="vial-particle p2" />
                <div className="vial-particle p3" />
                <div className="vial-particle p4" />
                <div className="vial-particle p5" />
                <div className="vial-ring" />
              </>
            )}
          </button>

          {/* COA label below vial */}
          {product.coa && (
            <div
              className={`coa-label-below ${vialAnimating ? 'fade-out' : ''}`}
              style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--accent)',
                fontSize: '0.8rem',
                fontWeight: 500,
                fontFamily: 'Poppins, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              <FileCheck size={16} />
              <span>Click vial to view COA</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="product-info-enter" style={{ animationDelay: '0.1s' }}>
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Research Compound</span>
          </div>

          <h1 className="product-info-enter" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', margin: '8px 0', animationDelay: '0.2s' }}>{product.name}</h1>

          <div className="product-info-enter" style={{ color: 'var(--text-muted)', marginBottom: '16px', animationDelay: '0.3s' }}>{product.mg} — Research Purpose Only</div>

          <div className="product-info-enter" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px', animationDelay: '0.35s' }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="#4db8e8" color="#4db8e8" />)}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>(47 reviews)</span>
          </div>

          <div className="product-info-enter" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--accent)', marginBottom: '24px', animationDelay: '0.4s' }}>${product.price.toFixed(2)}</div>

          <p className="product-info-enter" style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px', animationDelay: '0.5s' }}>{product.description}</p>

          <div className="product-info-enter" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', animationDelay: '0.6s' }}>
            {(product.highlights || []).map((h: string, i: number) => (
              <div key={h} className="highlight-enter" style={{ display: 'flex', alignItems: 'center', gap: '12px', animationDelay: `${0.7 + i * 0.08}s` }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(56,138,177,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <span style={{ fontSize: '0.95rem' }}>{h}</span>
              </div>
            ))}
          </div>

          {/* CTA — Add to Cart only */}
          <div className="product-info-enter" style={{ animationDelay: '0.9s' }}>
            <button
              onClick={() => id && addToCart(id)}
              className="inline-flex items-center justify-center gap-2 cursor-pointer border-none"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                padding: '16px 48px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1.05rem',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#2d6f8f';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(56,138,177,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ShoppingBag size={22} />
              Add to Cart — ${product.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ background: 'var(--bg-light)', borderTop: '1px solid var(--border)', padding: '80px var(--container-pad)' }}>
          <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '1.8rem', fontWeight: 800 }}>You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map(([pid, p]) => (
                <Link
                  key={pid}
                  to={`/product/${pid}`}
                  className="related-enter"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '24px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'var(--text)',
                    display: 'block',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(56,138,177,0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <img src={p.img} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{p.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.mg}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>${p.price.toFixed(2)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ padding: '40px var(--container-pad)', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src="/images/logo.png" alt="NG Research" style={{ height: '70px', objectFit: 'contain', marginBottom: '16px' }} />
        </Link>
        <p>&copy; 2026 NG Research Inc. All rights reserved.</p>
      </footer>

      {/* COA Viewer */}
      {product.coa && (
        <CoaViewer
          isOpen={coaOpen}
          onClose={() => setCoaOpen(false)}
          imageSrc={product.coa}
          productName={product.name}
        />
      )}
    </div>
  );
}
