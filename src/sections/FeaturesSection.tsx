import { useEffect, useRef } from 'react';
import { Truck, Lock, HeartPulse, FlaskConical, PhoneCall, CheckCircle } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Fast Shipping', desc: 'Orders processed and shipped within 24 hours with full tracking.' },
  { icon: Lock, title: '100% Safe Payments', desc: 'All transactions are secured with industry-standard encryption.' },
  { icon: HeartPulse, title: 'Pharmaceutical-Grade Quality', desc: 'Every product meets strict pharmaceutical manufacturing standards.' },
  { icon: FlaskConical, title: 'Tested in Certified U.S. Labs', desc: 'Independent third-party testing ensures purity and potency.' },
  { icon: PhoneCall, title: 'Dedicated Support', desc: 'Our research specialists are available to assist with any questions.' },
  { icon: CheckCircle, title: 'Satisfaction Guarantee', desc: 'We stand behind the quality of every product we deliver.' },
];

export default function FeaturesSection() {
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
      grid.querySelectorAll('.reveal').forEach((card, i) => {
        (card as HTMLElement).style.transitionDelay = `${i * 120}ms`;
        observer.observe(card);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" style={{ background: 'var(--bg)', padding: '32px var(--container-pad) 40px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="text-center mb-6">
          <h2 className="mb-2" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Why Researchers Trust Threats
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive quality infrastructure designed for advanced laboratory environments
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="reveal transition-all duration-300"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(56,138,177,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="flex items-center justify-center mb-5"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(56,138,177,0.1)',
                }}
              >
                <Icon size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="mb-2" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
