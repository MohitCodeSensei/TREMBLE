"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import BottomPlayer from "../components/BottomPlayer";
import NowPlaying from "../components/NowPlaying";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const cards = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    title: ["Neon Dreams","Velvet Sky","Lost Signals","Golden Hour","Deep Blue",
            "Echo Chamber","Solar Flare","Night Drive","Paper Moon","Wildfire"][i],
    cover: `https://picsum.photos/seed/trmb${i}/400`,
  }));

  return (
    <main className="relative h-screen overflow-hidden">
      {/* Animated vibrant background */}
      <div className="mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
      </div>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <TopBar onMenu={() => setMenuOpen(true)} />

      <section className="px-4 pb-40 pt-6 h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Good evening 🎧</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.id}
                 className="glass p-3 hover:bg-white/10 transition cursor-pointer group">
              <img src={c.cover} alt=""
                   className="w-full aspect-square object-cover rounded-xl mb-3
                              group-hover:shadow-glow transition" />
              <p className="font-semibold truncate">{c.title}</p>
              <p className="text-xs text-white/50">Trending now</p>
            </div>
          ))}
        </div>
      </section>

      <BottomPlayer />
      <NowPlaying />
    </main>
  );
}
