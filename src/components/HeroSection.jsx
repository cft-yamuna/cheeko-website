import React, { useState, useRef, useEffect } from 'react';
import './HeroSection.css';

const cardImages = [
  { src: '/card-images/1.png', alt: 'Wash Your Hands', className: 'card-1' },
  { src: '/card-images/2.png', alt: 'Times World', className: 'card-2' },
  { src: '/card-images/3.png', alt: 'Yummy Time', className: 'card-3' },
  { src: '/card-images/4.png', alt: 'Brush Your Teeth', className: 'card-4' },
  { src: '/card-images/5.png', alt: 'Bedtime Stories', className: 'card-5' },
];

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('saleEndTime');
    if (saved) {
      const remaining = Math.max(0, Math.floor((Number(saved) - Date.now()) / 1000));
      if (remaining > 0) return remaining;
    }
    const duration = 2 * 60 * 60;
    localStorage.setItem('saleEndTime', String(Date.now() + duration * 1000));
    return duration;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function HeroSection() {
  const [allLoaded, setAllLoaded] = useState(false);
  const loadedCount = useRef(0);
  const countdown = useCountdown();

  const handleImageLoad = () => {
    loadedCount.current += 1;
    if (loadedCount.current === cardImages.length) {
      setAllLoaded(true);
    }
  };

  return (
    <div className="hero-section">
      <div className="top-bar">
        <p>Super Sale Ends In: {countdown}s | Get Cheeko For ₹3,999 <s>₹7,999</s></p>
      </div>
      <div className="nav-bar">
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.png" alt="Cheeko Logo" />
          </div>
          <div className="nav-links">
            <a href="#meet-cheeko">Meet Cheeko</a>
            <a href="#key-features">Key Features</a>
            <a href="#easy-setup">Easy Setup</a>
            <a href="#parental-dashboard">Parental Dashboard</a>
          </div>
          <button className="get-cheeko-button">Get Cheeko</button>
        </div>
      </div>
      <div className="hero-content">
        <h1>Your Child's Screen Free<br />Learning Companion</h1>
        <p>The friend who never gets tired of answering<br />questions.</p>
      </div>
      <div className={`card-fan ${allLoaded ? 'animate' : ''}`}>
        {cardImages.map((card) => (
          <div key={card.className} className={`card-fan-item ${card.className}`}>
            <img src={card.src} alt={card.alt} onLoad={handleImageLoad} />
          </div>
        ))}
      </div>
      <div className="device-3d">
        <model-viewer
          src="/cheeko.glb"
          loading="eager"
          camera-orbit="20deg 90deg 2.2m"
          camera-target="auto auto auto"
          camera-controls
          disable-zoom
          interaction-prompt="none"
          shadow-intensity="0"
          interpolation-decay="200"
          touch-action="pan-y"
          reveal="auto"
          power-preference="low-power"
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          ref={(el) => {
            if (el && !el._resetListenerAdded) {
              el._resetListenerAdded = true;
              let resetTimer;
              let isInteracting = false;
              el.addEventListener('mousedown', () => { isInteracting = true; });
              el.addEventListener('mouseup', () => {
                isInteracting = false;
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                  el.cameraOrbit = '20deg 90deg 2.2m';
                  el.cameraTarget = 'auto auto auto';
                }, 1500);
              });
              el.addEventListener('touchstart', () => { isInteracting = true; });
              el.addEventListener('touchend', () => {
                isInteracting = false;
                clearTimeout(resetTimer);
                resetTimer = setTimeout(() => {
                  el.cameraOrbit = '20deg 90deg 2.2m';
                  el.cameraTarget = 'auto auto auto';
                }, 1500);
              });
            }
          }}
        />
      </div>
    </div>
  );
}

export default HeroSection;