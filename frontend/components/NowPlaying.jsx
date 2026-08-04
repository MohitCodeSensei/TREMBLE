"use client";
import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { API_URL, getTremblerUrl } from '../utils/api';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Heart, ListMusic, Plus, Minus, Search, Loader2, ListPlus, ListVideo, Mic2, RefreshCw } from 'lucide-react';
import MonochromeKawarp from './MonochromeKawarp';
import SafeImage from './SafeImage';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NowPlaying = () => {
  const {
    currentTrack,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    currentTime,
    duration,
    lyrics,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    customLoopCount,
    toggleRepeat,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    likedSongs,
    toggleLike,
    setIsQueueVisible,
    isQueueVisible,
    queue,
    setQueue,
    currentIndex,
    playTrackFromQueue,
    user,
    playlists,
    savePlaylist,
    recentTracks,
    fillQueueWithSimilar,
    seekTo
  } = usePlayer();

  const [isRendered, setIsRendered] = useState(false);
  const router = useRouter();
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const scrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const searchContainerRef = useRef(null);
  
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [selectedTrackForMenu, setSelectedTrackForMenu] = useState(null);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState(false);
  const [hasRefreshedCurrentSong, setHasRefreshedCurrentSong] = useState(false);

  useEffect(() => {
    setHasRefreshedCurrentSong(false);
  }, [currentTrack?.youtube_id]);

  const handleRefreshQueue = async () => {
    setIsRefreshingQueue(true);
    if (currentTrack) {
      await new Promise(r => setTimeout(r, 400));
      await fillQueueWithSimilar(currentTrack);
      setHasRefreshedCurrentSong(true);
    }
    setIsRefreshingQueue(false);
  };
  
  const isLiked = currentTrack && likedSongs.some(t => (t.youtube_id || t.id) === (currentTrack.youtube_id || currentTrack.id));

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleLyricsScroll = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 4000);
  };

  useEffect(() => {
    if (isNowPlayingOpen) {
      setShouldRender(true);
      setTimeout(() => setIsRendered(true), 50);
    } else {
      setIsRendered(false);
      setTimeout(() => {
        setIsQueueVisible(false); // Reset queue visibility AFTER closing
        setShouldRender(false);
      }, 700);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsNowPlayingOpen(false);
      }
    };
    
    const handleMouseUp = (e) => {
      if (e.button === 3 || e.button === 4) {
        setIsNowPlayingOpen(false);
      }
    };

    if (isNowPlayingOpen) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isNowPlayingOpen, setIsQueueVisible, setIsNowPlayingOpen]);

  useEffect(() => {
    if (!lyrics) {
      setParsedLyrics([]);
      return;
    }
    
    let text = typeof lyrics === 'string' ? lyrics : lyrics.join('\n');
    
    if (!text.includes('[')) {
       setParsedLyrics([{ time: 0, text }]);
       return;
    }

    const lines = text.split('\n');
    const parsed = [];
    const timeRegexGlobal = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
    const timeRegexSingle = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/;
    
    lines.forEach(line => {
      const match = timeRegexSingle.exec(line);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const msStr = match[3] || '0';
        const ms = parseFloat('0.' + msStr);
        const time = mins * 60 + secs + ms;
        const textContent = line.replace(timeRegexGlobal, '').trim();
        if (textContent) {
          parsed.push({ time, text: textContent });
        }
      } else if (line.trim() && !line.trim().startsWith('[ti:') && !line.trim().startsWith('[ar:') && !line.trim().startsWith('[al:')) {
        parsed.push({ time: 0, text: line.trim() });
      }
    });
    
    parsed.sort((a, b) => a.time - b.time);
    setParsedLyrics(parsed);
  }, [lyrics]);

  useEffect(() => {
    if (parsedLyrics.length > 0) {
      let activeIndex = 0;
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (currentTime >= parsedLyrics[i].time - 0.15) {
          activeIndex = i;
        } else {
          break;
        }
      }
      setActiveLyricIndex(activeIndex);
      
      if (!isUserScrolling && scrollRef.current) {
         const container = scrollRef.current;
         const wrapper = container.children[0];
         if (wrapper && wrapper.children[activeIndex]) {
             const activeEl = wrapper.children[activeIndex];
             // Manually calculate the target scroll position (35% from the top)
             const targetY = container.clientHeight * 0.35;
             const activeElCenter = activeEl.offsetTop + (activeEl.clientHeight / 2);
             
             container.scrollTo({
                 top: activeElCenter - targetY,
                 behavior: 'smooth'
             });
         }
      }
    }
  }, [currentTime, parsedLyrics, isUserScrolling]);

  // Handle outside click for search & menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      // Also close menu if clicked outside, though we have stopPropagation, a global click clears it
      setSelectedTrackForMenu(null);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderArtistLinks = (artistString, isLyricsView = false, trackObj = null) => {
    if (!artistString) return null;
    const artists = artistString.split(',').map(a => a.trim());
    return artists.map((artist, i) => (
      <React.Fragment key={i}>
        <span 
          onClick={(e) => { 
            e.stopPropagation(); 
            setIsNowPlayingOpen(false); 
            setIsQueueVisible(false); 
            router.push(getTremblerUrl(artist));
          }}
          className={`hover:underline cursor-pointer hover:text-white transition-colors ${isLyricsView ? 'text-zinc-300' : 'text-zinc-400'}`}
        >
          {artist}
        </span>
        {i < artists.length - 1 && ', '}
      </React.Fragment>
    ));
  };

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            const songs = data.slice(0, 5); // Limit to 5 results to fit in Up Next
            setSearchResults(songs);
          }
        } catch (error) {
          console.error("Failed to search:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleAddToQueue = (track) => {
    const mappedTrack = {
      title: track.title,
      artist_name: track.artist || track.artist_name,
      cover_url: track.cover_url,
      thumb_url: track.thumb_url,
      youtube_id: track.youtube_id,
      duration: track.duration,
      type: track.type || 'song'
    };
    setQueue(prev => [...prev, mappedTrack]);
    setQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handlePlayNext = (track) => {
    const mappedTrack = {
      title: track.title,
      artist_name: track.artist || track.artist_name,
      cover_url: track.cover_url,
      thumb_url: track.thumb_url,
      youtube_id: track.youtube_id,
      duration: track.duration,
      type: track.type || 'song'
    };
    setQueue(prev => {
      const newQueue = [...prev];
      newQueue.splice(currentIndex + 1, 0, mappedTrack);
      return newQueue;
    });
    setQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleRemoveFromQueue = (indexToRemove) => {
    // indexToRemove is relative to upcomingQueue
    const actualIndex = currentIndex + 1 + indexToRemove;
    setQueue(prev => prev.filter((_, i) => i !== actualIndex));
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (!user) {
      setShowLoginToast(true);
      setTimeout(() => setShowLoginToast(false), 3000);
      return;
    }
    toggleLike(currentTrack, e);
  };

  const rawCover = currentTrack?.cover_url || '';
  const kawarpSrc = rawCover.startsWith('http')
    ? `${API_URL}/api/image-proxy?url=${encodeURIComponent(rawCover)}`
    : rawCover;

  if (!shouldRender || !currentTrack) return null;

  return (
    <div className={`fixed inset-0 z-[70] flex overflow-hidden font-sans transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isRendered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[100vh]'}`}>
      
      {/* Dynamic Fluid Background using KAWARP in NowPlaying.jsx */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
        {/* Instant Placeholder while Kawarp loads */}
        <div 
          className="absolute inset-0 opacity-50" 
          style={{ 
            backgroundImage: `url(${currentTrack?.cover_url})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            filter: 'blur(25px) saturate(180%)' 
          }}
        />
        
        {/* WebGL Kawarp Overlay */}
        {currentTrack?.cover_url && (
           <MonochromeKawarp
             src={kawarpSrc}
             isPlaying={isPlaying}
           />
        )}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[30px]"></div>
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Top Left Close Button */}
      <div className="absolute top-12 left-12 z-50 flex items-center gap-4 text-zinc-400">
        <button 
          onClick={() => setIsNowPlayingOpen(false)}
          className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* SLIDING CAROUSEL CONTAINER */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto h-full overflow-visible pointer-events-none p-8">
        <div 
          className="h-full flex transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-auto"
          style={{ width: '158.3333%', transform: isQueueVisible ? 'translateX(-36.8421%)' : 'translateX(0)' }}
        >
          
          {/* LEFT COLUMN - LYRICS (7/19 width) */}
          <div className={`w-[36.8421%] h-full flex flex-col pt-12 pb-32 pr-12 transition-opacity duration-700 ${isQueueVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="relative flex-1 overflow-y-auto no-scrollbar scroll-smooth group/lyrics mt-16" ref={scrollRef} onScroll={handleLyricsScroll} style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
              <div className="flex flex-col py-[40vh] gap-6 max-w-2xl text-left">
                {parsedLyrics.length > 0 ? (
                  parsedLyrics.map((line, index) => {
                    const isActive = index === activeLyricIndex;
                    const isPast = index < activeLyricIndex;
                    
                    return (
                      <div 
                        key={index}
                        onClick={() => {
                          if (typeof line.time === 'number') {
                            seekTo(line.time);
                            if (!isPlaying) togglePlay();
                          }
                        }}
                        className={`text-4xl font-black transition-all duration-700 ease-out cursor-pointer hover:text-white hover:blur-none hover:opacity-100 group-hover/lyrics:opacity-80 group-hover/lyrics:blur-0 ${
                          isActive ? 'text-white scale-[1.02] origin-left drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 
                          isPast ? 'text-white/40 blur-[4px] opacity-0 -translate-y-4' : 'text-white/40 blur-[2px]'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-4xl font-black text-white/40 blur-[1px]">Loading lyrics...</div>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - PLAYER (5/19 width) */}
          <div className={`w-[26.3157%] h-full flex flex-col justify-center items-center px-4 transition-all duration-1000 ease-out transform ${isRendered ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
             
             {/* Top Right Add to Tremlist Button (Lyrics Page) */}
             <div className={`w-full max-w-[420px] flex justify-end mb-4 transition-opacity duration-700 ${isQueueVisible ? 'hidden' : 'opacity-100'}`}>
               <button 
                  className="p-2 rounded-full transition-all flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-110"
                  title="Add to Tremlist"
                  onClick={(e) => {
                     e.stopPropagation();
                     if (selectedTrackForMenu?.youtube_id === currentTrack?.youtube_id) {
                       setSelectedTrackForMenu(null);
                     } else {
                       const rect = e.currentTarget.getBoundingClientRect();
                       setSelectedTrackForMenu(currentTrack);
                       // Open menu to the LEFT of the icon
                       setMenuPos({ top: rect.top, left: rect.left - 210 });
                     }
                  }}
               >
                 <Plus size={24} />
               </button>
             </div>

             {/* Top Left Add to Tremlist Button (Up Next Page) */}
             <div className={`w-full max-w-[420px] flex justify-start mb-4 transition-opacity duration-700 ${!isQueueVisible ? 'hidden' : 'opacity-100'}`}>
               <button 
                  className="p-2 rounded-full transition-all flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:scale-110"
                  title="Add to Tremlist"
                  onClick={(e) => {
                     e.stopPropagation();
                     if (selectedTrackForMenu?.youtube_id === currentTrack?.youtube_id) {
                       setSelectedTrackForMenu(null);
                     } else {
                       const rect = e.currentTarget.getBoundingClientRect();
                       setSelectedTrackForMenu(currentTrack);
                       // Open menu to the LEFT of the icon
                       setMenuPos({ top: rect.top, left: rect.left - 210 });
                     }
                  }}
               >
                 <Plus size={24} />
               </button>
             </div>

            <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] mb-8 ring-1 ring-white/10 bg-zinc-900">
              <SafeImage 
                src={currentTrack.cover_url} 
                alt={currentTrack.title} 
                title={currentTrack.title}
                artist={currentTrack.artist_name}
                type="song"
                className="absolute inset-0 w-full h-full object-cover" 
              />
            </div>
            
            <div className="w-full max-w-[420px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col flex-1 min-w-0 pr-4 text-left">
                  <h1 
                    className="text-3xl font-black text-white mb-1 truncate tracking-tight hover:text-indigo-300 transition-colors cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!currentTrack) return;
                      const albumId = currentTrack.album_id || currentTrack._albumId;
                      if (albumId) {
                        router.push(`/album/${albumId}?highlight=${currentTrack.youtube_id}`);
                        setIsNowPlayingOpen(false);
                        setIsQueueVisible(false);
                        return;
                      }
                      
                      const artistName = currentTrack.artist || currentTrack.artist_name || '';
                      if (artistName) {
                        router.push(getTremblerUrl(artistName));
                        setIsNowPlayingOpen(false);
                        setIsQueueVisible(false);
                        return;
                      }
                      
                      if (currentTrack.artist_id) {
                        router.push(getTremblerUrl(currentTrack.artist_id));
                        setIsNowPlayingOpen(false);
                        setIsQueueVisible(false);
                        return;
                      }
                    }}
                  >
                    {currentTrack.title}
                  </h1>
                  <p className="text-zinc-300 text-lg truncate font-medium">{renderArtistLinks(currentTrack.artist_name, true)}</p>
                </div>
                <div className="relative">
                  <button onClick={handleLikeClick} className="hover:scale-125 transition-all hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                    <Heart size={28} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "text-zinc-400 hover:text-white"} />
                  </button>
                  {/* Login Toast */}
                  <AnimatePresence>
                    {showLoginToast && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.9 }}
                        className="absolute top-10 right-0 w-48 bg-zinc-900 border border-white/20 text-white text-xs font-medium p-3 rounded-xl shadow-2xl z-50 pointer-events-none"
                      >
                        Please log in to like songs and create Tremlists.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              {/* Playback Controls */}
              <div className="flex flex-col gap-6 mt-2">
                 
                 {/* Progress Bar (Moved Up) */}
                 <div className="flex items-center gap-3 px-4 text-xs text-zinc-400 font-medium font-sans tracking-wide">
                    <span>{formatTime(currentTime)}</span>
                    <input 
                      type="range" 
                      min="0" 
                      max={duration || 100} 
                      value={currentTime || 0} 
                      onChange={(e) => seekTo(parseFloat(e.target.value))}
                      className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer hover:h-2 transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.8)] [&::-webkit-slider-thumb]:opacity-0 hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity"
                      style={{
                        background: `linear-gradient(to right, white, white)`,
                        backgroundSize: `${((currentTime || 0) / (duration || 1)) * 100}% 100%`,
                        backgroundRepeat: 'no-repeat',
                        transition: 'background-size 0.25s linear'
                      }}
                    />
                    <span>{formatTime(duration)}</span>
                 </div>

                 {/* Main Playback Buttons */}
                 <div className="flex items-center justify-between text-zinc-400 px-4">
                   <button onClick={toggleShuffle} className={`transition-all hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)] hover:text-white ${isShuffle ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`}>
                      <Shuffle size={20} />
                   </button>
                   <button onClick={playPrev} className="hover:text-white transition-all hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                      <SkipBack size={32} fill="currentColor" />
                   </button>
                   <button onClick={togglePlay} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)]">
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                   </button>
                   <button onClick={playNext} className="hover:text-white transition-all hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]">
                      <SkipForward size={32} fill="currentColor" />
                   </button>
                   <button onClick={toggleRepeat} className={`transition-all hover:scale-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)] hover:text-white relative ${customLoopCount !== 0 ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`}>
                      <Repeat size={20} />
                      {customLoopCount > 0 && (
                        <div className="absolute -top-1.5 -right-1.5 bg-white text-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-black shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                          {customLoopCount}
                        </div>
                      )}
                   </button>
                 </div>
                 
                 {/* Bottom Row for Volume and Queue icons (Moved Down) */}
                 <div className="flex items-center justify-between text-zinc-400 px-4 mt-2">
                    {/* Retractable Volume Bar */}
                    <div className="group flex items-center gap-2 relative">
                      <button onClick={toggleMute} className="hover:text-white transition-all hover:scale-110 z-10 relative" title="Mute/Unmute">
                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={isMuted ? 0 : volume} 
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-0 group-hover:w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer transition-all duration-300 opacity-0 group-hover:opacity-100 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,1)]"
                        style={{
                          background: `linear-gradient(to right, white ${isMuted ? 0 : volume}%, #27272a ${isMuted ? 0 : volume}%)`
                        }}
                      />
                    </div>
                    
                    {/* Queue Toggle Button */}
                    <button 
                      onClick={() => setIsQueueVisible(!isQueueVisible)} 
                      className={`relative w-8 h-8 flex items-center justify-center transition-all hover:scale-110 ${isQueueVisible ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'hover:text-white'}`}
                      title={isQueueVisible ? "Lyrics" : "Queue"}
                    >
                      <AnimatePresence mode="wait">
                        {isQueueVisible ? (
                          <motion.div key="lyrics-icon" initial={{ opacity: 0, rotate: -90, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.5 }} transition={{ duration: 0.2 }} className="absolute">
                            <Mic2 size={18} />
                          </motion.div>
                        ) : (
                          <motion.div key="queue-icon" initial={{ opacity: 0, rotate: 90, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -90, scale: 0.5 }} transition={{ duration: 0.2 }} className="absolute">
                            <ListMusic size={18} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                 </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - QUEUE (7/19 width) */}
          <div className={`w-[36.8421%] h-full flex flex-col justify-center pl-10 pr-6 transition-opacity duration-700 ${isQueueVisible ? 'opacity-100 delay-300' : 'opacity-0 pointer-events-none'}`}>
             <div className="w-full h-[82vh] max-h-[760px] bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 flex flex-col overflow-hidden shadow-2xl relative">
                <div className="flex items-center justify-between mb-6 relative">
                   <div className="flex items-center gap-3 shrink-0">
                     <h2 className="text-2xl font-black text-white">Up Next</h2>
                     <AnimatePresence>
                       {!hasRefreshedCurrentSong && (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           exit={{ opacity: 0, scale: 0.8 }}
                           transition={{ duration: 0.3 }}
                           className="flex items-center gap-2 text-zinc-400"
                         >
                           <button 
                             className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-all hover:text-white"
                             onClick={handleRefreshQueue}
                             title="Refresh algorithm"
                           >
                             <RefreshCw size={18} className={isRefreshingQueue ? "animate-spin" : ""} />
                           </button>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                   
                   {/* SEARCH BAR in Up Next (Moved to the right) */}
                   <div ref={searchContainerRef} className={`relative z-40 group flex flex-col transition-all duration-500 ease-out ${isSearchFocused ? 'w-full ml-4' : 'w-72 ml-4'}`}>
                     {/* Intense Aurora Northern Lights Glow */}
                     <div className={`absolute -inset-[20px] bg-white/10 blur-[30px] rounded-[100px] -z-10 transition-all duration-1000 pointer-events-none ${isSearchFocused ? 'opacity-100 animate-aurora-slow' : 'opacity-0'}`} />
                     
                     {/* Glassmorphism Search Container */}
                     <div className="relative w-full rounded-full overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] bg-zinc-800/40 backdrop-blur-md border border-white/10 p-[1.5px]">
                       
                       <div className="relative z-10 rounded-full flex items-center bg-black/60 backdrop-blur-lg transition-colors duration-300 focus-within:bg-zinc-900/90 w-full pl-4 pr-1.5 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                         <input
                           type="text"
                           placeholder="Search to add..."
                           value={query}
                           onChange={(e) => setQuery(e.target.value)}
                           onFocus={() => setIsSearchFocused(true)}
                           className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-500 text-sm outline-none transition-all duration-500 py-1 min-w-0 font-medium font-sans tracking-wide"
                         />
                         <div className="w-6 h-6 ml-1 shrink-0 bg-neutral-800 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-300 group-focus-within:bg-white group-focus-within:shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                           {isSearching ? <Loader2 className="text-zinc-400 group-focus-within:text-black animate-spin transition-colors" size={12} /> : <Search className="text-zinc-400 group-focus-within:text-black transition-colors" size={12} />}
                         </div>
                       </div>
                     </div>

                     {/* Dropdown Results (Rolls down/up) */}
                     <AnimatePresence>
                       {isSearchFocused && (query.trim().length > 0 || isSearching) && (
                         <motion.div 
                           initial={{ opacity: 0, y: -20, scaleY: 0.8, transformOrigin: 'top' }}
                           animate={{ opacity: 1, y: 0, scaleY: 1 }}
                           exit={{ opacity: 0, y: -20, scaleY: 0.8, transition: { duration: 0.2, ease: "easeIn" } }}
                           className="absolute top-12 left-0 right-0 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 max-h-[45vh] overflow-y-auto custom-scrollbar-white"
                         >
                           {isSearching ? (
                             <div className="flex items-center justify-center gap-2 text-white py-6">
                               <img loading="lazy" src="/images/tremble_loading_new.gif" alt="Loading" className="w-5 h-5 object-contain" />
                               <span className="font-medium text-sm">Searching...</span>
                             </div>
                           ) : searchResults.length > 0 ? (
                             searchResults.map((track, idx) => (
                               <div key={idx} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors group/item cursor-pointer" onClick={() => handlePlayNext(track)}>
                                 <SafeImage src={track.thumb_url || track.cover_url} className="w-10 h-10 rounded-md object-cover flex-shrink-0 shadow-md" />
                                 <div className="flex-1 min-w-0 pr-1">
                                   <h4 className="text-white font-bold truncate text-sm leading-tight mb-0.5">{track.title}</h4>
                                   <p className="text-zinc-400 text-xs truncate">{renderArtistLinks(track.artist || track.artist_name)}</p>
                                 </div>
                                 <div className="flex items-center gap-1 opacity-60 group-hover/item:opacity-100 transition-opacity shrink-0">
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleAddToQueue(track); }} 
                                     className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/20 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-white/5"
                                     title="Add to queue"
                                   >
                                     <ListPlus size={14} />
                                   </button>
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handlePlayNext(track); }} 
                                     className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/20 rounded-full transition-all hover:scale-110 flex items-center justify-center bg-white/5"
                                     title="Play Next"
                                   >
                                     <ListVideo size={14} />
                                   </button>
                                 </div>
                               </div>
                             ))
                           ) : query.length >= 2 ? (
                             <div className="text-center text-zinc-400 py-6 text-sm">No results found</div>
                           ) : null}
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                </div>
                
                <div className={`flex-1 overflow-y-auto no-scrollbar flex flex-col pr-2 pb-10 transition-all duration-500 ${isSearchFocused && (query.trim().length > 0 || isSearching) ? 'blur-[8px] opacity-40 scale-[0.98] pointer-events-none' : (isRefreshingQueue ? 'opacity-0 scale-[0.98] pointer-events-none' : 'blur-0 opacity-100 scale-100')}`}>
                   {queue.slice(currentIndex + 1).length > 0 ? (
                     <Reorder.Group 
                        axis="y" 
                        values={queue.slice(currentIndex + 1)} 
                        onReorder={(newUpcoming) => setQueue([...queue.slice(0, currentIndex + 1), ...newUpcoming])}
                        className="flex flex-col gap-3"
                     >
                         <AnimatePresence initial={false}>
                          {queue.slice(currentIndex + 1).map((track, idx) => (
                              <Reorder.Item 
                                value={track} 
                                key={track._dragId || `fallback-${idx}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                transition={{ duration: 0.2 }}
                                whileDrag={{ scale: 0.95, boxShadow: "0px 10px 30px rgba(0,0,0,0.5)", zIndex: 50, backgroundColor: "rgba(255,255,255,0.15)" }}
                                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                                className="flex items-center gap-4 p-3 rounded-xl transition-colors group cursor-grab active:cursor-grabbing border border-transparent bg-white/5 relative overflow-hidden focus:outline-none select-none"
                              >
                                 <div className="relative w-12 h-12 rounded-md overflow-hidden shadow-md flex-shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); playTrackFromQueue(idx); }}>
                                   <SafeImage src={track.cover_url || track.thumb_url} className="absolute inset-0 w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <Play size={16} className="text-white fill-white" />
                                   </div>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold truncate text-sm">{track.title}</h4>
                                    <p className="text-zinc-400 text-xs truncate">{renderArtistLinks(track.artist_name)}</p>
                                 </div>
                                 <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                   <button 
                                      className="p-2 text-zinc-300 hover:text-white hover:scale-110 transition-all bg-white/5 rounded-full hover:bg-white/20" 
                                      title="Add to Tremlist"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedTrackForMenu?.youtube_id === track.youtube_id) {
                                           setSelectedTrackForMenu(null);
                                        } else {
                                           const rect = e.currentTarget.getBoundingClientRect();
                                           setSelectedTrackForMenu(track);
                                           setMenuPos({ top: Math.min(rect.top, window.innerHeight - 320), left: rect.left - 220 });
                                        }
                                      }}
                                   >
                                      <Plus size={16} />
                                   </button>
                                   <button 
                                      className="p-2 text-zinc-400 hover:text-red-400 hover:scale-110 transition-all bg-white/5 rounded-full hover:bg-white/20" 
                                      title="Remove from queue"
                                      onClick={(e) => { e.stopPropagation(); handleRemoveFromQueue(idx); }}
                                   >
                                      <Minus size={16} />
                                   </button>
                                 </div>
                              </Reorder.Item>
                            ))}
                       </AnimatePresence>
                     </Reorder.Group>
                   ) : (
                      <div className="text-zinc-500 font-medium text-center mt-10">Queue is empty</div>
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* External Popup Menu */}
      <AnimatePresence>
        {selectedTrackForMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            className="fixed bg-zinc-900 border border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 z-[100] flex flex-col gap-1 cursor-default min-w-[200px]" 
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-xs text-zinc-400 font-bold px-2 py-1 uppercase tracking-wider mb-1">Add to Tremlist?</div>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                toggleLike(selectedTrackForMenu, e); 
                setSelectedTrackForMenu(null); 
              }}
              className="flex items-center px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              Liked Songs
            </button>
            {playlists && playlists.filter(pl => !pl.tracks?.[0]?._isAlbumTremlist && !pl._isAlbumTremlist).map(pl => (
              <button 
                key={pl.id}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const updated = { ...pl, tracks: [...(pl.tracks || []), selectedTrackForMenu] };
                  savePlaylist(updated);
                  setSelectedTrackForMenu(null); 
                }}
                className="flex items-center px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors text-left truncate"
              >
                {pl.title}
              </button>
            ))}
            <Link 
              href="/create-playlist"
              onClick={() => {
                if (selectedTrackForMenu) {
                   localStorage.setItem('pending_tremlist_track', JSON.stringify(selectedTrackForMenu));
                }
                setSelectedTrackForMenu(null);
              }}
              className="flex items-center px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              Create a Tremlist
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default NowPlaying;
