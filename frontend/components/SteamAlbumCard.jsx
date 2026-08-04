"use client";
import React, { useRef, useState } from 'react';
import SafeImage from './SafeImage';

export default function SteamAlbumCard({ album, onClick, className = '' }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50, rx: 0, ry: 0, isHovered: false });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    const py = Math.min(Math.max((y / rect.height) * 100, 0), 100);
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -14; // rotateX
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 14;  // rotateY
    setCoords({ x: px, y: py, rx, ry, isHovered: true });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 50, y: 50, rx: 0, ry: 0, isHovered: false });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`isolate relative flex flex-col gap-3 group cursor-pointer select-none ${className || 'min-w-[140px] w-[140px] md:min-w-[calc((100%-12rem)/7)] md:w-[calc((100%-12rem)/7)] shrink-0'}`}
      style={{ 
        perspective: '1000px',
        zIndex: coords.isHovered ? 50 : 1
      }}
    >
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 transition-transform duration-200 ease-out z-20"
        style={{
          transform: coords.isHovered
            ? `rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) scale3d(1.05, 1.05, 1.05)`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          boxShadow: coords.isHovered
            ? '0 20px 40px rgba(0,0,0,0.7), 0 0 25px rgba(99,102,241,0.45), inset 0 0 0 1px rgba(255,255,255,0.4)'
            : '0 8px 16px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)'
        }}
      >
        <SafeImage
          src={album.cover_url}
          alt={album.title}
          title={album.title}
          artist={album.artist}
          type="album"
          className="w-full h-full object-cover transition-transform duration-500"
          useOriginalSize={true}
        />

        {/* Steam Trading Card Holographic Sheen Layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-color-dodge z-10"
          style={{
            opacity: coords.isHovered ? 0.85 : 0,
            background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.9) 0%, rgba(200,230,255,0.45) 25%, rgba(255,180,240,0.35) 45%, rgba(130,220,255,0.2) 65%, transparent 80%), linear-gradient(${coords.rx * 8}deg, rgba(255,255,255,0.15) 0%, rgba(255,215,0,0.25) 50%, rgba(138,43,226,0.25) 100%)`
          }}
        />

        {/* Subtle foil diagonal highlight sweep */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-10"
          style={{
            opacity: coords.isHovered ? 0.4 : 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, transparent 40%, rgba(255,255,255,0.5) 60%, transparent 100%)'
          }}
        />

        {/* Metallic Foil Border Highlight */}
        <div className="absolute inset-0 border border-white/25 rounded-2xl pointer-events-none z-20" />
      </div>

      <div className="flex flex-col mt-1">
        <span className="text-white font-bold text-base truncate w-full group-hover:text-indigo-400 transition-colors">
          {album.title}
        </span>
        <span className="text-zinc-400 text-sm truncate font-medium mt-0.5">
          {album.artist || 'Album'}
        </span>
      </div>
    </div>
  );
}
