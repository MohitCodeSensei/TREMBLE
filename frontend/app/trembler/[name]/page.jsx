"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Pause, Shuffle, ArrowLeft, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { API_URL, getTremblerUrl, getAlbumUrl } from '../../../utils/api';
import { usePlayer } from '../../../context/PlayerContext';
import SafeImage from '../../../components/SafeImage';
import SteamAlbumCard from '../../../components/SteamAlbumCard';

const TremblerPage = () => {
  const params = useParams();
  const router = useRouter();
  const nameParam = params?.name || '';
  const decodedName = decodeURIComponent(String(nameParam).replace(/\+/g, ' '));

  const { loadTrackIntoContext, setQueue, togglePlay, isPlaying, currentTrack, setCurrentIndex, toggleLike, likedSongs } = usePlayer();
  const similarRef = useRef(null);

  const scrollSimilar = (direction) => {
    if (similarRef.current) {
      const scrollAmount = 552;
      similarRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getPlayCount = (songId) => {
    if (!songId) return "1,402,001";
    let hash = 0;
    for (let i = 0; i < songId.length; i++) {
       hash = songId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const plays = Math.abs(hash) % 800000000 + 1000000;
    return plays.toLocaleString();
  };

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPlayingArtist = isPlaying && currentTrack && artist?.top_songs?.some(t => t.id === currentTrack.id);

  const handlePlayAll = () => {
    if (isPlayingArtist) {
      togglePlay();
    } else {
      if (artist?.top_songs?.length > 0) {
        setQueue(artist.top_songs);
        loadTrackIntoContext(artist.top_songs[0]);
        setCurrentIndex(0);
        if (!isPlaying) togglePlay();
      }
    }
  };

  const handleShuffleAll = () => {
    if (artist?.top_songs?.length > 0) {
      const shuffled = [...artist.top_songs].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
      loadTrackIntoContext(shuffled[0]);
      setCurrentIndex(0);
      if (!isPlaying) togglePlay();
    }
  };

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/artist/${encodeURIComponent(nameParam)}`);
        if (!res.ok) throw new Error('Failed to fetch trembler details');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setArtist(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (nameParam) {
      fetchArtist();
    }
  }, [nameParam]);

  const handlePlaySong = (song, idx) => {
    loadTrackIntoContext(song);
    setQueue(artist.top_songs.slice(idx));
    setCurrentIndex(0);
    if (!isPlaying) togglePlay();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center -mt-20">
         <img loading="eager" src="/images/tremble_loading_new.gif" alt="Loading..." className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white p-8 text-center -mt-20">
         <div className="text-4xl font-black mb-4">404</div>
         <p className="text-zinc-400">This Trembler could not be found.</p>
         <p className="text-zinc-600 text-sm font-mono mt-4">{error}</p>
         <button onClick={() => router.back()} className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
         </button>
      </div>
    );
  }

  const effectiveCover = artist?.cover_url || artist?.top_songs?.[0]?.cover_url || artist?.albums?.[0]?.cover_url || '';

  return (
    <div className="min-h-screen bg-[#000000] pb-48 font-sans selection:bg-indigo-500/30 animate-in fade-in slide-in-from-bottom-24 duration-700 relative overflow-x-hidden">
      
      {/* Fixed solid pitch black underlay */}
      <div className="fixed inset-0 -z-20 bg-[#000000] pointer-events-none" />

      {/* Floating Back Button - Positioned cleanly below top navbar */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }} 
        className="fixed top-28 left-8 z-50 text-white/70 hover:text-white transition-colors flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10"
        aria-label="Go Back"
      >
         <ArrowLeft size={24} />
      </button>

      {/* Background Banner Image - Starts at the very top of the page with smooth natural fade */}
      <div className="absolute top-0 left-0 right-0 h-[750px] z-0 pointer-events-none overflow-hidden">
         <div 
           className="w-full h-full bg-cover bg-top bg-no-repeat opacity-50 scale-105"
           style={{ backgroundImage: effectiveCover ? `url(${effectiveCover})` : 'none' }}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 via-60% to-[#000000]"></div>
      </div>

      {/* Detail Header Banner */}
      <div className="relative w-full max-w-7xl mx-auto px-8 pt-32 pb-8 flex items-end">

         {/* Header Content */}
         <div className="relative z-10 w-full flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Trembler Avatar */}
            <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 shadow-2xl rounded-full border-4 border-[#0a0a0a] overflow-hidden bg-zinc-900">
               <SafeImage 
                 src={effectiveCover} 
                 alt={artist?.name || decodedName} 
                 artist={artist?.name || decodedName}
                 type="artist"
                 className="w-full h-full object-cover"
                 useOriginalSize={false} 
               />
            </div>
            
            {/* Trembler Info */}
            <div className="flex flex-col flex-1 text-center md:text-left mb-2">
               <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">{artist.name || decodedName}</h1>
               <p className="text-white/80 text-sm md:text-base leading-relaxed line-clamp-3 font-medium max-w-3xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                 {artist.description || `Explore the top hits and popular tracks from ${artist.name || decodedName}.`}
               </p>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-8 py-4 max-w-7xl mx-auto flex flex-col gap-12 mt-4 mb-8">
        
        {/* Popular Tracks Section */}
        <div className="w-full">
           <div className="flex items-center gap-6 mb-6">
              <h2 className="text-2xl font-black text-white">Popular Tracks</h2>
              <div className="flex items-center gap-3">
                 <button onClick={handlePlayAll} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-105 hover:bg-zinc-200 transition-all shadow-lg">
                    {isPlayingArtist ? <Pause size={22} className="text-black" fill="currentColor" /> : <Play size={22} className="text-black ml-1" fill="currentColor" />}
                 </button>
                 <button onClick={handleShuffleAll} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                    <Shuffle size={18} className="text-white" />
                 </button>
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2">
              {artist.top_songs && artist.top_songs.length > 0 ? (
                 <>
                   <div className="flex flex-col gap-2">
                     {artist.top_songs.slice(0, Math.ceil(artist.top_songs.length / 2)).map((song, idx) => (
                        <div key={idx} className={`flex items-center gap-4 hover:bg-white/5 p-2 pr-4 rounded-xl group cursor-pointer transition-all duration-300 ${(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying ? 'bg-white/10 ring-1 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}`} onClick={() => handlePlaySong(song, idx)}>
                           <div className="text-zinc-500 font-bold font-sans w-6 text-center text-sm">{idx + 1}</div>
                           <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800 shadow-md">
                               <SafeImage src={song.thumb_url || song.cover_url} useOriginalSize={true} className={`w-full h-full object-cover transition-all duration-300 ${(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying ? 'saturate-50 blur-[2px]' : ''}`} />
                               {!(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && (
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play size={16} fill="white" className="text-white ml-0.5 shadow-lg" />
                                 </div>
                               )}
                               {(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying && (
                                 <div className="absolute inset-0 flex items-center justify-center z-10">
                                   <img src="/images/tremble_song_overlay.gif" alt="playing" className="w-8 h-8 object-contain opacity-80 mix-blend-screen" />
                                 </div>
                               )}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0 justify-center">
                              <span className="text-white font-bold text-sm truncate group-hover:text-indigo-400 transition-colors drop-shadow-sm">{song.title}</span>
                              <span className="text-zinc-400 text-xs truncate mt-0.5">{song.artist}</span>
                           </div>
                           <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); toggleLike(song); }} className="text-zinc-400 hover:text-white transition-colors">
                                {likedSongs?.some(t => (t.id || t.youtube_id) === (song.id || song.youtube_id)) ? (
                                   <Heart size={16} fill="white" className="text-white" />
                                ) : (
                                   <Heart size={16} />
                                )}
                              </button>
                           </div>
                           <span className="text-zinc-500 w-24 text-right text-xs font-medium font-sans group-hover:text-zinc-400 transition-colors">{getPlayCount(song.id)}</span>
                        </div>
                     ))}
                   </div>
                   <div className="flex flex-col gap-2">
                     {artist.top_songs.slice(Math.ceil(artist.top_songs.length / 2)).map((song, i) => {
                        const originalIdx = Math.ceil(artist.top_songs.length / 2) + i;
                        return (
                           <div key={originalIdx} className={`flex items-center gap-4 hover:bg-white/5 p-2 pr-4 rounded-xl group cursor-pointer transition-all duration-300 ${(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying ? 'bg-white/10 ring-1 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}`} onClick={() => handlePlaySong(song, originalIdx)}>
                              <div className="text-zinc-500 font-bold font-sans w-6 text-center text-sm">{originalIdx + 1}</div>
                               <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800 shadow-md">
                                 <SafeImage src={song.thumb_url || song.cover_url} useOriginalSize={true} className={`w-full h-full object-cover transition-all duration-300 ${(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying ? 'saturate-50 blur-[2px]' : ''}`} />
                                 {!(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && (
                                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Play size={16} fill="white" className="text-white ml-0.5 shadow-lg" />
                                 </div>
                               )}
                               {(currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying && (
                                 <div className="absolute inset-0 flex items-center justify-center z-10">
                                   <img src="/images/tremble_song_overlay.gif" alt="playing" className="w-8 h-8 object-contain opacity-80 mix-blend-screen" />
                                 </div>
                               )}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0 justify-center">
                                 <span className="text-white font-bold text-sm truncate group-hover:text-indigo-400 transition-colors drop-shadow-sm">{song.title}</span>
                                 <span className="text-zinc-400 text-xs truncate mt-0.5">{song.artist}</span>
                              </div>
                              <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); toggleLike(song); }} className="text-zinc-400 hover:text-white transition-colors">
                                  {likedSongs?.some(t => (t.id || t.youtube_id) === (song.id || song.youtube_id)) ? (
                                     <Heart size={16} fill="white" className="text-white" />
                                  ) : (
                                     <Heart size={16} />
                                  )}
                                </button>
                              </div>
                              <span className="text-zinc-500 w-24 text-right text-xs font-medium font-sans group-hover:text-zinc-400 transition-colors">{getPlayCount(song.id)}</span>
                           </div>
                        );
                     })}
                   </div>
                 </>
              ) : (
                 <div className="col-span-1 lg:col-span-2 text-center py-12 text-zinc-500 font-medium">
                   No top songs found for this Trembler.
                 </div>
              )}
           </div>
        </div>

        {/* Albums Section with Steam Trading Card Effect */}
        {artist.albums && artist.albums.length > 0 && (
           <div className="w-full mt-8">
              <h2 className="text-2xl font-black text-white mb-6">Albums</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                 {artist.albums.map((album, idx) => (
                    <SteamAlbumCard
                      key={`trembler-album-${album.id || idx}`}
                      className="w-full min-w-0 md:min-w-0 md:w-full"
                      album={{
                        ...album,
                        artist: artist.name || decodedName
                      }}
                      onClick={() => router.push(getAlbumUrl(album, album.title))}
                    />
                 ))}
              </div>
           </div>
        )}

        {/* Similar Tremblers Section */}
        {artist.similar_artists && artist.similar_artists.length > 0 && (
           <div className="w-full mt-8 relative flex flex-col items-center">
              <div className="w-full max-w-[1080px]">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-black text-white">Similar Tremblers</h2>
                   <div className="flex items-center gap-2">
                      <button onClick={() => scrollSimilar('left')} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                         <ChevronLeft size={20} />
                      </button>
                      <button onClick={() => scrollSimilar('right')} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                         <ChevronRight size={20} />
                      </button>
                   </div>
                </div>

                <div 
                   ref={similarRef}
                   className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                   {artist.similar_artists.map((sim, idx) => (
                      <div 
                        key={idx} 
                        className="flex flex-col items-center gap-4 group cursor-pointer w-40 flex-shrink-0 snap-start" 
                        onClick={() => router.push(getTremblerUrl(sim.name || sim.id))}
                      >
                         <div className="w-40 h-40 relative rounded-full overflow-hidden bg-zinc-900 shadow-xl border-4 border-transparent group-hover:border-indigo-500/50 transition-colors duration-300">
                            <SafeImage src={sim.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" useOriginalSize={true} />
                         </div>
                         <span className="text-white font-bold text-sm text-center truncate w-full group-hover:text-indigo-400 transition-colors">{sim.name}</span>
                      </div>
                   ))}
                </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default TremblerPage;
