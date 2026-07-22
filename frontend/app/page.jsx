"use client";
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Link from 'next/link';
import { usePlayer } from '../context/PlayerContext';
import GenreCard from '../components/GenreCard';

const Home = () => {
  const { hasBooted, setCurrentTrack, setIsNowPlayingOpen, setIsPlaying } = usePlayer();
  const [animateEntrance, setAnimateEntrance] = useState(false);

  useEffect(() => {
    if (hasBooted) {
      setAnimateEntrance(true);
    }
  }, [hasBooted]);

  const handleTrackClick = (track) => {
    setCurrentTrack(track);
    setIsNowPlayingOpen(true);
    setIsPlaying(true);
  };

  const recommendedSongs = [
    { id: 1, title: 'Starboy', artist_name: 'The Weeknd', cover_url: '/images/albums/starboy.jpg', color: '#dc2626' },
    { id: 2, title: 'Let It Happen', artist_name: 'Tame Impala', cover_url: '/images/albums/currents.jpg', color: '#9333ea' },
    { id: 3, title: 'Kiss Me More', artist_name: 'Doja Cat', cover_url: '/images/albums/planet_her.jpg', color: '#db2777' },
    { id: 4, title: 'Gods Plan', artist_name: 'Drake', cover_url: '/images/albums/scorpion.jpg', color: '#334155' },
    { id: 5, title: 'Stronger', artist_name: 'Kanye West', cover_url: '/images/albums/graduation.jpg', color: '#c026d3' },
  ];

  const recommendedAlbums = [
    { id: 6, title: 'After Hours', artist_name: 'The Weeknd', cover_url: '/images/albums/after_hours.jpg', color: '#ea580c' },
    { id: 7, title: 'The Slow Rush', artist_name: 'Tame Impala', cover_url: '/images/albums/slow_rush.jpg', color: '#0369a1' },
    { id: 8, title: 'Hot Pink', artist_name: 'Doja Cat', cover_url: '/images/albums/hot_pink.jpg', color: '#eab308' },
    { id: 9, title: 'Scorpion', artist_name: 'Drake', cover_url: '/images/albums/scorpion.jpg', color: '#334155' },
    { id: 10, title: 'Graduation', artist_name: 'Kanye West', cover_url: '/images/albums/graduation.jpg', color: '#c026d3' },
    { id: 11, title: 'Astroworld', artist_name: 'Travis Scott', cover_url: '/images/albums/astroworld.jpg', color: '#eab308' },
    { id: 12, title: 'DAMN.', artist_name: 'Kendrick Lamar', cover_url: '/images/albums/damn.jpg', color: '#dc2626' },
    { id: 13, title: 'IGOR', artist_name: 'Tyler, The Creator', cover_url: '/images/albums/igor.jpg', color: '#ec4899' },
  ];

  const genres = [
    { title: 'Pop', imageUrl: '/images/albums/planet_her.jpg' },
    { title: 'Hip-Hop', imageUrl: '/images/albums/scorpion.jpg' },
    { title: 'Electronic', imageUrl: '/images/albums/currents.jpg' },
    { title: 'R&B', imageUrl: '/images/albums/after_hours.jpg' },
    { title: 'Rap', imageUrl: '/images/albums/astroworld.jpg' },
  ];

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'Hot & New', path: '/hot-new' },
    { name: 'Editor\'s Picks', path: '/editors-picks' },
    { name: 'AOTY', path: '/aoty' },
    { name: 'Recommended Songs', path: '/recommended-songs' }
  ];

  const getEntranceClass = (index, groupDelay = 0) => {
    if (!animateEntrance) return 'opacity-0';
    return 'opacity-0 animate-[bounceUp_0.8s_cubic-bezier(0.2,0.8,0.2,1)_forwards]';
  };

  const getEntranceStyle = (index, groupDelay = 0) => {
    return animateEntrance ? { animationDelay: `${groupDelay + (index * 0.1)}s` } : {};
  };

  return (
    <div className="p-8 space-y-12">
      {/* Header Tabs */}
      <div className={`flex items-center gap-8 border-b border-zinc-800 pb-4 overflow-x-auto ${getEntranceClass(0, 0)}`} style={getEntranceStyle(0, 0)}>
        {tabs.map((tab, i) => (
          <Link
            key={tab.name}
            href={tab.path}
            className={`text-lg font-bold drop-shadow-lg transition-all whitespace-nowrap ${i === 0 ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {/* Recommended Songs */}
      <section className={getEntranceClass(0, 0.2)} style={getEntranceStyle(0, 0.2)}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Recommended Songs</h2>
          <Link href="/recommended-songs" className="text-zinc-500 hover:text-white text-xs font-medium transition-all uppercase tracking-widest">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendedSongs.map((song, idx) => (
            <div 
              onClick={() => handleTrackClick(song)} 
              key={song.id} 
              className={`group cursor-pointer bg-zinc-900/40 hover:bg-zinc-800/60 p-4 rounded-2xl transition-colors duration-300 ${getEntranceClass(idx, 0.3)}`}
              style={getEntranceStyle(idx, 0.3)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={24} fill="white" className="text-white ml-1" />
                  </div>
                </div>
              </div>
              <div className="text-white font-bold text-base truncate">{song.title}</div>
              <div className="text-zinc-400 text-sm truncate mt-1">{song.artist_name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Albums */}
      <section className={getEntranceClass(0, 0.6)} style={getEntranceStyle(0, 0.6)}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Recommended Albums</h2>
          <button className="text-zinc-500 hover:text-white text-xs font-medium transition-all uppercase tracking-widest">
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendedAlbums.map((album, idx) => (
            <div 
              onClick={() => handleTrackClick(album)} 
              key={album.id} 
              className={`group cursor-pointer bg-zinc-900/40 hover:bg-zinc-800/60 p-4 rounded-2xl transition-colors duration-300 ${getEntranceClass(idx, 0.7)}`}
              style={getEntranceStyle(idx, 0.7)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={24} fill="black" className="text-black ml-1" />
                  </div>
                </div>
              </div>
              <div className="text-white font-bold text-base truncate">{album.title}</div>
              <div className="text-zinc-400 text-sm truncate mt-1">{album.artist_name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Genres */}
      <section className={`pt-8 ${getEntranceClass(0, 1.0)}`} style={getEntranceStyle(0, 1.0)}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Explore Genres</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {genres.map((genre, idx) => (
            <div key={genre.title} className={getEntranceClass(idx, 1.1)} style={getEntranceStyle(idx, 1.1)}>
              <GenreCard title={genre.title} imageUrl={genre.imageUrl} />
            </div>
          ))}
        </div>
      </section>
      
      {/* Extra space for scrolling */}
      <div className="h-20"></div>
    </div>
  );
};

export default Home;
