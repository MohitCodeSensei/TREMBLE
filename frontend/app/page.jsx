"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, ChevronLeft, ChevronRight, Sparkles, Disc } from 'lucide-react';
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

  // Derive most listened tremblers (artists) in descending order so the #1 most played artist is at index 0 (VERY LEFT)
  const mostListenedTremblers = useMemo(() => {
    const artistEntries = Object.values(playStats?.artistPlays || {});
    if (artistEntries.length > 0) {
      return artistEntries
        .filter(entry => entry.name && entry.name !== 'Unknown Artist')
        .sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    // Derive from recent tracks if playStats dictionary is fresh
    const map = {};
    (recentTracks || []).forEach(t => {
      const name = t.artist_name || t.artist;
      if (name && name !== 'Unknown Artist') {
        if (!map[name]) {
          map[name] = {
            id: t.artist_id || t.youtube_id || name,
            youtube_id: t.artist_id || t.youtube_id || name,
            name,
            title: name,
            type: 'artist',
            cover_url: t.cover_url || '',
            count: 0
          };
        }
        map[name].count += (t.play_count || 1);
      }
    });
    return Object.values(map).sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [playStats?.artistPlays, (recentTracks || []).length]);

  // Derive frequently listened albums (ONLY albums with any song listened to > 3 times)
  const frequentlyListenedAlbums = useMemo(() => {
    const albumEntries = Object.values(playStats?.albumPlays || {});
    const filtered = albumEntries.filter(entry => {
      const playCount = entry.count || 0;
      const songMax = entry.songMaxPlayCount || 0;
      // Requirement: Any song from an album listened more than 3 times (songMax >= 3 or count >= 3)
      return (songMax >= 3 || playCount >= 3) && entry.title && entry.title !== 'Single';
    });
    return filtered.sort((a, b) => ((b.songMaxPlayCount || b.count || 0) - (a.songMaxPlayCount || a.count || 0)));
  }, [playStats?.albumPlays]);

  useEffect(() => {
    let isMounted = true;

    const buildHomeFeed = async () => {
      try {
        setIsLoading(true);
        const assembledCategories = [];

        // ==============================================================
        // CASE A: LOGGED-IN USER
        // ==============================================================
        if (user) {
          const hasRecentHistory = Array.isArray(recentTracks) && recentTracks.length > 0;

          if (!hasRecentHistory) {
            // Logged-in user with NO recently played tracks: show algorithm development prompt only
            if (isMounted) {
              setCategories([]);
              setIsLoading(false);
              setAnimateEntrance(true);
            }
            return;
          }

          // 1. "Recently Played" is FIRST category
          if (recentTracks && recentTracks.length > 0) {
            assembledCategories.push({
              id: 'cat_recently_played',
              title: 'Recently Played',
              type: 'song_list',
              tracks: recentTracks.slice(0, 15)
            });
          }

          // 2. "Similar to {song_name}" ONLY shown when user has an active song in "Now Playing"
          if (currentTrack && (currentTrack.title || currentTrack.name)) {
            let similarTracks = [];
            const seedId = currentTrack.youtube_id || currentTrack.id;

            // Check if prefetched similar matches this seed
            if (prefetchedSimilar?.seedId === seedId && prefetchedSimilar?.tracks?.length > 0) {
              similarTracks = prefetchedSimilar.tracks;
            } else if (seedId) {
              try {
                const res = await fetch(`${API_URL}/watch/${seedId}`);
                if (res.ok) {
                  const data = await res.json();
                  const rawList = data.tracks || [];
                  const seenIds = new Set(recentTracks.map(r => r.youtube_id || r.id));
                  similarTracks = rawList.slice(1).filter(t => {
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
              } catch (e) {
                console.warn("Could not fetch similar tracks for current track:", e);
              }
            }

            if (similarTracks.length > 0) {
              assembledCategories.push({
                id: 'cat_similar_to_song',
                title: `Similar to ${currentTrack.title || currentTrack.name}`,
                type: 'song_list',
                tracks: similarTracks.slice(0, 15)
              });
            }
          }

          // 3. "Tremblers you vibe with" - Most listened trembler on the VERY LEFT (index 0)
          if (mostListenedTremblers && mostListenedTremblers.length > 0) {
            const deduplicatedTremblers = [];
            const seenTremblerNames = new Set();
            for (const art of mostListenedTremblers) {
              const artName = (art.name || art.title || '').toLowerCase().trim();
              if (artName && seenTremblerNames.has(artName)) continue;
              if (artName) seenTremblerNames.add(artName);
              deduplicatedTremblers.push({
                ...art,
                type: 'artist'
              });
              if (deduplicatedTremblers.length >= 12) break;
            }

            if (deduplicatedTremblers.length > 0) {
              assembledCategories.push({
                id: 'cat_tremblers_you_vibe_with',
                title: 'Tremblers you vibe with',
                type: 'trembler_list',
                tracks: deduplicatedTremblers
              });
            }
          }

          // 4. "Frequently Listened Albums" - Only albums with any song listened > 3 times
          if (frequentlyListenedAlbums && frequentlyListenedAlbums.length > 0) {
            assembledCategories.push({
              id: 'cat_frequently_listened_albums',
              title: 'Frequently Listened Albums',
              type: 'album_list',
              tracks: frequentlyListenedAlbums.slice(0, 10)
            });
          }

          if (isMounted) {
            setCategories(assembledCategories);
            setIsLoading(false);
            setAnimateEntrance(true);
          }
          return;
        }

        // ==============================================================
        // CASE B: GUEST USER (Not Logged In)
        // ==============================================================
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

        // 1. If guest has recent history, show "Recently Played" first
        if (recentTracks && recentTracks.length > 0) {
          assembledCategories.push({
            id: 'cat_recently_played',
            title: 'Recently Played',
            type: 'song_list',
            tracks: recentTracks.slice(0, 15)
          });
        }

        // 2. "Similar to {song_name}" ONLY shown when music session is active in "Now Playing"
        if (currentTrack && (currentTrack.title || currentTrack.name)) {
          let similarTracks = [];
          const seedId = currentTrack.youtube_id || currentTrack.id;
          if (prefetchedSimilar?.seedId === seedId && prefetchedSimilar?.tracks?.length > 0) {
            similarTracks = prefetchedSimilar.tracks;
          } else if (seedId) {
            try {
              const res = await fetch(`${API_URL}/watch/${seedId}`);
              if (res.ok) {
                const data = await res.json();
                const rawList = data.tracks || [];
                const seenIds = new Set((recentTracks || []).map(r => r.youtube_id || r.id));
                similarTracks = rawList.slice(1).filter(t => {
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
            } catch (e) {}
          }
          if (similarTracks.length > 0) {
            assembledCategories.push({
              id: 'cat_similar_to_song',
              title: `Similar to ${currentTrack.title || currentTrack.name}`,
              type: 'song_list',
              tracks: similarTracks.slice(0, 15)
            });
          }
        }

        // 3. Guest Tremblers you vibe with (most listened on the VERY LEFT)
        if (mostListenedTremblers && mostListenedTremblers.length > 0) {
          assembledCategories.push({
            id: 'cat_tremblers_you_vibe_with',
            title: 'Tremblers you vibe with',
            type: 'trembler_list',
            tracks: mostListenedTremblers.slice(0, 10)
          });
        }

        // 4. Guest Frequently Listened Albums (only songs played > 3 times)
        if (frequentlyListenedAlbums && frequentlyListenedAlbums.length > 0) {
          assembledCategories.push({
            id: 'cat_frequently_listened_albums',
            title: 'Frequently Listened Albums',
            type: 'album_list',
            tracks: frequentlyListenedAlbums.slice(0, 10)
          });
        }

        // Add Pop, Hip-Hop, and R&B categories (top 10 each)
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
  }, [user, (recentTracks || []).length, playStats?.totalPlays, currentTrack?.youtube_id || currentTrack?.id, prefetchedSimilar?.seedId, mostListenedTremblers, frequentlyListenedAlbums]);

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

  const isUserWithNoHistory = Boolean(user && (!recentTracks || recentTracks.length === 0));

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

          {isUserWithNoHistory ? (
            /* Logged-In State with 0 history: Algorithm Development Prompt */
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
            /* Render Categories (Song Lists, Trembler Lists, or Album Lists) */
            <div className="flex flex-col gap-12 pb-16">
              {categories.map((category) => (
                <div key={category.id || category.title} className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {category.title}
                  </h2>
                  
                  {category.type === 'trembler_list' ? (
                    /* Tremblers You Vibe With (Circular artist profile, #1 most played artist on the VERY LEFT) */
                    <DragScrollContainer>
                      {category.tracks.map((trembler, i) => (
                        <div
                          key={`trembler-${category.id || 'cat'}-${trembler.id || trembler.youtube_id || trembler.name || i}-${i}`}
                          onClick={() => router.push(getTremblerUrl(trembler.name || trembler.title || trembler.id || trembler.youtube_id))}
                          className="flex flex-col items-center gap-3 group cursor-pointer min-w-[130px] w-[130px] md:min-w-[calc((100%-12rem)/7)] md:w-[calc((100%-12rem)/7)] select-none shrink-0"
                        >
                          <div className="relative aspect-square w-full rounded-full overflow-hidden bg-zinc-900 border-2 border-white/10 shadow-xl group-hover:border-indigo-500/60 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all duration-500">
                            <SafeImage 
                              src={trembler.cover_url || ''} 
                              alt={trembler.name || trembler.title} 
                              title={trembler.name || trembler.title} 
                              artist={trembler.name || trembler.title}
                              type="artist"
                              className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-500 ease-out"
                              useOriginalSize={true}
                            />
                          </div>
                          <div className="flex flex-col items-center text-center mt-1 w-full px-1">
                            <span className="text-white font-bold text-base truncate w-full group-hover:text-indigo-400 transition-colors">
                              {trembler.name || trembler.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </DragScrollContainer>
                  ) : category.type === 'album_list' ? (
                    /* Frequently Listened Albums (Only songs played > 3 times) */
                    <DragScrollContainer>
                      {category.tracks.map((album, i) => (
                        <div
                          key={`album-${category.id || 'cat'}-${album.id || album.youtube_id || album.title || i}-${i}`}
                          onClick={() => router.push(getAlbumUrl(album, album.title || album.name))}
                          className="flex flex-col gap-3 group cursor-pointer min-w-[120px] w-[120px] md:min-w-[calc((100%-12rem)/7)] md:w-[calc((100%-12rem)/7)] shrink-0"
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-zinc-800 rounded-2xl shadow-xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/5 group-hover:border-white/20 transition-all duration-300">
                            <SafeImage 
                              src={album.cover_url || ''} 
                              alt={album.title} 
                              title={album.title} 
                              artist={album.artist}
                              type="album"
                              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-col mt-1">
                            <span className="text-white font-bold text-base truncate w-full group-hover:text-indigo-400 transition-colors">
                              {album.title}
                            </span>
                            <span className="text-zinc-400 text-sm truncate font-medium mt-0.5 capitalize">
                              {album.artist || 'Album'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </DragScrollContainer>
                  ) : (
                    /* Standard Song List */
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
                  )}
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
