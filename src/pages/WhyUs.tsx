import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingDown, Zap, FlaskConical, ShieldCheck, Truck, Clock, Award, Users, Headphones, Star, CheckCircle2, XCircle, ArrowRight, Microscope, BadgeCheck, Leaf, HeartHandshake
} from 'lucide-react';

const stats = [
  { icon: TrendingDown, label: 'Lowest Prices', value: '40%', desc: 'cheaper than competitors', color: 'var(--success)' },
  { icon: Zap, label: 'Fastest Shipping', value: '24h', desc: 'order processing time', color: 'var(--accent2)' },
  { icon: FlaskConical, label: 'Highest Purity', value: '99%+', desc: 'HPLC-verified every batch', color: 'var(--accent)' },
  { icon: ShieldCheck, label: 'Lab Verified', value: '100%', desc: 'independent COA included', color: 'var(--success)' },
];

const differentiators = [
  { icon: Microscope, title: 'HPLC-Tested Every Batch', desc: 'Every vial undergoes High-Performance Liquid Chromatography testing to verify purity, potency, and consistency. No exceptions.' },
  { icon: BadgeCheck, title: 'Free COA With Every Order', desc: 'Certificate of Analysis included at no extra cost. Full transparency on what you are getting.' },
  { icon: Leaf, title: 'Research-Grade Only', desc: 'We do not cut corners. Every compound meets pharmaceutical manufacturing standards for laboratory use.' },
  { icon: Truck, title: 'Discreet Fast Shipping', desc: 'Orders processed within 24 hours. Plain packaging with full tracking from our U.S. facility.' },
  { icon: HeartHandshake, title: 'Dedicated Support', desc: 'Our research specialists are available to answer questions about products, dosing protocols, and applications.' },
  { icon: Clock, title: 'Same-Day Processing', desc: 'Place your order before 2PM EST and it ships the same day. No delays, no excuses.' },
];

const comparison = [
  { feature: 'HPLC Testing', us: true, comp1: false, comp2: true },
  { feature: 'Free COA Included', us: true, comp1: false, comp2: false },
  { feature: '99%+ Purity Guarantee', us: true, comp1: false, comp2: true },
  { feature: 'Same-Day Shipping', us: true, comp1: false, comp2: false },
  { feature: 'Discreet Packaging', us: true, comp1: true, comp2: true },
  { feature: '24/7 Support', us: true, comp1: false, comp2: false },
  { feature: 'Crypto Payments', us: true, comp1: false, comp2: false },
  { feature: 'Lowest Price Match', us: true, comp1: false, comp2: false },
  { feature: 'Independent Lab Verified', us: true, comp1: false, comp2: false },
  { feature: 'No Minimum Order', us: true, comp1: true, comp2: false },
];

export default function WhyUs() {
  useEffect(() => {
    window.scrollTo(0, 0);

    const activateAll = () => {
      const revealEls = document.querySelectorAll('.reveal');
      revealEls.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.transitionDelay = `${i * 60}ms`;
        // Force reflow
        void htmlEl.offsetHeight;
        htmlEl.classList.add('active');
      });
    };

    // Use IntersectionObserver for scroll-triggered reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );

    // Delay to ensure DOM is rendered
    const t = setTimeout(() => {
      const revealEls = document.querySelectorAll('.reveal');
      revealEls.forEach((el) => observer.observe(el));
      // Fallback: activate any above-the-fold elements after 1s
      setTimeout(activateAll, 1000);
    }, 100);

    return () => { clearTimeout(t); observer.disconnect(); };
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero */}
      <section
        style={{
          padding: '60px var(--container-pad) 80px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(56,138,177,0.08) 0%, transparent 50%), var(--bg)',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--accent)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            Why NG Research
          </span>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '12px 0 16px',
              background: 'linear-gradient(135deg, #fff 0%, #388ab1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            The #1 One-Stop Shop<br />for Research Peptides
          </h1>
          <p className="reveal" style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            We built NG Research to be the only supplier you will ever need. Best prices. Fastest delivery. Highest purity. Period.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, label, value, desc, color }) => (
              <div
                key={label}
                className="reveal"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '28px 16px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(56,138,177,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} style={{ color }} />
                  </div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ background: 'var(--bg-light)', borderTop: '1px solid var(--border)', padding: '80px var(--container-pad)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h2 className="reveal text-center" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>
            How We Compare
          </h2>
          <p className="reveal text-center" style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '0.95rem' }}>
            See why researchers choose us over the competition.
          </p>

          <div className="reveal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 100px 100px 100px', padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              <span>Feature</span>
              <span className="text-center" style={{ color: 'var(--accent)' }}>NG Research</span>
              <span className="text-center">Competitor A</span>
              <span className="text-center">Competitor B</span>
            </div>

            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className="grid"
                style={{ gridTemplateColumns: '1fr 100px 100px 100px', padding: '14px 20px', borderBottom: i < comparison.length - 1 ? '1px solid var(--border)' : 'none', fontSize: '0.85rem', alignItems: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,138,177,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontWeight: 500 }}>{row.feature}</span>
                <span className="flex justify-center">{row.us ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> : <XCircle size={18} style={{ color: 'var(--text-muted)' }} />}</span>
                <span className="flex justify-center">{row.comp1 ? <CheckCircle2 size={18} style={{ color: 'var(--text-muted)' }} /> : <XCircle size={18} style={{ color: 'rgba(239,68,68,0.5)' }} />}</span>
                <span className="flex justify-center">{row.comp2 ? <CheckCircle2 size={18} style={{ color: 'var(--text-muted)' }} /> : <XCircle size={18} style={{ color: 'rgba(239,68,68,0.5)' }} />}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section style={{ padding: '80px var(--container-pad)', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="reveal text-center" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '8px' }}>
            What Sets Us Apart
          </h2>
          <p className="reveal text-center" style={{ color: 'var(--text-muted)', marginBottom: '48px', fontSize: '0.95rem' }}>
            Every detail matters when it comes to research-grade compounds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {differentiators.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="reveal"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', transition: 'all 0.3s', transitionDelay: `${i * 60}ms` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(56,138,177,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56,138,177,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section style={{ background: 'var(--bg-light)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '48px var(--container-pad)' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users, label: '2,400+', sub: 'Researchers Served' },
              { icon: Star, label: '4.9/5', sub: 'Average Rating' },
              { icon: Award, label: '100%', sub: 'COA Delivery Rate' },
              { icon: Headphones, label: '< 2hrs', sub: 'Support Response' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="reveal">
                <Icon size={28} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px var(--container-pad)', textAlign: 'center' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <h2 className="reveal" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 800, marginBottom: '12px' }}>
            Ready to Experience the Difference?
          </h2>
          <p className="reveal" style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
            Join thousands of researchers who trust NG Research for their laboratory needs.
          </p>
          <Link
            to="/"
            className="reveal inline-flex items-center gap-2"
            style={{ background: 'var(--accent)', color: '#fff', padding: '16px 40px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', textDecoration: 'none', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2d6f8f'; e.currentTarget.style.boxShadow = '0 0 40px rgba(56,138,177,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Shop Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px var(--container-pad)', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src="/images/logo.png" alt="NG Research" style={{ height: '70px', objectFit: 'contain', marginBottom: '16px' }} />
        </Link>
        <p>&copy; 2026 NG Research Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
