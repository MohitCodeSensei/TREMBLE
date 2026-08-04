"use client";
import React, { useState, useRef } from 'react';

const ContributorCard = ({ contributor }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Higher intensity than Tremlist (30 instead of 15)
    const rotateX = ((y - centerY) / centerY) * -30;
    const rotateY = ((x - centerX) / centerX) * 30;

    setRotation({ x: rotateX, y: rotateY });
    
    setMousePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <a
      href={contributor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-12px)] flex-shrink-0"
    >
      <div
        ref={cardRef}
        className="relative w-full cursor-pointer z-10 hover:z-20"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="w-full flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl transition-all duration-[250ms] ease-out border border-white/5 shadow-xl overflow-hidden"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.08 : 1})`,
            transformStyle: 'preserve-3d',
            boxShadow: isHovered ? `0 30px 60px rgba(0,0,0,0.8), ${rotation.y * -1.5}px ${rotation.x * -1.5}px 30px rgba(255,255,255,0.2)` : '0 10px 20px rgba(0,0,0,0.4)',
          }}
        >
          <div 
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-zinc-800 flex-shrink-0 transition-transform duration-[250ms] ease-out z-30 relative border border-white/10"
            style={{ transform: `translateZ(${isHovered ? '20px' : '0px'})`, borderColor: isHovered ? 'white' : 'rgba(255,255,255,0.1)' }}
          >
            <img loading="lazy" src={`${contributor.url}.png`} alt={contributor.name} className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`} />
          </div>
          
          <div className="flex flex-col z-30 relative" style={{ transform: `translateZ(${isHovered ? '30px' : '0px'})` }}>
            <span className={`font-bold transition-all duration-300 ${isHovered ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]' : 'text-zinc-300'}`}>
              {contributor.name}
            </span>
            <span className="text-zinc-500 text-sm">GitHub Profile</span>
          </div>
          
          {isHovered && (
            <div 
              className="absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300 opacity-80 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.9) 0%, transparent 50%)`
              }}
            />
          )}
        </div>
      </div>
    </a>
  );
};

export default ContributorCard;
