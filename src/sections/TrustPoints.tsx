import { useEffect, useRef } from 'react';
import { FlaskConical, ShieldCheck, FileSearch, ThermometerSnowflake, Scale } from 'lucide-react';

const points = [
  {
    icon: <FlaskConical size={24} />,
    title: 'High-Purity Peptide Synthesis',
    desc: 'Every batch is manufactured under strict GMP-like conditions using advanced solid-phase peptide synthesis (SPPS), ensuring exceptional purity and sequence fidelity for your research.',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Independent Third-Party Lab Testing',
    desc: 'All products undergo rigorous analysis by independent ISO-accredited laboratories. We verify identity, purity, and potency through multiple analytical methods before release.',
  },
  {
    icon: <FileSearch size={24} />,
    title: 'Transparent COA Access',
    desc: 'Certificate of Analysis (COA) documentation is included with every order and available online via batch number lookup. Full transparency on testing methodology and results.',
  },
  {
    icon: <ThermometerSnowflake size={24} />,
    title: 'Controlled Storage & Handling',
    desc: 'Products are stored in temperature-controlled environments from synthesis through shipping. Cold-chain packaging ensures peptide stability and integrity upon delivery.',
  },
  {
    icon: <Scale size={24} />,
    title: 'Research-Only Compliance',
    desc: 'All products are strictly sold for laboratory research purposes only. Not for human consumption, veterinary use, or diagnostic applications. Full compliance focus.',
  },
];

export default function TrustPoints() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.reveal').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 100}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ background: 'var(--bg-light)', padding: '80px var(--container-pad)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div className="text-center mb-12">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '12px' }}>
            Built for Precision. Backed by Verification.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Every product we offer meets the highest standards of quality, purity, and transparency in the peptide research industry.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {points.map((p) => (
            <div
              key={p.title}
              className="reveal"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '28px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center justify-center mb-4"
                style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56,138,177,0.1)', color: 'var(--accent)' }}>
                {p.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{p.title}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
