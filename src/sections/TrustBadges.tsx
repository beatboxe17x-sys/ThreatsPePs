import { useEffect, useRef } from 'react';
import { FlaskConical, Microscope, ShieldCheck, Truck, Award, Headphones } from 'lucide-react';

const badges = [
  {
    icon: FlaskConical,
    title: '99%+ Purity',
    desc: 'Lab-verified HPLC testing on every batch',
  },
  {
    icon: Microscope,
    title: 'Third-Party Tested',
    desc: 'Independent COA with every order',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: 'Encrypted checkout with crypto options',
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    desc: 'Discreet packaging, tracked delivery',
  },
  {
    icon: Award,
    title: 'Research Grade',
    desc: 'Pharmaceutical quality standards',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    desc: 'Dedicated research specialists',
  },
];

export default function TrustBadges() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.trust-badge').forEach((el, i) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.transitionDelay = `${i * 80}ms`;
              htmlEl.classList.add('active');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        background: 'var(--bg-light)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '60px var(--container-pad)',
      }}
    >
      <div
        style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {badges.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="trust-badge reveal"
            style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="trust-badge-icon">
              <Icon size={24} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>{title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
