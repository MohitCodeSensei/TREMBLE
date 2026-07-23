"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play, Pause, SkipForward, SkipBack,
  Repeat, Shuffle, Heart, Mic2, Volume2, VolumeX, ListMusic
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const BottomPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleNowPlaying,
    currentTime,
    duration,
    seekTo,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    toggleLike,
    likedSongs,
    isSidebarOpen,
    toggleSidebar
  } = usePlayer();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const displayTrack = currentTrack || {
    title: 'Select a Track',
    artist_name: 'to start listening',
    cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop',
    id: null
  };

  const isLiked = displayTrack.id && likedSongs.some(t => (t.id || t.youtube_id) === (displayTrack.id || displayTrack.youtube_id));

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleProgressChange = (e) => {
    seekTo(parseFloat(e.target.value));
  };

  const repeatColor = repeatMode > 0 ? "text-indigo-400" : "text-zinc-400";
  const shuffleColor = isShuffle ? "text-indigo-400" : "text-zinc-400";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl h-24 bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center px-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 transition-all duration-300">
      
      {/* Left Side: Mini Album Cover and Info */}
      <div
        className="flex items-center gap-4 w-1/3"
      >
        <div onClick={currentTrack ? toggleNowPlaying : undefined} className={`w-14 h-14 rounded-full overflow-hidden relative shadow-lg bg-zinc-800 flex-shrink-0 border border-white/5 ${currentTrack ? 'cursor-pointer group' : ''}`}>
          <img src={displayTrack.cover_url} alt={displayTrack.title} className={`w-full h-full object-cover transition-transform duration-300 opacity-90 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} />
          <div className="absolute inset-0 m-auto w-4 h-4 bg-zinc-950 rounded-full border border-zinc-800/50 shadow-inner"></div>
        </div>
        <div className="flex flex-col justify-center overflow-hidden cursor-pointer" onClick={currentTrack ? toggleNowPlaying : undefined}>
          <div className="text-white font-bold text-sm truncate hover:underline">{displayTrack.title}</div>
          <div className="text-zinc-400 text-xs truncate font-medium hover:underline">{displayTrack.artist_name}</div>
        </div>
        {currentTrack && (
          <button onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }} className="text-zinc-500 hover:text-red-500 transition-colors ml-2 hidden sm:block">
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-red-500" : ""} />
          </button>
        )}
      </div>

      {/* Center Side: Main Playback Controls */}
      <div className="flex-1 flex flex-col justify-center items-center gap-2">
        <div className="flex items-center gap-6">
          <button onClick={toggleShuffle} className={`hover:text-white transition-colors ${shuffleColor}`}><Shuffle size={18} /></button>
          <button onClick={playPrev} className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={22} fill="currentColor" /></button>
          <button
            onClick={currentTrack ? togglePlay : undefined}
            className={`w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={playNext} className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={22} fill="currentColor" /></button>
          <button onClick={toggleRepeat} className={`hover:text-white transition-colors relative ${repeatColor}`}>
            <Repeat size={18} />
            {repeatMode === 2 && <span className="absolute -top-1 -right-1 text-[8px] font-black bg-zinc-900 rounded-full w-3 h-3 flex items-center justify-center">1</span>}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md flex items-center gap-3 text-xs text-zinc-500 font-medium font-mono">
          <span>{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            style={{
              background: `linear-gradient(to right, white ${(currentTime / (duration || 1)) * 100}%, #27272a ${(currentTime / (duration || 1)) * 100}%)`
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Side: Volume & Extra Controls */}
      <div className="w-1/3 flex items-center justify-end gap-5 text-zinc-400">
        <button onClick={currentTrack ? toggleNowPlaying : undefined} className={`hover:text-white transition-colors ${currentTrack ? '' : 'opacity-50 cursor-not-allowed'}`}>
          <Mic2 size={18} />
        </button>
        <button onClick={toggleSidebar} className={`hover:text-white transition-colors ${isSidebarOpen ? 'text-indigo-400' : ''}`}>
          <ListMusic size={18} />
        </button>
        
        {/* Volume Slider */}
        <div className="flex items-center gap-2 group relative">
          <button onClick={toggleMute} className="hover:text-white transition-colors">
             {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={isMuted ? 0 : volume} 
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-0 group-hover:w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            style={{
              background: `linear-gradient(to right, white ${isMuted ? 0 : volume}%, #27272a ${isMuted ? 0 : volume}%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomPlayer;
