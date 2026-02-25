import React, { useEffect, useRef, useState } from 'react';
import './CardScrollSection.css';

const cardImages = [
  { src: '/card-images/1.png', alt: 'Wash Your Hands', label: 'Health Habits' },
  { src: '/card-images/2.png', alt: 'Times World',     label: 'World Explorer' },
  { src: '/card-images/3.png', alt: 'Yummy Time',      label: 'Nutrition Fun' },
  { src: '/card-images/4.png', alt: 'Brush Your Teeth',label: 'Daily Routine' },
  { src: '/card-images/5.png', alt: 'Bedtime Stories', label: 'Story Time' },
  { src: '/card-images/6.png', alt: 'Adventure Time',  label: 'Adventures' },
];

export default function CardScrollSection() {
  const sectionRef   = useRef(null);
  const deviceRef    = useRef(null);
  const cardRefs     = useRef([]);
  const particleRef  = useRef(null);
  const [progress, setProgress]       = useState(0);     // 0-1 scroll progress
  const [cardStates, setCardStates]   = useState(cardImages.map(() => 'hidden')); // hidden | flying | inserted
  const [deviceIn, setDeviceIn]       = useState(false);
  const [activeCard, setActiveCard]   = useState(null);
  const rafRef = useRef(null);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = particleRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,110,36,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  /* ── Scroll progress ── */
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect   = sectionRef.current.getBoundingClientRect();
      const total  = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const p = Math.min(1, Math.max(0, scrolled / total));
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Drive animations from scroll progress ── */
  useEffect(() => {
    // Phase 0→0.15: device flies in from top
    if (progress >= 0.08) setDeviceIn(true);
    else setDeviceIn(false);

    // Phase 0.2→0.9: cards fly in one by one
    const cardThresholds = [0.20, 0.32, 0.44, 0.56, 0.68, 0.80];
    setCardStates(prev => prev.map((state, i) => {
      if (progress >= cardThresholds[i] + 0.06) return 'inserted';
      if (progress >= cardThresholds[i])         return 'flying';
      return 'hidden';
    }));

    // Active card = last inserted one
    let last = null;
    cardThresholds.forEach((t, i) => { if (progress >= t) last = i; });
    setActiveCard(last);
  }, [progress]);

  /* ── Device Y transform on scroll ── */
  const deviceY = deviceIn
    ? Math.min(0, (progress - 0.08) / 0.12 * 0 - 0) // stays at 0 after landing
    : -120;

  const deviceOpacity = deviceIn
    ? Math.min(1, (progress - 0.08) / 0.1)
    : 0;

  const deviceScale = deviceIn
    ? 0.85 + Math.min(0.15, (progress - 0.08) / 0.12 * 0.15)
    : 0.7;

  return (
    <section className="css-section" ref={sectionRef} id="card-section">
      {/* Sticky viewport that holds all visuals */}
      <div className="css-sticky">
        <canvas className="css-particles" ref={particleRef} />

        {/* Background gradient orbs */}
        <div className="css-orb css-orb--1" />
        <div className="css-orb css-orb--2" />

        {/* Top text */}
        <div className={`css-headline ${progress > 0.05 ? 'css-headline--visible' : ''}`}>
          <span className="css-eyebrow">Scroll to discover</span>
          <h2>Meet <span className="css-accent">Cheeko</span></h2>
          <p>Your child's screen-free learning companion</p>
        </div>

        {/* Device */}
        <div
          className={`css-device ${deviceIn ? 'css-device--in' : ''}`}
          ref={deviceRef}
          style={{
            transform: `translateY(${deviceIn ? 0 : -140}px) scale(${deviceScale})`,
            opacity: deviceOpacity,
          }}
        >
          {/* Glow ring */}
          <div className="css-device-glow" />

          {/* Screen overlay — shows inserted card */}
          {activeCard !== null && cardStates[activeCard] === 'inserted' && (
            <div className="css-device-screen">
              <img src={cardImages[activeCard].src} alt={cardImages[activeCard].alt} />
            </div>
          )}

          <model-viewer
            src="/cheeko.glb"
            loading="eager"
            camera-orbit="20deg 90deg 2.2m"
            camera-target="auto auto auto"
            disable-zoom
            interaction-prompt="none"
            shadow-intensity="0"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          />

          {/* Card slot indicator */}
          <div className={`css-slot ${activeCard !== null && cardStates[activeCard] === 'inserted' ? 'css-slot--active' : ''}`} />
        </div>

        {/* Cards — fly in from sides */}
        <div className="css-cards">
          {cardImages.map((card, i) => {
            const state = cardStates[i];
            const fromLeft = i % 2 === 0;
            return (
              <div
                key={i}
                className={`css-card css-card--${i} css-card--${state} ${fromLeft ? 'css-card--left' : 'css-card--right'}`}
                ref={el => { cardRefs.current[i] = el; }}
              >
                <div className="css-card-inner">
                  <img src={card.src} alt={card.alt} />
                  <div className="css-card-label">{card.label}</div>
                  {state === 'inserted' && (
                    <div className="css-card-check">✓</div>
                  )}
                </div>
                {state === 'flying' && <div className="css-card-trail" />}
              </div>
            );
          })}
        </div>

        {/* Bottom badge strip */}
        <div className={`css-badges ${progress > 0.85 ? 'css-badges--visible' : ''}`}>
          {['200+ Stories', '50+ Songs', 'AI Tutor', 'Parental Controls'].map(b => (
            <div key={b} className="css-badge">{b}</div>
          ))}
        </div>

        {/* CTA */}
        <div className={`css-cta ${progress > 0.85 ? 'css-cta--visible' : ''}`}>
          <button className="css-cta-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Get Cheeko <span>→</span>
          </button>
          <div className="css-progress">
            <div className="css-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
