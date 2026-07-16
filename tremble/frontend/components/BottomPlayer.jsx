"use client";
import {
  Play, Pause, Shuffle, Repeat, SkipForward, SkipBack, Heart, Download,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function BottomPlayer() {
  const {
    track, isPlaying, setIsPlaying, shuffle, setShuffle,
    repeat, setRepeat, liked, setLiked, setShowNowPlaying,
  } = usePlayer();

  return (
    <footer className="glass-strong fixed bottom-4 left-4 right-4 z-30 px-4 py-3
                       flex items-center gap-4">
      {/* Album cover → opens Now Playing */}
      <button onClick={() => setShowNowPlaying(true)}
              className="flex items-center gap-3 min-w-0 group">
        <img src={track.cover} alt=""
             className="w-14 h-14 rounded-xl object-cover shadow-glow
                        group-hover:scale-105 transition" />
        <div className="text-left min-w-0 hidden sm:block">
          <p className="font-semibold truncate">{track.title}</p>
          <p className="text-xs text-white/50 truncate">{track.artist}</p>
        </div>
      </button>

      {/* Transport controls */}
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4">
        <button className={`glass-btn w-9 h-9 ${shuffle && "text-tremble-cyan"}`}
                onClick={() => setShuffle(!shuffle)}><Shuffle size={16} /></button>
        <button className="glass-btn w-9 h-9"><SkipBack size={18} /></button>
        <button onClick={() => setIsPlaying(!isPlaying)}
                className="glass-btn w-12 h-12 bg-gradient-to-br
                           from-tremble-violet to-tremble-magenta shadow-glow">
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <button className="glass-btn w-9 h-9"><SkipForward size={18} /></button>
        <button className={`glass-btn w-9 h-9 ${repeat && "text-tremble-cyan"}`}
                onClick={() => setRepeat(!repeat)}><Repeat size={16} /></button>
      </div>

      {/* Like + Download */}
      <div className="flex items-center gap-2">
        <button className={`glass-btn w-9 h-9 ${liked && "text-tremble-pink"}`}
                onClick={() => setLiked(!liked)}>
          <Heart size={18} fill={liked ? "currentColor" : "none"} />
        </button>
        <button className="glass-btn w-9 h-9"><Download size={18} /></button>
      </div>
    </footer>
  );
}
