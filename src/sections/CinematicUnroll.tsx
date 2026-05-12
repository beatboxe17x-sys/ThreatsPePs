import { useEffect, useRef } from 'react';

export default function CinematicUnroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    const content = contentRef.current;
    if (!section || !bg || !content) return;

    let progress = 0;
    let rafId: number;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 when section top enters viewport, 1 when section bottom leaves
      const start = vh; // section top at viewport bottom
      const end = -rect.height; // section bottom at viewport top
      const range = start - end;
      progress = Math.max(0, Math.min(1, (start - rect.top) / range));
    };

    const animate = () => {
      // Update clip-path based on scroll progress
      // 0 = collapsed (horizontal line at 50%), 1 = fully revealed
      const yMid = 50 - progress * 50; // 50 -> 0
      const yBottom = 50 + progress * 50; // 50 -> 100
      bg.style.clipPath = `polygon(0% ${yMid}%, 100% ${yMid}%, 100% ${yBottom}%, 0% ${yBottom}%)`;
      bg.style.filter = `blur(${8 - progress * 8}px)`;
      bg.style.transform = `scale(${1.2 - progress * 0.2})`;
      content.style.opacity = progress > 0.3 ? String((progress - 0.3) / 0.7) : '0';
      content.style.transform = `translateY(${30 - progress * 30}px)`;
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: '100vh', background: 'var(--bg)' }}
    >
      {/* Background Image */}
      <div
        ref={bgRef}
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/unroll-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          clipPath: 'polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)',
          filter: 'blur(8px)',
          transform: 'scale(1.2)',
          willChange: 'clip-path, filter, transform',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(10, 22, 40, 0.75)' }} />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{ opacity: 0 }}
      >
        <div className="text-center" style={{ maxWidth: '55vw', padding: '0 var(--container-pad)' }}>
          <p
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: '0.75rem',
              color: 'var(--accent)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            VERIFIED PURITY
          </p>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            Every batch tested. Every result documented.
          </h2>
        </div>
      </div>
    </section>
  );
}
