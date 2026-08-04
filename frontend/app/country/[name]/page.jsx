"use client";
import React, { useEffect, useState } from 'react';
import { getCountryTopSongs } from '../../../utils/api';
import { usePlayer } from '../../../context/PlayerContext';
import { Play, Pause, Music, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CountryTopPage({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const countryName = decodeURIComponent(resolvedParams.name || "");
  
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentTrack, isPlaying, loadTrackIntoContext, setQueue, togglePlay, setCurrentIndex } = usePlayer();

  useEffect(() => {
    if (!countryName) return;
    
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const results = await getCountryTopSongs(countryName);
        setTracks(results || []);
      } catch (err) {
        console.error("Failed to fetch country top songs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [countryName]);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    loadTrackIntoContext(tracks[0]);
    setQueue(tracks);
    setCurrentIndex(0);
    if (!isPlaying) togglePlay();
  };

  return (
    <div className="p-8 pb-32 font-sans transition-all duration-1000 ease-out animate-in fade-in slide-in-from-bottom-10 h-full overflow-y-auto custom-scrollbar-white">
      {/* Header section */}
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group"
        >
          <ChevronLeft size={28} className="text-zinc-400 group-hover:text-white transition-colors mr-1" />
        </button>
        <div>
          <span className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-2 block">Top 100</span>
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-lg">{countryName}</h1>
        </div>
      </div>

      {/* Play button */}
      <div className="mb-8">
        <button 
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center text-black"
          disabled={tracks.length === 0}
        >
          <Play size={26} fill="black" className="ml-1" />
        </button>
      </div>

      {/* Tracks List */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center w-full">
            <img loading="eager" fetchPriority="high" src="/images/tremble_loading_new.gif" alt="Loading..." className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
          </div>
        ) : tracks.length > 0 ? (
          tracks.map((track, idx) => {
            const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === track.youtube_id);
            return (
              <div 
                key={idx}
                className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors duration-200 group/item hover:bg-white/5 border border-transparent hover:border-white/5"
                onClick={() => {
                  loadTrackIntoContext(track);
                  setQueue(tracks);
                  setCurrentIndex(idx);
                  if (!isPlaying) togglePlay();
                }}
              >
                <div className="w-8 text-center text-zinc-500 font-medium font-mono text-sm">{idx + 1}</div>
                
                <div className="relative overflow-hidden rounded-md flex-shrink-0 shadow-md">
                  <img loading="lazy" 
                    src={track.cover_url} 
                    alt={track.title} 
                    className="w-12 h-12 object-cover transition-transform duration-300 bg-zinc-800 group-hover/item:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                      <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                  </div>
                  {isCurrentlyPlaying && isPlaying && (
                    <img src="/images/tremble_song_overlay.gif" alt="playing" className="absolute inset-0 w-full h-full object-cover rounded-md opacity-75 mix-blend-screen" />
                  )}
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`font-semibold line-clamp-1 transition-colors duration-200 ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-zinc-200 group-hover/item:text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-zinc-500 text-sm truncate">{track.artist}</span>
                </div>
                
                {track.duration && (
                  <div className="text-zinc-500 text-sm font-medium mr-4 whitespace-nowrap">
                    {track.duration}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4">
             <Music size={48} className="opacity-50" />
             <p className="text-lg font-medium">No top tracks found for {countryName}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
