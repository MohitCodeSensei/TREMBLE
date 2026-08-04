"use client";
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import { API_URL, getTremblerUrl } from '../../../utils/api';
import { Play, Pause, Heart, MoreVertical, Loader2, Minus, Plus, Search, Image as ImageIcon, Music, Shuffle, ArrowLeft } from 'lucide-react';
import SafeImage from '../../../components/SafeImage';
import { useRouter, useSearchParams } from 'next/navigation';

const getHighResImage = (url) => {
  if (!url) return '';
  if (url.includes('=w')) {
    return url.substring(0, url.indexOf('=w')) + '=w1200-h1200';
  }
  return url;
};

function PlaylistContent({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const { currentTrack, isPlaying, togglePlay, setQueue, loadTrackIntoContext, toggleLike, likedSongs, savePlaylist, deletePlaylist, playlists, toggleShuffle, setCurrentIndex, isShuffle } = usePlayer();
  
  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [highlightedTrackId, setHighlightedTrackId] = useState(null);

  useEffect(() => {
    if (highlightId && playlist) {
      setHighlightedTrackId(highlightId);
      const timer = setTimeout(() => setHighlightedTrackId(null), 2000);
      setTimeout(() => {
        const el = document.getElementById(`track-${highlightId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [highlightId, playlist]);

  // User Tremlist editing states
  const [playlistName, setPlaylistName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [coverImage, setCoverImage] = useState("/images/tremlist_static.jpeg");
  const [addedTracks, setAddedTracks] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [suggestedTracks, setSuggestedTracks] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoading(true);
        // 1. Check local state / localStorage
        let localFound = null;
        const storedStr = localStorage.getItem('tremble_playlists');
        if (storedStr) {
          try {
            const stored = JSON.parse(storedStr);
            localFound = stored.find(p => p.id?.toString() === id?.toString());
          } catch (e) {}
        }
        if (!localFound && playlists && playlists.length > 0) {
          localFound = playlists.find(p => p.id?.toString() === id?.toString());
        }

        if (localFound) {
          const loadedPl = { ...localFound, is_user_playlist: true };
          setPlaylist(loadedPl);
          setPlaylistName(loadedPl.title || "Tremlist");
          setCoverImage(loadedPl.cover_url || (loadedPl.tracks && loadedPl.tracks.length > 0 ? (loadedPl.tracks[0].cover_url || "/images/tremlist_static.jpeg") : "/images/tremlist_static.jpeg"));
          setAddedTracks(loadedPl.tracks || []);
          setIsLoading(false);
          return;
        }

        // 2. Fetch from backend API endpoint
        const res = await fetch(`${API_URL}/playlist/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setPlaylist(data);
            if (data.is_user_playlist) {
              setPlaylistName(data.title || "Tremlist");
              setCoverImage(data.cover_url || (data.tracks && data.tracks.length > 0 ? (data.tracks[0].cover_url || "/images/tremlist_static.jpeg") : "/images/tremlist_static.jpeg"));
              setAddedTracks(data.tracks || []);
            }
          } else {
            setPlaylist(null);
          }
        } else {
          setPlaylist(null);
        }
      } catch (err) {
        console.error("Failed to fetch playlist", err);
        setPlaylist(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPlaylist();
  }, [id, playlists]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const isUserPlaylist = Boolean(
    playlist?.is_user_playlist || 
    id?.toString().startsWith('local_tremlist_') || 
    (playlists && playlists.some(p => p.id?.toString() === id?.toString()))
  );

  const isAlbumTremlist = Boolean(
    playlist?.tracks?.[0]?._isAlbumTremlist || addedTracks?.[0]?._isAlbumTremlist
  );

  // Search debouncing for right column
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            const filtered = data.filter(t => !addedTracks.some(at => (at.youtube_id || at.id) === (t.youtube_id || t.videoId)));
            setSearchResults(filtered.slice(0, 10));
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
  }, [searchQuery, addedTracks]);

  // Suggestions fetching based on last added track
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isUserPlaylist || addedTracks.length === 0) {
        setSuggestedTracks([]);
        return;
      }
      setIsSuggesting(true);
      const lastTrack = addedTracks[addedTracks.length - 1];
      const artist = lastTrack.artist_name || lastTrack.artist;
      if (artist) {
        try {
          const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(artist)}`);
          if (res.ok) {
            const data = await res.json();
            const filtered = data.filter(t => !addedTracks.some(at => (at.youtube_id || at.id) === (t.youtube_id || t.videoId)));
            setSuggestedTracks(filtered.slice(0, 5));
          }
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
        }
      }
      setIsSuggesting(false);
    };

    fetchSuggestions();
  }, [addedTracks, isUserPlaylist]);

  const handleAddTrack = (track) => {
    const mappedTrack = {
      ...track,
      title: track.title,
      artist_name: track.artist || track.artist_name,
      cover_url: track.cover_url || track.thumbnails?.[track.thumbnails.length - 1]?.url,
      youtube_id: track.youtube_id || track.videoId,
      duration: track.duration
    };
    
    const updated = [...addedTracks, mappedTrack];
    setAddedTracks(updated);

    const updatedPlaylist = {
      ...playlist,
      id: id,
      title: playlistName || playlist?.title || "Tremlist",
      cover_url: coverImage,
      tracks: updated,
      type: 'playlist',
      is_user_playlist: true
    };
    setPlaylist(updatedPlaylist);
    savePlaylist(updatedPlaylist);

    setSearchResults(prev => prev.filter(t => (t.youtube_id || t.videoId) !== mappedTrack.youtube_id));
    setSuggestedTracks(prev => prev.filter(t => (t.youtube_id || t.videoId) !== mappedTrack.youtube_id));
  };

  const handleRemoveTrack = (idxToRemove) => {
    const updated = addedTracks.filter((_, i) => i !== idxToRemove);
    setAddedTracks(updated);
    const updatedPlaylist = {
      ...playlist,
      id: id,
      title: playlistName || playlist?.title || "Tremlist",
      cover_url: coverImage,
      tracks: updated,
      type: 'playlist',
      is_user_playlist: true
    };
    setPlaylist(updatedPlaylist);
    savePlaylist(updatedPlaylist);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
      const updatedPlaylist = {
        ...playlist,
        id: id,
        title: playlistName || playlist?.title || "Tremlist",
        cover_url: imageUrl,
        tracks: addedTracks,
        type: 'playlist',
        is_user_playlist: true
      };
      setPlaylist(updatedPlaylist);
      savePlaylist(updatedPlaylist);
    }
  };

  const handleNameSave = () => {
    setIsEditingName(false);
    if (!playlistName.trim()) return;
    const updatedPlaylist = {
      ...playlist,
      id: id,
      title: playlistName,
      cover_url: coverImage,
      tracks: addedTracks,
      type: 'playlist',
      is_user_playlist: true
    };
    setPlaylist(updatedPlaylist);
    savePlaylist(updatedPlaylist);
  };

  const handlePlayUserPlaylist = () => {
    if (addedTracks.length === 0) return;
    const mappedTracks = addedTracks.map(t => ({
      id: t.videoId || t.id || t.youtube_id,
      youtube_id: t.videoId || t.youtube_id || t.id,
      title: t.title,
      artist: t.artist_name || t.artist,
      artist_id: t.artist_id,
      album_id: t.album_id || t._albumId,
      cover_url: t.cover_url || coverImage,
      duration: t.duration
    }));
    loadTrackIntoContext(mappedTracks[0]);
    setQueue(mappedTracks);
    if (!isPlaying) togglePlay();
  };

  const handleShuffleUserPlaylist = () => {
    if (addedTracks.length === 0) return;
    const mappedTracks = addedTracks.map(t => ({
      id: t.videoId || t.id || t.youtube_id,
      youtube_id: t.videoId || t.youtube_id || t.id,
      title: t.title,
      artist: t.artist_name || t.artist,
      artist_id: t.artist_id,
      album_id: t.album_id || t._albumId,
      cover_url: t.cover_url || coverImage,
      duration: t.duration
    }));
    setQueue(mappedTracks);
    toggleShuffle();
    const randomIndex = Math.floor(Math.random() * mappedTracks.length);
    loadTrackIntoContext(mappedTracks[randomIndex]);
    if (!isPlaying) togglePlay();
  };

  const handlePlayExternal = (track, index) => {
    if (!playlist || !playlist.tracks) return;
    const mappedTracks = playlist.tracks.map(t => ({
      id: t.videoId || t.id || t.youtube_id,
      youtube_id: t.videoId || t.youtube_id || t.id,
      title: t.title,
      artist: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist_name || t.artist),
      artist_id: t.artists?.[0]?.id || t.artist_id,
      album_id: t.album?.id || t.album_id || (playlist.isAlbumTremlist ? playlist.id : null),
      cover_url: t.thumbnails ? t.thumbnails[t.thumbnails.length - 1].url : (t.cover_url || playlist.thumbnails?.[0]?.url),
      duration: t.duration
    }));
    loadTrackIntoContext(mappedTracks[index]);
    setQueue(mappedTracks);
    if (!isPlaying) togglePlay();
  };

  const formatTotalDuration = (tracksList) => {
    let totalSeconds = 0;
    if (tracksList && tracksList.length > 0) {
      tracksList.forEach(t => {
        if (t.duration) {
          const parts = t.duration.toString().split(':');
          if (parts.length === 2) {
            totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
          } else if (parts.length === 3) {
             totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
          }
        }
      });
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours} hours and ${minutes} minutes`;
    }
    return `${minutes} minutes and ${seconds} seconds`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <img src="/images/tremble_loading_new.gif" alt="Loading..." className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-8 pb-32 font-sans min-h-screen flex justify-center items-center">
        <h1 className="text-2xl text-zinc-400">Tremlist not found</h1>
      </div>
    );
  }

  // RENDER USER TREMLIST VIEW (Matching Image 2)
  if (isUserPlaylist) {
    return (
      <div className="p-8 pb-32 font-sans min-h-screen relative">
        {/* Floating Back Button */}
        <button 
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }} 
          className="fixed top-24 left-8 z-50 text-white/70 hover:text-white transition-colors flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10"
          aria-label="Go Back"
        >
           <ArrowLeft size={24} />
        </button>
        <div className={`flex flex-col gap-12 ${isAlbumTremlist ? 'max-w-4xl mx-auto pt-8' : 'lg:flex-row max-w-7xl mx-auto pt-8'}`}>
          
          {/* LEFT COLUMN: Playlist Details & Added Tracks */}
          <div className="flex-1 flex flex-col w-full">
            
            <div className={`flex gap-8 mb-8 ${isAlbumTremlist ? 'flex-col items-center text-center' : ''}`}>
              <div 
                className={`relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 group shadow-2xl flex items-center justify-center ${isAlbumTremlist ? 'w-72 h-72 sm:w-80 sm:h-80 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : 'w-56 h-56 cursor-pointer'}`}
                onClick={() => !isAlbumTremlist && fileInputRef.current?.click()}
              >
                <img 
                  loading="lazy" 
                  src={coverImage.includes('Mohit Mahajan') || coverImage.includes('tremlist_static.jpeg') ? '/images/tremlist_static.jpeg' : getHighResImage(coverImage)} 
                  alt={playlistName || "Tremlist"} 
                  className={`w-full h-full ${coverImage === '/images/logo.png' ? 'object-contain p-8' : 'object-cover'}`} 
                />
                <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-center transition-opacity duration-300 ${isAlbumTremlist ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}>
                  <ImageIcon size={32} className="text-white mb-2" />
                  <span className="text-white font-bold text-sm">Choose photo</span>
                </div>
                {!isAlbumTremlist && (
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                )}
              </div>

              <div className={`flex flex-col justify-end pb-2 flex-1 min-w-0 ${isAlbumTremlist ? 'items-center' : ''}`}>
                <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase mb-2">
                  {isAlbumTremlist ? "Album Tremlist" : "Tremlist"}
                </span>
                
                {isEditingName ? (
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                    className="text-5xl font-black tracking-tight text-white bg-transparent border-b-2 border-indigo-500 outline-none mb-4 w-full"
                  />
                ) : (
                  <h1 
                    onClick={() => setIsEditingName(true)}
                    className="text-5xl font-black tracking-tight text-white drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity mb-4 truncate"
                  >
                    {playlistName || playlist.title || "Tremlist"}
                  </h1>
                )}

                {isAlbumTremlist && (
                  <div className="flex justify-center mb-3 mt-1">
                    <span 
                      className="text-white hover:underline cursor-pointer font-bold font-sans text-xl drop-shadow-md"
                      onClick={() => {
                        const artist = addedTracks?.[0]?.artist || addedTracks?.[0]?.artist_name || '';
                        if (artist) {
                          router.push(getTremblerUrl(artist));
                        }
                      }}
                    >
                      {addedTracks?.[0]?.artist || addedTracks?.[0]?.artist_name || "Unknown Artist"}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-center gap-2 mb-2 ${isAlbumTremlist ? 'justify-center' : ''}`}>
                  {isAlbumTremlist && (
                    <div className="w-5 h-5 rounded bg-zinc-700 flex items-center justify-center overflow-hidden">
                      <span className="text-white text-[10px] font-bold">E</span>
                    </div>
                  )}
                  <p className="text-zinc-400 font-bold text-lg">
                    {addedTracks.length} Tracks
                  </p>
                </div>

                <p className="text-zinc-500 font-medium text-lg font-sans">
                  {formatTotalDuration(addedTracks)}
                </p>
              </div>

              {/* Delete Menu */}
              {!isAlbumTremlist && (
                <div className="relative pb-2 self-start">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-3 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                    aria-label="More options"
                  >
                    <MoreVertical size={24} />
                  </button>
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this Tremlist?")) {
                              await deletePlaylist(id);
                              router.push('/library');
                            }
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                        >
                          Delete Tremlist
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className={`relative flex items-center mb-8 w-full ${isAlbumTremlist ? 'justify-center' : 'gap-4'}`}>
              
              {isAlbumTremlist && (
                <div className="absolute left-0">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-3 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                    aria-label="More options"
                  >
                    <MoreVertical size={24} />
                  </button>
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                      <div className="absolute left-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                          onClick={async () => {
                            if (confirm("Are you sure you want to delete this Tremlist?")) {
                              await deletePlaylist(id);
                              router.push('/library');
                            }
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                        >
                          Delete Tremlist
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePlayUserPlaylist}
                  className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
                >
                  {isPlaying ? <Pause size={26} fill="black" /> : <Play size={26} fill="black" className="ml-1" />}
                </button>
                <button 
                  onClick={toggleShuffle}
                  className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center ${isShuffle ? 'bg-white border-white text-black drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'border-zinc-600 text-zinc-400 hover:border-white hover:text-black hover:bg-white'}`}
                >
                  <Shuffle size={20} />
                </button>
              </div>
            </div>

            {/* Track List */}
            <div className="flex flex-col gap-1 mt-4">
              {addedTracks.length === 0 ? (
                <div className="flex items-center gap-3 text-zinc-500 p-4 font-medium">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                     <Music size={16} />
                  </div>
                  No added tracks
                </div>
              ) : (
                addedTracks.map((track, idx) => {
                  const trackId = track.videoId || track.youtube_id || track.id;
                  const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === trackId);
                  const tTitle = track.title || "Unknown Title";
                  const tArtist = track.artist_name || track.artist || "Unknown Artist";
                  const tCover = track.cover_url || coverImage;

                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center px-4 py-2 rounded-xl border border-white/5 group hover:scale-[1.02] hover:my-1.5 hover:shadow-2xl hover:z-10 transition-all duration-300 ease-out cursor-pointer relative ${isCurrentlyPlaying ? 'bg-white/10' : 'bg-white/5'}`}
                      onClick={() => {
                        loadTrackIntoContext(track);
                        setQueue(addedTracks);
                        setCurrentIndex(idx);
                        if (!isPlaying) togglePlay();
                      }}
                    >
                      <div className="w-10 flex justify-center items-center">
                        {isCurrentlyPlaying && isPlaying ? (
                          <img src="/images/tremble_song_overlay.gif" alt="playing" className="w-6 h-6 object-contain opacity-80 mix-blend-screen" />
                        ) : (
                          <span className="text-zinc-500 font-sans font-medium text-sm">{idx + 1}</span>
                        )}
                      </div>
                      
                      {isAlbumTremlist ? null : (
                        <div className="relative mr-4 flex-shrink-0">
                          <img loading="lazy" src={tCover} alt={tTitle} className="w-10 h-10 rounded-md object-cover" />
                          {isCurrentlyPlaying && isPlaying && (
                            <img src="/images/tremble_song_overlay.gif" alt="playing" className="absolute inset-0 w-full h-full object-cover rounded-md opacity-75 mix-blend-screen" />
                          )}
                        </div>
                      )}

                      <div className="flex flex-col flex-1 min-w-0 ml-2 justify-center">
                        <span className={`font-semibold truncate group-hover:text-indigo-400 transition-colors ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-white'}`}>{tTitle}</span>
                        {!isAlbumTremlist && (
                          <span className="text-zinc-400 text-sm truncate">{tArtist}</span>
                        )}
                      </div>
                      
                      <div className="text-zinc-400 font-sans font-medium text-sm mr-4">{track.duration || "0:00"}</div>
                      
                      {!isAlbumTremlist && (
                        <div 
                          className="w-8 text-zinc-500 opacity-0 group-hover:opacity-100 hover:!text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all flex justify-center cursor-pointer" 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleRemoveTrack(idx); 
                          }}
                        >
                          <Minus size={18} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Search & Suggestions */}
          {!isAlbumTremlist && (
            <>
              <div className="hidden lg:block w-px bg-white/30 my-4 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
              <div className="flex-1 flex flex-col min-w-[300px] lg:max-w-md">
                <h2 className="text-xl font-bold text-white mb-6">Add to Tremlist:</h2>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search for songs to add..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-full py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 ring-blue-500 transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={18} />
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Search Results</h3>
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map((track, idx) => (
                    <div key={`search-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group">
                      <img loading="lazy" src={track.cover_url || track.thumbnails?.[0]?.url} alt={track.title} className="w-12 h-12 rounded object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-white font-medium truncate">{track.title}</span>
                        <span className="text-zinc-400 text-sm truncate">{track.artist || track.artist_name}</span>
                      </div>
                      <button 
                        onClick={() => handleAddTrack(track)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-600 text-zinc-500 group-hover:text-white group-hover:border-white group-hover:bg-white/10 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center justify-between">
                Suggested Tracks
                {isSuggesting && <Loader2 size={14} className="animate-spin text-zinc-400" />}
              </h3>
              
              {suggestedTracks.length > 0 ? (
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                  {suggestedTracks.map((track, idx) => (
                    <div key={`sugg-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors group border border-transparent hover:border-zinc-700">
                      <img loading="lazy" src={track.cover_url || track.thumbnails?.[0]?.url} alt={track.title} className="w-12 h-12 rounded object-cover" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-white font-medium truncate">{track.title}</span>
                        <span className="text-zinc-400 text-sm truncate">{track.artist || track.artist_name}</span>
                      </div>
                      <button 
                        onClick={() => handleAddTrack(track)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-600 text-zinc-500 group-hover:text-white group-hover:border-white group-hover:bg-white/10 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : addedTracks.length > 0 && !isSuggesting ? (
                <p className="text-zinc-500 text-sm italic">No more suggestions based on your tracks.</p>
              ) : !isSuggesting ? (
                <p className="text-zinc-500 text-sm italic">Add some tracks to get suggestions.</p>
              ) : null}
            </div>
            </div>
            </>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}} />
      </div>
    );
  }

  // RENDER EXTERNAL YOUTUBE PLAYLIST VIEW
  const coverUrl = playlist.thumbnails && playlist.thumbnails.length > 0 ? playlist.thumbnails[playlist.thumbnails.length - 1].url : (playlist.cover_url || '');
  const trackCount = playlist.trackCount || playlist.tracks?.length || 0;

  return (
    <div className="p-8 pb-32 font-sans min-h-screen relative">
      {/* Floating Back Button */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }} 
        className="fixed top-24 left-8 z-50 text-white/70 hover:text-white transition-colors flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10"
        aria-label="Go Back"
      >
         <ArrowLeft size={24} />
      </button>
      {/* Header section */}
      <div className="flex items-end justify-between mb-10 mt-4 w-full pt-8">
        <div className="flex items-end gap-6">
          <div className="w-56 h-56 rounded-xl shadow-2xl bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {coverUrl ? (
              <SafeImage 
                src={coverUrl} 
                alt={playlist.title} 
                title={playlist.title}
                type="playlist"
                className="w-full h-full object-cover" 
              />
            ) : (
               <Heart size={80} fill="white" className="text-zinc-600 drop-shadow-lg" />
            )}
          </div>
          <div className="flex flex-col gap-2 pb-2">
            <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Tremlist</span>
            <h1 className="text-6xl font-black text-white tracking-tight drop-shadow-md">{playlist.title}</h1>
            <p className="text-zinc-300 font-medium text-lg mt-2 flex items-center gap-2">
              {playlist.author && playlist.author.name && (
                 <span className="text-white font-bold">{playlist.author.name} • </span>
              )}
              {trackCount} {trackCount === 1 ? 'song' : 'songs'}
            </p>
            <p className="text-zinc-500 font-medium text-lg mt-1">
              {formatTotalDuration(playlist.tracks)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={() => handlePlayExternal(playlist.tracks?.[0], 0)}
          className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
        >
          {isPlaying ? <Pause size={26} fill="black" /> : <Play size={26} fill="black" className="ml-1" />}
        </button>
      </div>

      {/* List Header */}
      <div className="flex items-center text-zinc-400 text-sm font-medium border-b border-white/10 pb-2 mb-4 px-4">
        <div className="w-10 text-center">#</div>
        <div className="flex-1">Title</div>
        <div className="w-24 text-center">Duration</div>
        <div className="w-16"></div>
      </div>

      {/* Songs List */}
      <div className="flex flex-col gap-1">
        {playlist.tracks && playlist.tracks.map((track, idx) => {
          const trackId = track.videoId || track.youtube_id || track.id;
          const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === trackId);
          const tTitle = track.title || "Unknown Title";
          const tArtist = track.artists ? track.artists.map(a => a.name).join(', ') : (track.artist_name || track.artist);
          const tCover = track.thumbnails ? track.thumbnails[track.thumbnails.length - 1].url : (track.cover_url || coverUrl);
          const urlParams = new URLSearchParams(window.location.search);
          const highlightedTrackId = urlParams.get('highlight');
          
          return (
            <div 
              id={`track-${trackId}`}
              key={trackId || idx}
              onClick={() => handlePlayExternal(track, idx)}
              className={`flex items-center px-4 py-2 rounded-xl transition-all duration-500 cursor-pointer group ${isCurrentlyPlaying ? 'bg-white/10' : 'hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg'} ${highlightedTrackId === trackId ? 'ring-2 ring-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''}`}
            >
              <div className="w-10 text-center text-zinc-400 font-medium group-hover:hidden">
                {isCurrentlyPlaying && isPlaying ? (
                   <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse mx-auto"></div>
                ) : (
                   idx + 1
                )}
              </div>
              <div className="w-10 text-center text-white hidden group-hover:flex items-center justify-center">
                <Play size={16} fill="currentColor" />
              </div>

              <div className="flex-1 flex items-center gap-4 min-w-0">
                <div className="relative">
                  <SafeImage 
                    src={tCover} 
                    alt={tTitle} 
                    title={tTitle}
                    artist={tArtist}
                    type="song"
                    className="w-10 h-10 rounded-md object-cover flex-shrink-0 bg-zinc-800" 
                  />
                  {isCurrentlyPlaying && isPlaying && (
                    <img src="/images/tremble_song_overlay.gif" alt="playing" className="absolute inset-0 w-full h-full object-cover rounded-md opacity-75 mix-blend-screen" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`font-semibold truncate ${isCurrentlyPlaying ? 'text-indigo-400' : 'text-white'}`}>
                    {tTitle}
                  </span>
                  <span className="text-zinc-400 text-sm truncate font-medium">
                    {tArtist}
                  </span>
                </div>
              </div>

              <div className="w-16 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleLike({ ...track, youtube_id: track.videoId, cover_url: tCover, artist: tArtist }); }} 
                  className="text-red-500 hover:scale-110 transition-transform"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>

              <div className="w-16 text-right text-zinc-400 text-sm font-medium mr-4">
                {track.duration || "0:00"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlaylistPage(props) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <img src="/images/tremble_loading_new.gif" alt="Loading..." className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
      </div>
    }>
      <PlaylistContent {...props} />
    </Suspense>
  );
}
