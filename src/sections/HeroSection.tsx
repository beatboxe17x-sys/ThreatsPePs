import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, ClipboardList, Zap, ArrowRight } from 'lucide-react';
import { useApp } from '@/hooks/useAppContext';

export default function HeroSection() {
  const { products, addToCart } = useApp();
  const floatingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const productList = Object.entries(products);

  useEffect(() => {
    const text = textRef.current;
    const carousel = carouselRef.current;
    if (text) {
      text.style.opacity = '0';
      text.style.transform = 'translateY(40px)';
      setTimeout(() => {
        text.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
        text.style.opacity = '1';
        text.style.transform = 'translateY(0)';
      }, 100);
    }
    if (carousel) {
      carousel.style.opacity = '0';
      carousel.style.transform = 'translateY(40px)';
      setTimeout(() => {
        carousel.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.3s';
        carousel.style.opacity = '1';
        carousel.style.transform = 'translateY(0)';
      }, 200);
    }
  }, []);

  // Floating vials 3D tilt on mouse move
  useEffect(() => {
    const el = floatingRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = 'rotateY(0deg) rotateX(0deg)';
    };

    const container = el.parentElement;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const scrollToProducts = () => {
    const el = document.querySelector('#products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Card brightness based on rotation
  useEffect(() => {
    const carousel = document.querySelector('.carousel') as HTMLElement;
    if (!carousel) return;

    const updateBrightness = () => {
      const style = window.getComputedStyle(carousel);
      const matrix = new DOMMatrix(style.transform);
      const angle = Math.atan2(matrix.m13, matrix.m11) * (180 / Math.PI);

      const cards = carousel.querySelectorAll<HTMLElement>('.card-3d');
      cards.forEach((card, i) => {
        const cardAngle = (i * 72) + angle;
        const normalized = ((cardAngle % 360) + 360) % 360;
        const facing = normalized < 90 || normalized > 270;
        card.style.filter = facing ? 'brightness(1)' : 'brightness(0.4)';
      });

      requestAnimationFrame(updateBrightness);
    };

    const raf = requestAnimationFrame(updateBrightness);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      className="min-h-screen flex items-center relative overflow-hidden"
      style={{
        padding: '80px var(--container-pad) 32px',
        background: `radial-gradient(ellipse at 50% 0%, rgba(56,138,177,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(77,184,232,0.04) 0%, transparent 40%), var(--bg)`,
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center w-full" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Text Column */}
        <div ref={textRef}>
          <h1
            className="mb-6"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #fff 0%, #388ab1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Premium Research Peptides &amp; Compounds
          </h1>
          <p className="mb-8" style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
            High-purity peptide compounds manufactured for advanced research and innovation. Now accepting cryptocurrency payments.
          </p>

          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { icon: Shield, label: '99% verified purity' },
              { icon: Eye, label: 'Lab-Tested & Documented' },
              { icon: ClipboardList, label: 'Controlled Manufacturing' },
              { icon: Zap, label: 'Fast Shipping' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                <Icon size={18} style={{ color: 'var(--accent)' }} />
                {label}
              </div>
            ))}
          </div>

          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-2.5 cursor-pointer border-none transition-all duration-300"
            style={{ background: 'var(--accent)', color: '#fff', padding: '16px 36px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#2d6f8f';
              e.currentTarget.style.boxShadow = '0 0 40px var(--accent-glow)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Shop Now
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Right Column - Floating Vials + Carousel */}
        <div className="flex flex-col items-center gap-8" ref={carouselRef}>
          {/* Floating Vials */}
          <div className="floating-vials-container" style={{ perspective: '800px' }}>
            <div ref={floatingRef} className="floating-vials transition-transform duration-100 ease-out">
              <img src="/images/hero-vials-group.png?v=1" alt="NG Research Peptide Vials - BPC-157, GHK-Cu, GLP-3 RT" />
            </div>
          </div>

          {/* 3D Carousel */}
          <div className="carousel-container hidden lg:flex">
            <div className="carousel">
              {productList.slice(0, 5).map(([id, product], i) => (
                <div key={id} className="card-3d" style={{ transform: `rotateY(${i * 72}deg) translateZ(340px)` }}>
                  <Link to={`/product/${id}`} className="no-underline block" style={{ color: 'inherit' }} onClick={(e) => e.stopPropagation()}>
                    <div className="img-wrap">
                      <img src={product.img} alt={product.name} />
                    </div>
                    <h3>{product.name}</h3>
                    <div className="price">${product.price.toFixed(2)}</div>
                    <p>{product.mg} - Research Purpose Only</p>
                  </Link>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(id); }}
                      className="cursor-pointer border-none transition-all duration-300"
                      style={{ background: 'var(--accent)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#2d6f8f'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center no-underline transition-all duration-300"
                      style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500, padding: '6px 8px' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
