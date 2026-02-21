import React, { useState, useRef, useEffect } from 'react';
import './HeroSection.css';

// Pentatonic scale note frequencies
const NOTE = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00,
};

// Each card's unique ~6-second melody: [frequency, duration, startTime]
const MELODIES = [
  // 0 – Twinkle-style ascending
  [[NOTE.C4,0.45,0],[NOTE.C4,0.45,0.5],[NOTE.G4,0.45,1],[NOTE.G4,0.45,1.5],
   [NOTE.A4,0.45,2],[NOTE.A4,0.45,2.5],[NOTE.G4,0.8,3],
   [NOTE.E4,0.45,3.9],[NOTE.E4,0.45,4.4],[NOTE.D4,0.45,4.9],[NOTE.D4,0.45,5.4],[NOTE.C4,0.7,5.9]],
  // 1 – Bouncy playful
  [[NOTE.G4,0.3,0],[NOTE.A4,0.3,0.35],[NOTE.C5,0.35,0.7],[NOTE.A4,0.3,1.1],
   [NOTE.G4,0.4,1.45],[NOTE.E4,0.3,1.9],[NOTE.D4,0.3,2.25],[NOTE.E4,0.45,2.6],
   [NOTE.G4,0.45,3.1],[NOTE.C5,0.4,3.6],[NOTE.D5,0.3,4.05],[NOTE.C5,0.35,4.4],
   [NOTE.A4,0.4,4.8],[NOTE.G4,0.45,5.25],[NOTE.E4,0.4,5.75],[NOTE.C4,0.55,6.2]],
  // 2 – Waltz feel
  [[NOTE.E4,0.55,0],[NOTE.G4,0.35,0.6],[NOTE.A4,0.35,1],[NOTE.C5,0.55,1.4],
   [NOTE.D5,0.35,2],[NOTE.E5,0.55,2.4],[NOTE.D5,0.3,3],[NOTE.C5,0.35,3.35],
   [NOTE.A4,0.45,3.75],[NOTE.G4,0.45,4.25],[NOTE.A4,0.3,4.75],[NOTE.C5,0.45,5.1],
   [NOTE.G4,0.4,5.6],[NOTE.E4,0.45,6.05],[NOTE.C4,0.55,6.55]],
  // 3 – Descending lullaby
  [[NOTE.C5,0.5,0],[NOTE.A4,0.35,0.55],[NOTE.G4,0.35,0.95],[NOTE.E4,0.45,1.35],
   [NOTE.D4,0.4,1.85],[NOTE.C4,0.55,2.3],[NOTE.D4,0.3,2.9],[NOTE.E4,0.35,3.25],
   [NOTE.G4,0.45,3.65],[NOTE.A4,0.4,4.15],[NOTE.C5,0.5,4.6],
   [NOTE.D5,0.3,5.15],[NOTE.C5,0.35,5.5],[NOTE.A4,0.4,5.9],[NOTE.C4,0.55,6.35]],
  // 4 – Energetic march
  [[NOTE.A4,0.3,0],[NOTE.C5,0.3,0.35],[NOTE.D5,0.35,0.7],[NOTE.E5,0.45,1.1],
   [NOTE.D5,0.3,1.6],[NOTE.C5,0.3,1.95],[NOTE.A4,0.4,2.3],[NOTE.G4,0.45,2.75],
   [NOTE.E4,0.3,3.25],[NOTE.G4,0.4,3.6],[NOTE.A4,0.4,4.05],[NOTE.C5,0.45,4.5],
   [NOTE.A4,0.3,5],[NOTE.G4,0.4,5.35],[NOTE.E4,0.45,5.8],[NOTE.C4,0.6,6.3]],
  // 5 – Dreamy
  [[NOTE.D4,0.5,0],[NOTE.E4,0.35,0.55],[NOTE.G4,0.45,0.95],[NOTE.A4,0.4,1.45],
   [NOTE.C5,0.55,1.9],[NOTE.A4,0.3,2.5],[NOTE.G4,0.35,2.85],[NOTE.A4,0.45,3.25],
   [NOTE.C5,0.4,3.75],[NOTE.D5,0.45,4.2],[NOTE.E5,0.4,4.7],[NOTE.D5,0.35,5.15],
   [NOTE.C5,0.4,5.55],[NOTE.A4,0.4,6],[NOTE.G4,0.45,6.45]],
];

// Returns { promise, cancel } — cancel silences audio and resolves promise with true
function playMelody(audioCtx, cardIndex) {
  const melody = MELODIES[cardIndex % MELODIES.length];
  const lastNote = melody[melody.length - 1];
  const totalDuration = lastNote[2] + lastNote[1] + 0.15;

  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(audioCtx.destination);

  let timeoutId;
  let resolveFn;

  melody.forEach(([freq, dur, start]) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = audioCtx.currentTime + start;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.setValueAtTime(0.15, t + dur - 0.08);
    gain.gain.linearRampToValueAtTime(0, t + dur);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + dur);
  });

  const promise = new Promise((resolve) => {
    resolveFn = resolve;
    timeoutId = setTimeout(() => resolve(false), totalDuration * 1000);
  });

  return {
    promise,
    cancel: () => {
      clearTimeout(timeoutId);
      masterGain.disconnect();
      resolveFn(true); // resolve with true = was cancelled
    },
  };
}

const cardImages = [
  { src: '/card-images/1.png', alt: 'Wash Your Hands', className: 'card-1' },
  { src: '/card-images/2.png', alt: 'Times World', className: 'card-2' },
  { src: '/card-images/3.png', alt: 'Yummy Time', className: 'card-3' },
  { src: '/card-images/4.png', alt: 'Brush Your Teeth', className: 'card-4' },
  { src: '/card-images/5.png', alt: 'Bedtime Stories', className: 'card-5' },
  { src: '/card-images/6.png', alt: 'Adventure Time', className: 'card-6' },
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
  const [carouselActive, setCarouselActive] = useState(false);
  const [carouselReady, setCarouselReady] = useState(false);
  const [arrangement, setArrangement] = useState([0, 1, 2, 3, 4]);
  const [phase, setPhase] = useState('idle');
  const [reserve, setReserve] = useState(5);
  const [playingCard, setPlayingCard] = useState(null);
  const loadedCount = useRef(0);
  const deviceRef = useRef(null);
  const cardRefs = useRef([]);
  const flyAnimsRef = useRef([]);   // array of { cardIndex, anim }
  const melodyRef = useRef(null);   // current { promise, cancel }
  const audioCtxRef = useRef(null);
  const modelViewerRef = useRef(null);
  const countdown = useCountdown();

  const handleImageLoad = () => {
    loadedCount.current += 1;
    if (loadedCount.current === cardImages.length) {
      setAllLoaded(true);
    }
  };

  // Activate carousel after fan-in animations complete (~1.8s + pause)
  useEffect(() => {
    if (!allLoaded) return;
    const timer = setTimeout(() => setCarouselActive(true), 2200);
    return () => clearTimeout(timer);
  }, [allLoaded]);

  // Enable transitions one frame after carousel snap (prevents jump)
  useEffect(() => {
    if (!carouselActive) return;
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setCarouselReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, [carouselActive]);

  // Rotate cards right-to-left every 3.5s (only when idle)
  useEffect(() => {
    if (!carouselReady || phase !== 'idle') return;
    const timer = setInterval(() => {
      setArrangement(prev => [...prev.slice(1), prev[0]]);
    }, 3500);
    return () => clearInterval(timer);
  }, [carouselReady, phase]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (melodyRef.current) melodyRef.current.cancel();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Fly a card to the device from the top — returns the WAAPI animation
  const flyCardToDevice = (cardIndex) => {
    const cardEl = cardRefs.current[cardIndex];
    const deviceEl = deviceRef.current;
    if (!cardEl || !deviceEl) return null;

    const cardRect = cardEl.getBoundingClientRect();
    const deviceRect = deviceEl.getBoundingClientRect();

    const deviceCenterX = deviceRect.left + deviceRect.width / 2;
    const deviceTopY = deviceRect.top + deviceRect.height * 0.12;
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    const deltaX = deviceCenterX - cardCenterX;
    const deltaY = deviceTopY - cardCenterY;

    cardEl.getAnimations().forEach(a => a.cancel());

    const anim = cardEl.animate([
      {
        transform: 'translateX(-50%) translate(0px, 0px) scale(1) rotate(0deg)',
        opacity: 1,
      },
      {
        transform: `translateX(-50%) translate(${deltaX * 0.4}px, ${deltaY - 120}px) scale(0.45) rotate(3deg)`,
        opacity: 0.9,
        offset: 0.4,
      },
      {
        transform: `translateX(-50%) translate(${deltaX}px, ${deltaY - 50}px) scale(0.15) rotate(0deg)`,
        opacity: 0.75,
        offset: 0.75,
      },
      {
        transform: `translateX(-50%) translate(${deltaX}px, ${deltaY + 30}px) scale(0.12) rotate(0deg)`,
        opacity: 0,
      },
    ], {
      duration: 1800,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      fill: 'forwards',
    });

    flyAnimsRef.current.push({ cardIndex, anim });
    return anim;
  };

  // Cancel previous melody, play new one, handle cleanup when it finishes
  const startPlayback = async (cardIndex) => {
    if (melodyRef.current) {
      melodyRef.current.cancel();
      melodyRef.current = null;
    }

    setPlayingCard(cardIndex);

    const result = playMelody(audioCtxRef.current, cardIndex);
    melodyRef.current = result;

    const wasCancelled = await result.promise;
    if (wasCancelled) return; // another melody took over, bail out

    melodyRef.current = null;
    setPhase('returning');

    setTimeout(() => {
      // Cleanup ALL fly animations
      flyAnimsRef.current.forEach(({ anim: a, cardIndex: idx }) => {
        a.cancel();
        const el = cardRefs.current[idx];
        if (el) {
          el.style.display = '';
          el.style.transform = '';
          el.style.opacity = '';
        }
      });
      flyAnimsRef.current = [];

      setPlayingCard(null);
      setPhase('idle');
    }, 500);
  };

  const handleCardClick = (cardIndex) => {
    // Skip cards that already flew away or during transitions
    if (flyAnimsRef.current.some(f => f.cardIndex === cardIndex)) return;
    if (phase !== 'idle' && phase !== 'playing') return;

    // Ensure AudioContext is created/resumed on user gesture
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    // Shared sequence: vanish others → boom → flip card → fly to device → boom → reappear
    const runInsertSequence = (cardIdx, onArrangementUpdate) => {
      // Boom pulse on the clicked card (shockwave origin)
      const clickedEl = cardRefs.current[cardIdx];
      if (clickedEl) {
        clickedEl.animate([
          { scale: '1', filter: 'brightness(1)' },
          { scale: '1.2', filter: 'brightness(1.4)', offset: 0.35 },
          { scale: '1', filter: 'brightness(1)' },
        ], { duration: 600, easing: 'ease-out' });
      }

      // Vanish all other visible cards with burst effect
      arrangement.forEach(idx => {
        if (idx === cardIdx) return;
        const el = cardRefs.current[idx];
        if (!el) return;
        el.animate([
          { opacity: 1, scale: '1', filter: 'brightness(1)' },
          { opacity: 0.7, scale: '0.6', filter: 'brightness(1.5)', offset: 0.3 },
          { opacity: 0, scale: '0.15', filter: 'brightness(2)' },
        ], { duration: 600, fill: 'forwards', easing: 'ease-in' });
      });

      // After cards vanish, slowly flip the clicked card
      setTimeout(() => {
        const cardEl = cardRefs.current[cardIdx];
        if (!cardEl) return;

        const flipAnim = cardEl.animate([
          { rotate: 'y 0deg', scale: '1' },
          { rotate: 'y 90deg', scale: '1.1', offset: 0.25 },
          { rotate: 'y 180deg', scale: '1.2', offset: 0.5 },
          { rotate: 'y 270deg', scale: '1.1', offset: 0.75 },
          { rotate: 'y 360deg', scale: '1' },
        ], { duration: 1000, easing: 'ease-in-out' });

        flipAnim.onfinish = () => {
          // Fly card into device from the top
          const flyAnim = flyCardToDevice(cardIdx);
          if (!flyAnim) return;

          flyAnim.onfinish = () => {
            // Update arrangement
            const newArr = onArrangementUpdate();

            // Boom effect on device
            deviceRef.current?.classList.add('device-boom');

            // Reappear cards with pop-in
            newArr.forEach(idx => {
              const el = cardRefs.current[idx];
              if (!el) return;
              el.getAnimations().forEach(a => a.cancel());
              el.animate([
                { opacity: 0, scale: '0.5' },
                { opacity: 1, scale: '1.05', offset: 0.7 },
                { opacity: 1, scale: '1' },
              ], { duration: 400, easing: 'ease-out' });
            });

            setTimeout(() => {
              deviceRef.current?.classList.remove('device-boom');
              setPhase('playing');
              startPlayback(cardIdx);
            }, 550);
          };
        };
      }, 700);
    };

    if (phase === 'idle') {
      const currentReserve = reserve;
      setPhase('flying');
      setPlayingCard(cardIndex);

      runInsertSequence(cardIndex, () => {
        const newArr = [...arrangement.filter(i => i !== cardIndex), currentReserve];
        setArrangement(newArr);
        setReserve(cardIndex);
        return newArr;
      });

    } else if (phase === 'playing') {
      const previousCard = playingCard;
      setPhase('flying');

      // Cancel current melody
      if (melodyRef.current) {
        melodyRef.current.cancel();
        melodyRef.current = null;
      }

      // Bring previous card back (cancel fly animation)
      flyAnimsRef.current.forEach(({ anim, cardIndex: idx }) => {
        anim.cancel();
        const el = cardRefs.current[idx];
        if (el) {
          el.style.display = '';
          el.style.transform = '';
          el.style.opacity = '';
        }
      });
      flyAnimsRef.current = [];

      setPlayingCard(cardIndex);

      runInsertSequence(cardIndex, () => {
        const newArr = arrangement.map(i => i === cardIndex ? previousCard : i);
        setArrangement(newArr);
        setReserve(cardIndex);
        return newArr;
      });
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
      <div className={`hero-content${phase !== 'idle' ? ' hero-hidden' : ''}`}>
        <h1>Your Child's Screen Free<br />Learning Companion</h1>
        <p>The friend who never gets tired of answering<br />questions.</p>
      </div>
      <div className={`card-fan ${allLoaded ? 'animate' : ''} ${carouselActive ? 'carousel' : ''} ${carouselReady ? 'ready' : ''}`}>
        {cardImages.map((card, index) => {
          const slotIndex = carouselActive ? arrangement.indexOf(index) : index;
          const hasSlot = carouselActive && slotIndex !== -1;
          const isCenter = slotIndex === 2 && carouselActive;
          const isClickable = (isCenter && phase === 'idle') || (hasSlot && phase === 'playing');
          return (
            <div
              key={card.className}
              ref={el => { cardRefs.current[index] = el; }}
              className={`card-fan-item ${card.className}${isCenter && phase === 'idle' ? ' attention' : ''}${phase === 'playing' && hasSlot ? ' clickable' : ''}`}
              data-slot={hasSlot ? slotIndex : undefined}
              onClick={isClickable ? () => handleCardClick(index) : undefined}
            >
              <img src={card.src} alt={card.alt} onLoad={handleImageLoad} />
            </div>
          );
        })}
      </div>
      <div className="device-3d" ref={deviceRef}>
        {playingCard !== null && (
          <div className={`device-screen-overlay ${phase === 'playing' ? 'visible' : ''}`}>
            <img src={cardImages[playingCard].src} alt={cardImages[playingCard].alt} />
          </div>
        )}
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
            modelViewerRef.current = el;
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
