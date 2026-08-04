"use client";
import React, { useEffect, useRef, useState } from 'react';
import { API_URL } from '../utils/api';

export default function FluidBackground({ coverUrl, isPlaying = true }) {
  const canvasRef = useRef(null);
  const [colors, setColors] = useState([
    { r: 79, g: 70, b: 229 },  // Indigo
    { r: 236, g: 72, b: 153 }, // Pink
    { r: 147, g: 51, b: 234 }, // Purple
    { r: 234, g: 88, b: 12 },  // Amber/Orange
    { r: 15, g: 23, b: 42 }    // Midnight Slate
  ]);

  // Extract rich multi-color palette from cover art
  useEffect(() => {
    if (!coverUrl) return;

    const img = new Image();
    const proxyUrl = coverUrl.startsWith('http')
      ? `${API_URL}/api/image-proxy?url=${encodeURIComponent(coverUrl)}`
      : coverUrl;

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = 64;
        offCanvas.height = 64;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 64, 64);
        const data = ctx.getImageData(0, 0, 64, 64).data;

        // Sample 5 distinct quadrant regions
        const c1 = getPixelColor(data, 16, 16); // Top-Left
        const c2 = getPixelColor(data, 48, 16); // Top-Right
        const c3 = getPixelColor(data, 16, 48); // Bottom-Left
        const c4 = getPixelColor(data, 48, 48); // Bottom-Right
        const c5 = getPixelColor(data, 32, 32); // Center

        // Check color saturation to ensure rich multi-color output
        const extracted = [c1, c2, c3, c4, c5].map(color => boostColorIfMonochrome(color));
        setColors(extracted);
      } catch (e) {
        // Keep vibrant default fallback
      }
    };
    img.onerror = () => {};
    img.src = proxyUrl;
  }, [coverUrl]);

  function getPixelColor(data, x, y) {
    const idx = (y * 64 + x) * 4;
    return {
      r: data[idx] || 50,
      g: data[idx + 1] || 50,
      b: data[idx + 2] || 70
    };
  }

  // Boost saturation if cover art is monochromatic/grayscale (e.g. ONF B&W cover)
  function boostColorIfMonochrome({ r, g, b }) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    // If difference between RGB components is low, add subtle vibrant tinting
    if (diff < 35) {
      return {
        r: Math.min(255, Math.max(40, r + 40)),
        g: Math.min(255, Math.max(30, g - 20)),
        b: Math.min(255, Math.max(80, b + 70))
      };
    }
    return { r, g, b };
  }

  // Render soothing fluid liquid mesh on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let time = 0;

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth * 0.45);
      canvas.height = Math.ceil(window.innerHeight * 0.45);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += isPlaying ? 0.005 : 0.0015; // Slow, soothing fluid movement
      const w = canvas.width;
      const h = canvas.height;

      // Deep base coat using 5th color
      const bg = colors[4];
      ctx.fillStyle = `rgb(${bg.r * 0.25}, ${bg.g * 0.25}, ${bg.b * 0.25})`;
      ctx.fillRect(0, 0, w, h);

      // Node 1: Top-Left floating orb
      const x1 = w * (0.35 + 0.28 * Math.sin(time * 0.45));
      const y1 = h * (0.35 + 0.25 * Math.cos(time * 0.35));
      const r1 = Math.max(w, h) * 0.7;
      drawOrb(ctx, x1, y1, r1, colors[0], 0.9);

      // Node 2: Top-Right floating orb
      const x2 = w * (0.65 + 0.25 * Math.cos(time * 0.55));
      const y2 = h * (0.42 + 0.25 * Math.sin(time * 0.4));
      const r2 = Math.max(w, h) * 0.65;
      drawOrb(ctx, x2, y2, r2, colors[1], 0.85);

      // Node 3: Bottom-Left floating orb
      const x3 = w * (0.3 + 0.25 * Math.sin(time * 0.6));
      const y3 = h * (0.75 + 0.22 * Math.cos(time * 0.5));
      const r3 = Math.max(w, h) * 0.75;
      drawOrb(ctx, x3, y3, r3, colors[2], 0.8);

      // Node 4: Bottom-Right floating orb
      const x4 = w * (0.72 + 0.22 * Math.sin(time * 0.38));
      const y4 = h * (0.7 + 0.25 * Math.sin(time * 0.65));
      const r4 = Math.max(w, h) * 0.65;
      drawOrb(ctx, x4, y4, r4, colors[3], 0.85);

      // Node 5: Center floating liquid accent
      const x5 = w * (0.5 + 0.2 * Math.cos(time * 0.7));
      const y5 = h * (0.5 + 0.2 * Math.sin(time * 0.5));
      const r5 = Math.max(w, h) * 0.5;
      drawOrb(ctx, x5, y5, r5, colors[4], 0.7);

      animId = requestAnimationFrame(render);
    };

    function drawOrb(ctx, x, y, radius, color, opacity) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
      grad.addColorStop(0.45, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.55})`);
      grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [colors, isPlaying]);

  return (
    <div className="absolute -inset-32 overflow-hidden pointer-events-none z-0 bg-black">
      {/* Soothing Dynamic Fluid Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-cover transform scale-150 filter blur-[110px] saturate-[240%] contrast-[105%] transition-opacity duration-1000"
      />
      {/* Ambient Vignette & Smooth Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/40" />
      {/* Micro Grain Texture */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-15 mix-blend-overlay" />
    </div>
  );
}
