"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { getGenreSongs } from '../../../../utils/api';
import { usePlayer } from '../../../../context/PlayerContext';
import { Play, Pause, Music, ChevronLeft, Shuffle, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GENRE_IMAGES = [
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1493225457124-a1a2a44cc6e9?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1483032469466-b937c425697b?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516280440502-1262dff9953b?w=600&h=300&fit=crop"
];

export default function GenrePage({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const genreTitle = decodeURIComponent(resolvedParams.genre || "");
  
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  
  const { loadTrackIntoContext, setQueue, togglePlay, toggleLike, currentTrack, isPlaying, setCurrentIndex, likedSongs } = usePlayer();

  const GENRE_CUSTOM_IMAGES = {
    'pop': '/images/genres/pop_genre.png',
    'hip-hop': '/images/genres/hiphop_genre.png',
    'hiphop': '/images/genres/hiphop_genre.png',
    'rock': '/images/genres/rock_genre.png',
    'electronic': '/images/genres/electronic_genre.png',
    'r&b': '/images/genres/rnb_genre.png',
    'rnb': '/images/genres/rnb_genre.png',
    'jazz': '/images/genres/jazz_genre.png',
    'classical': '/images/genres/classical_genre.png',
    'country': '/images/genres/country_genre.png',
    'indie': '/images/genres/indie_genre.png',
    'k-pop': '/images/genres/kpop_genre.png',
    'kpop': '/images/genres/kpop_genre.png',
    'latin': '/images/genres/latin_genre.png',
    'metal': '/images/genres/metal_genre.png',
    'phonk': '/images/genres/phonk_genre.png',
    'motivation': '/images/genres/motivation_genre.png',
    'feel good': '/images/genres/feel_good_genre.png',
    'feel-good': '/images/genres/feel_good_genre.png',
    'feelgood': '/images/genres/feel_good_genre.png',
    'fitness': '/images/genres/fitness_genre.png',
    'workout': '/images/genres/fitness_genre.png'
  };

  const bgImage = useMemo(() => {
    const key = (genreTitle || '').toLowerCase().trim();
    if (GENRE_CUSTOM_IMAGES[key]) return GENRE_CUSTOM_IMAGES[key];
    const normalizedKey = key.replace(/[^a-z0-9]/g, '');
    if (GENRE_CUSTOM_IMAGES[normalizedKey]) return GENRE_CUSTOM_IMAGES[normalizedKey];
    let hash = 0;
    for (let i = 0; i < genreTitle.length; i++) {
       hash = genreTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    return GENRE_IMAGES[Math.abs(hash) % GENRE_IMAGES.length];
  }, [genreTitle]);

  useEffect(() => {
    if (!genreTitle) return;
    
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const results = await getGenreSongs(genreTitle);
        setTracks(results || []);
      } catch (err) {
        console.error("Failed to fetch genre songs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSongs();
  }, [genreTitle]);

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    loadTrackIntoContext(tracks[0]);
    setQueue(tracks);
    setCurrentIndex(0);
    if (!isPlaying) togglePlay();
  };

  const handleShuffleAll = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    loadTrackIntoContext(shuffled[0]);
    setQueue(shuffled);
    setCurrentIndex(0);
    if (!isPlaying) togglePlay();
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const newOpacity = Math.max(0, 1 - scrollTop / 250);
    setScrollOpacity(newOpacity);
  };

  return (
    <div 
      className="relative min-h-full font-sans transition-all duration-1000 ease-out animate-in fade-in slide-in-from-bottom-10 h-full overflow-y-auto custom-scrollbar-white bg-black"
      onScroll={handleScroll}
    >
      {/* Background Banner Image */}
      <div className="absolute top-0 left-0 right-0 h-[1100px] z-0 pointer-events-none">
         <div 
           className="w-full h-full bg-cover bg-top bg-no-repeat opacity-50 transition-opacity duration-200"
           style={{ backgroundImage: `url(${bgImage})` }}
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/60 to-black"></div>
      </div>

      <div className="relative z-10 p-8 pt-32 pb-32 max-w-4xl mx-auto w-full flex flex-col items-center">
        {/* Header section */}
        <div className="flex items-center absolute left-0 sm:left-8 top-24 z-50">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center transition-all group"
          >
            <ChevronLeft size={28} className="text-zinc-300 group-hover:text-white transition-colors mr-1" />
          </button>
        </div>
        
        <div 
          className="flex flex-col items-center mt-12 mb-8 text-center transition-opacity duration-200" 
          style={{ opacity: scrollOpacity }}
        >
          <span className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-2 block">Genre</span>
          <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-lg mb-8">{genreTitle}</h1>
          
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={handlePlayAll}
              className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center text-black"
              disabled={tracks.length === 0}
            >
              <Play size={26} fill="black" className="ml-1" />
            </button>
            <button 
              onClick={handleShuffleAll}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 backdrop-blur-md transition-all flex items-center justify-center text-white"
              disabled={tracks.length === 0}
            >
              <Shuffle size={20} />
            </button>
          </div>
        </div>

        {/* Tracks List */}
        <div className="w-full flex flex-col gap-2 mt-8">
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
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group/item border border-transparent ${isCurrentlyPlaying && isPlaying ? 'bg-white/10 ring-1 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black/20 hover:bg-white/5 backdrop-blur-sm'}`}
                  onClick={() => {
                    loadTrackIntoContext(track);
                    setQueue(tracks);
                    setCurrentIndex(idx);
                    if (!isPlaying) togglePlay();
                  }}
                >
                  <div className="w-8 text-center text-zinc-500 font-medium font-sans text-sm">{idx + 1}</div>
                  
                  <div className="relative overflow-hidden rounded-md flex-shrink-0 shadow-md">
                    <img loading="lazy" 
                      src={track.cover_url} 
                      alt={track.title} 
                      className={`w-12 h-12 object-cover transition-all duration-300 bg-zinc-800 ${isCurrentlyPlaying && isPlaying ? 'saturate-50 blur-[2px]' : 'group-hover/item:scale-105'}`}
                    />
                    {!isCurrentlyPlaying && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                          <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                      </div>
                    )}
                    {(isCurrentlyPlaying && isPlaying) && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <img src="/images/tremble_song_overlay.gif" alt="playing" className="w-8 h-8 object-contain opacity-80 mix-blend-screen" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={`font-semibold line-clamp-1 transition-colors duration-200 ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-zinc-200 group-hover/item:text-white'}`}>
                      {track.title}
                    </span>
                    <span className="text-zinc-500 text-sm truncate">{track.artist}</span>
                  </div>
                  
                  <div className="w-12 flex justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }} 
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {likedSongs?.some(t => (t.id || t.youtube_id) === (track.id || track.youtube_id)) ? (
                         <Heart size={18} fill="white" className="text-white" />
                      ) : (
                         <Heart size={18} />
                      )}
                    </button>
                  </div>

                  {track.duration && (
                    <div className="w-16 text-right text-zinc-500 font-sans text-sm font-medium mr-4 whitespace-nowrap">
                      {track.duration}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-4 bg-black/20 backdrop-blur-sm rounded-2xl">
               <Music size={48} className="opacity-50" />
               <p className="text-lg font-medium">No tracks found for this genre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
