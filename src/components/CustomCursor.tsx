import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Only show on desktop (hide on touch devices)
    if ('ontouchstart' in window) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setHidden(false);
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    // Animation loop for smooth following
    let raf: number;
    const animate = () => {
      // Vial cursor follows with lag (smooth)
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      // Dot follows faster
      dotX += (mouseX - dotX) * 0.35;
      dotY += (mouseY - dotY) * 0.35;

      if (cursor) {
        cursor.style.transform = `translate(${cursorX - 12}px, ${cursorY - 12}px)`;
      }
      if (dot) {
        dot.style.transform = `translate(${dotX - 3}px, ${dotY - 3}px)`;
      }
      raf = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    raf = requestAnimationFrame(animate);

    // Hide default cursor on body
    document.body.style.cursor = 'none';
    // But show default cursor on interactive elements for usability
    const style = document.createElement('style');
    style.textContent = `
      a, button, input, textarea, select, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf);
      document.body.style.cursor = '';
      style.remove();
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      {/* Vial cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '24px',
          height: '24px',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.2s',
          willChange: 'transform',
        }}
      >
        {/* SVG Vial */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 4px rgba(56,138,177,0.5))' }}>
          {/* Vial body */}
          <path
            d="M8 2h8v3l-1 1v8c0 2.5-1.5 4.5-3 6-1.5-1.5-3-3.5-3-6V6L8 5V2z"
            fill="rgba(56,138,177,0.2)"
            stroke="var(--accent)"
            strokeWidth="1.5"
          />
          {/* Liquid inside */}
          <path
            d="M9.5 10h5v3c0 1.5-0.8 3-2.5 4.5-1.7-1.5-2.5-3-2.5-4.5V10z"
            fill="rgba(56,138,177,0.4)"
          />
          {/* Vial cap */}
          <rect x="8" y="1" width="8" height="2" rx="1" fill="var(--accent)" />
          {/* Glow dot */}
          <circle cx="17" cy="17" r="3" fill="rgba(56,138,177,0.3)" />
        </svg>
      </div>
      {/* Center dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent)',
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: hidden ? 0 : 0.8,
          transition: 'opacity 0.2s',
          willChange: 'transform',
        }}
      />
    </>
  );
}
