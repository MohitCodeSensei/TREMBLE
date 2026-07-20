"use client";
import React, { useState } from 'react';
import { Search, Upload } from 'lucide-react';

const TopBar = () => {
  const [query, setQuery] = useState('');
  const userRole = 'artist'; // Mock role for now

  return (
    <header className="fixed top-0 right-0 left-0 h-20 px-8 flex items-center justify-between z-30 pointer-events-none">
      <div className="flex-1 max-w-2xl pointer-events-auto">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-black border border-zinc-800 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:ring-2 ring-zinc-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pointer-events-auto">
        {userRole === 'artist' && (
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition-all">
            <Upload size={18} />
            <span>Upload</span>
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 cursor-pointer" />
      </div>
    </header>
  );
};

export default TopBar;
