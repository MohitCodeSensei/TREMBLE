"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, User, Settings, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlayer } from '../context/PlayerContext';

const TopBar = () => {
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const pathname = usePathname();
  const { 
    isSidebarOpen, 
    setIsNowPlayingOpen, 
    setQueue, 
    setCurrentIndex, 
    loadTrackIntoContext, 
    setLyrics 
  } = usePlayer();
  const userRole = 'artist'; // Mock role for now

  const searchContainerRef = useRef(null);

  // Close profile dropdown and search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      setIsProfileOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`http://localhost:5000/api/ytmusic/search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const data = await res.json();
            // Filter to only songs and take top 5
            const songs = data.filter(item => item.type === 'SONG').slice(0, 5);
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

  const handleSelectTrack = async (track) => {
    const mappedTrack = {
      title: track.name,
      artist_name: track.artist.name,
      cover_url: track.thumbnails[track.thumbnails.length - 1]?.url || track.thumbnails[0]?.url,
      youtube_id: track.videoId,
    };
    
    setQueue([mappedTrack]);
    setCurrentIndex(0);
    loadTrackIntoContext(mappedTrack);

    setQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    setIsNowPlayingOpen(true);

    try {
      const res = await fetch(`http://localhost:5000/api/ytmusic/song/${track.videoId}`);
      if (res.ok) {
        const details = await res.json();
        if (details.lyrics) {
          // If lyrics exist, update them
          setLyrics(details.lyrics);
        } else {
           setLyrics("Lyrics not available for this track.");
        }
      }
    } catch (e) { 
      console.error(e); 
      setLyrics("Error fetching lyrics.");
    }
  };

  if (pathname === '/login') return null;

  return (
    <>
      {/* Background Blur Overlay when search is focused */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xl z-20 transition-all duration-500 pointer-events-none ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      <header className="fixed top-0 right-0 left-0 h-20 px-6 flex items-center justify-between z-30 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
        {/* Left section: Logo next to hamburger */}
        <div className={`flex-1 pointer-events-auto flex items-center transition-all duration-500 ${isSidebarOpen ? 'pl-0 justify-center' : 'pl-14 justify-start'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <img
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
          <div ref={searchContainerRef} className="relative group max-w-md w-full flex flex-col items-center z-40">
            <input
              type="text"
              placeholder="Search for songs, artists, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-6 pr-14 py-2.5 rounded-full bg-zinc-900/50 backdrop-blur-md border border-white/10 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:bg-zinc-800/80 focus:border-indigo-500/50 focus:ring-4 ring-indigo-500/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-10 relative"
            />
            <div className="absolute right-2 top-[3px] w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 group-focus-within:bg-indigo-500 group-focus-within:border-indigo-400 transition-colors shadow-sm cursor-pointer z-10 pointer-events-none">
              {isSearching ? <Loader2 className="text-white animate-spin" size={16} /> : <Search className="text-zinc-400 group-focus-within:text-white transition-colors" size={16} />}
            </div>

            {/* Dropdown Results */}
            {(searchResults.length > 0 && isSearchFocused) && (
              <div className="absolute top-14 left-0 right-0 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 overflow-hidden">
                {searchResults.map((track) => (
                  <div 
                    key={track.videoId}
                    onClick={() => handleSelectTrack(track)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
                  >
                    <img 
                      src={track.thumbnails[0]?.url} 
                      alt={track.name} 
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-white font-semibold text-sm truncate">{track.name}</span>
                      <span className="text-zinc-400 text-xs truncate">{track.artist.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right section: Auth / Actions */}
        <div className="flex-1 flex items-center justify-end pointer-events-auto relative h-20">
          
          {/* Buttons that shift left */}
          <div className={`flex items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isProfileOpen ? '-translate-x-[280px]' : '-translate-x-14'} absolute right-0 top-1/2 -translate-y-1/2`}>
            <Link href="/login" className="px-6 py-2 rounded-full text-white font-bold hover:scale-105 bg-white/10 hover:bg-white hover:text-black transition-all duration-300 text-sm border border-white/10">
              Log In
            </Link>
            {userRole === 'artist' && (
              <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-bold hover:bg-zinc-200 transition-all hover:scale-105 shadow-lg">
                <Upload size={18} />
                <span>Upload</span>
              </button>
            )}
          </div>

          {/* Morphing Profile / Dropdown */}
          <div 
            onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
            className={`absolute right-0 top-5 bg-zinc-900 border cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex flex-col ${
              isProfileOpen 
                ? 'w-64 h-[240px] rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-white/20' 
                : 'w-10 h-10 rounded-full border-zinc-700 hover:border-white'
            }`}
          >
            {/* When Closed (or top of open menu) */}
            <div className={`flex items-center justify-center w-full ${isProfileOpen ? 'h-14 mb-2 bg-zinc-800/50 rounded-xl' : 'h-full'}`}>
               {isProfileOpen ? (
                 <div className="flex items-center gap-3 w-full px-4">
                   <div className="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0" />
                   <div className="flex flex-col text-left">
                     <span className="text-white text-sm font-bold truncate">Alex Audiophile</span>
                     <span className="text-zinc-500 text-xs">Free Plan</span>
                   </div>
                 </div>
               ) : (
                 <div className="w-full h-full bg-zinc-800 rounded-full" />
               )}
            </div>
            
            {/* Menu Items (Fade in when open) */}
            <div className={`flex flex-col gap-1 w-full transition-opacity duration-500 delay-100 ${isProfileOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm">
                <User size={18} /> Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm">
                <Settings size={18} /> Settings
              </Link>
              <div className="h-px w-full bg-white/10 my-1" />
              <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors font-medium text-sm">
                <LogOut size={18} /> Log Out
              </Link>
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default TopBar;
