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
  const fontSizeRef = useRef(40);
  const morphProgressRef = useRef(0);

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

    // 1. Generate waving grid particles across full canvas + bleed
    const gridSpacing = isSmallScreen ? 11 : 15;
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
          size: isSmallScreen
            ? Math.random() * 0.3 + 1.3
            : Math.random() * 0.6 + 2.2,
          currentAlpha: isSmallScreen ? 0.42 : 0.58,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // 2. Offscreen canvas to sample 'LifeStored' letter coordinates
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    // Proportional font sizing: centered vertically with generous breathing room
    let fontSize: number;
    if (isSmallScreen) {
      fontSize = Math.min(
        Math.max(width * 0.105, 34),
        Math.min(44, height * 0.22)
      );
    } else {
      fontSize = Math.min(
        Math.max(width * 0.075, 54),
        Math.min(92, height * 0.30)
      );
    }

    fontSizeRef.current = fontSize;

    offCtx.fillStyle = '#000000';
    offCtx.font = `700 ${fontSize}px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('LifeStored', width / 2, height / 2);

    const imgData = offCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Collect candidate points across the full word from top to bottom
    const candidates: { x: number; y: number }[] = [];
    const step = isSmallScreen ? 2.0 : 3.2;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const px = Math.floor(x);
        const py = Math.floor(y);
        const index = (py * width + px) * 4;
        if (data[index + 3] > 110) {
          const jitterX = (Math.random() - 0.5) * (isSmallScreen ? 0.4 : 0.7);
          const jitterY = (Math.random() - 0.5) * (isSmallScreen ? 0.4 : 0.7);
          candidates.push({ x: x + jitterX, y: y + jitterY });
        }
      }
    }

    // Uniformly downsample candidates so text consumes at most 38% of total particles
    const maxTextPoints = Math.min(candidates.length, Math.floor(particles.length * 0.38));
    const textPoints: { x: number; y: number }[] = [];

    if (candidates.length <= maxTextPoints) {
      textPoints.push(...candidates);
    } else {
      const stride = candidates.length / maxTextPoints;
      for (let i = 0; i < maxTextPoints; i++) {
        textPoints.push(candidates[Math.floor(i * stride)]);
      }
    }

    // 3. Nearest-Neighbor Assignment
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
      height = Math.floor(rect.height || (width <= 768 ? 220 : 300));

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

      // Smooth ease-out morph progress: 0.0 (wave) <-> 1.0 (fully formed)
      if (hovered) {
        morphProgressRef.current += (1.0 - morphProgressRef.current) * 0.045;
      } else {
        morphProgressRef.current += (0.0 - morphProgressRef.current) * 0.052;
      }

      const morph = morphProgressRef.current;
      const lerpSpeed = isSmallScreen ? 0.055 : 0.048;

      // TIMED CROSSFADE CURVE:
      // - Phase 1 (0.0 to 0.50): Dots stream inward from wave toward letters. Solid text is hidden (0%).
      // - Phase 2 (0.50 to 0.88): Dots seamlessly fade out (1.0 -> 0.0) while perfect solid word fades in (0.0 -> 1.0).
      // - Phase 3 (0.88 to 1.0): Dots are completely faded out (0%), leaving only the 100% crisp, gap-free vector word!
      const crossfadeStart = 0.50;
      const crossfadeEnd = 0.88;
      const crossfadeSpan = crossfadeEnd - crossfadeStart;

      let textDotsFade = 1.0;
      let solidTextAlpha = 0.0;

      if (morph >= crossfadeStart) {
        const progress = Math.min(1.0, (morph - crossfadeStart) / crossfadeSpan);
        textDotsFade = Math.max(0, 1.0 - progress);
        solidTextAlpha = Math.min(1.0, progress);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (hovered) {
          if (p.hasTextTarget) {
            // Glide smoothly toward target letter positions
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.x += dx * lerpSpeed;
            p.y += dy * lerpSpeed;

            // Only draw text particles if they haven't faded out yet
            const finalDotAlpha = p.currentAlpha * textDotsFade;

            if (finalDotAlpha > 0.02) {
              const breath = Math.sin(elapsed * 2.2 + p.phase) * (isSmallScreen ? 0.06 : 0.12);
              const drawX = p.x + breath;
              const drawY = p.y + breath;

              ctx.beginPath();
              ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 0, 0, ${finalDotAlpha.toFixed(2)})`;
              ctx.fill();
            }
          } else {
            // Ambient wave particles maintain continuous visible wave around the formed text
            const waveY =
              Math.sin(elapsed * 1.8 + p.baseX * 0.012 + p.baseY * 0.016) * (isSmallScreen ? 8 : 13) +
              Math.cos(elapsed * 1.3 + p.baseX * 0.02) * (isSmallScreen ? 4 : 5.5);
            const waveX = Math.cos(elapsed * 1.4 + p.baseY * 0.018) * (isSmallScreen ? 3 : 4);

            const idleTargetX = p.baseX + waveX;
            const idleTargetY = p.baseY + waveY;

            p.x += (idleTargetX - p.x) * 0.035;
            p.y += (idleTargetY - p.y) * 0.035;

            // Active ambient alpha: 0.28 on mobile so the wave remains alive
            const targetAlpha = isSmallScreen ? 0.28 : 0.14;
            p.currentAlpha += (targetAlpha - p.currentAlpha) * 0.05;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
            ctx.fill();
          }
        } else {
          // Undulating continuous sine & cosine waves filling the entire viewport
          const waveAmpY = isSmallScreen ? 11 : 16;
          const waveY =
            Math.sin(elapsed * 2.0 + p.baseX * 0.012 + p.baseY * 0.016) * waveAmpY +
            Math.cos(elapsed * 1.4 + p.baseX * 0.02) * (waveAmpY * 0.5);
          const waveX = Math.cos(elapsed * 1.6 + p.baseY * 0.018) * (isSmallScreen ? 3 : 4.5);

          const idleTargetX = p.baseX + waveX;
          const idleTargetY = p.baseY + waveY;

          // Smooth return to idle wave
          p.x += (idleTargetX - p.x) * 0.04;
          p.y += (idleTargetY - p.y) * 0.04;

          const depth = (Math.sin(elapsed * 2.0 + p.baseX * 0.012) + 1) * 0.5;
          const targetAlpha = isSmallScreen ? 0.32 + depth * 0.32 : 0.38 + depth * 0.44;
          p.currentAlpha += (targetAlpha - p.currentAlpha) * 0.05;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 0, 0, ${p.currentAlpha.toFixed(2)})`;
          ctx.fill();
        }
      }

      // Seamless Solid Typography Fade-in:
      // Fades in precisely as the text dots fade out, forming a 100% gapless, vector-perfect word
      if (solidTextAlpha > 0.01) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${solidTextAlpha.toFixed(3)})`;
        ctx.font = `700 ${fontSizeRef.current}px "Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('LifeStored', width / 2, height / 2);
        ctx.restore();
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
