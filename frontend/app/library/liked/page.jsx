"use client";
import React from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import { Play, Heart, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default function LikedSongsPage() {
  const { likedSongs, loadTrackIntoContext, setQueue, togglePlay, toggleLike, currentTrack, isPlaying } = usePlayer();

  const handlePlay = (track, index) => {
    loadTrackIntoContext(track);
    setQueue(likedSongs); // Use the whole liked songs list as queue
    togglePlay();
  };

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      handlePlay(likedSongs[0], 0);
    }
  };

  return (
    <div className="p-8 pb-32 font-sans min-h-screen">
      {/* Header section */}
      <div className="flex items-end gap-6 mb-10 mt-4">
        <div className="w-48 h-48 rounded-xl shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
          <Heart size={80} fill="white" className="text-white drop-shadow-lg" />
        </div>
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Playlist</span>
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-md">Liked Songs</h1>
          <p className="text-zinc-300 font-medium text-lg mt-2">
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-white"
        >
          <Play size={26} fill="currentColor" className="ml-1" />
        </button>
      </div>

      {/* List Header */}
      <div className="flex items-center text-zinc-400 text-sm font-medium border-b border-white/10 pb-2 mb-4 px-4">
        <div className="w-10 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="w-24 text-center">Duration</div>
        <div className="w-16"></div>
      </div>

      {/* Songs List */}
      <div className="flex flex-col gap-1">
        {likedSongs.map((track, idx) => {
          const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === track.youtube_id);
          
          return (
            <div 
              key={track.youtube_id || track.id || idx}
              onClick={() => handlePlay(track, idx)}
              className={`flex items-center px-4 py-2 rounded-xl transition-colors cursor-pointer group ${isCurrentlyPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              {/* Index or Play icon */}
              <div className="w-10 text-center text-zinc-400 font-medium group-hover:hidden">
                {isCurrentlyPlaying && isPlaying ? (
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse mx-auto"></div>
                ) : (
                   idx + 1
                )}
              </div>
              <div className="w-10 text-center text-white hidden group-hover:flex items-center justify-center">
                <Play size={16} fill="currentColor" />
              </div>

              {/* Title & Artist & Cover */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                <img src={track.cover_url} alt={track.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-zinc-800" />
                <div className="flex flex-col min-w-0">
                  <span className={`font-semibold truncate ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-zinc-400 text-sm truncate font-medium">
                    {track.artist}
                  </span>
                </div>
              </div>

              {/* Like Button */}
              <div className="w-16 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike(track); }} 
                  className="text-red-500 hover:scale-110 transition-transform"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>

              {/* Duration */}
              <div className="w-16 text-right text-zinc-400 text-sm font-medium mr-4">
                {track.duration || "0:00"}
              </div>

              {/* More options */}
              <div className="w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                <button className="hover:text-white" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
