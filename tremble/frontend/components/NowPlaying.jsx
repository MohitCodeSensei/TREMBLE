"use client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function NowPlaying() {
  const { track, showNowPlaying, setShowNowPlaying, isPlaying } = usePlayer();
  const [activeLine, setActiveLine] = useState(0);

  // Auto-scroll lyrics while song "plays"
  useEffect(() => {
    if (!isPlaying || !showNowPlaying) return;
    const t = setInterval(
      () => setActiveLine((l) => (l + 1) % track.lyrics.length),
      3000
    );
    return () => clearInterval(t);
  }, [isPlaying, showNowPlaying, track.lyrics.length]);

  if (!showNowPlaying) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col animate-float-up">
      {/* Dynamic animated mesh background */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <button onClick={() => setShowNowPlaying(false)}
              className="glass-btn w-11 h-11 absolute top-6 right-6 z-10">
        <X size={20} />
      </button>

      <div className="flex-1 grid md:grid-cols-2 gap-8 p-8 md:p-16 items-center">
        {/* LEFT — large album cover */}
        <div className="flex justify-center">
          <img src={track.cover} alt={track.title}
               className="w-full max-w-md aspect-square object-cover rounded-3xl
                          shadow-glow border border-white/15" />
        </div>

        {/* RIGHT — scrolling lyrics */}
        <div className="glass-strong h-[70vh] p-8 overflow-y-auto flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold">{track.title}</h2>
            <p className="text-white/50">{track.artist}</p>
          </div>
          <div className="space-y-6">
            {track.lyrics.map((line, i) => (
              <p key={i} className={`lyric-line ${i === activeLine ? "active" : ""}`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
