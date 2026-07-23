"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import GenreCard from '../../components/GenreCard';
import { getGenres } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { Heart, Music2, FolderHeart } from 'lucide-react';

export default function LibraryPage() {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { likedSongs, user, togglePlay, setQueue, loadTrackIntoContext } = usePlayer();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        let parsed = [];
        if (typeof data === 'object' && !Array.isArray(data)) {
          for (const key in data) {
            parsed = parsed.concat(data[key]);
          }
        } else if (Array.isArray(data)) {
          parsed = data;
        }
        setGenres(parsed);
      } catch (e) {
        console.error("Failed to fetch genres", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenres();
  }, []);

  return (
    <div className="p-8 pb-32 font-sans transition-all duration-1000 ease-out animate-in fade-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight">Your Library</h1>
      </div>

      {/* Liked Songs Folder */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Playlists</h2>
        <Link href="/library/liked" className="block w-full max-w-sm">
          <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden group cursor-pointer shadow-xl transition-all duration-300 hover:shadow-indigo-500/20">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out" />
            
            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <FolderHeart size={32} className="text-white drop-shadow-md" />
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Heart size={20} fill="currentColor" className="text-white" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-md">Liked Songs</h3>
                <p className="text-indigo-100 font-medium flex items-center gap-2 drop-shadow-sm">
                  <Music2 size={14} />
                  {user ? `${likedSongs.length} saved tracks` : 'Log in to save tracks'}
                </p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Dynamic Genres */}
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Explore Genres</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
           <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {genres.map((genre, idx) => (
            <GenreCard key={idx} title={genre.title} params={genre.params} imageUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop" />
          ))}
        </div>
      )}
    </div>
  );
}
