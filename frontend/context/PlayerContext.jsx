"use client";
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { getLyrics } from '../utils/api';

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
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0 = off, 1 = all, 2 = one

  // UI State
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasBooted, setHasBooted] = useState(false);
  const [lyrics, setLyrics] = useState(null);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

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

  const playNext = () => {
    if (queue.length === 0) return;
    if (repeatMode === 2) {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
      return;
    }
    let nextIndex = currentIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeatMode === 1) nextIndex = 0;
      else return; // end of queue
    }
    setCurrentIndex(nextIndex);
    loadTrackIntoContext(queue[nextIndex]);
  };

  const playPrev = () => {
    if (currentTime > 3) {
      playerRef.current?.seekTo(0);
      return;
    }
    if (queue.length === 0 || currentIndex <= 0) return;
    let prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    loadTrackIntoContext(queue[prevIndex]);
  };

  const seekTo = (seconds) => {
    playerRef.current?.seekTo(seconds);
    setCurrentTime(seconds);
  };

  // User & Auth State
  const [user, setUser] = useState(null);

  // Likes State
  const [likedSongs, setLikedSongs] = useState([]);

  useEffect(() => {
    // On mount, check if user is in localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        fetchLikedSongs(parsed.id);
      }
    } catch (e) {}
  }, []);

  const fetchLikedSongs = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/liked-songs/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setLikedSongs(data);
      }
    } catch (e) {
      console.error("Failed to fetch liked songs", e);
    }
  };

  const toggleLike = async (track) => {
    if (!track) return;
    
    const trackId = track.id || track.youtube_id;
    const isLiked = likedSongs.some((t) => (t.id || t.youtube_id) === trackId);
    
    // Optimistic UI update
    setLikedSongs((prev) => {
      if (isLiked) {
        return prev.filter((t) => (t.id || t.youtube_id) !== trackId);
      }
      return [...prev, track];
    });

    // Sync with backend if logged in
    if (user) {
      try {
        if (isLiked) {
           await fetch(`http://localhost:8000/api/liked-songs/${user.id}/${trackId}`, {
             method: 'DELETE'
           });
        } else {
           await fetch(`http://localhost:8000/api/liked-songs`, {
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
    setRepeatMode((prev) => (prev + 1) % 3);
  };

  const loadTrackIntoContext = (track) => {
    if (!track) return;
    setCurrentTrack({
      title: track.name || track.title,
      artist_name: track.artist?.name || track.artist_name || 'Unknown',
      cover_url: track.thumbnails?.[track.thumbnails.length - 1]?.url || track.thumbnails?.[0]?.url || track.cover_url || '',
      youtube_id: track.videoId || track.youtube_id,
      id: track.id || track.videoId || track.youtube_id
    });
    setLyrics(null);
  };

  useEffect(() => {
    if (currentTrack?.youtube_id) {
      getLyrics(currentTrack.youtube_id)
        .then(data => setLyrics(data.lyrics || "[00:00.00] Lyrics not available"))
        .catch(() => setLyrics("[00:00.00] Lyrics not available"));
    } else {
      setLyrics("[00:00.00] Lyrics not available");
    }
  }, [currentTrack?.youtube_id]);

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
      setIsPlaying(true);
      setDuration(playerRef.current.getDuration());
      
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        if (playerRef.current) {
          const time = await playerRef.current.getCurrentTime();
          setCurrentTime(time);
        }
      }, 1000);
    } else {
      setIsPlaying(false);
      clearInterval(intervalRef.current);
      if (event.data === 0) {
        playNext();
      }
    }
  };

  const ytOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      playsinline: 1,
      vq: 'hd1080'
    },
  };

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
      repeatMode,
      toggleRepeat,
      isNowPlayingOpen,
      toggleNowPlaying,
      setIsNowPlayingOpen,
      isSidebarOpen,
      toggleSidebar,
      hasBooted,
      setHasBooted,
      lyrics,
      setLyrics,
      loadTrackIntoContext,
      likedSongs,
      toggleLike,
      user,
      setUser,
      logout
    }}>
      {children}
      
      {/* Hidden YouTube Player Engine */}
      <div className="fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none">
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
