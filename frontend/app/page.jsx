"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { API_URL, getTremblerUrl, getAlbumUrl, getTremlistUrl } from '../utils/api';
import { useRouter } from 'next/navigation';
import SafeImage from '../components/SafeImage';
import SteamAlbumCard from '../components/SteamAlbumCard';
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
    hasBooted, 
    user, 
    recentTracks, 
    playStats, 
    totalPlays, 
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

  // Milestone caching for Tremblers (#5: 50 songs) and Albums (#6: 10 songs)
  const [cachedTremblers, setCachedTremblers] = useState(null);
  const [cachedTremblerMilestone, setCachedTremblerMilestone] = useState(-1);
  const [cachedAlbums, setCachedAlbums] = useState(null);
  const [cachedAlbumMilestone, setCachedAlbumMilestone] = useState(-1);

  const router = useRouter();

  // Active seed determination for "Similar to {song_name}" category:
  // 1. If music is playing in "Now Playing" -> currentTrack
  // 2. If no music is playing in "Now Playing" -> user's most recently played song (recentTracks[0])
  // 3. Fallback for brand new users with 0 history -> popular seed track
  const activeSeed = useMemo(() => {
    if (currentTrack && (currentTrack.youtube_id || currentTrack.id)) {
      return currentTrack;
    }
    if (recentTracks && recentTracks.length > 0 && (recentTracks[0].youtube_id || recentTracks[0].id)) {
      return recentTracks[0];
    }
    return {
      id: 'dQw4w9WgXcQ',
      youtube_id: 'dQw4w9WgXcQ',
      title: 'Starboy',
      artist: 'The Weeknd',
      artist_name: 'The Weeknd'
    };
  }, [
    currentTrack?.youtube_id, 
    currentTrack?.id, 
    currentTrack?.title,
    (recentTracks || [])[0]?.youtube_id, 
    (recentTracks || [])[0]?.id,
    (recentTracks || [])[0]?.title
  ]);

  // Dedicated Similar Category state with smooth fade transition
  const [similarState, setSimilarState] = useState({
    seedId: null,
    seedTitle: '',
    tracks: [],
    isFading: false
  });
  const similarStateRef = useRef(similarState);
  useEffect(() => {
    similarStateRef.current = similarState;
  }, [similarState]);

  // Dedicated effect to manage Similar tracks with silky smooth fade transitions
  useEffect(() => {
    let isMounted = true;
    const targetId = activeSeed?.youtube_id || activeSeed?.id;
    const targetTitle = activeSeed?.title || 'Song';

    if (!targetId) return;

    // If already matching current seed and has tracks, do nothing
    if (similarStateRef.current.seedId === targetId && similarStateRef.current.tracks.length > 0) {
      return;
    }

    const applyNewTracks = (newTracks) => {
      if (!isMounted) return;
      if (similarStateRef.current.tracks.length > 0 && similarStateRef.current.seedId !== targetId) {
        // Smoothly fade out old songs
        setSimilarState(prev => ({ ...prev, isFading: true }));
        setTimeout(() => {
          if (!isMounted) return;
          setSimilarState({
            seedId: targetId,
            seedTitle: targetTitle,
            tracks: newTracks,
            isFading: false
          });
        }, 250);
      } else {
        // First load or initial seed
        setSimilarState({
          seedId: targetId,
          seedTitle: targetTitle,
          tracks: newTracks,
          isFading: false
        });
      }
    };

    const recent20 = (recentTracks || []).slice(0, 20);
    const excludeIds = new Set(recent20.map(t => t.youtube_id || t.id).filter(Boolean));
    excludeIds.add(targetId);
    const excludeTitles = new Set(recent20.map(t => (t.title || '').toLowerCase().trim()).filter(Boolean));
    if (targetTitle) excludeTitles.add(targetTitle.toLowerCase().trim());

    // 1. Check prefetchedSimilar from PlayerContext
    if (prefetchedSimilar && prefetchedSimilar.seedId === targetId && prefetchedSimilar.tracks?.length > 0) {
      const filtered = prefetchedSimilar.tracks.filter(t => {
        const tid = t.youtube_id || t.id;
        const normTitle = (t.title || '').toLowerCase().trim();
        return !excludeIds.has(tid) && !excludeTitles.has(normTitle);
      });
      if (filtered.length > 0) {
        applyNewTracks(filtered.slice(0, 15));
        return;
      }
    }

    // 2. Check sessionStorage cache
    try {
      const cachedRaw = sessionStorage.getItem(`tremble_similar_${targetId}`);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Array.isArray(cached) && cached.length > 0) {
          const filtered = cached.filter(t => {
            const tid = t.youtube_id || t.id;
            const normTitle = (t.title || '').toLowerCase().trim();
            return !excludeIds.has(tid) && !excludeTitles.has(normTitle);
          });
          if (filtered.length > 0) {
            applyNewTracks(filtered.slice(0, 15));
            return;
          }
        }
      }
    } catch (e) {}

    // 3. Background fetch from API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch(`${API_URL}/watch/${targetId}`, { signal: controller.signal })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        clearTimeout(timeoutId);
        if (!isMounted || !data) return;
        const rawTracks = data.tracks || [];
        const seen = new Set();
        const collected = [];

        for (const t of rawTracks.slice(1)) {
          const tid = t.videoId || t.id || t.youtube_id;
          const title = (t.title || '').trim();
          const normTitle = title.toLowerCase();

          if (!tid || tid === targetId || excludeIds.has(tid) || seen.has(tid)) continue;
          if (excludeTitles.has(normTitle)) continue;

          seen.add(tid);
          const thumbs = t.thumbnails || t.thumbnail || [];
          collected.push({
            id: tid,
            youtube_id: tid,
            type: 'song',
            title: title,
            artist: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist || ''),
            artist_name: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist || ''),
            cover_url: thumbs.length > 0 ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${tid}/hqdefault.jpg`
          });

          if (collected.length >= 15) break;
        }

        if (collected.length > 0) {
          try {
            sessionStorage.setItem(`tremble_similar_${targetId}`, JSON.stringify(collected));
          } catch (e) {}
          applyNewTracks(collected);
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        // If error & we have no tracks at all, fallback to other songs so section is never empty
        if (isMounted && similarStateRef.current.tracks.length === 0) {
          const fallbackList = (recentTracks || []).slice(1, 16);
          if (fallbackList.length > 0) {
            applyNewTracks(fallbackList);
          }
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [activeSeed?.youtube_id, activeSeed?.id, activeSeed?.title, prefetchedSimilar]);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setAnimateEntrance(true), 50);
    }
  }, [isLoading]);

  // Formulated list of songs that user listens to THE MOST (Strict criteria: AT LEAST 5 plays of that specific song)
  // Sorted in descending order of play count so that the MOST LISTENED SONG is on the VERY LEFT
  const mostListenedSongs = useMemo(() => {
    const songEntries = Object.values(playStats?.songPlays || {});
    if (songEntries.length > 0) {
      // STRICT CRITERIA: ONLY songs with AT LEAST 5 plays
      const qualifiedSongs = songEntries.filter(entry => entry.track && (entry.count || 0) >= 5);
      
      if (qualifiedSongs.length === 0) {
        return []; // Do not qualify or show Jump right in unless songs have at least 5 plays!
      }

      // Sort descending by play count so that the MOST PLAYED SONG is on the VERY LEFT
      const sorted = qualifiedSongs
        .sort((a, b) => {
          const countDiff = (b.count || 0) - (a.count || 0);
          if (countDiff !== 0) return countDiff;
          return (b.lastPlayed || 0) - (a.lastPlayed || 0);
        })
        .map(entry => ({
          ...entry.track,
          play_count: entry.count
        }));

      return sorted.slice(0, 15);
    }
    return [];
  }, [playStats?.songPlays]);

  // Derive most listened tremblers (artists) in descending order
  const mostListenedTremblers = useMemo(() => {
    const artistEntries = Object.values(playStats?.artistPlays || {});
    if (artistEntries.length > 0) {
      return artistEntries
        .filter(entry => entry.name && entry.name !== 'Unknown Artist')
        .sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    // Extract from recent history if playStats is fresh
    const map = {};
    (recentTracks || []).forEach(t => {
      const name = t.artist_name || t.artist;
      if (name && name !== 'Unknown Artist') {
        if (!map[name]) {
          map[name] = {
            id: t.artist_id || t.youtube_id,
            youtube_id: t.artist_id || t.youtube_id,
            name,
            title: name,
            type: 'artist',
            cover_url: t.cover_url || '',
            count: 0
          };
        }
        map[name].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [playStats?.artistPlays, recentTracks]);

  // Derive most listened albums in descending order
  const mostListenedAlbums = useMemo(() => {
    const albumEntries = Object.values(playStats?.albumPlays || {});
    if (albumEntries.length > 0) {
      return albumEntries
        .filter(entry => entry.title && entry.title !== 'Single')
        .sort((a, b) => (b.count || 0) - (a.count || 0));
    }
    // Extract from recent history if playStats is fresh
    const map = {};
    (recentTracks || []).forEach(t => {
      const albName = typeof t.album === 'object' ? t.album?.name : t.album;
      if (albName && albName !== 'Single') {
        const key = t.album_id || albName;
        if (!map[key]) {
          map[key] = {
            id: t.album_id || key,
            youtube_id: t.album_id || key,
            title: albName,
            artist: t.artist_name || t.artist || '',
            type: 'album',
            cover_url: t.cover_url || '',
            count: 0
          };
        }
        map[key].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [playStats?.albumPlays, recentTracks]);

  useEffect(() => {
    let isMounted = true;

    const buildHomeCategories = async () => {
      try {
        const assembledCategories = [];

        // -------------------------------------------------------------
        // CATEGORY #1: Recently Played
        // -------------------------------------------------------------
        if (recentTracks && recentTracks.length > 0) {
          assembledCategories.push({
            id: 'cat_recently_played',
            title: 'Recently Played',
            type: 'song_list',
            tracks: recentTracks.slice(0, 15)
          });
        }

        // -------------------------------------------------------------
        // CATEGORY #2: Jump right in (Formulated Most Listened with AT LEAST 5 plays, Most Played on VERY LEFT)
        // -------------------------------------------------------------
        if (mostListenedSongs && mostListenedSongs.length >= 1) {
          assembledCategories.push({
            id: 'cat_jump_right_in',
            title: 'Jump right in',
            type: 'song_list',
            tracks: mostListenedSongs
          });
        }

        // -------------------------------------------------------------
        // CATEGORY #3: Similar to {song_name} - ALWAYS SHOWN AT ALL TIMES
        // -------------------------------------------------------------
        const currentSimilarTracks = similarState.tracks.length > 0 
          ? similarState.tracks 
          : (prefetchedSimilar?.seedId === (activeSeed?.youtube_id || activeSeed?.id) && prefetchedSimilar?.tracks?.length > 0
              ? prefetchedSimilar.tracks
              : (recentTracks && recentTracks.length > 1 ? recentTracks.slice(1, 16) : []));

        assembledCategories.push({
          id: 'cat_similar_to_song',
          title: `Similar to ${similarState.seedTitle || activeSeed?.title || 'Song'}`,
          type: 'song_list',
          isSimilar: true,
          tracks: currentSimilarTracks
        });

        // -------------------------------------------------------------
        // CATEGORY #5: Tremblers you vibe with
        // Circular profile, edge-to-edge zoom fit, no "Trembler" label, no saturation effect, no play button
        // -------------------------------------------------------------
        if (mostListenedTremblers && mostListenedTremblers.length > 0) {
          const deduplicatedTremblers = [];
          const seenTremblerIds = new Set();
          const seenTremblerNames = new Set();
          for (const art of mostListenedTremblers) {
            const artId = art.id || art.youtube_id;
            const artName = (art.name || art.title || '').toLowerCase().trim();
            if (artId && seenTremblerIds.has(artId)) continue;
            if (artName && seenTremblerNames.has(artName)) continue;
            if (artId) seenTremblerIds.add(artId);
            if (artName) seenTremblerNames.add(artName);
            deduplicatedTremblers.push({
              ...art,
              type: 'artist'
            });
            if (deduplicatedTremblers.length >= 15) break;
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

        // -------------------------------------------------------------
        // CATEGORY #6: Albums you love
        // Steam trading card 3D tilt & sheen hover. No hover play button.
        // -------------------------------------------------------------
        if (mostListenedAlbums && mostListenedAlbums.length > 0) {
          const deduplicatedAlbums = [];
          const seenAlbumIds = new Set();
          const seenAlbumTitles = new Set();
          for (const alb of mostListenedAlbums) {
            const aid = alb.id || alb.youtube_id;
            const aTitle = (alb.title || '').toLowerCase().trim();
            if (aid && seenAlbumIds.has(aid)) continue;
            if (aTitle && seenAlbumTitles.has(aTitle)) continue;
            if (aid) seenAlbumIds.add(aid);
            if (aTitle) seenAlbumTitles.add(aTitle);
            deduplicatedAlbums.push({
              ...alb,
              type: 'album'
            });
            if (deduplicatedAlbums.length >= 15) break;
          }

          if (deduplicatedAlbums.length > 0) {
            assembledCategories.push({
              id: 'cat_albums_you_love',
              title: 'Albums you love',
              type: 'album_list',
              tracks: deduplicatedAlbums
            });
          }
        }

        // Render immediately with local data without waiting on network!
        if (isMounted) {
          setCategories(assembledCategories);
          setIsLoading(false);
        }

        // -------------------------------------------------------------
        // Background Enrichment: "We think you'd like" right after "Similar to {song_name}"
        // -------------------------------------------------------------
        const songEntries = Object.values(playStats?.songPlays || {});
        const candidateSeeds = songEntries.length > 0 
          ? songEntries.filter(e => e.track).map(e => e.track)
          : (recentTracks || []);

        if (candidateSeeds.length > 0) {
          const mostListenedIds = new Set(candidateSeeds.map(s => s.youtube_id || s.id));
          const mostListenedTitles = new Set(candidateSeeds.map(s => (s.title || '').toLowerCase().trim()));
          const shuffledSeeds = [...candidateSeeds].sort(() => 0.5 - Math.random());
          const seedTrackIds = shuffledSeeds.slice(0, 4).map(s => s.youtube_id || s.id).filter(Boolean);

          if (seedTrackIds.length > 0) {
            fetch(`${API_URL}/api/recommendations/we-think-youd-like`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                seed_track_ids: seedTrackIds,
                exclude_track_ids: Array.from(mostListenedIds),
                limit: 20
              })
            })
            .then(res => res.ok ? res.json() : null)
            .then(recData => {
              if (isMounted && recData && recData.tracks && recData.tracks.length > 0) {
                const weThinkTracks = recData.tracks.filter(t => {
                  const tid = t.youtube_id || t.id;
                  const normTitle = (t.title || '').toLowerCase().trim();
                  return !mostListenedIds.has(tid) && !mostListenedTitles.has(normTitle);
                }).slice(0, 15);

                if (weThinkTracks.length > 0) {
                  setCategories(prev => {
                    const filtered = prev.filter(c => c.id !== 'cat_we_think_youd_like');
                    const simIdx = filtered.findIndex(c => c.id === 'cat_similar_to_song');
                    const insertIdx = simIdx !== -1 ? simIdx + 1 : Math.min(2, filtered.length);
                    const updated = [...filtered];
                    updated.splice(insertIdx, 0, {
                      id: 'cat_we_think_youd_like',
                      title: "We think you'd like",
                      type: 'song_list',
                      tracks: weThinkTracks
                    });
                    return updated;
                  });
                }
              }
            })
            .catch(() => {});
          }
        }
      } catch (err) {
        console.error("Failed to build home categories", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    buildHomeCategories();

    return () => {
      isMounted = false;
    };
  }, [
    hasBooted, 
    user?.id, 
    (recentTracks || []).length, 
    mostListenedSongs?.length,
    playStats?.totalPlays,
    similarState.seedId,
    similarState.seedTitle,
    similarState.tracks.length,
    activeSeed?.youtube_id,
    activeSeed?.id,
    activeSeed?.title
  ]);

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
          
          <div className="flex flex-col gap-12 pb-16">
            {categories.map((category) => {
              const isSimilarCat = category.id === 'cat_similar_to_song' || category.isSimilar;

              return (
                <div key={category.id || category.title} className="flex flex-col gap-4">
                  <h2 className={`text-2xl font-bold text-white tracking-tight ${isSimilarCat ? `transition-opacity duration-300 ${similarState.isFading ? 'opacity-40' : 'opacity-100'}` : ''}`}>
                    {isSimilarCat ? `Similar to ${similarState.seedTitle || activeSeed?.title || 'Song'}` : category.title}
                  </h2>
                  
                  {/* 1. Albums You Love Section (Steam Trading Card Effect, No Play Button) */}
                  {category.type === 'album_list' ? (
                    <DragScrollContainer>
                      {category.tracks.map((album, i) => (
                        <SteamAlbumCard
                          key={`album-${category.id || 'cat'}-${album.id || album.youtube_id || album.title || i}-${i}`}
                          album={album}
                          onClick={() => router.push(getAlbumUrl(album, album.title))}
                        />
                      ))}
                    </DragScrollContainer>
                  ) : category.type === 'trembler_list' ? (
                    /* 2. Tremblers You Vibe With Section (Circular Profile, Edge-to-Edge Cover fit, Smooth Zoom-In on hover, No "Trembler" label, No Saturation effect, No Play Button) */
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
                  ) : (
                    /* 3. Regular Song Categories (Recently Played, Jump Right In, Similar to {song}, We Think You'd Like) */
                    <div className={isSimilarCat ? `transition-all duration-300 ease-in-out ${similarState.isFading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}` : ''}>
                      <DragScrollContainer>
                        {(isSimilarCat && similarState.tracks.length > 0 ? similarState.tracks : category.tracks).map((song, i) => {
                          const isCurrentPlaying = (currentTrack?.youtube_id === song.youtube_id || currentTrack?.id === song.id) && isPlaying;
                          const activeList = isSimilarCat && similarState.tracks.length > 0 ? similarState.tracks : category.tracks;
                          return (
                            <div
                              key={`song-${category.id || 'cat'}-${song.id || song.youtube_id || song.title || i}-${i}`}
                              onClick={() => handleItemClick(song, activeList)}
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
                  )}
                </div>
              );
            })}
          </div>

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
