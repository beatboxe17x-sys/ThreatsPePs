import { useEffect, useRef } from 'react';
import { FlaskConical, ShieldCheck, Globe, Timer, Award } from 'lucide-react';

const stats = [
  { value: '99%+', label: 'Purity Guaranteed', icon: <FlaskConical size={22} />, desc: 'HPLC verified' },
  { value: '5', label: 'Quality Checks', icon: <ShieldCheck size={22} />, desc: 'Per batch' },
  { value: '100%', label: 'U.S. Verified', icon: <Globe size={22} />, desc: 'Independent labs' },
  { value: '24h', label: 'Same Day Ship', icon: <Timer size={22} />, desc: 'Order by 3pm EST' },
  { value: 'A+', label: 'Lab Grade', icon: <Award size={22} />, desc: 'Research standard' },
];

export default function QualityStats() {
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
      { threshold: 0.2 }
    );
    ref.current?.querySelectorAll('.reveal-scale').forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${i * 80}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ background: 'var(--bg)', padding: '40px var(--container-pad)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="reveal-scale text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '18px 12px',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ color: 'var(--accent)', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
