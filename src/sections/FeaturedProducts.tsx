import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingCart, Eye } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';

export default function FeaturedProducts() {
  const { products, addToCart, toggleWishlist, isWishlisted, showToast } = useApp();
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
      grid.querySelectorAll('.reveal-scale').forEach((card, i) => {
        (card as HTMLElement).style.transitionDelay = `${i * 100}ms`;
        observer.observe(card);
      });
    }
    return () => observer.disconnect();
  }, [products]);

  const productList = Object.entries(products);

  const handleAddToCart = (id: string, name: string) => {
    addToCart(id);
    showToast(`${name} added to cart`, '\uD83D\uDED2');
  };

  const handleWishlist = (id: string, name: string) => {
    toggleWishlist(id);
    const isNow = isWishlisted(id);
    showToast(`${name} ${isNow ? 'added to' : 'removed from'} wishlist`, isNow ? '\u2764\uFE0F' : '\uD83D\uDC94');
  };

  return (
    <section id="products" style={{ background: 'var(--bg-light)', padding: '32px var(--container-pad) 48px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="text-center mb-6">
          <h2 className="mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Featured Products
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Browse through our premium research peptides, carefully formulated for purity, consistency, and quality.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {productList.map(([id, product]) => {
            const outOfStock = product.stock !== undefined && product.stock <= 0;
            const wishlisted = isWishlisted(id);

            return (
              <div key={id} className="reveal-scale group"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '0',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(56,138,177,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Image container with hover overlay */}
                <div className="relative overflow-hidden" style={{ height: '260px', borderRadius: '18px 18px 0 0' }}>
                  <Link to={`/product/${id}`} className="no-underline block h-full" style={{ color: 'inherit' }}>
                    <img src={product.img} alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500"
                      style={{ padding: '16px' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.08)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                    />
                  </Link>

                  {/* Hover overlay buttons */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(transparent, rgba(10,22,40,0.85))',
                      opacity: 0,
                      transform: 'translateY(10px)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Invisible hover bridge to trigger */}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3"
                    style={{
                      background: 'linear-gradient(transparent, rgba(10,22,40,0.85))',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      pointerEvents: 'none',
                    }}>
                    <button onClick={() => handleWishlist(id, product.name)}
                      className="cursor-pointer border-none flex items-center justify-center transition-all duration-200"
                      style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: wishlisted ? '#ef4444' : 'rgba(255,255,255,0.15)',
                        color: '#fff', backdropFilter: 'blur(10px)',
                      }}>
                      <Heart size={16} fill={wishlisted ? '#fff' : 'none'} />
                    </button>
                    {!outOfStock && (
                      <button onClick={() => handleAddToCart(id, product.name)}
                        className="cursor-pointer border-none flex items-center gap-2 transition-all duration-200"
                        style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    )}
                    <Link to={`/product/${id}`}
                      className="flex items-center justify-center no-underline transition-all duration-200"
                      style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                      <Eye size={16} />
                    </Link>
                  </div>

                  {/* Out of stock badge */}
                  {outOfStock && (
                    <div className="absolute top-3 left-3 flex items-center gap-1"
                      style={{ background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Out of Stock
                    </div>
                  )}

                  {/* Wishlist indicator (when not hovered) */}
                  {wishlisted && (
                    <div className="absolute top-3 right-3 flex items-center justify-center"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
                      <Heart size={14} fill="#fff" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '18px 20px 20px' }}>
                  <Link to={`/product/${id}`} className="no-underline" style={{ color: 'inherit' }}>
                    <h3 className="mb-1" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{product.name}</h3>
                    <div className="mb-1" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.mg}</div>
                    <div className="mb-3" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                      From ${product.price.toFixed(2)}
                    </div>
                  </Link>

                  {/* Bottom actions */}
                  <div className="flex items-center gap-2">
                    {outOfStock ? (
                      <button disabled
                        className="flex-1 cursor-not-allowed border-none"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)', padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.8rem' }}>
                        Out of Stock
                      </button>
                    ) : (
                      <button onClick={() => handleAddToCart(id, product.name)}
                        className="flex-1 cursor-pointer border-none flex items-center justify-center gap-1.5 transition-all duration-200"
                        style={{ background: 'var(--accent)', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.8rem' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2d6f8f'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    )}
                    <button onClick={() => handleWishlist(id, product.name)}
                      className="cursor-pointer border-none flex items-center justify-center transition-all duration-200"
                      style={{
                        width: '38px', height: '38px', borderRadius: '10px',
                        background: wishlisted ? 'rgba(239,68,68,0.1)' : 'var(--bg)',
                        border: `1px solid ${wishlisted ? '#ef4444' : 'var(--border)'}`,
                        color: wishlisted ? '#ef4444' : 'var(--text-muted)',
                      }}>
                      <Heart size={16} fill={wishlisted ? '#ef4444' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
