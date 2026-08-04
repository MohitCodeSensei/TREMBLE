"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play, Pause, SkipForward, SkipBack,
  Repeat, Shuffle, Heart, Mic2, Volume2, VolumeX, ListMusic, Plus
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import SafeImage from './SafeImage';
import { API_URL, getTremblerUrl } from '../utils/api';

const BottomPlayer = () => {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    toggleNowPlaying,
    currentTime,
    duration,
    seekTo,
    volume,
    handleVolumeChange,
    isMuted,
    toggleMute,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    customLoopCount,
    toggleRepeat,
    toggleLike,
    likedSongs,
    isSidebarOpen,
    toggleSidebar,
    isNowPlayingOpen,
    setIsNowPlayingOpen,
    isQueueVisible,
    setIsQueueVisible,
    playlists,
    savePlaylist
  } = usePlayer();
  const pathname = usePathname();
  const [selectedTrackForMenu, setSelectedTrackForMenu] = React.useState(null);

  React.useEffect(() => {
    const handleDocumentClick = () => {
      if (selectedTrackForMenu) setSelectedTrackForMenu(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [selectedTrackForMenu]);

  const [menuPos, setMenuPos] = React.useState({ bottom: 0, left: 0 });

  const handleArtistClick = async (e, targetArtist, targetArtistId) => {
    e.stopPropagation();
    if (targetArtist && targetArtist !== 'Unknown Artist' && targetArtist !== 'to start listening') {
      router.push(getTremblerUrl(targetArtist));
    } else if (targetArtistId) {
      router.push(getTremblerUrl(targetArtistId));
    }
  };

  if (pathname === '/login') return null;
  if (!currentTrack) return null;

  const displayTrack = currentTrack || {
    title: 'Select a Track',
    artist_name: 'to start listening',
    cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop',
    id: null
  };

  const artists = displayTrack.artist_name ? displayTrack.artist_name.split(',').map(a => a.trim()) : [];

  const isLiked = (displayTrack.id || displayTrack.youtube_id) && likedSongs.some(t => (t.id || t.youtube_id) === (displayTrack.id || displayTrack.youtube_id));

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleProgressChange = (e) => {
    seekTo(parseFloat(e.target.value));
  };

  const repeatColor = customLoopCount > 0 ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "text-zinc-400";
  const shuffleColor = isShuffle ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "text-zinc-400";

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-fit h-24 bg-zinc-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center px-8 gap-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40 transition-all duration-300">
      
      {/* Left Side: Mini Album Cover and Info */}
      <div className="flex items-center justify-end gap-4 w-[240px]">
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-start">
        <div onClick={currentTrack ? toggleNowPlaying : undefined} className={`w-14 h-14 rounded-full overflow-hidden relative shadow-lg bg-zinc-800 flex-shrink-0 border border-white/5 ${currentTrack ? 'cursor-pointer group' : ''}`}>
          <div 
            className="w-full h-full animate-[spin_10s_linear_infinite]"
            style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
          >
            <SafeImage 
              src={displayTrack.cover_url} 
              alt={displayTrack.title} 
              title={displayTrack.title}
              artist={displayTrack.artist_name}
              type="song"
              className="w-full h-full object-cover opacity-90" 
            />
          </div>
          <div className="absolute inset-0 m-auto w-4 h-4 bg-zinc-950 rounded-full border border-zinc-800/50 shadow-inner pointer-events-none"></div>
        </div>
        <div className="flex flex-col justify-center overflow-hidden cursor-pointer" onClick={currentTrack ? toggleNowPlaying : undefined}>
          <div className="text-white font-bold text-sm truncate hover:underline">{displayTrack.title}</div>
          <div className="text-zinc-400 text-xs truncate font-medium">
            {artists.map((artist, index) => (
              <span key={index}>
                <span 
                  className={artist !== 'Unknown Artist' && artist !== 'to start listening' ? 'hover:underline cursor-pointer hover:text-white transition-colors' : ''}
                  onClick={(e) => handleArtistClick(e, artist, index === 0 ? displayTrack.artist_id : null)}
                >
                  {artist}
                </span>
                {index < artists.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
        </div>
        {currentTrack && (
          <button onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }} className="text-zinc-500 hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)] hover:scale-125 transition-all hidden sm:block flex-shrink-0">
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" : ""} />
          </button>
        )}
      </div>

      {/* Center Side: Main Playback Controls */}
      <div className="flex flex-col justify-center items-center gap-2 w-[400px]">
        <div className="flex items-center gap-6">
          <button onClick={toggleShuffle} className={`hover:text-white transition-all hover:scale-125 ${shuffleColor}`}><Shuffle size={18} /></button>
          <button onClick={playPrev} className="text-zinc-400 hover:text-white transition-all hover:scale-125"><SkipBack size={22} fill="currentColor" /></button>
          <button
            onClick={currentTrack ? togglePlay : undefined}
            className={`w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={playNext} className="text-zinc-400 hover:text-white transition-all hover:scale-125"><SkipForward size={22} fill="currentColor" /></button>
          <button onClick={toggleRepeat} className={`hover:text-white transition-all hover:scale-125 relative ${repeatColor}`}>
            <Repeat size={18} />
            {customLoopCount > 0 && (
              <div className="absolute -top-1.5 -right-1.5 bg-white text-black w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-black shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                {customLoopCount}
              </div>
            )}
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full max-w-md flex items-center gap-3 text-xs text-zinc-500 font-medium" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "San Francisco", "Helvetica Neue", sans-serif' }}>
          <span>{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime || 0} 
            onChange={handleProgressChange}
            className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 hover:[&::-webkit-slider-thumb]:opacity-100 [&::-webkit-slider-thumb]:transition-opacity"
            style={{
              background: `linear-gradient(to right, white, white)`,
              backgroundSize: `${((currentTime || 0) / (duration || 1)) * 100}% 100%`,
              backgroundRepeat: 'no-repeat',
              transition: 'background-size 0.25s linear'
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Side: Volume & Extra Controls */}
      <div className="flex items-center gap-5 text-zinc-400 w-max">
        <button onClick={currentTrack ? toggleNowPlaying : undefined} className={`hover:text-white transition-colors ${currentTrack ? '' : 'opacity-50 cursor-not-allowed'}`}>
          <Mic2 size={18} />
        </button>
        <button 
          onClick={() => {
            if (currentTrack) {
              setIsNowPlayingOpen(true);
              setIsQueueVisible(true);
            }
          }} 
          className={`hover:text-white transition-colors ${isNowPlayingOpen && isQueueVisible ? 'text-indigo-400' : ''}`}
        >
          <ListMusic size={18} />
        </button>
        
        {/* Volume Slider */}
        <div className="flex items-center gap-2 group relative">
          <button onClick={toggleMute} className="hover:text-white transition-colors">
             {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
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

        {/* Add to Tremlist Button */}
        <button 
           className={`transition-all hover:scale-125 ${selectedTrackForMenu ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]' : 'text-zinc-400 hover:text-white'}`}
           title="Add to Tremlist"
           onClick={(e) => {
             e.stopPropagation();
             if (!currentTrack) return;
             if (selectedTrackForMenu) {
               setSelectedTrackForMenu(null);
             } else {
               setSelectedTrackForMenu(currentTrack);
             }
           }}
        >
           <Plus size={20} />
        </button>
      </div>

      {/* External Popup Menu */}
      <AnimatePresence>
        {selectedTrackForMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bg-zinc-900 border border-white/20 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 z-[100] flex flex-col gap-1 cursor-default min-w-[200px]" 
            style={{ bottom: '100px', right: '30px' }}
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

export default BottomPlayer;
