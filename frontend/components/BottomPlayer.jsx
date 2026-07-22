"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play, Pause, SkipForward, SkipBack,
  Repeat, Shuffle, Heart, Mic2, Volume2, Maximize2
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const BottomPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleNowPlaying
  } = usePlayer();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  // Placeholder if no track is selected
  const displayTrack = currentTrack || {
    title: 'Select a Track',
    artist_name: 'to start listening',
    cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop', // nice abstract placeholder
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl h-20 bg-zinc-900/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center px-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 transition-all duration-300 hover:bg-zinc-900/70">
      
      {/* Left Side: Mini Album Cover and Info */}
      <div
        onClick={currentTrack ? toggleNowPlaying : undefined}
        className={`flex items-center gap-3 w-1/3 ${currentTrack ? 'cursor-pointer group' : ''}`}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden relative shadow-lg bg-zinc-800 flex-shrink-0 border border-white/5">
          <img src={displayTrack.cover_url} alt={displayTrack.title} className={`w-full h-full object-cover transition-transform duration-300 opacity-90 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} />
          {/* Inner circle hole to look like a record */}
          <div className="absolute inset-0 m-auto w-4 h-4 bg-zinc-950 rounded-full border border-zinc-800/50 shadow-inner"></div>
        </div>
        <div className="flex flex-col justify-center overflow-hidden">
          <div className="text-white font-bold text-sm truncate">{displayTrack.title}</div>
          <div className="text-zinc-400 text-xs truncate font-medium">{displayTrack.artist_name}</div>
        </div>
        {currentTrack && (
          <button className="text-zinc-500 hover:text-red-500 transition-colors ml-2 hidden sm:block">
            <Heart size={18} />
          </button>
        )}
      </div>

      {/* Center Side: Main Playback Controls */}
      <div className="flex-1 flex flex-col justify-center items-center gap-1">
        <div className="flex items-center gap-5 text-zinc-400">
          <button className="hover:text-white transition-colors"><Shuffle size={16} /></button>
          <button className="hover:text-white transition-colors"><SkipBack size={20} fill="currentColor" /></button>
          <button
            onClick={currentTrack ? togglePlay : undefined}
            className={`w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <button className="hover:text-white transition-colors"><SkipForward size={20} fill="currentColor" /></button>
          <button className="hover:text-white transition-colors"><Repeat size={16} /></button>
        </div>
        
        {/* Progress Bar centered precisely below controls */}
        <div className="w-full max-w-sm flex items-center gap-2 text-[10px] text-zinc-500 font-bold tracking-wider">
          <span>0:00</span>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-white group-hover:bg-indigo-400 transition-colors rounded-full" />
          </div>
          <span>{currentTrack ? '3:45' : '0:00'}</span>
        </div>
      </div>

      {/* Right Side: Volume & Extra Actions */}
      <div className="w-1/3 flex items-center justify-end gap-4 text-zinc-400 pr-2">
        <button className="hover:text-white transition-colors hidden sm:block" title="Lyrics">
          <Mic2 size={18} />
        </button>
        
        {/* Vertical Volume Hover Popover */}
        <div className="relative flex items-center justify-center group">
          <button className="hover:text-white transition-colors p-2">
            <Volume2 size={18} />
          </button>
          {/* Popover container */}
          <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-8 h-24 bg-zinc-800/90 backdrop-blur-md rounded-full shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col items-center py-3 border border-white/10">
            <div className="w-1.5 flex-1 bg-zinc-900 rounded-full relative overflow-hidden cursor-pointer">
              <div className="absolute bottom-0 left-0 w-full h-2/3 bg-indigo-500 rounded-full transition-colors" />
            </div>
          </div>
        </div>

        {/* Expand Fullscreen */}
        {currentTrack && (
          <button onClick={toggleNowPlaying} className="hover:text-white transition-colors p-2" title="Fullscreen">
            <Maximize2 size={18} />
          </button>
        )}
      </div>

    </div>
  );
};

export default BottomPlayer;
