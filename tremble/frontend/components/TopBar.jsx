"use client";
import { Menu, Search, Upload } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export default function TopBar({ onMenu }) {
  const { user } = usePlayer();
  const isArtist = user?.role === "artist";

  return (
    <header className="glass sticky top-0 z-30 mx-4 mt-4 px-4 py-3 flex items-center gap-3">
      <button className="glass-btn w-10 h-10" onClick={onMenu} aria-label="Menu">
        <Menu size={20} />
      </button>

      <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10
                      rounded-full px-4 py-2">
        <Search size={18} className="text-white/50" />
        <input
          placeholder="Search songs, artists… (YouTube Music)"
          className="bg-transparent outline-none w-full text-sm placeholder:text-white/40"
        />
      </div>

      {/* Upload — only visible for Artist role */}
      {isArtist && (
        <button className="glass-btn px-4 h-10 gap-2 !rounded-full
                           bg-gradient-to-r from-tremble-violet to-tremble-magenta
                           text-sm font-semibold flex">
          <Upload size={18} /> Upload
        </button>
      )}
    </header>
  );
}
