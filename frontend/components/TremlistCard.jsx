"use client";
import React, { useState, useRef } from 'react';
import Link from 'next/link';

const getHighResImage = (url) => {
  if (!url) return '';
  if (url.includes('=w')) {
    return url.substring(0, url.indexOf('=w')) + '=w1200-h1200';
  }
  return url;
};

const TremlistCard = ({ playlist }) => {
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

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

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
    <Link href={`/playlist/${playlist.id}`} className="block w-full sm:w-44 flex-shrink-0">
      <div
        ref={cardRef}
        className="relative w-full aspect-square rounded-2xl cursor-pointer z-10 hover:z-20"
        style={{ perspective: '1000px' }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="w-full h-full rounded-2xl transition-all duration-[250ms] ease-out border border-white/5 shadow-xl overflow-hidden bg-zinc-800"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovered ? 1.05 : 1})`,
            transformStyle: 'preserve-3d',
            boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,0.6), ${rotation.y * -1}px ${rotation.x * -1}px 20px rgba(255,255,255,0.1)` : '0 10px 20px rgba(0,0,0,0.4)',
          }}
        >
          <img loading="lazy" 
            src={getHighResImage(playlist.cover_url && (playlist.cover_url.includes('Mohit Mahajan') || playlist.cover_url.includes('tremlist_static.jpeg')) ? '/images/tremlist_static.jpeg' : (playlist.cover_url || '/images/tremlist_static.jpeg'))} 
            alt={playlist.title} 
            className={`w-full h-full object-cover transition-transform duration-500 ease-out transform ${isHovered ? 'scale-110' : 'scale-100'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end opacity-100 z-10">
            <h3 
              className="text-xl font-bold text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate transition-transform duration-[250ms] ease-out"
              style={{ transform: `translateZ(${isHovered ? '30px' : '0px'})` }}
            >
              {playlist.title}
            </h3>
            <p 
              className="text-zinc-300 font-medium text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-transform duration-[250ms] ease-out"
              style={{ transform: `translateZ(${isHovered ? '20px' : '0px'})` }}
            >
              {playlist.tracks?.length || 0} tracks
            </p>
          </div>
          
          {isHovered && (
            <div 
              className="absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300 opacity-60 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`
              }}
            />
          )}
        </div>
      </div>
    </Link>
  );
};

export default TremlistCard;
