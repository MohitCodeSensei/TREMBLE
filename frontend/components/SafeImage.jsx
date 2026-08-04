"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Music } from 'lucide-react';
import { API_URL } from '../utils/api';

const SafeImage = ({ src, alt, className, type, artist, title, videoId, youtube_id, useOriginalSize, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');
  const fallbackStep = useRef(0);

  const cleanArtist = artist || '';
  const cleanTitle = title || '';
  const cleanType = type || 'song';
  const vid = videoId || youtube_id || '';

  const apiFallbackUrl = `${API_URL}/api/cover-fallback?artist=${encodeURIComponent(cleanArtist)}&title=${encodeURIComponent(cleanTitle)}&video_id=${encodeURIComponent(vid)}&type=${encodeURIComponent(cleanType)}`;

  useEffect(() => {
    fallbackStep.current = 0;
    if (src) {
      let hdSrc = src;
      if (src.includes('Mohit Mahajan') || src.includes('tremlist_static.jpeg')) {
        hdSrc = '/images/tremlist_static.jpeg';
      } else if (!useOriginalSize && (src.includes('googleusercontent.com') || src.includes('ggpht.com') || src.includes('gstatic.com'))) {
        hdSrc = src.replace(/=w\d+-h\d+/, '=w1080-h1080').replace(/=s\d+/, '=s1080');
      } else if (src.includes('img.youtube.com') && src.includes('hqdefault.jpg')) {
        hdSrc = src.replace('hqdefault.jpg', 'maxresdefault.jpg');
      }
      setCurrentSrc(hdSrc);
      setLoaded(false);
      setError(false);
    } else if (vid) {
      setCurrentSrc(`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`);
      setLoaded(false);
      setError(false);
    } else if (cleanArtist || cleanTitle) {
      setCurrentSrc(apiFallbackUrl);
      setLoaded(false);
      setError(false);
    } else {
      setError(true);
    }
  }, [src, vid, cleanArtist, cleanTitle, cleanType]);

  const handleError = () => {
    fallbackStep.current += 1;

    if (currentSrc.includes('maxresdefault.jpg')) {
      setCurrentSrc(currentSrc.replace('maxresdefault.jpg', 'hqdefault.jpg'));
      return;
    }

    if (src && currentSrc !== src && !currentSrc.includes(src)) {
      setCurrentSrc(src);
      return;
    }

    if (cleanArtist || cleanTitle) {
      if (!currentSrc.includes('/api/cover-fallback')) {
        setCurrentSrc(apiFallbackUrl);
        return;
      }
      if (cleanType === 'song' && cleanArtist && !currentSrc.includes('type=artist')) {
        setCurrentSrc(`${API_URL}/api/cover-fallback?artist=${encodeURIComponent(cleanArtist)}&title=&type=artist`);
        return;
      }
    }

    if (vid && !currentSrc.includes(`vi/${vid}/`)) {
      setCurrentSrc(`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`);
      return;
    }

    setError(true);
  };

  return (
    <div className={`relative bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center overflow-hidden flex-shrink-0 ${className} ${loaded ? '' : 'animate-pulse'}`}>
      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-tr from-indigo-950/40 to-purple-950/40">
          <Music size={20} className="text-zinc-600" />
        </div>
      ) : (
        currentSrc && (
          <img
            src={currentSrc}
            alt={loaded ? alt : ''}
            onLoad={() => setLoaded(true)}
            onError={handleError}
            className={`w-full h-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            {...props}
          />
        )
      )}
    </div>
  );
};

export default SafeImage;
