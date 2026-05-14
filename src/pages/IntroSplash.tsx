import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntroSplash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');
  const [textVisible, setTextVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);

  useEffect(() => {
    // Redirect if age not verified
    if (!sessionStorage.getItem('ng_age_verified')) {
      navigate('/age-verify', { replace: true });
      return;
    }
    // Staggered text entrance
    const t1 = setTimeout(() => setTextVisible(true), 400);
    const t2 = setTimeout(() => setSubtitleVisible(true), 900);
    const t3 = setTimeout(() => setButtonVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  const handleEnter = () => {
    sessionStorage.setItem('ng_seen_intro', 'true');
    sessionStorage.setItem('ng_age_verified', 'true');
    setPhase('exit');
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1200);
  };

  return (
    <div className={`intro-splash ${phase}`}>
      {/* Animated background gradient orbs */}
      <div className="intro-orb orb-1" />
      <div className="intro-orb orb-2" />
      <div className="intro-orb orb-3" />

      {/* Floating vials */}
      <div className="intro-vial vial-left">
        <img src="/images/bpc-157.png?v=5" alt="" draggable={false} />
      </div>
      <div className="intro-vial vial-right">
        <img src="/images/ghk-cu.png?v=5" alt="" draggable={false} />
      </div>
      <div className="intro-vial vial-top">
        <img src="/images/retatrutide.png?v=5" alt="" draggable={false} />
      </div>
      <div className="intro-vial vial-bottom">
        <img src="/images/sermorelin.png?v=5" alt="" draggable={false} />
      </div>

      {/* Particle dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="intro-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${4 + Math.random() * 6}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="intro-content">
        <div className={`intro-welcome ${textVisible ? 'visible' : ''}`}>
          Welcome to
        </div>

        <h1 className={`intro-title ${textVisible ? 'visible' : ''}`}>
          <span className="intro-ng">Next Gen</span>
          <span className="intro-research">Research</span>
        </h1>

        <p className={`intro-subtitle ${subtitleVisible ? 'visible' : ''}`}>
          Premium peptide compounds for advanced laboratory research
        </p>

        <button
          className={`intro-enter-btn ${buttonVisible ? 'visible' : ''}`}
          onClick={handleEnter}
        >
          <span>Enter Site</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Bottom gradient fade */}
      <div className="intro-bottom-fade" />
    </div>
  );
}
