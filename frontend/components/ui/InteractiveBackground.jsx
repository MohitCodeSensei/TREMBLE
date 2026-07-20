"use client";
import React, { useEffect, useState } from 'react';

const InteractiveBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-40 transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.15) 0%, transparent 50%)`
        }}
      />
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/20" />

      {/* Static subtle blobs for depth */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-white/5 blur-3xl" />
    </div>
  );
};

export default InteractiveBackground;
