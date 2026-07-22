"use client";
import React from 'react';
import { Github } from 'lucide-react';

export default function AboutPage() {
  const contributors = [
    { name: 'Mohitcodesensei', url: 'https://github.com/mohitcodesensei' },
    { name: 'Shivam254-xyz', url: 'https://github.com/shivam254-xyz' },
    { name: 'Pranitdhumal1436-gif', url: 'https://github.com/pranitdhumal1436-gif' },
    { name: 'Varunsargam', url: 'https://github.com/varunsargam' },
    { name: 'Connectwithaadit', url: 'https://github.com/connectwithaadit' }
  ];

  return (
    <div className="p-12 space-y-16 flex flex-col items-center max-w-5xl mx-auto text-center mt-10">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-black text-white mb-6 tracking-tight">About TREMBLE</h1>
        <div className="text-zinc-400 max-w-3xl text-lg leading-relaxed">
          TREMBLE is a premium music streaming experience designed for audiophiles.
          We focus on high-quality audio, minimal design, and a seamless user interface. 
          Built with cutting-edge web technologies, TREMBLE provides a fluid, immersive, and visually stunning way to experience your favorite music.
        </div>
      </div>

      <div className="w-full">
        <h2 className="text-2xl font-bold text-white mb-8">Contributors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributors.map((contributor) => (
            <a
              key={contributor.name}
              href={contributor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800/80 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group shadow-lg text-left"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-zinc-800 flex-shrink-0 border border-white/10 group-hover:border-indigo-400 transition-colors">
                <img src={`${contributor.url}.png`} alt={contributor.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold group-hover:text-indigo-400 transition-colors">{contributor.name}</span>
                <span className="text-zinc-500 text-sm">GitHub Profile</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
