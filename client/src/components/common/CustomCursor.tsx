// client/src/components/common/CustomCursor.tsx
import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDonateHover, setIsDonateHover] = useState(false);
  const [cursorText, setCursorText] = useState('SAVE FOOD');
  const [isTouch, setIsTouch] = useState(false);

  const ringRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  // Mouse coordinates (immediate)
  const mousePos = useRef({ x: -100, y: -100 });
  // Interpolated smooth coordinates for pill delay
  const smoothPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check for touch device or reduced motion
    const touchCheck = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (touchCheck || reducedMotion) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [data-cursor-interactive]');
        const isDonate = target.closest('[data-cursor-donate]');
        const customText = target.closest('[data-cursor-text]')?.getAttribute('data-cursor-text');

        setIsHovering(!!interactive);
        setIsDonateHover(!!isDonate);
        setCursorText(customText || (isDonate ? 'RESCUE' : 'SAVE FOOD'));
      }
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    let animationFrameId: number;

    const render = () => {
      // Ring follows immediately
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // Glassmorphism pill follows with spring / lerp delay
      const ease = 0.15;
      smoothPos.current.x += (mousePos.current.x - smoothPos.current.x) * ease;
      smoothPos.current.y += (mousePos.current.y - smoothPos.current.y) * ease;

      if (pillRef.current) {
        pillRef.current.style.transform = `translate3d(${smoothPos.current.x}px, ${smoothPos.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible]);

  if (isTouch || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* 1. Outlined cursor ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-4 -mt-4 w-8 h-8 rounded-full border border-saveplate-neon/60 transition-transform duration-75 ease-out flex items-center justify-center ${
          isHovering ? 'scale-150 border-saveplate-neon' : 'scale-100'
        } ${isDonateHover ? 'border-[#39FF14] bg-saveplate-neon/10 shadow-neon' : ''}`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-saveplate-neon" />
      </div>

      {/* 2. Glassmorphism pill trailing with subtle spring delay */}
      <div
        ref={pillRef}
        className={`fixed top-0 left-0 ml-5 mt-5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-200 backdrop-blur-md border ${
          isDonateHover
            ? 'bg-saveplate-neon text-black border-saveplate-neon shadow-neon'
            : isHovering
            ? 'bg-saveplate-forest/90 text-saveplate-neon border-saveplate-neon/40 shadow-glass scale-110'
            : 'bg-saveplate-deep/70 text-saveplate-cream/80 border-white/10'
        }`}
      >
        {cursorText}
      </div>
    </div>
  );
};

