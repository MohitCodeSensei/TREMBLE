"use client";
import React from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { usePlayer } from '../../context/PlayerContext';
import { allMockTracks } from '../../utils/mockData';

const HotAndNew = () => {
  const { setCurrentTrack, setIsNowPlayingOpen, setIsPlaying } = usePlayer();

  const handleTrackClick = (track) => {
    setCurrentTrack(track);
    setIsNowPlayingOpen(true);
    setIsPlaying(true);
  };

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'Hot & New', path: '/hot-new' },
    { name: 'Editor\'s Picks', path: '/editors-picks' },
    { name: 'AOTY', path: '/aoty' },
    { name: 'Recommended Songs', path: '/recommended-songs' }
  ];

  return (
    <div className="p-8 space-y-12">
      <div className="flex items-center gap-8 border-b border-zinc-800 pb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            href={tab.path}
            className={`text-lg font-bold drop-shadow-lg transition-all whitespace-nowrap ${tab.name === 'Hot & New' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Hot & New Releases</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {allMockTracks.slice().reverse().map((item) => (
            <div onClick={() => handleTrackClick(item)} key={item.id} className="group cursor-pointer bg-zinc-900/40 hover:bg-zinc-800/60 p-4 rounded-2xl transition-colors duration-300">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={24} fill="black" className="text-black ml-1" />
                  </div>
                </div>
              </div>
              <div className="text-white font-bold text-base truncate">{item.title}</div>
              <div className="text-zinc-400 text-sm truncate mt-1">{item.artist_name}</div>
            </div>
          ))}
        </div>
      </section>
      
      <div className="h-20"></div>
    </div>
  );
};

export default HotAndNew;
