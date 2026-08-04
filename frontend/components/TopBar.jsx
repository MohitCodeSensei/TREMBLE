"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Search, Upload, User, Settings, LogOut, Loader2, Play, Plus, MoreVertical, ListPlus, ListVideo, Disc, ChevronRight, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';
import { API_URL, getTremblerUrl, getAlbumUrl } from '../utils/api';
import { LiquidMetal } from './ui/liquid-metal';
import SafeImage from './SafeImage';
import Typewriter from './Typewriter';

const TopBarContent = () => {
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTrembler, setSearchTrembler] = useState(null);
  const [searchAlbum, setSearchAlbum] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddSubmenu, setShowAddSubmenu] = useState(false);
  
  const basePlaceholders = [
    "Search for songs, tremblers, albums...",
    "What's on your mind?",
    "What do you wanna listen to today?",
    "Find your new favorite track..."
  ];

  const [placeholders, setPlaceholders] = useState(basePlaceholders);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPlaceholders([...basePlaceholders].sort(() => Math.random() - 0.5));
  }, []);

  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    isSidebarOpen, 
    setIsNowPlayingOpen, 
    setQueue, 
    setCurrentIndex, 
    loadTrackIntoContext, 
    setLyrics,
    user,
    logout,
    playlists,
    savePlaylist,
    toggleLike,
    queue,
    currentIndex
  } = usePlayer();

  const handlePlayNext = (track) => {
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, track);
    setQueue(newQueue);
  };

  const handleAddToQueue = (track) => {
    setQueue([...queue, track]);
  };

  const searchContainerRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const menuRef = useRef(null);
  const popupOverlayRef = useRef(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [selectedTrackForMenu, setSelectedTrackForMenu] = useState(null);
  const [hoveredSearchIdx, setHoveredSearchIdx] = useState(null);
  const [hoveredRecentIdx, setHoveredRecentIdx] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tremble_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch(e) {}
  }, []);

  const saveRecentSearch = (track) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.youtube_id !== track.youtube_id);
      const updated = [track, ...filtered].slice(0, 10);
      localStorage.setItem('tremble_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  // Close profile dropdown and search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      
      // If clicked inside the popup menu, do nothing
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      
      // If clicked on the popup overlay, close only the popup
      if (popupOverlayRef.current && popupOverlayRef.current.contains(e.target)) {
        setSelectedTrackForMenu(null);
        setShowAddSubmenu(false);
        return;
      }
      
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
        setSelectedTrackForMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset menu when search context changes
  useEffect(() => {
    setSelectedTrackForMenu(null);
  }, [query, isSearchFocused]);

  // Sync query when on /search page; reset query when navigating away from /search
  useEffect(() => {
    if (pathname === '/search') {
      const q = searchParams ? searchParams.get('q') : '';
      if (q) setQuery(q);
      else setQuery('');
    } else {
      // Universally clear search bar when leaving /search or on other pages
      setQuery('');
      setSearchResults([]);
      setSearchTrembler(null);
      setSearchAlbum(null);
      setIsSearchFocused(false);
    }
  }, [pathname, searchParams]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_URL}/api/unified-search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            setSearchTrembler(data.trembler || null);
            setSearchAlbum(data.album || null);
            const songs = data.songs ? data.songs.slice(0, 8) : [];
            setSearchResults(songs);
          }
        } catch (error) {
          console.error("Failed to search:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setSearchTrembler(null);
        setSearchAlbum(null);
      }
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleNavigateToSearch = () => {
    if (query.trim()) {
      setIsSearchFocused(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClearSearch = (e) => {
    if (e) e.stopPropagation();
    setQuery('');
    setSearchResults([]);
    setSearchTrembler(null);
    setSearchAlbum(null);
    setIsSearchFocused(false);
    if (pathname === '/search') {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    }
  };

  const handleSelectTrembler = (trembler) => {
    if (!trembler) return;
    router.push(getTremblerUrl(trembler.name || trembler.title || trembler.id));
    setIsSearchFocused(false);
  };

  const handleSelectAlbum = (album) => {
    if (!album) return;
    router.push(getAlbumUrl(album));
    setIsSearchFocused(false);
  };

  const handleSelectTrack = async (track) => {
    const mappedTrack = {
      title: track.title,
      artist: track.artist || track.artist_name,
      artist_name: track.artist_name || track.artist,
      artist_id: track.artist_id,
      album_id: track.album_id || track._albumId,
      cover_url: track.cover_url || (track.youtube_id ? `https://i.ytimg.com/vi/${track.youtube_id}/hqdefault.jpg` : ''),
      thumb_url: track.thumb_url || track.cover_url,
      youtube_id: track.youtube_id,
      duration: track.duration,
      type: track.type || 'song'
    };
    
    setQueue([mappedTrack]);
    setCurrentIndex(0);
    loadTrackIntoContext(mappedTrack);
    saveRecentSearch(mappedTrack);

    setQuery('');
    setSearchResults([]);
    setSearchTrembler(null);
    setIsSearchFocused(false);
    setIsNowPlayingOpen(true);
  };

  const renderTrackItem = (track, idx, isRecent = false) => {
    return (
      <div 
        key={idx} 
        className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors duration-200 group/item hover:bg-white/5"
        onClick={() => handleSelectTrack(track)}
      >
        <div className="relative overflow-hidden rounded-md flex-shrink-0 shadow-md">
          <SafeImage 
            src={track.thumb_url || track.cover_url} 
            alt={track.title}
            title={track.title}
            artist={track.artist_name || track.artist}
            videoId={track.youtube_id || track.id}
            type={track.type || 'song'}
            useOriginalSize={true}
            className="w-12 h-12 transition-transform duration-300 bg-zinc-800 group-hover/item:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
              <Play size={16} fill="currentColor" className="text-white ml-0.5" />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold line-clamp-2 transition-colors duration-200 text-zinc-300 group-hover/item:text-white">{track.title}</span>
          <span className="text-zinc-500 text-sm truncate">{track.artist}</span>
        </div>
        {track.duration && (
          <div className="text-zinc-500 text-xs font-medium mr-2 whitespace-nowrap">
            {track.duration}
          </div>
        )}
        
        {/* 3 Dots Button */}
        <div className={`relative flex-shrink-0 transition-opacity duration-200 ${selectedTrackForMenu?.youtube_id === track.youtube_id ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (selectedTrackForMenu?.youtube_id === track.youtube_id) {
                 setSelectedTrackForMenu(null);
                 setShowAddSubmenu(false);
              } else {
                 const rect = e.currentTarget.getBoundingClientRect();
                 setSelectedTrackForMenu(track);
                 setShowAddSubmenu(false);
                 let topPos = rect.top;
                 if (topPos > window.innerHeight - 320) {
                   topPos = window.innerHeight - 320;
                 }
                 setMenuPos({ top: topPos, left: rect.right + 20 });
              }
            }}
            className={`transition-all p-2 rounded-full ${
              selectedTrackForMenu?.youtube_id === track.youtube_id 
                ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] bg-white/5 scale-125' 
                : 'text-zinc-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] hover:scale-125 hover:bg-white/5'
            }`}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
    );
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* Background Blur Overlay when search is focused */}
      <div 
        suppressHydrationWarning={true}
        onClick={() => {
          setIsSearchFocused(false);
          setSelectedTrackForMenu(null);
        }}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xl z-20 transition-all duration-500 ${isSearchFocused ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
      />
      
      <header className={`fixed top-0 right-0 left-0 h-20 px-6 flex items-center justify-between z-30 pointer-events-none ${pathname && (pathname.startsWith('/trembler') || pathname.startsWith('/artist') || pathname.startsWith('/library/genre')) ? '' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        {/* Left section: Logo next to hamburger */}
        <div className={`flex-1 pointer-events-auto flex items-center transition-all duration-300 ${isSidebarOpen ? 'pl-10 justify-start' : 'pl-14 justify-start'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <img loading="lazy"
              src="/images/logo.png"
              alt="TREMBLE logo"
              className="h-8 w-8 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            />
            <span className="text-xl font-black tracking-widest text-white group-hover:text-indigo-400 transition-colors duration-300">
              TREMBLE
            </span>
          </Link>
        </div>

        {/* Center section: Search */}
        <div className={`flex-1 pointer-events-auto flex justify-center transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isSearchFocused ? 'translate-y-6 scale-105' : 'translate-y-0 scale-100'}`}>
          <div ref={searchContainerRef} className="relative group max-w-[36rem] w-full flex flex-col items-center z-40">
            {/* Intense Aurora Northern Lights Glow */}
            <div className={`absolute -inset-[50px] bg-white/10 blur-[60px] rounded-[100px] -z-10 transition-all duration-1000 pointer-events-none ${isSearchFocused ? 'opacity-100 animate-aurora-slow' : 'opacity-0'}`} />
            <div className={`absolute -inset-[30px] bg-white/20 blur-[40px] rounded-full -z-10 transition-all duration-1000 pointer-events-none ${isSearchFocused ? 'opacity-100 animate-aurora-reverse' : 'opacity-0'}`} />
            <div className={`absolute -inset-[15px] bg-white/30 blur-[20px] rounded-full -z-10 transition-all duration-1000 pointer-events-none ${isSearchFocused ? 'opacity-100 animate-aurora-fast' : 'opacity-0'}`} />
            
            {/* Liquid Metal Search Container */}
            <div className="relative w-full rounded-full overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] bg-zinc-800" style={{ padding: '2px' }}>
               <LiquidMetal
                  colorBack="#555555"
                  colorTint="#ffffff"
                  speed={0.4}
                  repetition={4}
                  distortion={0.15}
                  scale={1}
                  className="absolute inset-0 z-0 rounded-full"
               />
               
               {/* Inner Input Container */}
               <div className="relative z-10 rounded-full flex items-center bg-black transition-colors duration-300 group-focus-within:bg-zinc-900/90 w-full pl-6 pr-2 py-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-y-0 left-6 right-12 flex items-center pointer-events-none overflow-hidden">
                    {isMounted && query.length === 0 && (
                     <div className="absolute inset-0 flex items-center overflow-hidden whitespace-nowrap">
                       <span 
                         key={currentPlaceholderIndex}
                         className="text-zinc-500 font-medium text-[16px] animate-fade-in-out font-sans tracking-wide"
                       >
                         {placeholders[currentPlaceholderIndex]}
                       </span>
                     </div>
                   )}
                 </div>
                 
                 <input
                   type="text"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   onFocus={() => setIsSearchFocused(true)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       handleNavigateToSearch();
                     }
                   }}
                   className="flex-1 bg-transparent border-none text-white outline-none transition-all duration-500 py-2 relative z-10 w-full h-full font-medium font-sans text-[16px] tracking-wide"
                 />
                 
                  {/* Right Side Icon Container with smooth animated X / Search toggle */}
                  <div 
                    className="w-10 h-10 ml-2 bg-neutral-800 rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] transition-all duration-300 group-focus-within:bg-white group-focus-within:shadow-[0_0_15px_rgba(255,255,255,0.5)] cursor-pointer hover:scale-105 relative overflow-hidden"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {pathname === '/search' ? (
                        <motion.button
                          key="cross-clear-btn"
                          type="button"
                          initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          onClick={handleClearSearch}
                          className="w-full h-full flex items-center justify-center text-zinc-400 hover:text-white group-focus-within:text-black group-focus-within:hover:text-black transition-colors"
                          title="Clear search"
                        >
                          <X size={18} />
                        </motion.button>
                      ) : (
                        <motion.button
                          key="search-action-btn"
                          type="button"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          onClick={handleNavigateToSearch}
                          className="w-full h-full flex items-center justify-center"
                          title="Search"
                        >
                          {isSearching ? (
                            <Loader2 className="text-zinc-400 group-focus-within:text-black animate-spin transition-colors" size={18} />
                          ) : (
                            <Search className="text-zinc-400 group-focus-within:text-black transition-colors" size={18} />
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
            </div>

            {/* Dropdown Results */}
            {isSearchFocused && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[48rem] bg-zinc-900/80 backdrop-blur-[40px] border border-white/10 rounded-2xl p-4 shadow-[0_40px_80px_rgba(0,0,0,0.7)] max-h-[70vh] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-4 duration-300 custom-scrollbar-white">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-3 text-white py-12">
                      <img loading="lazy" src="/images/tremble_loading_new.gif" alt="Loading" className="w-6 h-6 object-contain" />
                      <span className="font-medium text-lg">Searching...</span>
                  </div>
                ) : (searchTrembler || searchAlbum || searchResults.length > 0) ? (
                  <div className="flex flex-col gap-2">
                    {/* Top Trembler Match Card */}
                    {searchTrembler && (
                      <div className="flex flex-col gap-1 mb-1">
                        <div className="text-[11px] text-zinc-500 font-bold px-2 uppercase tracking-widest flex items-center justify-between">
                          <span>Top Trembler Match</span>
                        </div>
                        <div 
                          onClick={() => handleSelectTrembler(searchTrembler)}
                          className="flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-900/40 border border-indigo-500/25 hover:border-indigo-400 hover:bg-white/10 group/trembler shadow-lg"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Circular Trembler Photo */}
                            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indigo-500/40 group-hover/trembler:ring-indigo-400 group-hover/trembler:scale-105 transition-all duration-300 shadow-md bg-zinc-800">
                              <SafeImage 
                                src={searchTrembler.cover_url}
                                alt={searchTrembler.name}
                                title={searchTrembler.name}
                                artist={searchTrembler.name}
                                type="artist"
                                useOriginalSize={true}
                                className="w-full h-full object-cover rounded-full"
                              />
                            </div>
                            
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-white group-hover/trembler:text-indigo-400 transition-colors truncate">
                                  {searchTrembler.name}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] uppercase font-black tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                                  Trembler
                                </span>
                              </div>
                              <span className="text-zinc-400 text-xs truncate mt-0.5">
                                {searchTrembler.subscribers || 'Trembler Profile'} &bull; View Profile
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pr-2 text-zinc-400 group-hover/trembler:text-white transition-colors flex-shrink-0">
                            <span className="text-xs font-semibold hidden sm:inline text-zinc-400 group-hover/trembler:text-indigo-300">Profile</span>
                            <ChevronRight size={18} className="transform group-hover/trembler:translate-x-1 transition-transform text-zinc-400 group-hover/trembler:text-indigo-300" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top Album Match Card */}
                    {searchAlbum && !searchTrembler && (
                      <div className="flex flex-col gap-1 mb-1">
                        <div className="text-[11px] text-zinc-500 font-bold px-2 uppercase tracking-widest flex items-center justify-between">
                          <span>Top Album Match</span>
                        </div>
                        <div 
                          onClick={() => handleSelectAlbum(searchAlbum)}
                          className="flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-purple-950/40 via-zinc-900/40 to-zinc-900/40 border border-purple-500/25 hover:border-purple-400 hover:bg-white/10 group/album shadow-lg"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/20 group-hover/album:scale-105 transition-all duration-300 shadow-md bg-zinc-800">
                              <SafeImage 
                                src={searchAlbum.cover_url}
                                alt={searchAlbum.title}
                                title={searchAlbum.title}
                                artist={searchAlbum.artist}
                                type="album"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-white group-hover/album:text-purple-400 transition-colors truncate">
                                  {searchAlbum.title}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] uppercase font-black tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                                  Album
                                </span>
                              </div>
                              <span className="text-zinc-400 text-xs truncate mt-0.5">
                                {searchAlbum.artist} {searchAlbum.year ? `&bull; ${searchAlbum.year}` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 pr-2 text-zinc-400 group-hover/album:text-white transition-colors flex-shrink-0">
                            <span className="text-xs font-semibold hidden sm:inline text-zinc-400 group-hover/album:text-purple-300">View Album</span>
                            <ChevronRight size={18} className="transform group-hover/album:translate-x-1 transition-transform text-zinc-400 group-hover/album:text-purple-300" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Accurate Song Search Results */}
                    {searchResults.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1">
                        {(searchTrembler || searchAlbum) && (
                          <div className="text-[11px] text-zinc-500 font-bold px-2 py-1 uppercase tracking-widest flex items-center justify-between border-t border-white/5 pt-2">
                            <span>Popular Songs</span>
                            <span className="text-[10px] font-medium lowercase text-zinc-500">{searchResults.length} songs</span>
                          </div>
                        )}
                        {searchResults.map((track, idx) => renderTrackItem(track, idx, false))}
                      </div>
                    )}

                    {/* Bottom Enter / View All Results Link */}
                    {query.trim().length > 0 && (
                      <div 
                        onClick={handleNavigateToSearch}
                        className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all duration-200"
                      >
                        <span className="text-xs font-semibold flex items-center gap-1.5 text-zinc-300">
                          <Search size={14} className="text-indigo-400" />
                          <span>Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-white rounded border border-white/20">Enter</kbd> to see full results for "{query}"</span>
                        </span>
                        <ArrowRight size={15} className="text-indigo-400" />
                      </div>
                    )}
                  </div>
                ) : query.length >= 2 ? (
                  <div className="text-center text-zinc-400 py-12 font-medium text-lg">No results found for "{query}"</div>
                ) : recentSearches.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-zinc-500 font-bold px-3 py-3 uppercase tracking-widest">Recent Searches</div>
                    {recentSearches.map((track, idx) => renderTrackItem(track, idx, true))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Right section: Auth / Actions */}
        <div className="flex-1 flex items-center justify-end pointer-events-auto relative h-20">
          
          {user ? (
            <>
              {/* Buttons that shift left when profile opens */}
              <div className={`flex items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isProfileOpen ? '-translate-x-[280px]' : '-translate-x-14'} absolute right-0 top-1/2 -translate-y-1/2`}>
                {user.role === 'artist' && (
                  <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all hover:scale-105 shadow-lg">
                    <Upload size={18} />
                    <span>Upload</span>
                  </button>
                )}
              </div>

              {/* Profile Dropdown Container */}
              <div 
                ref={profileDropdownRef}
                className={`absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-[90] overflow-hidden ${isProfileOpen ? 'w-56 translate-y-[20px] rounded-[40px] p-[2px] shadow-[0_15px_50px_rgba(0,0,0,0.8)]' : 'w-11 h-11 rounded-full p-[2px] shadow-none cursor-pointer'}`}
                style={{ transformOrigin: 'top right' }}
                onClick={(e) => { if(!isProfileOpen) { e.stopPropagation(); setIsProfileOpen(true); } }}
              >
                 <div className="absolute inset-0 z-0 pointer-events-none">
                    <LiquidMetal
                      colorBack="#555555"
                      colorTint="#ffffff"
                      speed={0.4}
                      repetition={4}
                      distortion={0.15}
                      scale={1}
                      className="w-full h-full"
                    />
                 </div>
                 <div className={`relative z-10 flex flex-col w-full h-full bg-black transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isProfileOpen ? 'rounded-[38px] p-4' : 'rounded-full hover:bg-zinc-900'}`}>
                 <div 
                  onClick={(e) => { if(isProfileOpen) { e.stopPropagation(); setIsProfileOpen(false); } }}
                  className={`flex items-center justify-center w-full cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isProfileOpen ? 'mb-4 mt-2' : 'h-full'}`}
                 >
                   <div className={`rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isProfileOpen ? 'w-16 h-16 border border-white/10' : 'w-full h-full'}`}>
                      {user.profile_picture_url ? (
                        <img loading="lazy" src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-white font-bold transition-all duration-700 ${isProfileOpen ? 'text-2xl' : 'text-sm'}`}>{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                   </div>
                 </div>
                
                 {/* Menu Items (Fade in when open) */}
                 <div 
                  className={`flex flex-col gap-1 w-full transition-opacity duration-500 delay-100 ${isProfileOpen ? 'opacity-100 mb-2' : 'opacity-0 h-0 pointer-events-none overflow-hidden'}`}
                  onClick={(e) => e.stopPropagation()}
                 >
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       router.push('/settings?tab=profile');
                       setTimeout(() => setIsProfileOpen(false), 100);
                     }}
                     className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm w-full text-left"
                   >
                     <User size={18} /> Profile
                   </button>
                   <button 
                     onClick={(e) => {
                       e.preventDefault();
                       router.push('/settings?tab=preferences');
                       setTimeout(() => setIsProfileOpen(false), 100);
                     }}
                     className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm w-full text-left"
                   >
                     <Settings size={18} /> Settings
                   </button>
                   <div className="h-px w-full bg-white/10 my-1" />
                   <button 
                     onClick={(e) => { 
                       e.preventDefault(); 
                       if(logout) logout(); 
                       setIsProfileOpen(false); 
                       window.location.href = '/login'; 
                     }}
                     className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors font-medium text-sm w-full text-left"
                   >
                     <LogOut size={18} /> Log Out
                   </button>
                 </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4 absolute right-0 top-1/2 -translate-y-1/2">
              <Link href="/login" className="px-6 py-2 rounded-full text-white font-bold hover:scale-105 bg-white/10 hover:bg-white hover:text-black transition-all duration-300 text-sm border border-white/10">
                Log In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* External Popup Menu */}
      {selectedTrackForMenu && (
        <>
          <div 
            ref={popupOverlayRef}
            className="fixed inset-0 z-[90]" 
          />
          <div 
            ref={menuRef}
            className="fixed bg-zinc-900 border border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 z-[100] flex flex-col gap-1 cursor-default min-w-[220px]" 
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={e => e.stopPropagation()}
          >
            {/* Add to Tremlist (Dropdown) */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddSubmenu(!showAddSubmenu);
                }}
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  Add to Tremlist?
                </span>
                <span className={`text-xs text-zinc-500 transition-transform duration-200 ${showAddSubmenu ? 'rotate-90' : ''}`}>▶</span>
              </button>

              {showAddSubmenu && (
                <div className="mt-1 pl-2 border-l border-white/10 space-y-1 max-h-40 overflow-y-auto custom-scrollbar-white">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleLike(selectedTrackForMenu, e); 
                      setSelectedTrackForMenu(null); 
                      setShowAddSubmenu(false);
                    }}
                    className="block w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-indigo-400 hover:bg-white/5 rounded-md truncate transition-colors"
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
                        setShowAddSubmenu(false);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-indigo-400 hover:bg-white/5 rounded-md truncate transition-colors"
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
                      setShowAddSubmenu(false);
                    }}
                    className="block w-full text-left px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-white/5 rounded-md truncate transition-colors"
                  >
                    + Create New Tremlist
                  </Link>
                </div>
              )}
            </div>

            {/* Play Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayNext(selectedTrackForMenu);
                setSelectedTrackForMenu(null);
                setShowAddSubmenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <ListVideo size={16} />
              Play Next
            </button>

            {/* Add to Queue */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToQueue(selectedTrackForMenu);
                setSelectedTrackForMenu(null);
                setShowAddSubmenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <ListPlus size={16} />
              Add to Queue
            </button>

            {/* Go to Trembler */}
            {(selectedTrackForMenu.artist_id || selectedTrackForMenu.artist || selectedTrackForMenu.artist_name) && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setSelectedTrackForMenu(null);
                  setShowAddSubmenu(false);
                  setIsSearchFocused(false);
                  
                  const artistName = selectedTrackForMenu.artist_name || selectedTrackForMenu.artist;
                  if (artistName) {
                    router.push(getTremblerUrl(artistName));
                  } else if (selectedTrackForMenu.artist_id) {
                    router.push(getTremblerUrl(selectedTrackForMenu.artist_id));
                  }
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
              >
                <User size={16} />
                Go to Trembler
              </button>
            )}

            {/* Go to Album */}
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setSelectedTrackForMenu(null);
                setShowAddSubmenu(false);
                setIsSearchFocused(false);
                
                const aid = selectedTrackForMenu.album_id || selectedTrackForMenu._albumId || (selectedTrackForMenu.type === 'album' ? selectedTrackForMenu.youtube_id : null);
                if (aid) {
                  router.push(`/album/${aid}`);
                } else {
                  const q = `${selectedTrackForMenu.title} ${selectedTrackForMenu.artist || selectedTrackForMenu.artist_name || ''}`;
                  if (q.trim()) {
                    try {
                       const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}&filter=albums`);
                       if (res.ok) {
                         const data = await res.json();
                         const found = data.find(t => t.album_id || t.id || (t.type === 'album' && t.youtube_id));
                         const foundAid = found ? (found.album_id || found.id || found.youtube_id) : null;
                         if (foundAid) {
                           router.push(`/album/${foundAid}`);
                           return;
                         }
                       }
                    } catch (err) {}
                  }
                  router.push(`/search?q=${encodeURIComponent(q + ' album')}`);
                }
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-semibold text-zinc-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <Disc size={16} />
              Go to Album
            </button>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes aurora-glow {
          0% { transform: scale(1) translateY(0) rotate(0deg); opacity: 0.5; }
          25% { transform: scale(1.15) translateY(-5px) rotate(2deg) skewX(2deg); opacity: 0.8; }
          50% { transform: scale(1.05) translateY(5px) rotate(-2deg) skewX(-2deg); opacity: 0.6; }
          75% { transform: scale(1.2) translateY(-2px) rotate(1deg) skewX(1deg); opacity: 0.9; }
          100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 0.5; }
        }
        .animate-aurora-slow {
          animation: aurora-glow 12s ease-in-out infinite alternate;
        }
        .animate-aurora-reverse {
          animation: aurora-glow 9s ease-in-out infinite alternate-reverse;
        }
        .animate-aurora-fast {
          animation: aurora-glow 6s ease-in-out infinite alternate;
        }
        .custom-scrollbar-white::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-white::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-white::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar-white::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.6);
        }
      `}} />
    </>
  );
};

export default function TopBar() {
  return (
    <Suspense fallback={null}>
      <TopBarContent />
    </Suspense>
  );
}
