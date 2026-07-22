"use client";
import React from 'react';
import GenreCard from '../../components/GenreCard';

export default function LibraryPage() {
  const genres = [
    { title: 'Pop', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop' },
    { title: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=300&fit=crop' },
    { title: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c090be2e8f1?w=400&h=300&fit=crop' },
    { title: 'Rock', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=300&fit=crop' },
    { title: 'Jazz', imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=400&h=300&fit=crop' },
    { title: 'Classical', imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop' },
    { title: 'R&B', imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=300&fit=crop' },
    { title: 'Indie', imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop' },
    { title: 'Country', imageUrl: 'https://images.unsplash.com/photo-1514525253344-f81f7179163e?w=400&h=300&fit=crop' },
    { title: 'Lo-Fi', imageUrl: 'https://images.unsplash.com/photo-1493225295707-eef55735174f?w=400&h=300&fit=crop' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Your Library & Genres</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {genres.map((genre) => (
          <GenreCard key={genre.title} title={genre.title} imageUrl={genre.imageUrl} />
        ))}
      </div>
      
      <div className="h-20"></div>
    </div>
  );
}
