import { useEffect, useRef } from 'react';
import { Dna, Microscope, ClipboardList, Snowflake, FlaskConical } from 'lucide-react';

const items = [
  { icon: Dna, title: 'High-purity peptide synthesis', desc: 'Each compound is synthesized for molecular accuracy and consistent research results.' },
  { icon: Microscope, title: 'Independent third-party lab testing', desc: 'Products undergo external laboratory testing to verify purity, composition, and batch-level consistency.' },
  { icon: ClipboardList, title: 'Transparent COA access', desc: 'Certificates of Analysis are available to provide clear insight into testing results and product specifications.' },
  { icon: Snowflake, title: 'Controlled storage & handling', desc: 'Compounds are stored and handled under controlled conditions to preserve stability and integrity.' },
  { icon: FlaskConical, title: 'Research-only compliance focus', desc: 'All products are clearly labeled and supplied exclusively for research and laboratory use.' },
];

export default function VerificationSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const left = entry.target.querySelector('.reveal-left');
            const right = entry.target.querySelector('.reveal-right');
            if (left) left.classList.add('active');
            if (right) right.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="verify" ref={sectionRef} style={{ padding: '32px var(--container-pad) 40px' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Left Column */}
        <div className="reveal-left">
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: '24px' }}>
            Built for Precision.<br />
            <span style={{ color: 'var(--accent)' }}>Backed by Verification.</span>
          </h2>

          <div className="flex flex-col gap-6 mt-10">
            {items.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex gap-5 items-start transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(56,138,177,0.1)',
                  }}
                >
                  <Icon size={22} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <h3 className="mb-1" style={{ fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="reveal-right flex items-center justify-center">
          <div
            className="relative overflow-hidden flex items-center justify-center transition-all duration-300"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              padding: '40px',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(56,138,177,0.1), transparent 70%)',
              }}
            />
            <img
              src="/images/hero-vial-4.png"
              alt="BPC-157 Vial"
              className="relative z-10 w-full transition-transform duration-300"
              style={{
                maxWidth: '280px',
                filter: 'drop-shadow(0 20px 40px rgba(56,138,177,0.3))',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
