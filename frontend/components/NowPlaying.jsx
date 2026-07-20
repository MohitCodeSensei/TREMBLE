"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X } from 'lucide-react';

const NowPlaying = () => {
  const {
    currentTrack,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
  } = usePlayer();

  if (!isNowPlayingOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{ background: `radial-gradient(circle at center, ${currentTrack.primaryColor || '#7c3aed'} 0%, #000 100%)` }}
        />
        <div className="absolute inset-0 opacity-30" />
      </div>

      {/* Close Button */}
      <button
        onClick={() => setIsNowPlayingOpen(false)}
        className="absolute top-8 right-8 z-50 p-3 rounded-lg glass-btn text-white"
      >
        <X size={24} />
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl h-full max-h-[80vh] bg-black border border-zinc-800 rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Album Art */}
        <div className="w-full md:w-1/2 h-full p-8 flex items-center justify-center bg-black/20">
          <div className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl ring-1 ring-zinc-800">
            <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right: Lyrics */}
        <div className="w-full md:w-1/2 h-full p-8 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white">{currentTrack.title}</h2>
            <p className="text-zinc-400 text-xl">{currentTrack.artist_name}</p>
          </div>

          <div className="space-y-6 py-10">
            {/* Mock Lyrics */}
            {[
              "Walking through the neon rain",
              "Echoes of a distant name",
              "Shattering the glass inside",
              "Nowhere left for us to hide",
              "Electric dreams in velvet blue",
              "Searching for a path to you",
              "The silence screams a melody",
              "Of everything we used to be"
            ].map((line, i) => (
              <div
                key={i}
                className={`lyric-line cursor-pointer hover:text-white transition-all ${i === 2 ? 'active' : ''}`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
