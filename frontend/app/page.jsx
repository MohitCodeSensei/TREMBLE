"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTremblerUrl, getAlbumUrl, getTremlistUrl, getGenreSongs, API_URL } from '../utils/api';
import { useRouter } from 'next/navigation';
import SafeImage from '../components/SafeImage';
import WorldMap from '../components/WorldMap';

const DragScrollContainer = ({ children }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = () => {
    if (!containerRef.current) return;
    const { scrollLeft: sLeft, scrollWidth: sWidth, clientWidth: cWidth } = containerRef.current;
    setCanScrollLeft(sLeft > 5);
    setCanScrollRight(sWidth - cWidth - sLeft > 10);
  };

  useEffect(() => {
    checkScrollBounds();
    const handleResize = () => checkScrollBounds();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [children]);

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    checkScrollBounds();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    checkScrollBounds();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
    checkScrollBounds();
  };

  const scroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = direction === 'left' ? -450 : 450;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollBounds, 350);
    }
  };

  return (
    <div className="relative group/scroll">
      <button 
        onClick={() => scroll('left')}
        aria-label="Scroll left"
        className={`absolute left-0 top-[130px] -translate-y-1/2 -translate-x-4 z-30 w-12 h-12 bg-black/70 hover:bg-black/95 backdrop-blur text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl pointer-events-auto ${canScrollLeft ? 'opacity-0 group-hover/scroll:opacity-100' : 'opacity-0 pointer-events-none hidden'}`}
      >
        <ChevronLeft size={30} />
      </button>
      <div 
        ref={containerRef}
        onScroll={checkScrollBounds}
        className={`flex gap-8 overflow-x-auto pt-6 pb-6 -mt-4 -mb-4 no-scrollbar relative ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab scroll-smooth'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {children}
      </div>
      <button 
        onClick={() => scroll('right')}
        aria-label="Scroll right"
        className={`absolute right-0 top-[130px] -translate-y-1/2 translate-x-4 z-30 w-12 h-12 bg-black/70 hover:bg-black/95 backdrop-blur text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl pointer-events-auto ${canScrollRight ? 'opacity-0 group-hover/scroll:opacity-100' : 'opacity-0 pointer-events-none hidden'}`}
      >
        <ChevronRight size={30} />
      </button>
    </div>
  );
};

const Home = () => {
  const { 
    user, 
    recentTracks, 
    playStats, 
    setQueue, 
    togglePlay, 
    loadTrackIntoContext, 
    isPlaying, 
    fillQueueWithSimilar, 
    currentTrack,
    prefetchedSimilar
  } = usePlayer();

  const [animateEntrance, setAnimateEntrance] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const buildHomeFeed = async () => {
      // If user is logged in, no categories are shown (only algorithm message)
      if (user) {
        if (isMounted) {
          setCategories([]);
          setIsLoading(false);
          setAnimateEntrance(true);
        }
        return;
      }

      try {
        setIsLoading(true);

        // 1. Fetch or load from cache the Top 10 songs for Pop, Hip-Hop, and R&B
        let pop = [];
        let hiphop = [];
        let rnb = [];

        try {
          const cachedPop = sessionStorage.getItem('tremble_home_pop');
          const cachedHiphop = sessionStorage.getItem('tremble_home_hiphop');
          const cachedRnb = sessionStorage.getItem('tremble_home_rnb');
          if (cachedPop && cachedHiphop && cachedRnb) {
            pop = JSON.parse(cachedPop);
            hiphop = JSON.parse(cachedHiphop);
            rnb = JSON.parse(cachedRnb);
          }
        } catch (e) {}

        if (!pop.length || !hiphop.length || !rnb.length) {
          const [pRes, hRes, rRes] = await Promise.all([
            getGenreSongs('Pop'),
            getGenreSongs('Hip-Hop'),
            getGenreSongs('R&B')
          ]);
          pop = (pRes || []).slice(0, 10);
          hiphop = (hRes || []).slice(0, 10);
          rnb = (rRes || []).slice(0, 10);
          try {
            sessionStorage.setItem('tremble_home_pop', JSON.stringify(pop));
            sessionStorage.setItem('tremble_home_hiphop', JSON.stringify(hiphop));
            sessionStorage.setItem('tremble_home_rnb', JSON.stringify(rnb));
          } catch (e) {}
        }

        const assembledCategories = [];

        // 2. Check if enough guest user data exists (at least 3 played tracks)
        const hasEnoughGuestData = (recentTracks && recentTracks.length >= 3) || ((playStats?.totalPlays || 0) >= 3);
        if (hasEnoughGuestData) {
          let recTracks = [];

          // Use prefetched similar tracks or query watch playlist for recent tracks
          if (prefetchedSimilar?.tracks && prefetchedSimilar.tracks.length > 0) {
            recTracks = prefetchedSimilar.tracks;
          } else if (recentTracks && recentTracks.length > 0) {
            const seed = recentTracks[0];
            try {
              const seedId = seed.youtube_id || seed.id;
              if (seedId) {
                const res = await fetch(`${API_URL}/watch/${seedId}`);
                if (res.ok) {
                  const data = await res.json();
                  const rawList = data.tracks || [];
                  const seenIds = new Set(recentTracks.map(r => r.youtube_id || r.id));
                  recTracks = rawList.slice(1).filter(t => {
                    const tid = t.videoId || t.id || t.youtube_id;
                    return tid && !seenIds.has(tid);
                  }).map(t => ({
                    id: t.videoId || t.id || t.youtube_id,
                    youtube_id: t.videoId || t.id || t.youtube_id,
                    type: 'song',
                    title: t.title || 'Unknown Track',
                    artist: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist || ''),
                    artist_name: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist || ''),
                    cover_url: t.thumbnails && t.thumbnails.length > 0 ? t.thumbnails[t.thumbnails.length - 1].url : `https://i.ytimg.com/vi/${t.videoId || t.id}/hqdefault.jpg`
                  }));
                }
              }
            } catch (e) {
              console.warn("Guest recommendation fetch note:", e);
            }
          }

          if (recTracks.length > 0) {
            assembledCategories.push({
              id: 'cat_guest_recommended',
              title: 'Recommended for you (Please log in to enhance algorithm accuracy)',
              type: 'song_list',
              tracks: recTracks.slice(0, 10)
            });
          }
        }

        // 3. Add Pop, Hip-Hop, and R&B categories (top 10 each)
        if (pop.length > 0) {
          assembledCategories.push({
            id: 'cat_pop',
            title: 'Pop',
            type: 'song_list',
            tracks: pop.slice(0, 10)
          });
        }

        if (hiphop.length > 0) {
          assembledCategories.push({
            id: 'cat_hiphop',
            title: 'Hip-Hop',
            type: 'song_list',
            tracks: hiphop.slice(0, 10)
          });
        }

        if (rnb.length > 0) {
          assembledCategories.push({
            id: 'cat_rnb',
            title: 'R&B',
            type: 'song_list',
            tracks: rnb.slice(0, 10)
          });
        }

        if (isMounted) {
          setCategories(assembledCategories);
          setIsLoading(false);
          setAnimateEntrance(true);
        }
      } catch (err) {
        console.error("Failed to build home categories:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setAnimateEntrance(true);
        }
      }
    };

    buildHomeFeed();

    return () => {
      isMounted = false;
    };
  }, [user, (recentTracks || []).length, playStats?.totalPlays, prefetchedSimilar]);

  const handleItemClick = (item, trackList) => {
    if (item.type === 'playlist') {
      router.push(getTremlistUrl(item, item.title || item.name));
    } else if (item.type === 'album') {
      router.push(getAlbumUrl(item, item.title || item.name));
    } else if (item.type === 'artist') {
      router.push(getTremblerUrl(item.name || item.title || item.artist_name || item.artist || item.youtube_id || item.id));
    } else {
      // Regular song
      loadTrackIntoContext(item);
      setQueue(trackList && trackList.length > 0 ? trackList : [item]);
      if (!isPlaying) togglePlay();
      fillQueueWithSimilar(item);
    }
  };

  return (
    <div className="p-8 font-sans">
      {isLoading ? (
        <div className="min-h-[80vh] flex flex-col items-center justify-center w-full -mt-20">
          <img 
            loading="eager" 
            fetchPriority="high" 
            src="/images/tremble_loading_new.gif" 
            alt="Loading..." 
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" 
          />
        </div>
      ) : (
        <div className={`transition-all duration-1000 ease-out ${animateEntrance ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Home</h1>

          {user ? (
            /* Logged-In State: Algorithm Development Display */
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center my-6 bg-zinc-950/40 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-white/80 shadow-[0_0_40px_rgba(255,255,255,0.06)]">
                <Sparkles size={36} className="text-indigo-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                Developing Your Sound Profile
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg max-w-lg font-medium leading-relaxed">
                Please search and listen to various tracks to develop your algorithm
              </p>
            </div>
          ) : (
            /* Guest State: Pop, Hip-Hop, R&B (10 songs each) + Conditional Recommendations */
            <div className="flex flex-col gap-12 pb-16">
              {categories.map((category) => (
                <div key={category.id || category.title} className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {category.title}
                  </h2>
                  <DragScrollContainer>
                    {category.tracks.map((song, i) => {
                      const isCurrentPlaying = (currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying;
                      return (
                        <div
                          key={`song-${category.id || 'cat'}-${song.id || song.youtube_id || song.title || i}-${i}`}
                          onClick={() => handleItemClick(song, category.tracks)}
                          className="flex flex-col gap-3 group cursor-pointer min-w-[120px] w-[120px] md:min-w-[calc((100%-12rem)/7)] md:w-[calc((100%-12rem)/7)] shrink-0"
                        >
                          <div className={`relative aspect-square w-full overflow-hidden bg-zinc-800 rounded-xl transition-all duration-300 ${isCurrentPlaying ? 'shadow-[0_0_25px_rgba(255,255,255,0.6)]' : 'shadow-xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]'}`}>
                            <SafeImage 
                              src={song.cover_url || (song.youtube_id || song.id ? `https://i.ytimg.com/vi/${song.youtube_id || song.id}/hqdefault.jpg` : '')} 
                              alt={song.title} 
                              title={song.title} 
                              artist={song.artist_name || song.artist}
                              videoId={song.youtube_id || song.id}
                              type={song.type || 'song'}
                              className={`w-full h-full object-cover transition-all duration-500 ${isCurrentPlaying ? 'saturate-50 blur-[2px]' : 'group-hover:scale-110'}`}
                            />
                            
                            {/* Hover Play Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              {!isCurrentPlaying && (
                                <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg">
                                  <Play size={24} fill="currentColor" className="text-white ml-1" />
                                </div>
                              )}
                            </div>

                            {/* Playing Track Overlay */}
                            {isCurrentPlaying && (
                              <>
                                <img 
                                  src="/images/tremble_song_overlay.gif" 
                                  alt="playing" 
                                  className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-75 mix-blend-screen z-10 pointer-events-none scale-75" 
                                />
                                <div className="absolute inset-0 border-2 border-white/100 rounded-xl z-20 pointer-events-none" />
                              </>
                            )}
                          </div>

                          <div className="flex flex-col mt-1">
                            <span className="text-white font-bold text-base truncate w-full group-hover:text-indigo-400 transition-colors">
                              {song.title}
                            </span>
                            <span className="text-zinc-400 text-sm truncate font-medium mt-0.5 capitalize">
                              {song.artist_name || song.artist || ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </DragScrollContainer>
                </div>
              ))}
            </div>
          )}

          {/* Top Global Songs / Interactive World Map */}
          <div className="flex flex-col gap-6 mt-4 border-t border-white/5 pt-12">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Top Global Songs</h2>
              <p className="text-zinc-400 mt-2 font-medium">Click on any country to explore its top trending tracks.</p>
            </div>
            <WorldMap />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
