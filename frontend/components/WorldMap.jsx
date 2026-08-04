"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Mercator, Graticule, NaturalEarth } from '@visx/geo';
import { ParentSize } from '@visx/responsive';
import * as topojson from 'topojson-client';
import { useRouter } from 'next/navigation';

const topologyUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

const background = '#000000';
const graticuleStroke = 'rgba(255,255,255,0.1)';
const featureFill = '#27272a'; // zinc-800
const featureStroke = '#3f3f46'; // zinc-700
const featureHoverFill = '#6366f1'; // indigo-500

export default function WorldMap() {
  const router = useRouter();
  const [worldData, setWorldData] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(topologyUrl)
      .then((res) => res.json())
      .then((topology) => {
        const geojson = topojson.feature(topology, topology.objects.countries);
        setWorldData(geojson);
      })
      .catch((err) => console.error('Failed to load topology', err));
  }, []);

  if (!worldData) {
    return (
      <div className="w-full aspect-[2/1] flex items-center justify-center bg-zinc-900/50 rounded-2xl animate-pulse">
        <span className="text-zinc-500 font-bold tracking-widest uppercase">Loading Map...</span>
      </div>
    );
  }

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative w-full aspect-[2/1] bg-black/40 rounded-3xl overflow-hidden shadow-2xl border border-white/10" onMouseMove={handleMouseMove}>
      <ParentSize>
        {({ width, height }) => {
          // Centered and scaled projection
          const centerX = width / 2;
          const centerY = height / 1.7; // shift slightly down
          const scale = (width / 630) * 100; // responsive scale

          return (
            <svg width={width} height={height}>
              {/* Map Layer */}
              <NaturalEarth data={worldData.features} scale={scale} translate={[centerX, centerY]}>
                {(mercator) => (
                  <g>
                    {/* Graticule */}
                    <Graticule
                      graticule={g => mercator.path(g) || ''}
                      stroke={graticuleStroke}
                      strokeWidth={0.5}
                    />
                    {/* Countries */}
                    {mercator.features.map(({ feature, path }, i) => {
                      const isHovered = hoveredCountry === feature.properties.name;
                      return (
                        <path
                          key={`map-feature-${i}`}
                          d={path || ''}
                          fill={isHovered ? featureHoverFill : featureFill}
                          stroke={featureStroke}
                          strokeWidth={0.5}
                          className="cursor-pointer transition-colors duration-200"
                          onMouseEnter={() => setHoveredCountry(feature.properties.name)}
                          onMouseLeave={() => setHoveredCountry(null)}
                          onClick={() => {
                            if (feature.properties.name) {
                              router.push(`/country/${encodeURIComponent(feature.properties.name)}`);
                            }
                          }}
                        />
                      );
                    })}
                  </g>
                )}
              </NaturalEarth>
            </svg>
          );
        }}
      </ParentSize>

      {/* Tooltip */}
      {hoveredCountry && (
        <div 
          className="fixed pointer-events-none z-50 px-4 py-2 bg-zinc-900 border border-white/10 shadow-xl rounded-lg text-white font-bold text-sm tracking-wide transform -translate-x-1/2 -translate-y-full"
          style={{ left: mousePos.x, top: mousePos.y - 15 }}
        >
          {hoveredCountry}
        </div>
      )}
    </div>
  );
}
