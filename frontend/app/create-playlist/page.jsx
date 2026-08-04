"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Shuffle, Plus, Search, Image as ImageIcon, Loader2, Music, Clock, Minus } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { API_URL } from '../../utils/api';

export default function CreatePlaylistPage() {
  const { loadTrackIntoContext, setQueue, togglePlay, isPlaying, toggleShuffle, savePlaylist, playlists } = usePlayer();
  const router = useRouter();
  
  const [playlistName, setPlaylistName] = useState("Tremlist #1");
  const [isEditingName, setIsEditingName] = useState(false);
  const [coverImage, setCoverImage] = useState("C:\\Users\\Mohit Mahajan\\Downloads\\tremlist_static.jpeg");
  
  const [addedTracks, setAddedTracks] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [suggestedTracks, setSuggestedTracks] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const hasInitializedName = useRef(false);
  const playlistIdRef = useRef(`local_tremlist_${Date.now()}_${Math.random().toString(36).substring(2,9)}`);

  useEffect(() => {
    if (!hasInitializedName.current && playlists) {
      setPlaylistName(`Tremlist #${playlists.length + 1}`);
      hasInitializedName.current = true;
    }
  }, [playlists]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  useEffect(() => {
    try {
      const pendingStr = localStorage.getItem('pending_tremlist_track');
      if (pendingStr) {
        const track = JSON.parse(pendingStr);
        setAddedTracks(prev => {
          if (!prev.find(t => t.youtube_id === track.youtube_id)) {
            return [...prev, track];
          }
          return prev;
        });
        localStorage.removeItem('pending_tremlist_track');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const handleSaveToBackend = async () => {
    if (addedTracks.length === 0) return;
    setIsSaving(true);
    const playlist = {
      id: playlistIdRef.current,
      title: playlistName,
      cover_url: coverImage,
      tracks: addedTracks,
      type: 'playlist'
    };
    
    await savePlaylist(playlist);
    alert('Tremlist saved to library!');
    setIsSaving(false);
    router.push('/library');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            const filtered = data.filter(t => !addedTracks.some(at => at.youtube_id === t.youtube_id));
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

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (addedTracks.length === 0) {
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
            const filtered = data.filter(t => !addedTracks.some(at => at.youtube_id === t.youtube_id));
            setSuggestedTracks(filtered.slice(0, 5));
          }
        } catch (error) {
          console.error("Failed to fetch suggestions:", error);
        }
      }
      setIsSuggesting(false);
    };

    fetchSuggestions();
  }, [addedTracks]);

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

    savePlaylist({
      id: playlistIdRef.current,
      title: playlistName,
      cover_url: coverImage,
      tracks: updated,
      type: 'playlist'
    }).then(newId => {
      if (newId) {
        playlistIdRef.current = newId;
      }
    });

    setSearchResults(prev => prev.filter(t => (t.youtube_id || t.videoId) !== mappedTrack.youtube_id));
    setSuggestedTracks(prev => prev.filter(t => (t.youtube_id || t.videoId) !== mappedTrack.youtube_id));
  };

  const handlePlayPlaylist = () => {
    if (addedTracks.length === 0) return;
    loadTrackIntoContext(addedTracks[0]);
    setQueue(addedTracks);
    if (!isPlaying) togglePlay();
  };

  const handleShufflePlaylist = () => {
    if (addedTracks.length === 0) return;
    setQueue(addedTracks);
    toggleShuffle(); 
    const randomIndex = Math.floor(Math.random() * addedTracks.length);
    loadTrackIntoContext(addedTracks[randomIndex]);
    if (!isPlaying) togglePlay();
  };

  const formatTotalDuration = () => {
    let totalSeconds = 0;
    addedTracks.forEach(t => {
      if (t.duration) {
        const parts = t.duration.toString().split(':');
        if (parts.length === 2) {
          totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        } else if (parts.length === 3) {
           totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        }
      }
    });

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours} hours and ${minutes} minutes`;
    }
    return `${minutes} minutes and ${seconds} seconds`;
  };

  return (
    <div className="p-8 pb-32 font-sans min-h-screen">
      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto">
        
        {/* LEFT COLUMN: Playlist Details & Added Tracks */}
        <div className="flex-1 flex flex-col">
          
          <div className="flex gap-8 mb-8">
            <div 
              className="relative w-56 h-56 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0 group cursor-pointer shadow-2xl flex items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <img loading="lazy" src={coverImage.includes('Mohit Mahajan') || coverImage.includes('tremlist_static.jpeg') ? '/images/tremlist_static.jpeg' : coverImage} alt="Tremlist Cover" className={`w-full h-full ${coverImage === '/images/logo.png' ? 'object-contain p-8' : 'object-cover'}`} />
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ImageIcon size={32} className="text-white mb-2" />
                <span className="text-white font-bold text-sm">Choose photo</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </div>

            <div className="flex flex-col justify-end pb-2">
              <span className="text-sm font-bold tracking-wider text-zinc-400 uppercase mb-2">Tremlist</span>
              
              {isEditingName ? (
                <input
                  ref={nameInputRef}
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="text-6xl font-black tracking-tight text-white bg-transparent border-b-2 border-indigo-500 outline-none mb-4 w-full"
                />
              ) : (
                <h1 
                  onClick={() => setIsEditingName(true)}
                  className="text-6xl font-black tracking-tight text-white drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity mb-4"
                >
                  {playlistName}
                </h1>
              )}

              <p className="text-zinc-400 font-bold text-lg mb-2">
                {addedTracks.length} Tracks
              </p>
              <p className="text-zinc-500 font-medium text-lg">
                {formatTotalDuration()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-8 w-full">
            {/* Left side: centered below the 56px cover */}
            <div className="w-56 flex items-center justify-center gap-4">
              <button 
                onClick={handlePlayPlaylist}
                className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
              >
                {isPlaying ? <Pause size={26} fill="black" /> : <Play size={26} fill="black" className="ml-1" />}
              </button>
              <button 
                onClick={handleShufflePlaylist}
                className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center text-black"
              >
                <Shuffle size={22} className="text-black" />
              </button>
            </div>
            
            {addedTracks.length > 0 && (
              <button 
                onClick={handleSaveToBackend}
                disabled={isSaving}
                className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 font-bold text-black transition-all shadow-lg hover:scale-105 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin text-black" /> : null}
                Save Changes
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1 mt-4">
            {addedTracks.length === 0 ? (
              <div className="flex items-center gap-3 text-zinc-500 p-4 font-medium">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                   <Music size={16} />
                </div>
                No added tracks
              </div>
            ) : (
              addedTracks.map((track, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center px-4 py-2 rounded-xl bg-white/5 border border-white/5 group hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer relative"
                  onClick={() => {
                    loadTrackIntoContext(track);
                    setQueue(addedTracks);
                    if (!isPlaying) togglePlay();
                  }}
                >
                  <div className="w-8 text-zinc-500 font-medium">{idx + 1}</div>
                  <div className="relative mr-4">
                    <img loading="lazy" src={track.cover_url} alt={track.title} className="w-10 h-10 rounded-md object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-white font-semibold truncate group-hover:text-indigo-400 transition-colors">{track.title}</span>
                    <span className="text-zinc-400 text-sm truncate">{track.artist_name}</span>
                  </div>
                  <div className="text-zinc-400 text-sm mr-4">{track.duration}</div>
                  <div 
                    className="w-8 text-zinc-500 opacity-0 group-hover:opacity-100 hover:!text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all flex justify-center cursor-pointer" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      const updated = addedTracks.filter((_, i) => i !== idx);
                      setAddedTracks(updated);
                      savePlaylist({
                        id: playlistIdRef.current,
                        title: playlistName,
                        cover_url: coverImage,
                        tracks: updated,
                        type: 'playlist'
                      });
                    }}
                  >
                    <Minus size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hidden lg:block w-px bg-white/50 my-4 shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>

        {/* RIGHT COLUMN: Search & Suggestions */}
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
                    <img loading="lazy" src={track.cover_url} alt={track.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-white font-medium truncate">{track.title}</span>
                      <span className="text-zinc-400 text-sm truncate">{track.artist}</span>
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
                    <img loading="lazy" src={track.cover_url} alt={track.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-white font-medium truncate">{track.title}</span>
                      <span className="text-zinc-400 text-sm truncate">{track.artist}</span>
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
