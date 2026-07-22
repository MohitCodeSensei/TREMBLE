"use client";
import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { 
  ChevronDown, Mic2, SlidersHorizontal, Heart, Plus, 
  Download, List, Shuffle, SkipBack, Play, Pause, 
  SkipForward, Repeat, Volume2, VolumeX, Languages, ArrowDownToLine, Maximize 
} from 'lucide-react';

const ambientKeyframes = `
  @keyframes morph-1 {
    0% { transform: scale(1.5) translate(0, 0) rotate(0deg); }
    33% { transform: scale(1.6) translate(2%, 2%) rotate(1deg); }
    66% { transform: scale(1.4) translate(-2%, -2%) rotate(-1deg); }
    100% { transform: scale(1.5) translate(0, 0) rotate(0deg); }
  }
  @keyframes morph-2 {
    0% { transform: scale(1.5) translate(0, 0) rotate(0deg); }
    33% { transform: scale(1.4) translate(-2%, 2%) rotate(-1deg); }
    66% { transform: scale(1.6) translate(2%, -2%) rotate(1deg); }
    100% { transform: scale(1.5) translate(0, 0) rotate(0deg); }
  }
  @keyframes morph-3 {
    0% { transform: scale(1.2) translate(0, 0); }
    50% { transform: scale(1.3) translate(0, 2%); }
    100% { transform: scale(1.2) translate(0, 0); }
  }
`;

const NowPlaying = () => {
  const {
    currentTrack,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seekTo,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    queue,
    currentIndex,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    lyrics
  } = usePlayer();

  const [isRendered, setIsRendered] = useState(false);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isNowPlayingOpen) {
      setTimeout(() => setIsRendered(true), 50);
    } else {
      setIsRendered(false);
    }
  }, [isNowPlayingOpen]);

  if (!isNowPlayingOpen || !currentTrack) return null;

  const displayLyrics = lyrics 
    ? typeof lyrics === 'string' ? lyrics.split('\n') : Array.isArray(lyrics) ? lyrics : ["Lyrics available soon..."]
    : ["Loading lyrics..."];
    
  const nextTrack = queue[currentIndex + 1];

  return (
    <div className={`fixed inset-0 z-[70] flex p-8 overflow-hidden font-sans transition-opacity duration-1000 ${isRendered ? 'opacity-100' : 'opacity-0'}`}>
      <style>{ambientKeyframes}</style>
      {/* Dynamic Fluid Background based on Album Cover */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        
        {/* Layer 1: Slow organic morph */}
        <div 
          className="absolute inset-0 opacity-50 mix-blend-screen" 
          style={{ backgroundImage: `url(${currentTrack.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(100px) saturate(200%)', animation: 'morph-1 20s ease-in-out infinite' }}
        />

        {/* Layer 2: Counter morph */}
        <div 
          className="absolute inset-0 opacity-60 mix-blend-overlay" 
          style={{ backgroundImage: `url(${currentTrack.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(120px) saturate(250%)', animation: 'morph-2 25s ease-in-out infinite' }}
        />

        {/* Layer 3: Central breathing highlight */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-color-dodge rounded-full" 
          style={{ backgroundImage: `url(${currentTrack.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(150px) saturate(150%)', animation: 'morph-3 15s ease-in-out infinite' }}
        />

        {/* Smoothing Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[60px]"></div>
        {/* Texture */}
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-30 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex h-full">
        
        {/* LEFT COLUMN - PLAYER */}
        <div className="w-5/12 h-full flex flex-col justify-center pr-8">
          
          {/* Top Left Icons */}
          <div className="absolute top-8 left-8 z-50 flex items-center gap-4 text-zinc-400">
            <button 
              onClick={() => setIsNowPlayingOpen(false)}
              className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Main Album Art & Info */}
          <div className={`flex flex-col items-center flex-1 min-h-0 justify-center transition-all duration-1000 ease-out transform ${isRendered ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
            <div className="relative h-full max-h-[40vh] min-h-[200px] aspect-square rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6)] mb-6 ring-1 ring-white/5 mx-auto flex-shrink-0">
              <img src={currentTrack.cover_url} alt={currentTrack.title} className="absolute inset-0 w-full h-full object-cover" />
            </div>
            
            <div className="w-full max-w-[420px] flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold text-white mb-1 truncate tracking-tight">{currentTrack.title}</h1>
              <p className="text-zinc-300 text-lg mb-6 truncate font-medium">{currentTrack.artist_name}</p>
              
              {/* Action Bar */}
              <div className="flex items-center justify-center gap-6 text-zinc-400 mb-8 w-full relative">
                
                {/* Heart - Moved to far left */}
                <button className="hover:text-red-500 transition-colors absolute left-0">
                  <Heart size={22} fill="currentColor" className="text-red-500" />
                </button>

                {/* Center tools */}
                <button className="hover:text-white transition-colors"><SlidersHorizontal size={22} /></button>
                <button className="hover:text-white transition-colors"><Plus size={22} /></button>
                <button className="hover:text-white transition-colors"><ArrowDownToLine size={22} /></button>
                <button className="hover:text-white transition-colors"><List size={22} /></button>
                
                {/* Volume - Vertical hover to Expand Upwards */}
                <div className="group flex flex-col items-center justify-end text-zinc-400 absolute right-0 bottom-[-4px] w-8 h-8">
                  <button onClick={toggleMute} className="z-10 bg-transparent rounded-full w-full h-full flex items-center justify-center hover:text-white transition-colors cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <div className="absolute bottom-8 h-0 opacity-0 group-hover:h-28 group-hover:opacity-100 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex justify-center w-full origin-bottom mb-2 shadow-2xl">
                    <div 
                      className="w-1.5 h-28 bg-zinc-700/80 rounded-full relative cursor-pointer hover:bg-zinc-600 transition-colors"
                      onClick={(e) => {
                         const bounds = e.currentTarget.getBoundingClientRect();
                         const percent = 1 - ((e.clientY - bounds.top) / bounds.height);
                         handleVolumeChange(Math.max(0, Math.min(100, percent * 100)));
                      }}
                    >
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-white transition-all duration-300 rounded-full" 
                        style={{ height: `${isMuted ? 0 : volume}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Up Next */}
              {nextTrack && (
                <div className="text-center w-full mb-2">
                  <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-1">Up Next</div>
                  <div className="text-xs text-zinc-300 font-medium truncate px-4">{nextTrack.title} • {nextTrack.artist_name}</div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="flex items-center gap-3 w-full mb-6">
                <span className="text-xs text-zinc-400 font-medium w-8 text-right">{formatTime(currentTime)}</span>
                <div 
                  className="flex-1 h-1 bg-zinc-700/50 rounded-full relative cursor-pointer group"
                  onClick={(e) => {
                    const bounds = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - bounds.left) / bounds.width;
                    seekTo(percent * duration);
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-indigo-400 transition-colors" 
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 font-medium w-8 text-left">{formatTime(duration)}</span>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-6 w-full px-4 mb-8 text-zinc-300">
                <button onClick={toggleShuffle} className={`transition-colors ${isShuffle ? 'text-indigo-400' : 'hover:text-white'}`}><Shuffle size={20} /></button>
                <button onClick={playPrev} className="hover:text-white transition-colors"><SkipBack size={24} fill="currentColor" /></button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={playNext} className="hover:text-white transition-colors"><SkipForward size={24} fill="currentColor" /></button>
                <button onClick={toggleRepeat} className={`transition-colors ${repeatMode > 0 ? 'text-indigo-400' : 'hover:text-white'} relative`}>
                  <Repeat size={20} />
                  {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-indigo-500 text-white w-3 h-3 rounded-full flex items-center justify-center">1</span>}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - LYRICS */}
        <div className="w-7/12 h-full flex flex-col pl-16 pt-4">
          
          {/* Space where Top Right Utilities used to be */}
          <div className="w-full mb-12"></div>

          {/* Lyrics Container */}
          <div className={`flex flex-col gap-6 flex-grow overflow-y-auto pb-32 transition-all duration-1000 delay-300 transform ${isRendered ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} scrollbar-hide`}>
            {displayLyrics.map((line, idx) => (
              <p 
                key={idx} 
                className={`text-2xl sm:text-3xl font-bold leading-tight ${idx === 0 || idx === 1 ? 'text-white' : 'text-white/40 blur-[1px]'}`}
              >
                {line || ' '}
              </p>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

export default NowPlaying;
