"use client";
import React, { useState } from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import { Play, Heart, MoreVertical, Shuffle, Plus, ListPlus, ListVideo, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SafeImage from '../../../components/SafeImage';
import { useRouter } from 'next/navigation';
import { getTremblerUrl } from '../../../utils/api';

export default function LikedSongsPage() {
  const { likedSongs, loadTrackIntoContext, setQueue, togglePlay, toggleLike, currentTrack, isPlaying, playlists, savePlaylist, queue, currentIndex, user } = usePlayer();
  const router = useRouter();
  const [activeMenuTrackId, setActiveMenuTrackId] = useState(null);
  const [showAddSubmenu, setShowAddSubmenu] = useState(false);

  const displaySongs = [...likedSongs].reverse();

  const handlePlayNext = (track) => {
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    setQueue(newQueue);
  };

  const handleAddToQueue = (track) => {
    setQueue([...queue, track]);
  };

  const handlePlay = (track, index) => {
    loadTrackIntoContext(track);
    setQueue(displaySongs); 
    if (!isPlaying) togglePlay();
  };

  const handlePlayAll = () => {
    if (displaySongs.length > 0) {
      handlePlay(displaySongs[0], 0);
    }
  };

  const handleShufflePlay = () => {
    if (displaySongs.length > 0) {
      const shuffled = [...displaySongs].sort(() => Math.random() - 0.5);
      loadTrackIntoContext(shuffled[0]);
      setQueue(shuffled);
      if (!isPlaying) togglePlay();
    }
  };

  const handleAddToPlaylist = async (targetPlaylist, track) => {
    const mappedTrack = {
      title: track.title,
      artist_name: track.artist || track.artist_name || 'Unknown Artist',
      cover_url: track.cover_url || '',
      youtube_id: track.youtube_id || track.id || track.videoId,
      id: track.id || track.youtube_id || track.videoId,
      duration: track.duration || '3:45'
    };
    
    const existingTracks = targetPlaylist.tracks || [];
    const exists = existingTracks.some(t => (t.youtube_id || t.id) === mappedTrack.youtube_id);
    
    if (exists) {
      alert(`"${track.title}" is already in ${targetPlaylist.title}`);
      return;
    }
    
    const updatedTracks = [...existingTracks, mappedTrack];
    const updatedPlaylist = {
      ...targetPlaylist,
      tracks: updatedTracks
    };
    
    await savePlaylist(updatedPlaylist);
    alert(`Added "${track.title}" to ${targetPlaylist.title}`);
  };

  const parseDuration = (durStr) => {
    if (!durStr || typeof durStr !== 'string') return 225;
    const parts = durStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 225;
  };

  const totalSeconds = likedSongs.reduce((acc, track) => acc + parseDuration(track.duration && track.duration !== "0:00" && track.duration !== "00:00" ? track.duration : "3:45"), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  
  const durationText = totalHours > 0 
    ? `${totalHours} hr ${totalMinutes} min` 
    : `${totalMinutes} min`;

  return (
    <div className="p-8 pb-32 font-sans min-h-screen max-w-5xl mx-auto px-12 relative">
      {/* Floating Back Button */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }} 
        className="fixed top-24 left-8 z-50 text-white/70 hover:text-white transition-colors flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10"
        aria-label="Go Back"
      >
         <ArrowLeft size={24} />
      </button>

      {/* Header section */}
      <div className="flex items-end gap-6 mb-10 mt-4">
        <div className="w-48 h-48 rounded-xl shadow-2xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-black">
          <img loading="lazy" src="/images/tremble_like_blackbg.jpeg" alt="Liked Songs" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-zinc-400 mb-2">{(user?.username || "TREMLIST").toUpperCase()}</span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-md">
            Liked Songs
          </h1>
          <p className="text-zinc-300 font-medium text-lg mt-2">
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'} • {durationText}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
        >
          <Play size={26} fill="black" className="ml-1" />
        </button>
        <button 
          onClick={handleShufflePlay}
          className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
        >
          <Shuffle size={24} />
        </button>
      </div>

      {/* List Header */}
      <div className="flex items-center text-zinc-400 text-sm font-medium border-b border-white/10 pb-2 mb-4 px-4">
        <div className="w-10 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="w-16"></div>
        <div className="w-16 text-right mr-4">Duration</div>
        <div className="w-8"></div>
      </div>

      {/* Songs List */}
      <div className="flex flex-col gap-2 mt-4 pb-32">
        {displaySongs.length === 0 ? (
          <div className="text-center text-zinc-400 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <Heart size={48} className="mx-auto mb-4 opacity-50" />
            <p>You haven't liked any songs yet.</p>
          </div>
        ) : (
          displaySongs.map((track, idx) => {
            const trackId = track.youtube_id || track.id || idx;
            const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === track.youtube_id);
            const isMenuOpen = activeMenuTrackId === trackId;
            
            return (
              <div 
                key={trackId}
                onClick={() => handlePlay(track, idx)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all cursor-pointer group relative ${isCurrentlyPlaying ? 'bg-white/10' : 'hover:bg-white/5 hover:-translate-y-0.5'}`}
              >
                {/* Index or Play icon */}
                <div className="w-10 text-center text-zinc-400 font-medium group-hover:hidden flex-shrink-0">
                  {isCurrentlyPlaying && isPlaying ? (
                     <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse mx-auto"></div>
                  ) : (
                     displaySongs.length - idx
                  )}
                </div>
                <div className="w-10 text-center text-white hidden group-hover:flex items-center justify-center flex-shrink-0">
                  <Play size={16} fill="currentColor" />
                </div>

                {/* Title & Artist & Cover */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 relative bg-zinc-800">
                    <SafeImage 
                      src={track.cover_url} 
                      alt={track.title} 
                      title={track.title}
                      artist={track.artist}
                      type="song"
                      className="w-full h-full object-cover" 
                    />
                    {isCurrentlyPlaying && isPlaying && (
                      <img src="/images/tremble_song_overlay.gif" alt="playing" className="absolute inset-0 w-full h-full object-cover rounded-md opacity-75 mix-blend-screen" />
                    )}
                  </div>
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
                <div className="w-16 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }} 
                    className="text-white hover:scale-125 transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    title="Unlike"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                </div>

                {/* Duration */}
                <div className="w-16 text-right text-zinc-400 text-sm font-medium mr-4 flex-shrink-0">
                  {track.duration && track.duration !== "0:00" && track.duration !== "00:00" ? track.duration : "3:45"}
                </div>

                {/* 3 Dots Options */}
                <div className="w-8 flex justify-center flex-shrink-0 relative">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveMenuTrackId(isMenuOpen ? null : trackId);
                      setShowAddSubmenu(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                    aria-label="More options"
                  >
                    <MoreVertical size={20} />
                  </button>

                  {isMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuTrackId(null);
                          setShowAddSubmenu(false);
                        }} 
                      />
                      <div 
                        className="absolute left-full ml-3 -top-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-left-2 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Option 1: Add to Tremlist */}
                        <div className="relative">
                          <button
                            onClick={() => setShowAddSubmenu(!showAddSubmenu)}
                            className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                          >
                            <span className="flex items-center gap-2">
                              <Plus size={16} />
                              Add to Tremlist
                            </span>
                            <span className="text-xs text-zinc-500">▶</span>
                          </button>

                          {/* Submenu for selecting target playlist */}
                          {showAddSubmenu && (
                            <div className="mt-1 pl-2 border-l border-white/10 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                              {playlists && playlists.length > 0 ? (
                                playlists.map((pl) => (
                                  <button
                                    key={pl.id}
                                    onClick={() => {
                                      handleAddToPlaylist(pl, track);
                                      setActiveMenuTrackId(null);
                                      setShowAddSubmenu(false);
                                    }}
                                    className="block w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-indigo-400 hover:bg-white/5 rounded-md truncate transition-colors"
                                  >
                                    {pl.title}
                                  </button>
                                ))
                              ) : (
                                <Link
                                  href="/create-playlist"
                                  className="block w-full text-left px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-white/5 rounded-md truncate transition-colors"
                                  onClick={() => {
                                    localStorage.setItem('pending_tremlist_track', JSON.stringify(song));
                                    setActiveMenuTrackId(null);
                                  }}
                                >
                                  + Create New Tremlist
                                </Link>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Go to Trembler */}
                        {(track.artist_id || track.artist_name || track.artist) && (
                          <button
                            onClick={() => {
                              router.push(getTremblerUrl(track.artist_name || track.artist || track.artist_id));
                              setActiveMenuTrackId(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left mt-1 border-t border-white/5"
                          >
                            <User size={16} />
                            Go to Trembler
                          </button>
                        )}
                        
                        {/* Play Next */}
                        <button
                          onClick={() => {
                            handlePlayNext(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left mt-1"
                        >
                          <ListVideo size={16} />
                          Play Next
                        </button>

                        {/* Add to Queue */}
                        <button
                          onClick={() => {
                            handleAddToQueue(track);
                            setActiveMenuTrackId(null);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left mt-1"
                        >
                          <ListPlus size={16} />
                          Add to Queue
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
