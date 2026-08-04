"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import GenreCard from '../../components/GenreCard';
import { getGenres } from '../../utils/api';
import { usePlayer } from '../../context/PlayerContext';
import { Heart, Music2, FolderHeart, Plus } from 'lucide-react';
import TremlistCard from '../../components/TremlistCard';

const DEFAULT_GENRES = [
  {"title": "Pop", "params": "pop"},
  {"title": "Hip-Hop", "params": "hiphop"},
  {"title": "Rock", "params": "rock"},
  {"title": "Electronic", "params": "electronic"},
  {"title": "R&B", "params": "rnb"},
  {"title": "Jazz", "params": "jazz"},
  {"title": "Classical", "params": "classical"},
  {"title": "Country", "params": "country"},
  {"title": "Indie", "params": "indie"},
  {"title": "K-Pop", "params": "kpop"},
  {"title": "Latin", "params": "latin"},
  {"title": "Metal", "params": "metal"},
  {"title": "Phonk", "params": "phonk"},
  {"title": "Motivation", "params": "motivation"},
  {"title": "Feel Good", "params": "feel good"},
  {"title": "Fitness", "params": "workout"}
];

export default function LibraryPage() {
  const GENRE_IMAGES = [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a1a2a44cc6e9?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1483032469466-b937c425697b?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1520166012956-add9ba0ee3f4?w=600&h=300&fit=crop",
    "https://images.unsplash.com/photo-1516280440502-1262dff9953b?w=600&h=300&fit=crop"
  ];

  const [genres, setGenres] = useState(DEFAULT_GENRES);
  const [isLoading, setIsLoading] = useState(false);
  const { likedSongs, user, togglePlay, setQueue, loadTrackIntoContext, playlists } = usePlayer();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        let parsed = [];
        if (typeof data === 'object' && !Array.isArray(data)) {
          for (const key in data) {
            parsed = parsed.concat(data[key]);
          }
        } else if (Array.isArray(data) && data.length > 0) {
          parsed = data;
        }
        if (parsed.length > 0) {
          setGenres(parsed);
        }
      } catch (e) {
        console.error("Failed to fetch genres", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGenres();
  }, []);

  const GENRE_CUSTOM_IMAGES = {
    'pop': '/images/genres/pop_genre.png',
    'hip-hop': '/images/genres/hiphop_genre.png',
    'hiphop': '/images/genres/hiphop_genre.png',
    'rock': '/images/genres/rock_genre.png',
    'electronic': '/images/genres/electronic_genre.png',
    'r&b': '/images/genres/rnb_genre.png',
    'rnb': '/images/genres/rnb_genre.png',
    'jazz': '/images/genres/jazz_genre.png',
    'classical': '/images/genres/classical_genre.png',
    'country': '/images/genres/country_genre.png',
    'indie': '/images/genres/indie_genre.png',
    'k-pop': '/images/genres/kpop_genre.png',
    'kpop': '/images/genres/kpop_genre.png',
    'latin': '/images/genres/latin_genre.png',
    'metal': '/images/genres/metal_genre.png',
    'phonk': '/images/genres/phonk_genre.png',
    'motivation': '/images/genres/motivation_genre.png',
    'feel good': '/images/genres/feel_good_genre.png',
    'feel-good': '/images/genres/feel_good_genre.png',
    'feelgood': '/images/genres/feel_good_genre.png',
    'fitness': '/images/genres/fitness_genre.png',
    'workout': '/images/genres/fitness_genre.png'
  };

  const getGenreImage = (title, idx) => {
    const key = (title || '').toLowerCase().trim();
    if (GENRE_CUSTOM_IMAGES[key]) return GENRE_CUSTOM_IMAGES[key];
    const normalizedKey = key.replace(/[^a-z0-9]/g, '');
    if (GENRE_CUSTOM_IMAGES[normalizedKey]) return GENRE_CUSTOM_IMAGES[normalizedKey];
    return GENRE_IMAGES[idx % GENRE_IMAGES.length];
  };

  return (
    <div className="p-8 pb-32 font-sans transition-all duration-1000 ease-out animate-in fade-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight">Library</h1>
      </div>

      {/* Your Tremlists Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Your Tremlists</h2>
        <div className="flex items-center gap-6 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none">
          {/* Liked Songs Tremlist Card (Rectangular) */}
          <Link href="/library/liked" className="block w-full sm:w-80 h-44 flex-shrink-0 group">
            <div className="relative w-full h-full rounded-2xl bg-zinc-950 p-6 flex flex-col justify-between border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-white/20 hover:shadow-indigo-500/10">
              <div className="relative z-10 flex items-center justify-between">
                <FolderHeart className="w-6 h-6 text-white/80 transition-colors group-hover:text-white" />
              </div>

              {/* Right Side Visual Graphic */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                <img 
                  src="/images/liked_songs_bg.png" 
                  alt="Liked songs artwork" 
                  className="w-32 h-32 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-transform duration-700 group-hover:scale-105" 
                />
              </div>

              {/* Bottom Info */}
              <div className="relative z-10">
                <h3 className="text-white font-bold text-xl tracking-tight mb-1 group-hover:text-white transition-colors">Liked Songs</h3>
                <p className="text-zinc-400 text-xs font-medium flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5" />
                  <span>{likedSongs.length} saved tracks</span>
                </p>
              </div>
            </div>
          </Link>

          {/* User Created Playlists */}
          {playlists && playlists.map((playlist, idx) => (
            <TremlistCard key={idx} playlist={playlist} />
          ))}

          {/* Create New Tremlist Card (Matching TremlistCard w-44 dimensions) */}
          <Link href="/create-playlist" className="block w-full sm:w-44 flex-shrink-0 group">
            <div className="relative w-full aspect-square rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-dashed border-white/10 hover:border-white/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-zinc-400 group-hover:text-white text-xs font-semibold tracking-wide text-center px-2 transition-colors">
                Create Tremlist
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Dynamic Genres */}
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Explore Genres</h2>
      {isLoading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center w-full">
           <img loading="eager" fetchPriority="high" src="/images/tremble_loading_new.gif" alt="Loading..." className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {genres.map((genre, idx) => (
            <GenreCard 
              key={idx} 
              title={genre.title} 
              params={genre.params} 
              imageUrl={getGenreImage(genre.title, idx)} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
