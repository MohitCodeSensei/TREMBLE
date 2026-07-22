"use client";
import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PointerTrail() {
  const trailRef = useRef(null);
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {

    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update CSS variables for other elements to be reactive
      document.documentElement.style.setProperty('--mouse-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${mouseY}px`);

      setIsVisible(true);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout to fade out when mouse stops
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 150); // Fades away quickly after stopping
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop for smooth trailing effect
    const animate = () => {
      // Easing function for smooth follow
      trailX += (mouseX - trailX) * 0.1;
      trailY += (mouseY - trailY) * 0.1;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailX}px, ${trailY}px)`;
      }

      requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const zIndexClass = pathname === '/login' ? 'z-50' : 'z-0';

  return (
    <>
      <style>{`
        @keyframes hueCycle {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `}</style>
      <div 
        className={`pointer-events-none fixed top-0 left-0 ${zIndexClass} mix-blend-screen transition-opacity duration-1000`}
        style={{ opacity: isVisible ? 1 : 0, animation: 'hueCycle 10s linear infinite' }}
        ref={trailRef}
      >
        {/* Massive 1000px faint multicolored trail */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500 rounded-full blur-[150px] opacity-[0.03] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500 rounded-full blur-[120px] opacity-[0.04] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 rounded-full blur-[100px] opacity-[0.05] animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
      </div>
    </>
  );
}
