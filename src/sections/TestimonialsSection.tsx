import { useEffect, useRef } from 'react';

const testimonials = [
  {
    stars: 5,
    quote: 'The purity and consistency of these peptides is unmatched. Every batch has been spot-on for our research protocols. The COA documentation is thorough and reliable.',
    initials: 'DR',
    name: 'Dr. Richard M.',
    title: 'Lead Researcher, BioLab Sciences',
  },
  {
    stars: 5,
    quote: 'Fast shipping and excellent packaging. The compounds arrived in perfect condition with full documentation. Customer support was incredibly knowledgeable.',
    initials: 'SK',
    name: 'Sarah K.',
    title: 'Lab Director, Molecular Dynamics',
  },
  {
    stars: 5,
    quote: 'We have tried multiple suppliers over the years. Threats is the only one that consistently delivers pharmaceutical-grade quality with transparent lab results.',
    initials: 'JT',
    name: 'James T.',
    title: 'Principal Investigator, CellGen Research',
  },
];

export default function TestimonialsSection() {
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
        (card as HTMLElement).style.transitionDelay = `${i * 150}ms`;
        observer.observe(card);
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="testimonials" style={{ background: 'var(--bg-light)', padding: '32px var(--container-pad) 40px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="text-center mb-16">
          <h2 className="mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.01em' }}>
            What people say about our products
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="reveal"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '32px',
              }}
            >
              <div className="mb-4" style={{ fontSize: '1.2rem', color: 'var(--accent2)' }}>
                {'★'.repeat(t.stars)}
              </div>
              <p className="mb-5" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center text-white font-bold"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    fontSize: '0.9rem',
                  }}
                >
                  {t.initials}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
