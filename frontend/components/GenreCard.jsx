"use client";
import React, { useState, useRef, useEffect } from 'react';

const GenreCard = ({ title, imageUrl }) => {
  const cardRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // percentage

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top; 
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation: max 15 degrees
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setRotation({ x: rotateX, y: rotateY });
    
    // For shine effect
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
    <div
      ref={cardRef}
      className="relative w-full h-48 rounded-xl cursor-pointer z-10 hover:z-20"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="w-full h-full rounded-xl transition-all duration-[250ms] ease-out border border-white/5 shadow-2xl overflow-hidden flex items-end p-5"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.08 : 1})`,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,0.6), ${rotation.y * -1}px ${rotation.x * -1}px 20px rgba(255,255,255,0.1)` : '0 10px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Background Image - Saturates on Hover */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform ${isHovered ? 'saturate-100 scale-110' : 'saturate-50 scale-100'}`}
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />

        {/* Steam-style Shine effect on hover */}
        {isHovered && (
          <div 
            className="absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300 opacity-60"
            style={{
              background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`
            }}
          />
        )}

        {/* 3D Text Element */}
        <h3 
          className="relative z-30 text-white font-black text-2xl tracking-widest uppercase transition-transform duration-[250ms] ease-out drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
          style={{ transform: `translateZ(${isHovered ? '40px' : '0px'})` }}
        >
          {title}
        </h3>
      </div>
    </div>
  );
};

export default GenreCard;
