import { useState, useEffect, useRef } from 'react';
import { Mail, Phone } from 'lucide-react';

export default function ContactSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section id="contact" ref={sectionRef} style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', padding: '100px var(--container-pad)' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Left Column */}
        <div className="reveal">
          <h2 className="mb-5" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.01em' }}>
            Get in Touch
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            Have questions about our products or need help with an order?
          </p>
          <div className="flex flex-col gap-4">
            <a
              href="mailto:support@threats.io"
              className="flex items-center gap-3 no-underline transition-colors duration-300"
              style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Mail size={20} style={{ color: 'var(--accent)' }} />
              support@threats.io
            </a>
            <a
              href="tel:+15550192847"
              className="flex items-center gap-3 no-underline transition-colors duration-300"
              style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Phone size={20} style={{ color: 'var(--accent)' }} />
              +1 (555) 019-2847
            </a>
          </div>
        </div>

        {/* Right Column - Newsletter */}
        <div className="reveal">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px' }}>
            <h3 className="mb-2" style={{ fontSize: '1.3rem', fontWeight: 700 }}>Subscribe to our Newsletter</h3>
            <p className="mb-6" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Subscribe to our newsletter to get daily insights, news, updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 outline-none transition-colors duration-300"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  color: 'var(--text)',
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                type="submit"
                className="cursor-pointer border-none transition-all duration-300 whitespace-nowrap"
                style={{
                  background: subscribed ? 'var(--success)' : 'var(--accent)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '14px 24px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => {
                  if (!subscribed) e.currentTarget.style.background = '#2d6f8f';
                }}
                onMouseLeave={e => {
                  if (!subscribed) e.currentTarget.style.background = 'var(--accent)';
                }}
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
