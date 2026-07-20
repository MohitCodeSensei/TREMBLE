"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play, Pause, SkipForward, SkipBack,
  Repeat, Shuffle, Heart, Download
} from 'lucide-react';

const BottomPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleNowPlaying
  } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl h-20 rounded-lg glass flex items-center justify-center text-zinc-500 font-medium">
        Select a track to start listening
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl h-20 rounded-lg bg-black border border-zinc-800 flex items-center px-6 gap-8 z-40">
      {/* Album Art */}
      <div
        onClick={toggleNowPlaying}
        className="flex items-center gap-4 cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden relative transition-transform group-hover:scale-105">
          <img src={currentTrack.cover_url} alt={currentTrack.title} className="w-full h-full object-cover" />
        </div>
        <div className="hidden sm:block">
          <div className="text-white font-medium text-sm">{currentTrack.title}</div>
          <div className="text-zinc-400 text-xs">{currentTrack.artist_name}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 flex items-center justify-center gap-6">
        <div className="flex items-center gap-4 text-zinc-400">
          <Shuffle size={18} className="hover:text-white cursor-pointer transition-colors" />
          <SkipBack size={22} className="hover:text-white cursor-pointer transition-colors" />
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <SkipForward size={22} className="hover:text-white cursor-pointer transition-colors" />
          <Repeat size={18} className="hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Extra Actions */}
      <div className="flex items-center gap-4 text-zinc-400">
        <Heart size={20} className="hover:text-pink-500 cursor-pointer transition-colors" />
        <Download size={20} className="hover:text-white cursor-pointer transition-colors" />
      </div>
    </div>
  );
};

export default BottomPlayer;
