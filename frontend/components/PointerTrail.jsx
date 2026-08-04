"use client";
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PointerTrail() {
  const trailRef = useRef(null);
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let mouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    let mouseY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    let trailX = mouseX;
    let trailY = mouseY;
    let animId;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);

      setIsVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Fades away smoothly after cursor stops moving
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Easing function for smooth organic follow
      trailX += (mouseX - trailX) * 0.12;
      trailY += (mouseY - trailY) * 0.12;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };
    
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, []);

  if (!pathname || pathname.startsWith('/artist') || pathname.startsWith('/trembler') || pathname.startsWith('/library/genre') || pathname.startsWith('/album')) return null;

  return (
    <>
      <style>{`
        @keyframes hueCycle {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
      <div 
        className="pointer-events-none fixed top-0 left-0 z-[1] mix-blend-screen transition-opacity duration-700 ease-out will-change-transform"
        style={{ opacity: isVisible ? 1 : 0, animation: 'hueCycle 12s linear infinite' }}
        ref={trailRef}
      >
        {/* Multilayered vibrant ambient glowing pointer trail */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/20 rounded-full blur-[60px] pointer-events-none" />
      </div>
    </>
  );
}
