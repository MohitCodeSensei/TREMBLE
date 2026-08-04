"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { usePlayer } from '../../../context/PlayerContext';
import { API_URL, getTremblerUrl } from '../../../utils/api';
import { Play, Pause, Heart, Shuffle, Plus, Check, Loader2, ArrowLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SafeImage from '../../../components/SafeImage';
import MonochromeKawarp from '../../../components/MonochromeKawarp';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AlbumContent({ params }) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;
  const { loadTrackIntoContext, setQueue, togglePlay, toggleLike, currentTrack, isPlaying, setCurrentIndex, savePlaylist, likedSongs, playlists } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [highlightedTrackId, setHighlightedTrackId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, -150]);
  const textY = useTransform(scrollY, [0, 800], [0, -300]);
  const bgOpacity = useTransform(scrollY, [0, 600], [1, 0]);

  useEffect(() => {
    async function fetchAlbum() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/album/${id}`);
        if (!res.ok) throw new Error('Failed to load album');
        const data = await res.json();
        setAlbum(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlbum();
  }, [id]);

  useEffect(() => {
    if (highlightId) {
      setHighlightedTrackId(highlightId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`track-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightId, isLoading]);

  const mappedTracks = (album?.tracks || []).map(t => ({
    id: t.videoId || t.id,
    youtube_id: t.videoId || t.id,
    title: t.title,
    artist: album?.artist || (album?.artists && album.artists[0]?.name) || (t.artists && t.artists[0]?.name) || 'Unknown Artist',
    artist_name: album?.artist || (album?.artists && album.artists[0]?.name) || (t.artists && t.artists[0]?.name) || 'Unknown Artist',
    artist_id: album?.artists?.[0]?.id || '',
    duration: t.duration || t.length || '3:30',
    cover_url: (t.thumbnails && t.thumbnails.length > 0 ? t.thumbnails[t.thumbnails.length - 1].url : '') || (album?.thumbnails && album.thumbnails.length > 0 ? album.thumbnails[album.thumbnails.length - 1].url : ''),
    album: album?.title || 'Unknown Album',
    _albumId: id
  }));

  const handlePlayAll = () => {
    if (mappedTracks.length === 0) return;
    if (isPlayingAlbum) {
      togglePlay();
    } else {
      setQueue(mappedTracks);
      loadTrackIntoContext(mappedTracks[0]);
      setCurrentIndex(0);
      if (!isPlaying) togglePlay();
    }
  };

  const handleShuffleAll = () => {
    if (mappedTracks.length === 0) return;
    const shuffled = [...mappedTracks].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    loadTrackIntoContext(shuffled[0]);
    setCurrentIndex(0);
    if (!isPlaying) togglePlay();
  };
  const handleShuffle = handleShuffleAll;

  const handlePlay = (track, index) => {
    setQueue(mappedTracks);
    loadTrackIntoContext(track);
    setCurrentIndex(index);
    if (!isPlaying) togglePlay();
  };
  const handleTrackClick = handlePlay;

  const handleAddToTremlist = () => {
    if (!album || mappedTracks.length === 0) return;
    const newPlaylist = {
      id: `album_${id}`,
      title: album.title,
      cover_url: album.thumbnails && album.thumbnails.length > 0 ? album.thumbnails[album.thumbnails.length - 1].url : '',
      tracks: mappedTracks,
      createdAt: new Date().toISOString()
    };
    savePlaylist(newPlaylist);
    setIsSaved(true);
  };
  const handleSaveAlbum = handleAddToTremlist;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <img src="/images/tremble_loading_new.gif" alt="Loading..." className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
      </div>
    );
  }

  if (!album || !album.tracks) {
    return (
      <div className="p-8 pb-32 font-sans min-h-screen flex justify-center items-center">
        <h1 className="text-2xl text-zinc-400">Album not found</h1>
      </div>
    );
  }

  const coverUrl = album.thumbnails && album.thumbnails.length > 0 ? album.thumbnails[album.thumbnails.length - 1].url : '';
  const trackCount = album.trackCount || album.tracks.length;
  const isPlayingAlbum = isPlaying && currentTrack && mappedTracks.some(t => t.youtube_id === currentTrack.youtube_id);
  const isAlbumSaved = playlists?.some(p => p.tracks?.[0]?._albumId === id);

  return (
    <div className="relative min-h-screen">
      {/* Floating Back Button */}
      <button 
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }} 
        className="fixed top-24 left-8 z-50 text-white/70 hover:text-white transition-colors flex items-center justify-center w-12 h-12 bg-black/40 hover:bg-black/80 backdrop-blur-md rounded-full shadow-lg border border-white/10"
        aria-label="Go Back"
      >
         <ArrowLeft size={24} />
      </button>
      <div className="fixed inset-0 -z-10 w-full h-full bg-black">
        {coverUrl && (
          <motion.div style={{ y: bgY, opacity: bgOpacity }} className="absolute inset-0 w-full h-full flex items-start justify-center opacity-60">
            <img src={coverUrl} className="w-[120vw] lg:w-[100vw] max-w-[1400px] aspect-square object-cover mix-blend-lighten mt-16 sm:mt-24" style={{
               maskImage: 'radial-gradient(ellipse 65% 55% at 50% 40%, black 10%, transparent 70%)',
               WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 40%, black 10%, transparent 70%)'
            }} />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black pointer-events-none" />
      </div>

      <div className="p-8 pb-32 pt-24 font-sans flex flex-col items-center">
        <div className="max-w-4xl w-full flex flex-col items-center mt-24">
          {/* Header */}
          <motion.div style={{ y: textY }} className="flex flex-col items-center w-full z-10">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-lg text-center mb-4">{album.title}</h1>
            
            {/* Artist Link */}
            <Link 
              href={getTremblerUrl(album.artist || mappedTracks?.[0]?.artist || album.artists?.[0]?.name || album.artists?.[0]?.id || '')} 
              className="text-xl sm:text-2xl font-bold text-white hover:underline drop-shadow-md mb-2 text-center block"
            >
              {album.artist || mappedTracks?.[0]?.artist || 'Unknown Artist'}
            </Link>

            <p className="text-zinc-300 font-medium text-sm sm:text-base flex items-center justify-center gap-1.5 mb-8">
              <span className="w-5 h-5 rounded bg-zinc-700 text-xs text-white flex items-center justify-center font-bold">E</span>
              <span>Album • {album.year || '2023'} • {trackCount} songs</span>
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={handlePlayAll}
              className="w-16 h-16 rounded-full bg-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center text-black"
            >
              {isPlayingAlbum ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={handleShuffleAll} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <Shuffle size={20} />
            </button>
            <button onClick={handleAddToTremlist} className={`w-12 h-12 rounded-full hover:bg-white/20 flex items-center justify-center transition-all ${isAlbumSaved || isSaved ? 'text-white bg-white/20' : 'bg-white/10 text-white'}`}>
              {isAlbumSaved || isSaved ? <Check size={24} /> : <Plus size={24} />}
            </button>
          </div>

          {/* Tracklist */}
          <div className="w-full flex flex-col">
            {mappedTracks.map((track, idx) => {
              const isCurrentlyPlaying = currentTrack && (currentTrack.youtube_id === track.youtube_id || currentTrack.id === track.id);
              return (
                  <div 
                  id={`track-${track.youtube_id}`}
                  key={track.youtube_id || idx}
                  className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 group/item border border-transparent ${isCurrentlyPlaying && isPlaying ? 'bg-white/10 ring-1 ring-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black/20 hover:bg-white/5 backdrop-blur-sm'}`}
                  onClick={() => handlePlay(track, idx)}
                >
                  <div className="w-12 text-center text-zinc-500 font-medium font-sans text-sm flex justify-center items-center h-12 relative">
                    {isCurrentlyPlaying && isPlaying ? (
                       <img src="/images/tremble_song_overlay.gif" alt="playing" className="w-8 h-8 object-contain opacity-80 mix-blend-screen" />
                    ) : (
                       <span className="group-hover/item:hidden">{idx + 1}</span>
                    )}
                    <Play size={16} fill="currentColor" className={`text-white ${isCurrentlyPlaying && isPlaying ? 'hidden' : 'hidden group-hover/item:block'}`} />
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0 ml-2 justify-center">
                    <span className={`font-semibold line-clamp-1 transition-colors duration-200 ${isCurrentlyPlaying ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-zinc-200 group-hover/item:text-white'}`}>
                      {track.title}
                    </span>
                  </div>
                  
                  <div className="w-12 flex justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }} 
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {likedSongs?.some(t => (t.id || t.youtube_id) === (track.id || track.youtube_id)) ? (
                         <Heart size={18} fill="white" className="text-white" />
                      ) : (
                         <Heart size={18} />
                      )}
                    </button>
                  </div>
                  
                  <div className="w-16 text-right text-zinc-400 font-sans text-sm font-medium">
                    {track.duration || "0:00"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlbumPage(props) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <img src="/images/tremble_loading_new.gif" alt="Loading..." className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]" />
      </div>
    }>
      <AlbumContent {...props} />
    </Suspense>
  );
}
