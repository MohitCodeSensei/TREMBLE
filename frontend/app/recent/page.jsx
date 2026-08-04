"use client";
import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, Heart, Shuffle, Clock } from 'lucide-react';
import SafeImage from '../../components/SafeImage';

export default function RecentPage() {
  const { recentTracks, loadTrackIntoContext, setQueue, togglePlay, currentTrack, isPlaying, toggleLike, likedSongs } = usePlayer();

  const handlePlay = (track, index) => {
    loadTrackIntoContext(track);
    setQueue(recentTracks);
    if (!isPlaying) togglePlay();
  };

  const handlePlayAll = () => {
    if (recentTracks && recentTracks.length > 0) {
      handlePlay(recentTracks[0], 0);
    }
  };

  const handleShufflePlay = () => {
    if (recentTracks && recentTracks.length > 0) {
      const shuffled = [...recentTracks].sort(() => Math.random() - 0.5);
      loadTrackIntoContext(shuffled[0]);
      setQueue(shuffled);
      if (!isPlaying) togglePlay();
    }
  };

  return (
    <div className="p-8 pb-32 font-sans min-h-screen max-w-5xl mx-auto px-6 lg:px-12">
      {/* Big Title Header */}
      <div className="flex flex-col gap-2 mb-8 mt-4">
        <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
          <Clock size={16} />
          HISTORY
        </span>
        <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-md">
          Recently Played
        </h1>
        <p className="text-zinc-400 font-medium text-lg mt-1">
          {recentTracks.length > 0 
            ? `${recentTracks.length} unique ${recentTracks.length === 1 ? 'track' : 'tracks'} recently played`
            : 'Your recently played tracks will appear here.'}
        </p>
      </div>

      {/* Action Controls */}
      {recentTracks.length > 0 && (
        <div className="flex items-center gap-6 mb-10">
          <button 
            onClick={handlePlayAll}
            className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
            title="Play All"
          >
            <Play size={26} fill="black" className="ml-1" />
          </button>
          <button 
            onClick={handleShufflePlay}
            className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
            title="Shuffle Play"
          >
            <Shuffle size={24} />
          </button>
        </div>
      )}

      {/* Centered Songs List Cards (Matching Reference Boxes) */}
      <div className="flex flex-col gap-4 w-full">
        {recentTracks.length === 0 ? (
          <div className="text-center text-zinc-500 py-20 font-medium text-lg bg-zinc-900/30 rounded-2xl border border-white/5 p-12">
            No recently played tracks yet. Play some music to see your history!
          </div>
        ) : (
          recentTracks.map((track, idx) => {
            const trackId = track.youtube_id || track.id;
            const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === trackId);
            const isLiked = likedSongs.some(t => (t.youtube_id || t.id) === trackId);

            return (
              <div 
                key={trackId || idx}
                onClick={() => handlePlay(track, idx)}
                className={`w-full bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-xl group cursor-pointer ${isCurrentlyPlaying ? 'ring-2 ring-indigo-500 bg-indigo-950/20' : ''}`}
              >
                {/* Left Side: Index, Cover, Title, Artist */}
                <div className="flex items-center gap-5 min-w-0 flex-1 mr-4">
                  <div className="w-8 text-center text-zinc-500 group-hover:text-white font-bold text-lg flex-shrink-0">
                    {isCurrentlyPlaying && isPlaying ? (
                       <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-pulse mx-auto"></div>
                    ) : (
                       idx + 1
                    )}
                  </div>

                  <SafeImage 
                    src={track.cover_url || (trackId ? `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg` : '')} 
                    alt={track.title} 
                    title={track.title}
                    artist={track.artist_name || track.artist}
                    videoId={trackId}
                    type="song"
                    useOriginalSize={true}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-zinc-800 shadow-md" 
                  />

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-xl font-bold truncate transition-colors ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-white group-hover:text-indigo-400'}`}>
                      {track.title}
                    </span>
                    <span className="text-zinc-400 font-medium text-base truncate mt-0.5">
                      {track.artist_name || track.artist || "Unknown Artist"}
                    </span>
                  </div>
                </div>

                {/* Right Side: Duration, Like, Play Button */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-zinc-400 font-medium text-base mr-2 hidden sm:inline-block">
                    {track.duration || "3:45"}
                  </span>

                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }} 
                    className="p-3 rounded-full hover:bg-white/10 text-red-500 transition-all flex items-center justify-center"
                    title={isLiked ? "Remove from Liked Songs" : "Add to Liked Songs"}
                  >
                    <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
                  </button>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePlay(track, idx); }}
                    className="w-12 h-12 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all"
                    title="Play"
                  >
                    {isCurrentlyPlaying && isPlaying ? (
                      <Pause size={22} fill="black" />
                    ) : (
                      <Play size={22} fill="black" className="ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
