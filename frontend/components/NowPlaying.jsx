"use client";
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Heart } from 'lucide-react';
import { Kawarp } from '@kawarp/react';

// Removed old ambient keyframes

const NowPlaying = () => {
  const {
    currentTrack,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    currentTime,
    duration,
    lyrics,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    likedSongs,
    toggleLike,
    user
  } = usePlayer();

  const [isRendered, setIsRendered] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const scrollRef = useRef(null);
  
  const isLiked = currentTrack && likedSongs.some(t => (t.youtube_id || t.id) === (currentTrack.youtube_id || currentTrack.id));

  useEffect(() => {
    if (isNowPlayingOpen) {
      setTimeout(() => setIsRendered(true), 50);
    } else {
      setIsRendered(false);
    }
  }, [isNowPlayingOpen]);

  useEffect(() => {
    if (!lyrics) {
      setParsedLyrics([]);
      return;
    }
    
    let text = typeof lyrics === 'string' ? lyrics : lyrics.join('\n');
    
    // Fallback if no timestamps
    if (!text.includes('[')) {
       setParsedLyrics([{ time: 0, text }]);
       return;
    }

    const lines = text.split('\n');
    const parsed = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    
    lines.forEach(line => {
      const match = timeRegex.exec(line);
      if (match) {
        const mins = parseInt(match[1]);
        const secs = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = mins * 60 + secs + (ms / 1000);
        const textContent = line.replace(timeRegex, '').trim();
        if (textContent) {
          parsed.push({ time, text: textContent });
        }
      } else if (line.trim()) {
        parsed.push({ time: 0, text: line.trim() });
      }
    });
    
    setParsedLyrics(parsed);
  }, [lyrics]);

  useEffect(() => {
    if (parsedLyrics.length > 0) {
      let activeIndex = 0;
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (currentTime >= parsedLyrics[i].time) {
          activeIndex = i;
        } else {
          break;
        }
      }
      setActiveLyricIndex(activeIndex);
      
      // Auto-scroll logic fixed
      if (scrollRef.current) {
         // The actual children are inside the first child of the ref
         const wrapper = scrollRef.current.children[0];
         if (wrapper && wrapper.children[activeIndex]) {
             const activeEl = wrapper.children[activeIndex];
             activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
      }
    }
  }, [currentTime, parsedLyrics]);

  if (!isNowPlayingOpen || !currentTrack) return null;

  return (
    <div className={`fixed inset-0 z-[70] flex p-8 overflow-hidden font-sans transition-opacity duration-1000 ${isRendered ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Dynamic Fluid Background using KAWARP */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Instant Placeholder while Kawarp loads */}
        <div 
          className="absolute inset-0 opacity-50" 
          style={{ backgroundImage: `url(${currentTrack?.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(80px) saturate(200%)' }}
        />
        
        {/* WebGL Kawarp Overlay */}
        {currentTrack?.cover_url && (
           <Kawarp
             src={currentTrack.cover_url}
             warpIntensity={2.0}
             animationSpeed={1.5}
             blurPasses={5}
             saturation={1.5}
             style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1.0 }}
           />
        )}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[20px]"></div>
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex h-full">
        
        {/* LEFT COLUMN - LYRICS (SWAPPED) */}
        <div className={`w-7/12 h-full flex flex-col pt-12 pb-32 pr-12 transition-all duration-1000 ease-out delay-150 transform ${isRendered ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <div className="absolute top-0 left-0 z-50 flex items-center gap-4 text-zinc-400">
            <button 
              onClick={() => setIsNowPlayingOpen(false)}
              className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              <ChevronDown size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth group/lyrics" ref={scrollRef} style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
            <div className="flex flex-col py-[40vh] gap-6 max-w-2xl text-left">
              {parsedLyrics.length > 0 ? (
                parsedLyrics.map((line, index) => {
                  const isActive = index === activeLyricIndex;
                  const isPast = index < activeLyricIndex;
                  
                  return (
                    <div 
                      key={index}
                      className={`text-4xl font-black transition-all duration-700 ease-out cursor-pointer hover:text-white hover:blur-none hover:opacity-100 group-hover/lyrics:opacity-80 group-hover/lyrics:blur-0 ${
                        isActive ? 'text-white scale-[1.02] origin-left drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 
                        isPast ? 'text-white/40 blur-[4px] opacity-0 -translate-y-4' : 'text-white/40 blur-[2px]'
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                })
              ) : (
                <div className="text-4xl font-black text-white/40 blur-[1px]">Loading lyrics...</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - PLAYER (SWAPPED) */}
        <div className={`w-5/12 h-full flex flex-col justify-center items-center pl-8 transition-all duration-1000 ease-out transform ${isRendered ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
          
          <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] mb-8 ring-1 ring-white/10 bg-zinc-900">
            <img src={currentTrack.cover_url} alt={currentTrack.title} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          
          <div className="w-full max-w-[420px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col flex-1 min-w-0 pr-4 text-left">
                <h1 className="text-3xl font-black text-white mb-1 truncate tracking-tight">{currentTrack.title}</h1>
                <p className="text-zinc-300 text-lg truncate font-medium">{currentTrack.artist_name}</p>
              </div>
              <button onClick={(e) => toggleLike(currentTrack, e)} className="hover:scale-110 transition-transform">
                <Heart size={28} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-indigo-400" : "text-zinc-400 hover:text-white"} />
              </button>
            </div>
            
            {/* Playback Controls */}
            <div className="flex flex-col gap-6">
               <div className="flex items-center justify-between text-zinc-400 px-4">
                 <button onClick={toggleShuffle} className={`hover:text-white transition-colors ${isShuffle ? 'text-indigo-400' : ''}`}>
                    <Shuffle size={20} />
                 </button>
                 <button onClick={playPrev} className="hover:text-white transition-colors hover:scale-110">
                    <SkipBack size={32} fill="currentColor" />
                 </button>
                 <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                 </button>
                 <button onClick={playNext} className="hover:text-white transition-colors hover:scale-110">
                    <SkipForward size={32} fill="currentColor" />
                 </button>
                 <button onClick={toggleRepeatMode} className={`hover:text-white transition-colors ${repeatMode !== 'none' ? 'text-indigo-400' : ''}`}>
                    {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                 </button>
               </div>
               
               {/* Volume Control */}
               <div className="flex items-center gap-3 px-4">
                 <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
                   {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                 </button>
                 <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden flex cursor-pointer group"
                      onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const p = (e.clientX - rect.left) / rect.width;
                         handleVolumeChange({ target: { value: p * 100 } });
                      }}
                 >
                   <div className="h-full bg-white group-hover:bg-indigo-400 transition-colors" style={{ width: `${isMuted ? 0 : volume}%` }} />
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NowPlaying;
