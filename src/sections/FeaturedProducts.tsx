import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';

export default function FeaturedProducts() {
  const { products, addToCart } = useApp();
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const grid = gridRef.current;
    if (grid) {
      const cards = grid.querySelectorAll('.reveal-scale');
      cards.forEach((card, i) => {
        (card as HTMLElement).style.transitionDelay = `${i * 100}ms`;
        observer.observe(card);
      });
    }

    return () => observer.disconnect();
  }, [products]);

  const productList = Object.entries(products);

  return (
    <section id="products" style={{ background: 'var(--bg-light)', borderTop: '1px solid var(--border)', padding: '100px var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Featured Products
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Browse through our premium research peptides, carefully formulated for purity, consistency, and quality.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productList.map(([id, product]) => (
            <div
              key={id}
              className="reveal-scale text-center transition-all duration-300"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px',
                position: 'relative',
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
              <Link to={`/product/${id}`} className="no-underline block" style={{ color: 'inherit' }}>
                <div className="flex items-center justify-center mb-4 overflow-hidden" style={{ height: '280px', borderRadius: '16px' }}>
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300"
                    style={{ maxHeight: '280px' }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                  />
                </div>
                <h3 className="mb-1" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{product.name}</h3>
                <div className="mb-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{product.mg}</div>
                <div className="mb-4" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                  ${product.price.toFixed(2)}
                </div>
              </Link>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => addToCart(id)}
                  className="w-full cursor-pointer border-none transition-all duration-300"
                  style={{ background: 'var(--accent)', color: '#fff', padding: '12px 32px', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#2d6f8f';
                    e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Add to Cart
                </button>
                <Link
                  to={`/product/${id}`}
                  className="inline-flex items-center justify-center gap-2 no-underline transition-all duration-300"
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    padding: '6px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
