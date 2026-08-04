"use client";
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlayer } from '../../context/PlayerContext';
import { 
  API_URL, 
  getUnifiedSearch, 
  getTremblerUrl, 
  getAlbumUrl 
} from '../../utils/api';
import SafeImage from '../../components/SafeImage';
import SteamAlbumCard from '../../components/SteamAlbumCard';
import { 
  Play, 
  Pause, 
  Heart, 
  ListPlus, 
  MoreVertical, 
  User, 
  Disc, 
  Music, 
  Sparkles, 
  Radio, 
  ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'songs', label: 'Songs', icon: Music },
  { id: 'tremblers', label: 'Tremblers', icon: User },
  { id: 'albums', label: 'Albums', icon: Disc },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('filter') || 'all';

  const [query, setQuery] = useState(rawQuery);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState({
    intent: 'song',
    top_result: null,
    trembler: null,
    album: null,
    songs: [],
    artists: [],
    albums: []
  });

  const {
    currentTrack,
    isPlaying,
    togglePlay,
    loadTrackIntoContext,
    setQueue,
    queue,
    currentIndex,
    setCurrentIndex,
    toggleLike,
    likedSongs,
    setIsNowPlayingOpen
  } = usePlayer();

  // Menu popup state
  const [selectedTrackForMenu, setSelectedTrackForMenu] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  // Close popup menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setSelectedTrackForMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update query state when URL query changes
  useEffect(() => {
    setQuery(rawQuery);
  }, [rawQuery]);

  // Fetch search results
  useEffect(() => {
    if (!rawQuery.trim()) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchSearch() {
      setLoading(true);
      try {
        const data = await getUnifiedSearch(rawQuery);
        if (isMounted) {
          setSearchData(data || {});
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSearch();
    return () => {
      isMounted = false;
    };
  }, [rawQuery]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('filter');
    } else {
      newParams.set('filter', catId);
    }
    router.replace(`/search?${newParams.toString()}`, { scroll: false });
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handlePlaySong = (track, list = null) => {
    if (!track) return;
    const mapped = {
      title: track.title,
      artist: track.artist || track.artist_name,
      artist_name: track.artist_name || track.artist,
      artist_id: track.artist_id,
      album: track.album || 'Single',
      album_id: track.album_id,
      cover_url: track.cover_url || (track.youtube_id ? `https://i.ytimg.com/vi/${track.youtube_id}/hqdefault.jpg` : ''),
      thumb_url: track.thumb_url || track.cover_url,
      youtube_id: track.youtube_id || track.id,
      duration: track.duration,
      type: 'song'
    };

    if (currentTrack && (currentTrack.youtube_id === mapped.youtube_id)) {
      togglePlay();
      return;
    }

    if (list && list.length > 0) {
      const formattedList = list.map(t => ({
        title: t.title,
        artist: t.artist || t.artist_name,
        artist_name: t.artist_name || t.artist,
        artist_id: t.artist_id,
        album: t.album || 'Single',
        album_id: t.album_id,
        cover_url: t.cover_url || (t.youtube_id ? `https://i.ytimg.com/vi/${t.youtube_id}/hqdefault.jpg` : ''),
        thumb_url: t.thumb_url || t.cover_url,
        youtube_id: t.youtube_id || t.id,
        duration: t.duration,
        type: 'song'
      }));
      const idx = formattedList.findIndex(t => t.youtube_id === mapped.youtube_id);
      setQueue(formattedList);
      setCurrentIndex(idx !== -1 ? idx : 0);
      loadTrackIntoContext(mapped);
    } else {
      setQueue([mapped]);
      setCurrentIndex(0);
      loadTrackIntoContext(mapped);
    }
    setIsNowPlayingOpen(true);
  };

  const handlePlayNext = (track) => {
    const formatted = {
      title: track.title,
      artist: track.artist || track.artist_name,
      artist_name: track.artist_name || track.artist,
      artist_id: track.artist_id,
      album: track.album || 'Single',
      album_id: track.album_id,
      cover_url: track.cover_url || (track.youtube_id ? `https://i.ytimg.com/vi/${track.youtube_id}/hqdefault.jpg` : ''),
      thumb_url: track.thumb_url || track.cover_url,
      youtube_id: track.youtube_id || track.id,
      duration: track.duration,
      type: 'song'
    };
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, formatted);
    setQueue(newQueue);
    setSelectedTrackForMenu(null);
  };

  const handleAddToQueue = (track) => {
    const formatted = {
      title: track.title,
      artist: track.artist || track.artist_name,
      artist_name: track.artist_name || track.artist,
      artist_id: track.artist_id,
      album: track.album || 'Single',
      album_id: track.album_id,
      cover_url: track.cover_url || (track.youtube_id ? `https://i.ytimg.com/vi/${track.youtube_id}/hqdefault.jpg` : ''),
      thumb_url: track.thumb_url || track.cover_url,
      youtube_id: track.youtube_id || track.id,
      duration: track.duration,
      type: 'song'
    };
    setQueue([...queue, formatted]);
    setSelectedTrackForMenu(null);
  };

  const openMenu = (e, track) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const isBottom = window.innerHeight - rect.bottom < 260;
    setMenuPos({
      top: isBottom ? rect.top - 200 : rect.bottom + 8,
      left: Math.min(rect.left - 180, window.innerWidth - 240)
    });
    setSelectedTrackForMenu(track);
  };

  const isCurrentTrackPlaying = (track) => {
    if (!currentTrack || !track) return false;
    return isPlaying && (currentTrack.youtube_id === (track.youtube_id || track.id));
  };

  const isCurrentTrackSelected = (track) => {
    if (!currentTrack || !track) return false;
    return currentTrack.youtube_id === (track.youtube_id || track.id);
  };

  const topResult = searchData.top_result;
  const rawSongs = searchData.songs || [];
  const artists = searchData.artists || [];
  const albums = searchData.albums || [];

  // Filter out topResult if it's a song so it doesn't appear twice
  const songsWithoutTopResult = rawSongs.filter(s => {
    if (!topResult) return true;
    const topId = topResult.youtube_id || topResult.id;
    const songId = s.youtube_id || s.id;
    return topId !== songId;
  });

  return (
    <div className="min-h-screen text-white pb-32 pt-2 md:pt-4 px-4 sm:px-8 max-w-7xl mx-auto select-none relative">
      
      {/* Floating Back Button */}
      <button 
        onClick={handleGoBack}
        className="fixed top-24 left-6 sm:left-8 z-50 text-white/80 hover:text-white transition-all flex items-center justify-center w-11 h-11 bg-black/50 hover:bg-black/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/10 hover:border-white/25 hover:scale-105 active:scale-95 duration-200"
        aria-label="Go Back"
        title="Go back"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Loading State (Centered, larger gif and text, category tabs hidden) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full gap-5">
          <img 
            src="/images/tremble_loading_new.gif" 
            alt="Loading..." 
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          />
          <p className="text-zinc-300 font-semibold text-lg sm:text-xl tracking-wide animate-pulse text-center">
            Fetching results for "{rawQuery || query}"...
          </p>
        </div>
      ) : !rawQuery.trim() ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-zinc-400">
          <Music size={48} className="mb-4 text-zinc-600" />
          <h2 className="text-2xl font-bold text-white mb-2">Search Tremble</h2>
          <p className="text-zinc-400 max-w-md">Type in artist names, album titles, or song keywords in the search bar above.</p>
        </div>
      ) : (
        <>
          {/* Clean Category Navigation Buttons (No distracting background rectangle) */}
          <div className="sticky top-20 z-40 py-2.5 mb-8 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shrink-0 ${
                    isActive
                      ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.45)] scale-[1.03]'
                      : 'bg-zinc-900/90 text-zinc-300 border border-white/10 hover:border-white/30 hover:bg-zinc-800 hover:text-white backdrop-blur-md'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-black' : 'text-zinc-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-10">

            {/* ALL VIEW: Hero Top Result + Categorized Sections */}
            {activeCategory === 'all' && (
              <>
                {/* TOP RESULT FULL WIDTH CARD */}
                {topResult && (
                  <div className="w-full flex flex-col">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <h2 className="text-xs font-black tracking-widest text-zinc-400 uppercase">
                        Top Result
                      </h2>
                    </div>

                    <div className="relative w-full bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-black/85 border border-white/10 rounded-2xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-white/20 transition-all duration-300 flex flex-col justify-between">
                      
                      {/* Ambient subtle glow */}
                      <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-all duration-500" />
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10 w-full">
                        {/* Artwork with Top Result #1 Badge */}
                        <div 
                          className={`relative w-28 h-28 sm:w-40 sm:h-40 shrink-0 overflow-hidden shadow-2xl cursor-pointer ${
                            topResult.type === 'artist' ? 'rounded-full ring-2 ring-white/30' : 'rounded-2xl ring-1 ring-white/15'
                          }`}
                          onClick={() => {
                            if (topResult.type === 'artist') {
                              router.push(getTremblerUrl(topResult.name || topResult.title));
                            } else if (topResult.type === 'album') {
                              router.push(getAlbumUrl(topResult));
                            } else {
                              handlePlaySong(topResult, rawSongs);
                            }
                          }}
                        >
                          <SafeImage
                            src={topResult.cover_url}
                            alt={topResult.name || topResult.title}
                            title={topResult.name || topResult.title}
                            artist={topResult.artist || topResult.name}
                            type={topResult.type === 'artist' ? 'artist' : 'album'}
                            useOriginalSize={true}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Sound wave overlay when playing */}
                          {topResult.type === 'song' && isCurrentTrackPlaying(topResult) && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                              <img 
                                src="/images/tremble_song_overlay.gif" 
                                alt="playing" 
                                className="w-10 h-10 object-contain opacity-95 mix-blend-screen" 
                              />
                            </div>
                          )}

                          {/* Hover Play Overlay */}
                          {topResult.type !== 'artist' && !isCurrentTrackPlaying(topResult) && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                                <Play size={24} className="fill-current ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info Column */}
                        <div className="flex flex-col min-w-0 flex-1 justify-center">
                          <div className="flex items-center gap-2 mb-2">
                            {/* #1 Badge in SF font */}
                            <span className="px-2.5 py-0.5 text-xs font-black rounded-md bg-white text-black font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tracking-wider shadow-md">
                              #1
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider rounded-full bg-white/10 text-white border border-white/20">
                              {topResult.type === 'artist' ? 'Trembler' : topResult.type === 'album' ? 'Album' : 'Song'}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 
                            className="text-2xl sm:text-4xl font-extrabold text-white truncate group-hover:text-white group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all cursor-pointer"
                            onClick={() => {
                              if (topResult.type === 'artist') router.push(getTremblerUrl(topResult.name || topResult.title));
                              else if (topResult.type === 'album') router.push(getAlbumUrl(topResult));
                              else handlePlaySong(topResult, rawSongs);
                            }}
                          >
                            {topResult.name || topResult.title}
                          </h3>

                          {/* Subtitle */}
                          <p className="text-zinc-400 text-sm sm:text-base mt-1.5 truncate">
                            {topResult.type === 'artist' ? (
                              <span>{topResult.subscribers || 'Trembler Profile'} &bull; Verified Trembler</span>
                            ) : topResult.type === 'album' ? (
                              <span>Album &bull; {topResult.artist} {topResult.year ? `&bull; ${topResult.year}` : ''}</span>
                            ) : (
                              <span>Song &bull; {topResult.artist} {topResult.views ? `&bull; ${topResult.views} plays` : ''}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/10 z-10">
                        {topResult.type === 'artist' ? (
                          <button
                            onClick={() => router.push(getTremblerUrl(topResult.name || topResult.title))}
                            className="flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                          >
                            <User size={18} />
                            <span>View Profile</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (topResult.type === 'album') router.push(getAlbumUrl(topResult));
                              else handlePlaySong(topResult, rawSongs);
                            }}
                            className="flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                          >
                            {isCurrentTrackPlaying(topResult) ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
                            <span>{isCurrentTrackPlaying(topResult) ? 'Pause' : 'Play'}</span>
                          </button>
                        )}

                        {topResult.type === 'song' && (
                          <>
                            <button
                              onClick={() => handleAddToQueue(topResult)}
                              className="flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white font-semibold text-sm border border-white/10 transition-colors"
                            >
                              <ListPlus size={18} />
                              <span className="hidden sm:inline">Add to queue</span>
                            </button>

                            <button
                              onClick={() => toggleLike(topResult)}
                              className={`p-3 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-white/10 transition-all ${
                                likedSongs.some(s => s.youtube_id === (topResult.youtube_id || topResult.id)) 
                                  ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] bg-white/20' 
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              <Heart 
                                size={19} 
                                fill={likedSongs.some(s => s.youtube_id === (topResult.youtube_id || topResult.id)) ? 'white' : 'none'} 
                                className={likedSongs.some(s => s.youtube_id === (topResult.youtube_id || topResult.id)) ? 'text-white' : ''} 
                              />
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* SONGS SECTION (Popularity-Ranked, starting from #2 if Top Result is present) */}
                {songsWithoutTopResult.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Music size={20} className="text-white" />
                        <span>Songs</span>
                      </h2>
                      <button
                        onClick={() => handleCategoryChange('songs')}
                        className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider hover:underline"
                      >
                        View all ({rawSongs.length})
                      </button>
                    </div>

                    <div className="flex flex-col divide-y divide-white/5 bg-zinc-900/40 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
                      {songsWithoutTopResult.slice(0, 8).map((track, idx) => {
                        const rankNumber = topResult ? (idx + 2) : (idx + 1);
                        const isCurrentlyPlaying = isCurrentTrackPlaying(track);
                        const isSelected = isCurrentTrackSelected(track);
                        const isLiked = likedSongs.some(s => s.youtube_id === (track.youtube_id || track.id));

                        return (
                          <div
                            key={track.youtube_id || idx}
                            onClick={() => handlePlaySong(track, rawSongs)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                              isCurrentlyPlaying
                                ? 'bg-white/10 ring-1 ring-white/25 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                                : isSelected
                                ? 'bg-white/10'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {/* Rank Number in SF font / Play Icon / Wave */}
                              <div className="w-7 text-center font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums font-semibold text-sm text-zinc-400 group-hover:hidden shrink-0">
                                {isCurrentlyPlaying ? (
                                  <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">#{rankNumber}</span>
                                ) : (
                                  <span>#{rankNumber}</span>
                                )}
                              </div>
                              <div className="w-7 text-center hidden group-hover:flex items-center justify-center shrink-0 text-white">
                                {isCurrentlyPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
                              </div>

                              {/* Thumbnail with playing sound wave overlay */}
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-800 ring-1 ring-white/10">
                                <SafeImage
                                  src={track.cover_url}
                                  alt={track.title}
                                  title={track.title}
                                  artist={track.artist}
                                  type="album"
                                  className="w-full h-full object-cover"
                                />
                                {isCurrentlyPlaying && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                                    <img 
                                      src="/images/tremble_song_overlay.gif" 
                                      alt="playing" 
                                      className="w-6 h-6 object-contain opacity-95 mix-blend-screen" 
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Title & Artist (Glowing white on hover) */}
                              <div className="flex flex-col min-w-0 flex-1 pr-2">
                                <span className={`font-semibold text-sm truncate transition-all duration-200 ${
                                  isCurrentlyPlaying
                                    ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                                    : 'text-zinc-100 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                                }`}>
                                  {track.title}
                                </span>
                                <div className="flex items-center gap-1.5 text-zinc-400 text-xs truncate mt-0.5">
                                  <span className="truncate group-hover:text-zinc-200 transition-colors">{track.artist}</span>
                                  {track.views && (
                                    <>
                                      <span className="text-zinc-600">&bull;</span>
                                      <span className="text-zinc-400 font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums shrink-0">{track.views} plays</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right side: Duration & Actions */}
                            <div className="flex items-center gap-3 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLike(track);
                                }}
                                className={`p-1.5 rounded-full hover:bg-white/10 transition-all ${
                                  isLiked 
                                    ? 'opacity-100 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' 
                                    : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white'
                                }`}
                              >
                                <Heart 
                                  size={16} 
                                  fill={isLiked ? 'white' : 'none'} 
                                  className={isLiked ? 'text-white' : ''} 
                                />
                              </button>

                              <span className="text-xs font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums text-zinc-400 w-12 text-right">
                                {track.duration || '3:00'}
                              </span>

                              <button
                                onClick={(e) => openMenu(e, track)}
                                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TREMBLERS SECTION */}
                {artists.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <User size={20} className="text-white" />
                        <span>Tremblers</span>
                      </h2>
                      <button
                        onClick={() => handleCategoryChange('tremblers')}
                        className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider hover:underline"
                      >
                        View all ({artists.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {artists.slice(0, 6).map((art, idx) => (
                        <div
                          key={art.id || idx}
                          onClick={() => router.push(getTremblerUrl(art.name))}
                          className="flex flex-col items-center text-center p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/25 hover:bg-zinc-800/60 transition-all duration-300 cursor-pointer group shadow-lg"
                        >
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 ring-2 ring-white/10 group-hover:ring-white/40 group-hover:scale-105 transition-all duration-300 shadow-xl bg-zinc-800">
                            <SafeImage
                              src={art.cover_url}
                              alt={art.name}
                              title={art.name}
                              artist={art.name}
                              type="artist"
                              useOriginalSize={true}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="font-bold text-sm text-white group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-colors truncate w-full">
                            {art.name}
                          </h4>
                          <span className="text-[11px] text-zinc-400 mt-0.5 truncate w-full">
                            {art.subscribers || 'Trembler'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ALBUMS SECTION */}
                {albums.length > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                        <Disc size={20} className="text-white" />
                        <span>Albums</span>
                      </h2>
                      <button
                        onClick={() => handleCategoryChange('albums')}
                        className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider hover:underline"
                      >
                        View all ({albums.length})
                      </button>
                    </div>

                    <div className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-2 px-2">
                      {albums.slice(0, 7).map((alb, idx) => (
                        <SteamAlbumCard
                          key={alb.id || idx}
                          album={alb}
                          onClick={() => router.push(getAlbumUrl(alb))}
                        />
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}

            {/* DEDICATED SONGS TAB */}
            {activeCategory === 'songs' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-white">All Songs for "{query}"</h2>
                  <span className="text-sm font-semibold text-zinc-400 font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums">{rawSongs.length} results</span>
                </div>

                {rawSongs.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500">No songs found matching "{query}"</div>
                ) : (
                  <div className="flex flex-col divide-y divide-white/5 bg-zinc-900/40 border border-white/10 rounded-2xl p-3 backdrop-blur-xl">
                    {rawSongs.map((track, idx) => {
                      const isCurrentlyPlaying = isCurrentTrackPlaying(track);
                      const isSelected = isCurrentTrackSelected(track);
                      const isLiked = likedSongs.some(s => s.youtube_id === (track.youtube_id || track.id));

                      return (
                        <div
                          key={track.youtube_id || idx}
                          onClick={() => handlePlaySong(track, rawSongs)}
                          className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                            isCurrentlyPlaying
                              ? 'bg-white/10 ring-1 ring-white/25 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                              : isSelected
                              ? 'bg-white/10'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="w-8 text-center font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums text-sm text-zinc-400 font-semibold group-hover:hidden shrink-0">
                              {isCurrentlyPlaying ? (
                                <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">#{idx + 1}</span>
                              ) : (
                                <span>#{idx + 1}</span>
                              )}
                            </div>
                            <div className="w-8 text-center hidden group-hover:flex items-center justify-center shrink-0 text-white">
                              {isCurrentlyPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
                            </div>

                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800 ring-1 ring-white/10">
                              <SafeImage
                                src={track.cover_url}
                                alt={track.title}
                                title={track.title}
                                artist={track.artist}
                                type="album"
                                className="w-full h-full object-cover"
                              />
                              {isCurrentlyPlaying && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                                  <img 
                                    src="/images/tremble_song_overlay.gif" 
                                    alt="playing" 
                                    className="w-7 h-7 object-contain opacity-95 mix-blend-screen" 
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col min-w-0 flex-1 pr-3">
                              <span className={`font-semibold text-base truncate transition-all duration-200 ${
                                isCurrentlyPlaying
                                  ? 'text-white font-bold drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                                  : 'text-zinc-100 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]'
                              }`}>
                                {track.title}
                              </span>
                              <div className="flex items-center gap-2 text-zinc-400 text-xs truncate mt-0.5">
                                <span className="truncate group-hover:text-zinc-200 transition-colors">{track.artist}</span>
                                {track.album && track.album !== 'Single' && (
                                  <>
                                    <span className="text-zinc-600">&bull;</span>
                                    <span className="text-zinc-500 truncate">{track.album}</span>
                                  </>
                                )}
                                {track.views && (
                                  <>
                                    <span className="text-zinc-600">&bull;</span>
                                    <span className="text-zinc-400 font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums shrink-0">{track.views} plays</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(track);
                              }}
                              className={`p-2 rounded-full hover:bg-white/10 transition-all ${
                                isLiked 
                                  ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' 
                                  : 'text-zinc-400 hover:text-white'
                              }`}
                            >
                              <Heart 
                                size={18} 
                                fill={isLiked ? 'white' : 'none'} 
                                className={isLiked ? 'text-white' : ''} 
                              />
                            </button>

                            <span className="text-xs font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums text-zinc-400 w-12 text-right">
                              {track.duration || '3:00'}
                            </span>

                            <button
                              onClick={(e) => openMenu(e, track)}
                              className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* DEDICATED TREMBLERS TAB */}
            {activeCategory === 'tremblers' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-white">Tremblers for "{query}"</h2>
                  <span className="text-sm font-semibold text-zinc-400 font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums">{artists.length} results</span>
                </div>

                {artists.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500">No tremblers found matching "{query}"</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {artists.map((art, idx) => (
                      <div
                        key={art.id || idx}
                        onClick={() => router.push(getTremblerUrl(art.name))}
                        className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-white/30 hover:bg-zinc-800/80 transition-all duration-300 cursor-pointer group shadow-xl"
                      >
                        <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-4 ring-2 ring-white/15 group-hover:ring-white/50 group-hover:scale-105 transition-all duration-300 shadow-2xl bg-zinc-800">
                          <SafeImage
                            src={art.cover_url}
                            alt={art.name}
                            title={art.name}
                            artist={art.name}
                            type="artist"
                            useOriginalSize={true}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-extrabold text-base text-white group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-colors truncate w-full">
                          {art.name}
                        </h4>
                        <span className="text-xs text-zinc-400 mt-1 truncate w-full">
                          {art.subscribers || 'Verified Trembler'}
                        </span>
                        <button className="mt-4 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs transition-colors">
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DEDICATED ALBUMS TAB */}
            {activeCategory === 'albums' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-extrabold text-white">Albums for "{query}"</h2>
                  <span className="text-sm font-semibold text-zinc-400 font-['SF_Pro_Display','SF_Pro_Text',-apple-system,BlinkMacSystemFont,sans-serif] tabular-nums">{albums.length} results</span>
                </div>

                {albums.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500">No albums found matching "{query}"</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {albums.map((alb, idx) => (
                      <SteamAlbumCard
                        key={alb.id || idx}
                        album={alb}
                        onClick={() => router.push(getAlbumUrl(alb))}
                        className="w-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </>
      )}

      {/* Floating 3-Dots Popup Action Menu */}
      {selectedTrackForMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-60 bg-zinc-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150 text-sm"
          style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
          <div className="px-3 py-2 border-b border-white/5 mb-1">
            <p className="font-bold text-white truncate">{selectedTrackForMenu.title}</p>
            <p className="text-xs text-zinc-400 truncate">{selectedTrackForMenu.artist}</p>
          </div>

          <button
            onClick={() => handlePlayNext(selectedTrackForMenu)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Radio size={16} />
            <span>Play next</span>
          </button>

          <button
            onClick={() => handleAddToQueue(selectedTrackForMenu)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ListPlus size={16} />
            <span>Add to queue</span>
          </button>

          {selectedTrackForMenu.artist && (
            <button
              onClick={() => {
                router.push(getTremblerUrl(selectedTrackForMenu.artist));
                setSelectedTrackForMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <User size={16} />
              <span>Go to Trembler</span>
            </button>
          )}

          {selectedTrackForMenu.album_id && (
            <button
              onClick={() => {
                router.push(getAlbumUrl({ id: selectedTrackForMenu.album_id, title: selectedTrackForMenu.album }));
                setSelectedTrackForMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Disc size={16} />
              <span>Go to Album</span>
            </button>
          )}

          <div className="my-1 border-t border-white/5" />

          <button
            onClick={() => {
              toggleLike(selectedTrackForMenu);
              setSelectedTrackForMenu(null);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Heart 
              size={16} 
              fill={likedSongs.some(s => s.youtube_id === (selectedTrackForMenu.youtube_id || selectedTrackForMenu.id)) ? 'white' : 'none'} 
              className={likedSongs.some(s => s.youtube_id === (selectedTrackForMenu.youtube_id || selectedTrackForMenu.id)) ? 'text-white' : ''} 
            />
            <span>{likedSongs.some(s => s.youtube_id === (selectedTrackForMenu.youtube_id || selectedTrackForMenu.id)) ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <img src="/images/tremble_loading_new.gif" alt="Loading..." className="w-16 h-16 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
