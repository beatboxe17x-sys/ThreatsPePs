import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el, i) => {
              (el as HTMLElement).style.transitionDelay = `${i * 150}ms`;
              el.classList.add('active');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const scrollToProducts = () => {
    const el = document.querySelector('#products');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden text-center"
      style={{ padding: '120px var(--container-pad)' }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(56,138,177,0.1) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <h2 className="reveal mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.01em' }}>
          Proven Quality. Fully Verified.
        </h2>

        <p className="reveal mx-auto mb-10" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px' }}>
          Every peptide we offer undergoes rigorous multi-step quality verification. From synthesis to delivery, we maintain the highest standards of pharmaceutical-grade quality.
        </p>

        <div
          className="reveal grid grid-cols-3 gap-8 mx-auto mb-12"
          style={{ maxWidth: '600px' }}
        >
          {[
            { num: '99%+', label: 'Purity' },
            { num: '5', label: 'Quality Checks' },
            { num: '100%', label: 'U.S. Verified' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent)', marginBottom: '4px' }}>
                {stat.num}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="reveal mb-10">
          <h3 className="mb-3" style={{ fontSize: '1.2rem', color: 'var(--text)' }}>Verified Potency</h3>
          <p className="mx-auto mb-4" style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
            HPLC Analysis - Every vial is tested to confirm it contains exactly what the label says down to the microgram.
          </p>
          <p className="mx-auto" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px' }}>
            Why it matters: Independent lab verification ensures that what is on the label matches what is in the vial every time.
          </p>
        </div>

        <button
          onClick={scrollToProducts}
          className="reveal inline-flex items-center gap-2.5 cursor-pointer border-none transition-all duration-300"
          style={{
            background: 'var(--accent)',
            color: '#fff',
            padding: '18px 40px',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '1.05rem',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#2d6f8f';
            e.currentTarget.style.boxShadow = '0 0 50px var(--accent-glow)';
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

        <p className="reveal mt-5" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem' }}>
          Free COA included with every order
        </p>
      </div>
    </section>
  );
}
