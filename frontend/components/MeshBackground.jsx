"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

export default function MeshBackground() {
  const pathname = usePathname();

  // On Trembler and Artist pages, disable the blue/purple mesh background completely for a pitch black theme
  if (pathname && (pathname.startsWith('/trembler') || pathname.startsWith('/artist'))) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden transition-opacity duration-700">
      <div className="mesh-bg">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
      </div>
      {/* Additional subtle floating particles */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
}
