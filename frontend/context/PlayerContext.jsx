"use client";
import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleNowPlaying = () => setIsNowPlayingOpen(!isNowPlayingOpen);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      setCurrentTrack,
      isPlaying,
      setIsPlaying,
      togglePlay,
      isNowPlayingOpen,
      setIsNowPlayingOpen,
      toggleNowPlaying,
      isSidebarOpen,
      setIsSidebarOpen,
      toggleSidebar
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
