'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  targetX: number;
  targetY: number;
  hasTextTarget: boolean;
  size: number;
  currentAlpha: number;
  phase: number;
}

export default function WavingDotsFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isTouchOrSmall =
        window.innerWidth <= 768 ||
        (typeof window !== 'undefined' &&
          window.matchMedia('(pointer: coarse)').matches);
      setIsMobile(isTouchOrSmall);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Automatic animation loop on mobile view without requiring hover
  useEffect(() => {
    if (!isMobile) return;

    let isVisible = false;
    let timerId: NodeJS.Timeout | null = null;
    let currentPhase: 'wave' | 'formed' = 'wave';

    const triggerCycle = () => {
      if (!isVisible) return;

      if (currentPhase === 'wave') {
        currentPhase = 'formed';
        setIsHovered(true);
        timerId = setTimeout(triggerCycle, 3800); // Display formed 'LifeStored' for 3.8s
      } else {
        currentPhase = 'wave';
        setIsHovered(false);
        timerId = setTimeout(triggerCycle, 2400); // Ambient wave for 2.4s
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible = true;
            if (!timerId) {
              timerId = setTimeout(triggerCycle, 800);
            }
          } else {
            isVisible = false;
            if (timerId) {
              clearTimeout(timerId);
              timerId = null;
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (timerId) clearTimeout(timerId);
    };
  }, [isMobile]);

  const initParticlesAndText = useCallback((width: number, height: number) => {
    const isSmallScreen = width <= 768;

    // 1. Offscreen high-res canvas to render and sample 'LifeStored' letter coordinates
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Proportional font sizing: clean balance between screen width and height
    let fontSize: number;
    if (isSmallScreen) {
      // Mobile: between 34px and 44px, comfortably filling ~75% width with clear margins
      fontSize = Math.min(
        Math.max(width * 0.105, 32),
        Math.min(44, height * 0.26)
      );
    } else {
      fontSize = Math.min(
        Math.max(width * 0.075, 54),
        Math.min(92, height * 0.32)
      );
    }

    offCtx.fillStyle = '#000000';
    offCtx.font = `700 ${fontSize}px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('LifeStored', width / 2, height / 2);

    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // High-density organic sampling:
    // step = 1.4 on mobile, 3.2 on desktop
    // Organic subpixel jitter eliminates rigid square-grid checkerboard artifacts!
    const textPoints: { x: number; y: number }[] = [];
    const step = isSmallScreen ? 1.4 : 3.2;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const px = Math.floor(x);
        const py = Math.floor(y);
        const index = (py * width + px) * 4;
        if (data[index + 3] > 100) {
          // Subtle organic jitter creates continuous, silky typography contours
          const jitterX = (Math.random() - 0.5) * (isSmallScreen ? 0.6 : 0.9);
          const jitterY = (Math.random() - 0.5) * (isSmallScreen ? 0.6 : 0.9);
          textPoints.push({ x: x + jitterX, y: y + jitterY });
        }
      }
    }

    // 2. Generate waving grid particles across full canvas + bleed
    const gridSpacing = isSmallScreen ? 9.5 : 14;
    const cols = Math.ceil(width / gridSpacing) + 2;
    const rows = Math.ceil(height / gridSpacing) + 2;

    const particles: Particle[] = [];

    for (let r = -1; r <= rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const baseX = c * gridSpacing + (Math.random() - 0.5) * 1.5;
        const baseY = r * gridSpacing + (Math.random() - 0.5) * 1.5;

        particles.push({
          x: baseX,
          y: baseY,
          baseX,
          baseY,
          targetX: baseX,
          targetY: baseY,
          hasTextTarget: false,
          // Mobile dots: 1.1px - 1.35px for a fine silky particle cloth
          // Desktop dots: 2.0px - 2.6px
          size: isSmallScreen
            ? Math.random() * 0.25 + 1.1
            : Math.random() * 0.5 + 2.0,
          currentAlpha: isSmallScreen ? 0.42 : 0.58,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // 3. Nearest-Neighbor Assignment:
    // Match each text point to the closest idle particle so dots glide effortlessly into place
    const available = [...particles];
    for (let i = 0; i < textPoints.length; i++) {
      const tp = textPoints[i];
      let bestIdx = -1;
      let minDistSq = Infinity;

      for (let j = 0; j < available.length; j++) {
        const p = available[j];
        const dx = p.baseX - tp.x;
        const dy = p.baseY - tp.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          bestIdx = j;
        }
      }

      if (bestIdx !== -1) {
        const chosen = available[bestIdx];
        chosen.targetX = tp.x;
        chosen.targetY = tp.y;
        chosen.hasTextTarget = true;
        available.splice(bestIdx, 1);
      }
    }

    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = Math.floor(rect.width || window.innerWidth);
      height = Math.floor(rect.height || (width <= 768 ? 175 : 300));

      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticlesAndText(width, height);
    };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(handleResize);
    } else {
      handleResize();
    }

    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      const hovered = isHoveredRef.current;
      const particles = particlesRef.current;
      const isSmallScreen = width <= 768;

      const lerpSpeed = isSmallScreen ? 0.058 : 0.048;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (hovered) {
          if (p.hasTextTarget) {
            // Glide smoothly toward target letter positions
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.x += dx * lerpSpeed;
            p.y += dy * lerpSpeed;

            // Deep solid black for formed letters
            p.currentAlpha += (1.0 - p.currentAlpha) * 0.08;

            // Subtle organic breathing micro-motion
            const breath = Math.sin(elapsed * 2.2 + p.phase) * (isSmallScreen ? 0.08 : 0.16);
            const drawX = p.x + breath;
            const drawY = p.y + breath;

            // Text dot size: slightly overlapping (1.1px on mobile) to create continuous smooth strokes
            const drawSize = isSmallScreen ? 1.1 : p.size * 0.9;

            ctx.beginPath();
            ctx.arc(drawX, drawY, drawSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
            ctx.fill();
          } else {
            // Background wave dots maintain active ambient presence (not empty white space)
            const waveY =
              Math.sin(elapsed * 1.8 + p.baseX * 0.012 + p.baseY * 0.016) * (isSmallScreen ? 7 : 12) +
              Math.cos(elapsed * 1.3 + p.baseX * 0.02) * (isSmallScreen ? 3.5 : 5);
            const waveX = Math.cos(elapsed * 1.4 + p.baseY * 0.018) * (isSmallScreen ? 2.5 : 4);

            const idleTargetX = p.baseX + waveX;
            const idleTargetY = p.baseY + waveY;

            p.x += (idleTargetX - p.x) * 0.035;
            p.y += (idleTargetY - p.y) * 0.035;

            // Active ambient wave alpha so wave is clearly textured and visible around text
            const targetAlpha = isSmallScreen ? 0.32 : 0.16;
            p.currentAlpha += (targetAlpha - p.currentAlpha) * 0.05;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (isSmallScreen ? 1.05 : 0.85), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
            ctx.fill();
          }
        } else {
          // Undulating continuous sine & cosine waves filling the entire viewport
          const waveAmpY = isSmallScreen ? 9 : 15;
          const waveY =
            Math.sin(elapsed * 2.0 + p.baseX * 0.012 + p.baseY * 0.016) * waveAmpY +
            Math.cos(elapsed * 1.4 + p.baseX * 0.02) * (waveAmpY * 0.5);
          const waveX = Math.cos(elapsed * 1.6 + p.baseY * 0.018) * (isSmallScreen ? 2.5 : 4.5);

          const idleTargetX = p.baseX + waveX;
          const idleTargetY = p.baseY + waveY;

          // Smooth return to idle wave
          p.x += (idleTargetX - p.x) * 0.04;
          p.y += (idleTargetY - p.y) * 0.04;

          // Depth wave alpha calculation (0.28 to 0.55 on mobile for clear, silky texture)
          const depth = (Math.sin(elapsed * 2.0 + p.baseX * 0.012) + 1) * 0.5;
          const targetAlpha = isSmallScreen ? 0.30 + depth * 0.28 : 0.38 + depth * 0.44;
          p.currentAlpha += (targetAlpha - p.currentAlpha) * 0.05;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
          ctx.fill();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [initParticlesAndText]);

  const handleMobileToggle = () => {
    if (isMobile) {
      setIsHovered((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fullscreen-dots-canvas-wrapper"
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={handleMobileToggle}
      role="region"
      aria-label="Interactive LifeStored Waving Dots Particle Canvas"
    >
      <canvas ref={canvasRef} className="fullscreen-dots-canvas" />
    </div>
  );
}
