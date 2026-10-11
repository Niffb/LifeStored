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
  const isMobileRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  // Mobile detection: screen width <= 768px or coarse pointer (touch device)
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

  // Automatic animation loop on mobile view without needing hover
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
              // Smooth initial 1s wave before first auto-morphing
              timerId = setTimeout(triggerCycle, 1000);
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

    // 1. Offscreen canvas to sample 'LifeStored' letter coordinates
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Dynamically calculate font size so 'LifeStored' spans ~80% of width on mobile
    // and looks balanced and prominent on desktop
    let fontSize: number;
    if (isSmallScreen) {
      fontSize = Math.min(
        Math.max(width * 0.13, 36),
        Math.min(54, height * 0.28)
      );
    } else {
      fontSize = Math.min(
        Math.max(width * 0.082, 56),
        Math.min(104, height * 0.32)
      );
    }

    offCtx.fillStyle = '#000000';
    offCtx.font = `800 ${fontSize}px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('LifeStored', width / 2, height / 2);

    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Sampling step: 4 on mobile for high-definition lettering, 5.5 on desktop
    const textPoints: { x: number; y: number }[] = [];
    const step = isSmallScreen ? 4 : 5.5;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = Math.floor(y) * width * 4 + Math.floor(x) * 4;
        if (data[index + 3] > 140) {
          textPoints.push({ x: Math.floor(x), y: Math.floor(y) });
        }
      }
    }

    // 2. Generate waving grid particles spanning FULL width & height + extra bleed
    const gridSpacing = isSmallScreen ? 13 : 17;
    const cols = Math.ceil(width / gridSpacing) + 2;
    const rows = Math.ceil(height / gridSpacing) + 2;

    const particles: Particle[] = [];

    for (let r = -1; r <= rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const baseX = c * gridSpacing;
        const baseY = r * gridSpacing;

        particles.push({
          x: baseX,
          y: baseY,
          baseX,
          baseY,
          targetX: baseX,
          targetY: baseY,
          hasTextTarget: false,
          // Mobile dots: ~1.8 - 2.4px radius (crisp on high-DPI displays)
          // Desktop dots: ~2.8 - 3.6px radius
          size: isSmallScreen
            ? Math.random() * 0.5 + 1.8
            : Math.random() * 0.7 + 2.8,
          currentAlpha: 0.65,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // 3. Optimal Nearest-Neighbor Assignment:
    // Match each text point to its closest grid particle so particles glide smoothly into place
    const availableParticles = [...particles];
    for (let i = 0; i < textPoints.length; i++) {
      const tp = textPoints[i];
      let bestIdx = -1;
      let minDistSq = Infinity;

      for (let j = 0; j < availableParticles.length; j++) {
        const p = availableParticles[j];
        const dx = p.baseX - tp.x;
        const dy = p.baseY - tp.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          bestIdx = j;
        }
      }

      if (bestIdx !== -1) {
        const chosen = availableParticles[bestIdx];
        chosen.targetX = tp.x;
        chosen.targetY = tp.y;
        chosen.hasTextTarget = true;
        availableParticles.splice(bestIdx, 1);
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
      height = Math.floor(rect.height || (width <= 768 ? 260 : 340));

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticlesAndText(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      ctx.clearRect(0, 0, width, height);

      const hovered = isHoveredRef.current;
      const particles = particlesRef.current;

      const lerpSpeed = 0.048;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (hovered) {
          if (p.hasTextTarget) {
            // Smooth glide toward target letter positions
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.x += dx * lerpSpeed;
            p.y += dy * lerpSpeed;

            // Crisp solid black for formed text
            p.currentAlpha += (1.0 - p.currentAlpha) * 0.06;

            // Subtle organic breathing micro-motion
            const breath = Math.sin(elapsed * 2.2 + p.phase) * 0.22;
            const drawX = p.x + breath;
            const drawY = p.y + breath;

            ctx.beginPath();
            ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
            ctx.fill();
          } else {
            // Ambient background particles remain in gentle wave but fade to faint shimmer
            const waveY =
              Math.sin(elapsed * 1.8 + p.baseX * 0.01 + p.baseY * 0.014) * 14 +
              Math.cos(elapsed * 1.3 + p.baseX * 0.018) * 6;
            const waveX = Math.cos(elapsed * 1.4 + p.baseY * 0.016) * 4;

            const idleTargetX = p.baseX + waveX;
            const idleTargetY = p.baseY + waveY;

            p.x += (idleTargetX - p.x) * 0.035;
            p.y += (idleTargetY - p.y) * 0.035;

            // Fade softly to 0.035 so central LifeStored stands out cleanly
            p.currentAlpha += (0.035 - p.currentAlpha) * 0.05;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
            ctx.fill();
          }
        } else {
          // Undulating continuous sine & cosine waves filling the entire viewport
          const waveY =
            Math.sin(elapsed * 2.0 + p.baseX * 0.01 + p.baseY * 0.014) * 16 +
            Math.cos(elapsed * 1.4 + p.baseX * 0.018) * 8;
          const waveX = Math.cos(elapsed * 1.6 + p.baseY * 0.016) * 5;

          const idleTargetX = p.baseX + waveX;
          const idleTargetY = p.baseY + waveY;

          // Smooth return to the idle wave
          p.x += (idleTargetX - p.x) * 0.038;
          p.y += (idleTargetY - p.y) * 0.038;

          // Depth wave alpha calculation
          const depth = (Math.sin(elapsed * 2.0 + p.baseX * 0.01) + 1) * 0.5;
          const targetAlpha = 0.42 + depth * 0.48;
          p.currentAlpha += (targetAlpha - p.currentAlpha) * 0.04;

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
