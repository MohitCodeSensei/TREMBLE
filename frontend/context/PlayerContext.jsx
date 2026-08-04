"use client";
import React, { createContext, useContext, useState, useRef, useEffect, useMemo } from 'react';
import YouTube from 'react-youtube';
import { getLyrics, API_URL } from '../utils/api';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  
  // Queue State
  const [queue, setQueueState] = useState([]);
  
  const setQueue = (newQueueAction) => {
    if (typeof newQueueAction === 'function') {
      setQueueState(prev => {
        const next = newQueueAction(prev);
        return next.map(t => ({ ...t, _dragId: t._dragId || `drag-${Math.random().toString(36).substring(7)}` }));
      });
    } else {
      setQueueState(newQueueAction.map(t => ({ ...t, _dragId: t._dragId || `drag-${Math.random().toString(36).substring(7)}` })));
    }
  };
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [customLoopCount, setCustomLoopCount] = useState(0); // 0, 1, 2
  const [isShuffle, setIsShuffle] = useState(false);

  // UI State
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [lyrics, setLyrics] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  // Preferences State
  const [preferences, setPreferences] = useState({
    highQualityAudio: true,
    dataSaver: false,
    animations: true,
    autoplay: true
  });

  const updatePreference = (key, value) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, [key]: value };
      localStorage.setItem('tremble_preferences', JSON.stringify(newPrefs));
      return newPrefs;
    });
  };

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const pauseOnLoad = useRef(false);

  // Listening time tracking for 30s criteria
  const activeListeningTrackRef = useRef(null);
  const accumulatedListeningSecRef = useRef(0);
  const lastListeningTickRef = useRef(null);

  const toggleNowPlaying = () => setIsNowPlayingOpen(!isNowPlayingOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Playback Controls
  const togglePlay = () => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  };

  const isFetchingRadioRef = useRef(false);
  const lastRadioFetchTimeRef = useRef(0);

  const fetchMoreRadio = async () => {
    if (queue.length === 0) return;
    const lastTrack = queue[queue.length - 1];
    if (!lastTrack?.youtube_id) return;

    // Cooldown check (minimum 5s between calls) to prevent spamming failed fetches
    const now = Date.now();
    if (now - lastRadioFetchTimeRef.current < 5000) return;
    lastRadioFetchTimeRef.current = now;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      isFetchingRadioRef.current = true;
      const res = await fetch(`${API_URL}/watch/${lastTrack.youtube_id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 1) {
        const newTracks = data.tracks.slice(1, 30).map((t, idx) => {
          const thumbs = t.thumbnails || t.thumbnail || [];
          const cover = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : '';
          return {
            id: `radio-${Date.now()}-${idx}`,
            youtube_id: t.videoId,
            type: 'song',
            title: t.title,
            artist_name: t.artists ? t.artists.map(a => a.name).join(', ') : 'Unknown Artist',
            artist: t.artists ? t.artists.map(a => a.name).join(', ') : 'Unknown Artist',
            album: t.album ? t.album.name : 'Single',
            duration: t.length || '0:00',
            cover_url: cover,
            thumb_url: cover
          };
        }).filter(t => t.youtube_id);
        
        if (newTracks.length > 0) {
          setQueue(prev => {
             const existingIds = new Set(prev.map(t => t.youtube_id || t.id));
             const existingTitles = new Set(prev.map(t => (t.title || '').toLowerCase()));
             const uniqueNew = newTracks.filter(t => !existingIds.has(t.youtube_id) && !existingIds.has(t.id) && !existingTitles.has((t.title || '').toLowerCase()));
             return [...prev, ...uniqueNew];
          });
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn("Auto-play radio fetch unavailable:", e.message);
      }
    } finally {
      clearTimeout(timeoutId);
      isFetchingRadioRef.current = false;
    }
  };

  useEffect(() => {
    if (queue.length > 0 && queue.length - currentIndex - 1 < 15 && !isFetchingRadioRef.current) {
      fetchMoreRadio();
    }
  }, [currentIndex, queue.length]);

  const playNext = async () => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      // Stop playback and focus first song if auto-play fails or queue ends
      pauseOnLoad.current = true;
      setCurrentIndex(0);
      loadTrackIntoContext(queue[0]);
      return;
    }
    
    setCurrentIndex(nextIndex);
    const nextTrack = queue[nextIndex];
    
    // Decrement loop count if we are playing a loop copy
    if (nextTrack.isCustomLoop) {
       setCustomLoopCount(prev => Math.max(0, prev - 1));
    } else {
       setCustomLoopCount(0); // Reset if user skipped past loops
    }

    loadTrackIntoContext(nextTrack);
    
    // Imperatively load and play next track to bypass React state delays and background tab throttling
    if (playerRef.current && nextTrack?.youtube_id) {
       playerRef.current.loadVideoById(nextTrack.youtube_id);
    }
  };

  const playPrev = () => {
    if (currentTime > 3) {
      seekTo(0);
      playerRef.current?.playVideo();
      return;
    }
    if (currentIndex > 0) {
      setCustomLoopCount(0);
      setQueue(q => {
        const oldTrack = q[currentIndex];
        return q.filter((t, i) => {
          if (i <= currentIndex - 1) return true;
          if (t.isCustomLoop && (t.youtube_id || t.id) === (oldTrack?.youtube_id || oldTrack?.id)) return false;
          return true;
        });
      });
      setCurrentIndex(currentIndex - 1);
      const prevTrack = queue[currentIndex - 1];
      loadTrackIntoContext(prevTrack);
      if (playerRef.current && prevTrack?.youtube_id) {
        playerRef.current.loadVideoById(prevTrack.youtube_id);
      }
    }
  };

  const playTrackFromQueue = (indexOffset) => {
    const actualIndex = currentIndex + 1 + indexOffset;
    if (actualIndex >= queue.length) return;
    
    setCustomLoopCount(0);
    
    setQueue(q => {
      const newQueue = [...q];
      const [clickedTrack] = newQueue.splice(actualIndex, 1);
      const oldTrack = newQueue[currentIndex];
      
      const cleanedQueue = newQueue.filter((t, i) => {
        if (i <= currentIndex) return true;
        if (t.isCustomLoop && (t.youtube_id || t.id) === (oldTrack?.youtube_id || oldTrack?.id)) return false;
        return true;
      });
      
      // Discard current track: remove it from queue at currentIndex
      cleanedQueue.splice(currentIndex, 1, clickedTrack);
      
      // Load and play immediately
      loadTrackIntoContext(clickedTrack);
      if (playerRef.current && clickedTrack?.youtube_id) {
         playerRef.current.loadVideoById(clickedTrack.youtube_id);
      }
      return cleanedQueue;
    });
  };

  const seekTo = (seconds) => {
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(seconds, true);
      } catch (e) {}
    }
    setCurrentTime(seconds);
  };

  // User & Auth State
  const [user, setUser] = useState(null);

  // Likes State
  const [likedSongs, setLikedSongs] = useState([]);

  const cleanCorruptedPlaylists = (playlistsList) => {
    if (!playlistsList || playlistsList.length === 0) return [];
    const titleMap = new Map();
    playlistsList.forEach(p => {
      if (!p || !p.title) return;
      const key = p.title.trim().toLowerCase();
      if (!titleMap.has(key)) {
        titleMap.set(key, p);
      } else {
        const existing = titleMap.get(key);
        if ((p.tracks?.length || 0) >= (existing.tracks?.length || 0)) {
          titleMap.set(key, p);
        }
      }
    });
    return Array.from(titleMap.values());
  };

  const fetchPlaylists = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/playlists/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(p => ({
          ...p,
          cover_url: p.cover_url || (p.tracks && p.tracks.length > 0 ? (p.tracks[0].cover_url || "/images/tremlist_static.jpeg") : "/images/tremlist_static.jpeg"),
          type: 'playlist'
        }));
        const cleaned = cleanCorruptedPlaylists(mapped);
        setPlaylists(cleaned);
        localStorage.setItem('tremble_playlists', JSON.stringify(cleaned));
      }
    } catch (e) {
      console.warn("Could not connect to backend for playlists:", e.message);
      try {
        const storedPlaylists = localStorage.getItem('tremble_playlists');
        if (storedPlaylists) {
          setPlaylists(cleanCorruptedPlaylists(JSON.parse(storedPlaylists)));
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } else {
        const storedPlaylists = localStorage.getItem('tremble_playlists');
        if (storedPlaylists) {
          const parsedPlaylists = JSON.parse(storedPlaylists);
          const validPlaylists = parsedPlaylists.filter(p => p.tracks && p.tracks.length > 0);
          const cleaned = cleanCorruptedPlaylists(validPlaylists);
          setPlaylists(cleaned);
          if (cleaned.length !== parsedPlaylists.length) {
             localStorage.setItem('tremble_playlists', JSON.stringify(cleaned));
          }
        }
      }
      
      const storedPrefs = localStorage.getItem('tremble_preferences');
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchLikedSongs(user.id);
      fetchPlaylists(user.id);
      fetchHistory(user.id);
    }
  }, [user]);

  const fetchLikedSongs = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/liked-songs/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLikedSongs(data);
      }
    } catch (e) {
      console.warn("Could not fetch liked songs from backend:", e.message);
    }
  };

  const toggleLike = async (track) => {
    if (!track) return;
    
    const trackId = track.id || track.youtube_id;
    const isLiked = likedSongs.some((t) => (t.id || t.youtube_id) === trackId);
    
    setLikedSongs((prev) => {
      if (isLiked) {
        return prev.filter((t) => (t.id || t.youtube_id) !== trackId);
      }
      return [...prev, track];
    });

    if (user) {
      try {
        if (isLiked) {
           await fetch(`${API_URL}/api/liked-songs/${user.id}/${trackId}`, {
             method: 'DELETE'
           });
        } else {
           await fetch(`${API_URL}/api/liked-songs`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ user_id: user.id, track_data: track })
           });
        }
      } catch (e) {
         console.error("Failed to sync liked song with backend", e);
      }
    }
  };

  const savePlaylist = async (playlist) => {
    setPlaylists(prev => {
      let updated;
      if (!playlist.tracks || playlist.tracks.length === 0) {
        updated = prev.filter(p => p.id?.toString() !== playlist.id?.toString() && p.title?.toLowerCase() !== playlist.title?.toLowerCase());
      } else {
        const index = prev.findIndex(p => p.id?.toString() === playlist.id?.toString() || (p.title && p.title.toLowerCase() === playlist.title.toLowerCase()));
        const playlistToSave = {
          ...playlist,
          cover_url: playlist.cover_url || (playlist.tracks && playlist.tracks.length > 0 ? (playlist.tracks[0].cover_url || "/images/tremlist_static.jpeg") : "/images/tremlist_static.jpeg")
        };
        if (index >= 0) {
          updated = [...prev];
          updated[index] = playlistToSave;
        } else {
          updated = [playlistToSave, ...prev];
        }
      }
      const cleaned = cleanCorruptedPlaylists(updated);
      localStorage.setItem('tremble_playlists', JSON.stringify(cleaned));
      return cleaned;
    });

    if (user && playlist.tracks && playlist.tracks.length > 0) {
      try {
        const isLocal = playlist.id && playlist.id.toString().startsWith('local_tremlist_');
        const payload = {
          user_id: user.id,
          title: playlist.title,
          tracks: playlist.tracks || []
        };
        if (!isLocal && !isNaN(parseInt(playlist.id))) {
          payload.id = parseInt(playlist.id);
        }

        const res = await fetch(`${API_URL}/api/playlists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          const dbId = data.id;
          if (dbId) {
            setPlaylists(prev => {
              const updated = prev.map(p => {
                if (p.id === playlist.id || (p.title && p.title.toLowerCase() === playlist.title.toLowerCase())) {
                  return { ...p, id: dbId };
                }
                return p;
              });
              const cleaned = cleanCorruptedPlaylists(updated);
              localStorage.setItem('tremble_playlists', JSON.stringify(cleaned));
              return cleaned;
            });
            return dbId;
          }
        }
      } catch (e) {
        console.error("Failed to save playlist to backend", e);
      }
    }
  };

  const deletePlaylist = async (playlistId) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id.toString() !== playlistId.toString());
      localStorage.setItem('tremble_playlists', JSON.stringify(updated));
      return updated;
    });

    if (user && !playlistId.toString().startsWith('local_tremlist_')) {
      try {
        await fetch(`${API_URL}/api/playlists/${playlistId}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("Failed to delete playlist from backend", e);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setLikedSongs([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Initialization
  useEffect(() => {
    if (!hasBooted) {
      setHasBooted(true);
    }
  }, [hasBooted]);

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    playerRef.current?.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      playerRef.current?.unMute();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      playerRef.current?.unMute();
      setIsMuted(false);
    } else {
      playerRef.current?.mute();
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  
  const toggleRepeat = () => {
    setCustomLoopCount((prev) => {
      const next = (prev + 1) % 3;
      
      if (next > prev && currentTrack) {
        setQueue(q => {
          let currentLoops = 0;
          let insertAt = currentIndex + 1;
          while (insertAt < q.length && q[insertAt].isCustomLoop && (q[insertAt].youtube_id || q[insertAt].id) === (currentTrack.youtube_id || currentTrack.id)) {
            currentLoops++;
            insertAt++;
          }
          
          if (currentLoops >= next) {
            return q; // Prevent StrictMode double-addition
          }
          
          const loopTrack = {
            ...currentTrack,
            isCustomLoop: true,
            queue_id: `loop-${Date.now()}-${Math.random()}`
          };
          const newQueue = [...q];
          newQueue.splice(insertAt, 0, loopTrack);
          return newQueue;
        });
      } else if (next === 0 && currentTrack) {
        // Remove loop copies
        setQueue(q => q.filter((t, i) => {
          if (i <= currentIndex) return true;
          if (t.isCustomLoop && (t.youtube_id || t.id) === (currentTrack.youtube_id || currentTrack.id)) return false;
          return true;
        }));
      }
      return next;
    });
  };

  const [recentTracks, setRecentTracks] = useState([]);
  const [prefetchedSimilar, setPrefetchedSimilar] = useState(null);

  const [playStats, setPlayStats] = useState({
    totalPlays: 0,
    songPlays: {},
    artistPlays: {},
    albumPlays: {}
  });

  const sanitizeHistoryTrack = (t) => {
    if (!t) return t;
    const vid = t.youtube_id || t.id || t.videoId;
    let cover = t.cover_url || t.thumb_url || (t.thumbnails?.[t.thumbnails.length - 1]?.url) || (t.thumbnails?.[0]?.url);
    if (!cover && vid) {
      cover = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
    }
    return {
      ...t,
      youtube_id: vid,
      id: t.id || vid,
      title: t.title || t.name || 'Unknown Title',
      artist_name: t.artist_name || t.artist?.name || t.artist || t.author?.name || 'Unknown Artist',
      artist: t.artist_name || t.artist?.name || t.artist || t.author?.name || 'Unknown Artist',
      artist_id: t.artist_id || t.artist?.id || null,
      album: t.album?.name || t.album || 'Single',
      album_id: t.album_id || t.album?.id || null,
      cover_url: cover,
      thumb_url: t.thumb_url || cover
    };
  };

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('tremble_history');
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        const healed = parsed.map(sanitizeHistoryTrack);
        setRecentTracks(healed);
        localStorage.setItem('tremble_history', JSON.stringify(healed));
      }
      const storedStats = localStorage.getItem('tremble_play_stats');
      if (storedStats) {
        setPlayStats(JSON.parse(storedStats));
      }
    } catch (e) {}
  }, []);

  const recordTrackPlay = (track) => {
    if (!track) return;
    const sanitized = sanitizeHistoryTrack(track);
    const trackId = sanitized.youtube_id || sanitized.id;
    if (!trackId) return;

    setPlayStats(prev => {
      const totalPlays = (prev.totalPlays || 0) + 1;
      const songPlays = { ...(prev.songPlays || {}) };
      const currentSongStat = songPlays[trackId] || { track: sanitized, count: 0, lastPlayed: Date.now() };
      songPlays[trackId] = {
        track: sanitized,
        count: (currentSongStat.count || 0) + 1,
        lastPlayed: Date.now()
      };

      const artistPlays = { ...(prev.artistPlays || {}) };
      const artName = sanitized.artist_name || sanitized.artist || 'Unknown Artist';
      if (artName && artName !== 'Unknown Artist') {
        const artStat = artistPlays[artName] || {
          id: sanitized.artist_id || trackId,
          youtube_id: sanitized.artist_id || trackId,
          name: artName,
          title: artName,
          type: 'artist',
          cover_url: sanitized.cover_url || '',
          count: 0
        };
        artistPlays[artName] = {
          ...artStat,
          id: sanitized.artist_id || artStat.id,
          youtube_id: sanitized.artist_id || artStat.youtube_id,
          cover_url: artStat.cover_url || sanitized.cover_url || '',
          count: (artStat.count || 0) + 1
        };
      }

      const albumPlays = { ...(prev.albumPlays || {}) };
      const albName = typeof sanitized.album === 'string' ? sanitized.album : sanitized.album?.name;
      if (albName && albName !== 'Single') {
        const albKey = sanitized.album_id || albName;
        const albStat = albumPlays[albKey] || {
          id: sanitized.album_id || albKey,
          youtube_id: sanitized.album_id || albKey,
          title: albName,
          artist: artName,
          type: 'album',
          cover_url: sanitized.cover_url || '',
          count: 0
        };
        albumPlays[albKey] = {
          ...albStat,
          id: sanitized.album_id || albStat.id,
          youtube_id: sanitized.album_id || albStat.youtube_id,
          cover_url: albStat.cover_url || sanitized.cover_url || '',
          count: (albStat.count || 0) + 1
        };
      }

      const nextStats = { totalPlays, songPlays, artistPlays, albumPlays };
      localStorage.setItem('tremble_play_stats', JSON.stringify(nextStats));
      return nextStats;
    });

    // Update recent tracks
    setRecentTracks(prev => {
      const filtered = prev.filter(t => (t.youtube_id || t.id) !== trackId);
      const updated = [sanitized, ...filtered].slice(0, 50);
      localStorage.setItem('tremble_history', JSON.stringify(updated));
      return updated;
    });

    if (user) {
      try {
        fetch(`${API_URL}/api/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, track_data: sanitized })
        }).catch(e => console.warn("Could not sync history to backend:", e.message));
      } catch (e) {}
    }
  };

  const fetchHistory = async (userId) => {
    try {
      const [histRes, statsRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/history/${userId}`),
        fetch(`${API_URL}/api/user-stats/${userId}`)
      ]);
      if (histRes.status === 'fulfilled' && histRes.value.ok) {
        const data = await histRes.value.json();
        const deduplicated = [];
        const seen = new Set();
        data.forEach(raw => {
          const t = sanitizeHistoryTrack(raw);
          const tid = t.youtube_id || t.id;
          if (tid && !seen.has(tid)) {
            seen.add(tid);
            deduplicated.push(t);
          }
        });
        setRecentTracks(deduplicated);
        localStorage.setItem('tremble_history', JSON.stringify(deduplicated));
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const stats = await statsRes.value.json();
        if (stats && stats.total_plays > 0) {
          setPlayStats(prev => {
            const songPlays = { ...(prev.songPlays || {}) };
            (stats.most_listened_songs || []).forEach(t => {
              const sanitized = sanitizeHistoryTrack(t);
              const tid = sanitized.youtube_id || sanitized.id;
              if (tid) {
                songPlays[tid] = {
                  track: sanitized,
                  count: Math.max(songPlays[tid]?.count || 0, t.play_count || 1),
                  lastPlayed: Date.now()
                };
              }
            });
            const artistPlays = { ...(prev.artistPlays || {}) };
            (stats.most_listened_tremblers || []).forEach(a => {
              if (a.name) {
                artistPlays[a.name] = {
                  ...(artistPlays[a.name] || {}),
                  ...a,
                  count: Math.max(artistPlays[a.name]?.count || 0, a.count || 1)
                };
              }
            });
            const albumPlays = { ...(prev.albumPlays || {}) };
            (stats.most_listened_albums || []).forEach(alb => {
              const k = alb.id || alb.title;
              if (k) {
                albumPlays[k] = {
                  ...(albumPlays[k] || {}),
                  ...alb,
                  count: Math.max(albumPlays[k]?.count || 0, alb.count || 1)
                };
              }
            });
            const merged = {
              totalPlays: Math.max(prev.totalPlays || 0, stats.total_plays || 0),
              songPlays,
              artistPlays,
              albumPlays
            };
            localStorage.setItem('tremble_play_stats', JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (e) {
      console.warn("Could not fetch history from backend:", e.message);
      try {
        const storedHistory = localStorage.getItem('tremble_history');
        if (storedHistory) {
          const parsed = JSON.parse(storedHistory);
          setRecentTracks(parsed.map(sanitizeHistoryTrack));
        }
      } catch (err) {}
    }
  };

  const commitPreviousTrackListen = () => {
    const trackToCommit = activeListeningTrackRef.current;
    const listenedSec = accumulatedListeningSecRef.current;
    if (trackToCommit && listenedSec >= 30) {
      recordTrackPlay(trackToCommit);
    }
    accumulatedListeningSecRef.current = 0;
    lastListeningTickRef.current = null;
  };

  const prefetchTremblerAvatar = async (track) => {
    if (!track) return;
    const artistName = track.artist_name || track.artist;
    if (!artistName || artistName === 'Unknown Artist') return;
    
    const primaryArtist = artistName.split(',')[0].split('&')[0].split('feat.')[0].split('ft.')[0].trim();
    if (!primaryArtist) return;

    try {
      const cleanParam = primaryArtist.toLowerCase().replace(/\s+/g, '+');
      const res = await fetch(`${API_URL}/artist/${encodeURIComponent(cleanParam)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.cover_url) {
          try {
            const cached = JSON.parse(sessionStorage.getItem('tremble_artist_avatars') || '{}');
            cached[primaryArtist.toLowerCase()] = data.cover_url;
            sessionStorage.setItem('tremble_artist_avatars', JSON.stringify(cached));
          } catch (e) {}
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    const handleUnload = () => {
      commitPreviousTrackListen();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      commitPreviousTrackListen();
    };
  }, []);

  const loadTrackIntoContext = (track) => {
    if (!track) return;

    const rawVid = track.videoId || track.youtube_id || track.id;
    let rawCover = track.thumbnails?.[track.thumbnails.length - 1]?.url || track.thumbnails?.[0]?.url || track.cover_url || track.thumb_url || '';
    if (!rawCover && rawVid) {
      rawCover = `https://i.ytimg.com/vi/${rawVid}/hqdefault.jpg`;
    }

    const mapped = {
      title: track.name || track.title,
      artist_name: track.artist?.name || track.artist_name || track.artist || track.author?.name || 'Unknown Artist',
      artist_id: track.artist_id || track.artist?.id || null,
      cover_url: rawCover,
      thumb_url: track.thumb_url || rawCover,
      youtube_id: rawVid,
      id: track.id || rawVid,
      album: typeof track.album === 'object' ? track.album?.name : (track.album || 'Single'),
      album_id: typeof track.album === 'object' ? track.album?.id : (track.album_id || null),
      duration: track.duration || track.duration_seconds || '0:00'
    };

    activeListeningTrackRef.current = mapped;
    accumulatedListeningSecRef.current = 0;
    lastListeningTickRef.current = Date.now();

    setCurrentTrack(mapped);
    setLyrics(null);

    // Record track play in state, local storage, and database immediately
    recordTrackPlay(mapped);

    // Proactively fetch Trembler profile image right away
    prefetchTremblerAvatar(mapped);
  };

  useEffect(() => {
    if (currentTrack?.youtube_id) {
      getLyrics(currentTrack.youtube_id, currentTrack.title, currentTrack.artist_name || currentTrack.artist)
        .then(data => setLyrics(data.lyrics || "[00:00.00] Lyrics not available"))
        .catch(() => setLyrics("[00:00.00] Lyrics not available"));
        
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist_name || currentTrack.artist || 'Unknown Artist',
          album: currentTrack.album || 'Single',
          artwork: [
            { src: currentTrack.cover_url || '/images/logo.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }
    } else {
      setLyrics("[00:00.00] Lyrics not available");
    }
  }, [currentTrack?.youtube_id, currentTrack?.title, currentTrack?.artist_name]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
  }, [togglePlay, playPrev, playNext]);

  // Background prefetch similar songs for currentTrack without blocking or causing stutter
  // Excludes songs in the last 20 recently played songs to prevent repetitive tracks on Home page
  useEffect(() => {
    if (!currentTrack) return;
    const seedId = currentTrack.youtube_id || currentTrack.id;
    if (!seedId) return;

    let isCancelled = false;

    const prefetchSimilarSongs = async () => {
      try {
        const recent20 = (recentTracks || []).slice(0, 20);
        const excludeIds = new Set(recent20.map(t => t.youtube_id || t.id).filter(Boolean));
        excludeIds.add(seedId);

        const excludeTitles = new Set(recent20.map(t => (t.title || '').toLowerCase().trim()).filter(Boolean));
        if (currentTrack.title) {
          excludeTitles.add(currentTrack.title.toLowerCase().trim());
        }

        const res = await fetch(`${API_URL}/watch/${seedId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (isCancelled) return;

        const candidateTracks = data.tracks || [];
        const filtered = [];
        const seen = new Set();

        for (const t of candidateTracks) {
          const tid = t.videoId || t.id || t.youtube_id;
          const title = (t.title || '').trim();
          const normTitle = title.toLowerCase();

          if (!tid || tid === seedId || excludeIds.has(tid) || seen.has(tid)) continue;
          if (excludeTitles.has(normTitle)) continue;

          seen.add(tid);
          const thumbs = t.thumbnails || t.thumbnail || [];
          filtered.push({
            id: tid,
            youtube_id: tid,
            type: 'song',
            title: title,
            artist: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist || ''),
            artist_name: t.artists ? t.artists.map(a => a.name).join(', ') : (t.artist || ''),
            cover_url: (thumbs.length > 0) ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${tid}/hqdefault.jpg`
          });

          if (filtered.length >= 15) break;
        }

        // Only push when all songs are ready and fully verified
        if (!isCancelled && filtered.length > 0) {
          const payload = {
            seedId,
            seedTitle: currentTrack.title || 'Current Song',
            tracks: filtered
          };
          setPrefetchedSimilar(payload);
          try {
            sessionStorage.setItem('tremble_cached_similar', JSON.stringify(payload));
          } catch (e) {}
        }
      } catch (err) {
        console.warn("Background prefetching similar songs error:", err);
      }
    };

    prefetchSimilarSongs();

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.youtube_id, currentTrack?.id, recentTracks]);

  // YouTube Event Handlers
  const onReady = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    if (isMuted) playerRef.current.mute();
    event.target.playVideo();
  };

  const onStateChange = (event) => {
    // 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) {
      if (pauseOnLoad.current) {
        playerRef.current.pauseVideo();
        pauseOnLoad.current = false;
        setIsPlaying(false);
        lastListeningTickRef.current = null;
        return;
      }
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      lastListeningTickRef.current = Date.now();
      
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        if (playerRef.current) {
          const time = await playerRef.current.getCurrentTime();
          setCurrentTime(time);

          // Accumulate listening seconds while actively playing
          const now = Date.now();
          if (lastListeningTickRef.current) {
            const deltaSec = (now - lastListeningTickRef.current) / 1000;
            if (deltaSec > 0 && deltaSec < 2) {
              accumulatedListeningSecRef.current += deltaSec;
            }
          }
          lastListeningTickRef.current = now;
        }
      }, 250);
    } else {
      setIsPlaying(false);
      lastListeningTickRef.current = null;
      clearInterval(intervalRef.current);
      if (event.data === 0) {
        playNext();
      }
    }
  };

  const fillQueueWithSimilar = async (track) => {
    if (!track || !track.youtube_id) return;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${API_URL}/watch/${track.youtube_id}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.tracks && data.tracks.length > 0) {
        const mappedTracks = data.tracks.map(t => ({
          title: t.title,
          artist_name: t.artists ? t.artists.map(a => a.name).join(', ') : 'Unknown Artist',
          cover_url: t.thumbnail && t.thumbnail.length > 0 ? t.thumbnail[t.thumbnail.length - 1].url : '',
          thumb_url: t.thumbnail && t.thumbnail.length > 0 ? t.thumbnail[0].url : '',
          youtube_id: t.videoId,
          duration: t.length || '0:00',
          type: 'song'
        }));
        
        const filteredTracks = mappedTracks.filter(t => t.youtube_id !== track.youtube_id);
        
        // Keep the current track at index 0, and append the related tracks
        setQueue([track, ...filteredTracks.slice(0, 15)]);
        setCurrentIndex(0);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn("Could not fill queue with similar tracks:", err.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const ytOpts = useMemo(() => ({
    height: '200',
    width: '200',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      enablejsapi: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      vq: 'tiny' // Use lowest quality to save bandwidth since it's only audio
    },
  }), []);

  // Web Audio Silent Keep-Alive to prevent browser background tab suspension & Alt-tab pauses
  const audioKeepAliveRef = useRef(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (!audioKeepAliveRef.current) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            gain.gain.value = 0.00001; // Inaudible keep-alive signal
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            audioKeepAliveRef.current = { ctx, osc, gain };
          } else if (audioKeepAliveRef.current.ctx?.state === 'suspended') {
            audioKeepAliveRef.current.ctx.resume();
          }
        }
      } catch (e) {
        console.warn("Audio keep-alive note:", e);
      }
    } else {
      if (audioKeepAliveRef.current?.ctx && audioKeepAliveRef.current.ctx.state === 'running') {
        audioKeepAliveRef.current.ctx.suspend();
      }
    }
  }, [isPlaying]);

  // Ensure continuous background playback when switching tabs or Alt-tabbing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (isPlaying && playerRef.current) {
          try {
            const state = playerRef.current.getPlayerState?.();
            if (state === 2) {
              playerRef.current.playVideo();
            }
          } catch (e) {}
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Global Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playPrev();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setIsNowPlayingOpen(true);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setIsNowPlayingOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNext, playPrev, setIsNowPlayingOpen]);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      setCurrentTrack,
      isPlaying,
      togglePlay,
      currentTime,
      duration,
      seekTo,
      volume,
      handleVolumeChange,
      isMuted,
      toggleMute,
      queue,
      setQueue,
      currentIndex,
      setCurrentIndex,
      playNext,
      playPrev,
      isShuffle,
      toggleShuffle,
      customLoopCount,
      toggleRepeat,
      playTrackFromQueue,
      isNowPlayingOpen,
      toggleNowPlaying,
      setIsNowPlayingOpen,
      isQueueVisible,
      setIsQueueVisible,
      isSidebarOpen,
      toggleSidebar,
      recentTracks,
      hasBooted,
      setHasBooted,
      lyrics,
      setLyrics,
      loadTrackIntoContext,
      likedSongs,
      toggleLike,
      user,
      setUser,
      logout,
      playlists,
      savePlaylist,
      deletePlaylist,
      recentTracks,
      playStats,
      recordTrackPlay,
      totalPlays: playStats.totalPlays || 0,
      preferences,
      updatePreference,
      fillQueueWithSimilar,
      prefetchedSimilar
    }}>
      {children}
      
      {/* Background-safe YouTube Player Engine */}
      <div 
        aria-hidden="true"
        className="fixed bottom-0 right-0 w-[200px] h-[200px] pointer-events-none opacity-[0.001] -z-50 overflow-hidden"
        style={{ transform: 'translateZ(0)' }}
      >
        {currentTrack?.youtube_id && (
          <YouTube 
            videoId={currentTrack.youtube_id} 
            opts={ytOpts} 
            onReady={onReady}
            onStateChange={onStateChange}
            onError={(e) => {
               console.error("YouTube Player Error", e);
               playNext(); 
            }}
          />
        )}
      </div>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
