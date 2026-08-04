"use client";
import React, { useEffect, useState } from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import { API_URL } from '../../../utils/api';
import { Play, Heart, Clock, Loader2, Music2 } from 'lucide-react';

export default function GenrePage({ params }) {
  const titleParam = params?.title || "";
  const decodedTitle = titleParam ? decodeURIComponent(titleParam) : "Genre";
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadTrackIntoContext, setQueue, togglePlay, toggleLike, likedSongs, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    const fetchGenreSongs = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/genre-songs?title=${encodeURIComponent(decodedTitle)}`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(track => ({
            youtube_id: track.videoId,
            title: track.title,
            artist_name: track.artists ? track.artists.map(a => a.name).join(", ") : "Unknown",
            cover_url: track.thumbnails ? track.thumbnails[track.thumbnails.length - 1].url : "/images/default_cover.jpg",
            duration: track.duration_seconds || track.duration || 0,
            type: "song"
          }));
          setSongs(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch genre songs", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenreSongs();
  }, [decodedTitle]);

  const handlePlay = (track, index) => {
    loadTrackIntoContext(track);
    setQueue(songs);
    togglePlay();
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      handlePlay(songs[0], 0);
    }
  };

  const formatDuration = (val) => {
    if (typeof val === 'string') return val;
    if (!val) return "0:00";
    const mins = Math.floor(val / 60);
    const secs = val % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 pb-32 font-sans min-h-screen transition-all duration-1000 ease-out animate-in fade-in slide-in-from-bottom-10">
      {/* Header section */}
      <div className="flex items-end gap-6 mb-10 mt-4">
        <div className="w-48 h-48 rounded-xl shadow-2xl bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          <Music2 size={80} fill="white" className="text-white drop-shadow-lg opacity-80" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="flex flex-col gap-2 pb-2">
          <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Genre</span>
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-md">{decodedTitle}</h1>
          <p className="text-zinc-300 font-medium text-lg mt-2">
            Top 50 Songs
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={handlePlayAll}
          disabled={songs.length === 0}
          className="w-14 h-14 rounded-full bg-indigo-500 hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-white disabled:opacity-50 disabled:hover:scale-100"
        >
          <Play size={26} fill="currentColor" className="ml-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <img src="/images/tremble_loading.gif" alt="Loading..." className="w-12 h-12 object-contain" />
        </div>
      ) : (
        <>
          {/* List Header */}
          <div className="flex items-center text-zinc-400 text-sm font-medium border-b border-white/10 pb-2 mb-4 px-4">
            <div className="w-10 text-center">#</div>
            <div className="flex-1">Title</div>
            <div className="w-32 flex justify-end"><Clock size={16} /></div>
          </div>

          {/* Songs List */}
          <div className="space-y-1">
            {songs.map((track, idx) => {
              const isCurrentlyPlaying = currentTrack?.youtube_id === track.youtube_id;
              const isLiked = likedSongs.some(t => t.youtube_id === track.youtube_id);
              
              return (
                <div 
                  key={track.youtube_id || idx}
                  onClick={() => handlePlay(track, idx)}
                  className={`flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${isCurrentlyPlaying ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <div className="w-10 text-center text-zinc-400 font-medium group-hover:hidden">
                    {isCurrentlyPlaying && isPlaying ? (
                      <div className="flex gap-1 justify-center items-end h-4">
                        <div className="w-1 bg-indigo-500 h-full animate-[bounce_1s_infinite]" style={{ animationDelay: '0s' }} />
                        <div className="w-1 bg-indigo-500 h-2/3 animate-[bounce_1s_infinite]" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1 bg-indigo-500 h-1/2 animate-[bounce_1s_infinite]" style={{ animationDelay: '0.4s' }} />
                      </div>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="w-10 text-center hidden group-hover:block">
                    <Play size={16} fill="currentColor" className="text-white mx-auto" />
                  </div>
                  
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <img src={track.cover_url} alt={track.title} className="w-12 h-12 rounded-md object-cover shadow-md flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold truncate ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-white'}`}>
                        {track.title}
                      </span>
                      <span className="text-sm text-zinc-400 truncate">
                        {track.artist_name}
                      </span>
                    </div>
                  </div>

                  <div className="w-32 flex items-center justify-end gap-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }} 
                      className={`hover:scale-110 transition-transform ${isLiked ? 'text-indigo-400' : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white'}`}
                    >
                      <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <span className="text-sm text-zinc-400 tabular-nums">{formatDuration(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
