"use client";
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getTrending, getPlaylist, getAlbum } from '../utils/api';

const DragScrollContainer = ({ children }) => {
  const containerRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      ref={containerRef}
      className={`flex gap-8 overflow-x-auto pb-4 no-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab scroll-smooth'}`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const { hasBooted, loadTrackIntoContext, setQueue, togglePlay, isPlaying } = usePlayer();
  const [animateEntrance, setAnimateEntrance] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (hasBooted) {
      setAnimateEntrance(true);
    }
  }, [hasBooted]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trending
        let allCategories = [];
        try {
          const trendingData = await getTrending();
          if (trendingData.videos && trendingData.videos.items) {
             const trendingTracks = trendingData.videos.items.map(t => ({
                id: t.videoId,
                youtube_id: t.videoId,
                type: 'song',
                title: t.title,
                artist: t.artists ? t.artists.map(a => a.name).join(', ') : '',
                cover_url: t.thumbnails ? t.thumbnails[t.thumbnails.length-1].url : ''
             }));
             allCategories.push({
               title: "Trending Songs",
               tracks: trendingTracks
             });
          }
        } catch (e) {
          console.error("Failed to fetch trending", e);
        }

        // Fetch home
        const res = await fetch(`http://localhost:8000/home?limit=10`);
        const data = await res.json();
        allCategories = [...allCategories, ...data];
        
        setCategories(allCategories);
      } catch (err) {
        console.error("Failed to fetch home categories", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleItemClick = async (item, trackList) => {
    if (item.type === 'playlist' || item.type === 'album') {
       try {
         const data = item.type === 'playlist' ? await getPlaylist(item.youtube_id) : await getAlbum(item.youtube_id);
         const items = data.tracks || [];
         if (items.length > 0) {
            const mappedTracks = items.map(t => ({
                id: t.videoId,
                youtube_id: t.videoId,
                title: t.title,
                artist: t.artists ? t.artists.map(a => a.name).join(', ') : (data.artist || ''),
                cover_url: t.thumbnails ? t.thumbnails[t.thumbnails.length-1].url : item.cover_url,
                duration: t.duration
            }));
            loadTrackIntoContext(mappedTracks[0]);
            setQueue(mappedTracks);
            togglePlay();
            if (!isPlaying) togglePlay();
         }
       } catch(e) {
         console.error("Failed to fetch playlist/album tracks", e);
       }
    } else {
       // Regular song
       loadTrackIntoContext(item);
       setQueue(trackList.filter(t => t.type !== 'playlist' && t.type !== 'album'));
       togglePlay();
       if (!isPlaying) togglePlay();
    }
  };

  return (
    <div className={`p-8 font-sans transition-all duration-1000 ease-out ${animateEntrance ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <h1 className="text-4xl font-black text-white mb-8 tracking-tight">Home</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-12 pb-32">
          {categories.map((category, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">{category.title}</h2>
              <DragScrollContainer>
                {category.tracks.map((song, i) => (
                  <div
                    key={i}
                    onClick={() => handleItemClick(song, category.tracks)}
                    className="flex flex-col gap-3 group cursor-pointer min-w-[240px] w-[240px]"
                  >
                    <div className={`relative aspect-square w-full overflow-hidden bg-zinc-800 shadow-xl transition-all duration-300 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${song.type === 'artist' ? 'rounded-full' : 'rounded-xl'}`}>
                      <img 
                        src={song.cover_url} 
                        alt={song.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-14 h-14 bg-indigo-500 rounded-full flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg">
                          <Play size={24} fill="currentColor" className="text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-base truncate group-hover:text-indigo-400 transition-colors">{song.title}</span>
                      <span className="text-zinc-400 text-sm truncate font-medium mt-0.5 capitalize">{song.type === 'playlist' ? 'Playlist' : song.type === 'album' ? 'Album' : song.artist}</span>
                    </div>
                  </div>
                ))}
              </DragScrollContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
