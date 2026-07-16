"use client";
import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
  // Mock auth — swap with real JWT decode later. Set role:'artist' to see Upload btn.
  const [user] = useState({ username: "guest", role: "artist" });

  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [track] = useState({
    title: "Midnight Echoes",
    artist: "Aurora Skye",
    cover: "https://picsum.photos/seed/tremble/800",
    lyrics: [
      "In the silence of the night",
      "I can hear your heartbeat rise",
      "Echoes falling from the sky",
      "Painting colors in my eyes",
      "We are chasing endless light",
      "Dancing till the morning time",
      "Every whisper, every sign",
      "Tells me that you're mine tonight",
    ],
  });

  return (
    <PlayerContext.Provider
      value={{
        user, track,
        isPlaying, setIsPlaying,
        shuffle, setShuffle,
        repeat, setRepeat,
        liked, setLiked,
        showNowPlaying, setShowNowPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
