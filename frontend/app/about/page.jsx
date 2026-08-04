"use client";
import React, { useState, useEffect, useRef } from 'react';
import ContributorCard from '../../components/ContributorCard';
import Link from 'next/link';

export default function AboutPage() {
  const [logoVisible, setLogoVisible] = useState(true);
  const contributorsRef = useRef(null);

  useEffect(() => {
    // Observer to detect when the Contributors section reaches the middle of the screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        setLogoVisible(!entry.isIntersecting);
      },
      { 
        // Triggers when the contributors box comes within 40% from the bottom of the viewport (approaching the center logo)
        rootMargin: "0px 0px -40% 0px" 
      }
    );

    if (contributorsRef.current) {
      observer.observe(contributorsRef.current);
    }

    return () => {
      if (contributorsRef.current) {
        observer.unobserve(contributorsRef.current);
      }
    };
  }, []);

  const contributors = [
    { name: 'Mohitcodesensei', url: 'https://github.com/mohitcodesensei' },
    { name: 'Shivam254-xyz', url: 'https://github.com/shivam254-xyz' },
    { name: 'Pranitdhumal1436-gif', url: 'https://github.com/pranitdhumal1436-gif' },
    { name: 'Varunsargam', url: 'https://github.com/varunsargam' },
    { name: 'Connectwithaadit', url: 'https://github.com/connectwithaadit' }
  ];

  return (
    <div className="relative w-full h-[calc(100vh-100px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth">
      {/* Sticky Logo Layer (Brought out front: z-30) */}
      <div className={`sticky top-1/2 -translate-y-1/2 flex justify-center w-full z-30 pointer-events-none h-0 transition-opacity duration-700 ${logoVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="relative w-64 h-64 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
          <div className="absolute inset-0 bg-white/10 blur-[80px] rounded-full"></div>
          <img loading="lazy" src="https://github.com/MohitCodeSensei/TREMBLE/raw/main/frontend/app/icon.png" alt="Tremble Logo" className="w-48 h-48 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]" />
        </div>
      </div>

      {/* Content Layer (Behind logo: z-10) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-8 pb-32">
        
        {/* Header Section (Removed glass box) */}
        <div className="pt-24 pb-32 text-center max-w-3xl mx-auto space-y-6 mt-10">
          <h1 className="text-7xl font-black text-white tracking-tight drop-shadow-lg">Tremble</h1>
          <p className="text-2xl font-bold text-zinc-300">Feel Every Frequency. Pure Sound. Zero Interruptions.</p>
          
          <div className="flex justify-center gap-4 text-sm font-semibold tracking-widest uppercase mt-4 mb-6 text-zinc-400">
            <a href="#about" className="hover:text-white transition-colors"><kbd className="bg-white/10 px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors">About</kbd></a> •
            <a href="#features" className="hover:text-white transition-colors"><kbd className="bg-white/10 px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors">Features</kbd></a> •
            <a href="#visualizer-modes" className="hover:text-white transition-colors"><kbd className="bg-white/10 px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors">Visualizers</kbd></a> •
            <a href="#tech-stack" className="hover:text-white transition-colors"><kbd className="bg-white/10 px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors">Tech Stack</kbd></a> •
            <a href="#quick-start" className="hover:text-white transition-colors"><kbd className="bg-white/10 px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors">Quick Start</kbd></a>
          </div>

          <div className="flex justify-center gap-4 flex-wrap mt-8 relative z-40">
            <img loading="lazy" src="https://img.shields.io/badge/Audio-24--Bit%2F192kHz%20FLAC-ff0055?style=for-the-badge&logo=soundcharts&logoColor=white" alt="Lossless Audio" className="hover:scale-105 transition-transform" />
            <img loading="lazy" src="https://img.shields.io/badge/Ads-Zero%20Commercials-00f2fe?style=for-the-badge&logo=adguard&logoColor=white" alt="Ad-Free" className="hover:scale-105 transition-transform" />
            <img loading="lazy" src="https://img.shields.io/badge/UI-Immersive%203D%20%26%20WebGL-7928CA?style=for-the-badge&logo=opengl&logoColor=white" alt="Immersive UI" className="hover:scale-105 transition-transform" />
          </div>
        </div>

        <div className="w-full h-px bg-white/10 my-32"></div>

        {/* The Split Layout (Removed boxes, raw text only) */}
        <div className="w-full grid grid-cols-2 gap-y-32 gap-x-32 relative text-zinc-300 leading-relaxed text-lg">
          
          {/* Section 1: About (Left) */}
          <div className="col-span-1 flex flex-col justify-center text-right pr-8" id="about">
            <h2 className="text-3xl font-black text-white mb-6 tracking-tight">🎧 What is Tremble?</h2>
            <p className="mb-4">
              Tremble is an open-source, next-generation music streaming experience engineered for audiophiles and digital purists. Standard streaming platforms compress audio into muddy frequencies while bombarding users with ads and algorithms. Tremble strips away the noise.
            </p>
            <p>
              Built on a custom Web Audio DSP pipeline and WebGL visual shaders, Tremble delivers 100% ad-free 24-bit Hi-Res audio paired with real-time, audio-reactive 3D visual environments.
            </p>
          </div>
          <div className="col-span-1"></div>

          {/* Section 2: Features (Right) */}
          <div className="col-span-1"></div>
          <div className="col-span-1 flex flex-col justify-center text-left pl-8" id="features">
            <h2 className="text-3xl font-black text-white mb-6 tracking-tight">✨ Core Pillars</h2>
            
            <h3 className="text-xl font-bold text-white mb-2">🚫 100% Ad-Free Pure Flow</h3>
            <ul className="mb-8 space-y-1">
              <li>Zero audio interruptions, banners, or pop-ups.</li>
              <li>Unrestricted background playback &amp; infinite skips.</li>
              <li>Native offline playback caching built-in.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-2">💎 24-Bit / 192kHz Lossless Quality</h3>
            <ul className="space-y-1">
              <li>Bit-for-bit accurate digital audio via FLAC master streaming.</li>
              <li>Preserved full dynamic range for deep bass and ultra-crisp highs.</li>
              <li>Integrated 10-band parametric equalizer with zero-latency crossfade.</li>
            </ul>
          </div>

          {/* Section 3: More Features (Left) */}
          <div className="col-span-1 flex flex-col justify-center text-right pr-8">
            <h3 className="text-xl font-bold text-white mb-2">🎨 Dynamic Ambient UI</h3>
            <ul className="mb-8 space-y-1">
              <li>Fluid color engine that continuously morphs the glassmorphic interface based on album artwork.</li>
              <li>Distraction-free, minimal edge-to-edge typography mode.</li>
            </ul>

            <h3 className="text-xl font-bold text-white mb-2">🌌 Audio-Reactive 3D Visualizer</h3>
            <ul className="space-y-1">
              <li>GPU-accelerated WebGL / Three.js shader pipelines.</li>
              <li>Real-time frequency splitting (Sub-bass, Mids, Highs).</li>
              <li>Full mouse and touch orbit controls for interactive visuals.</li>
            </ul>
          </div>
          <div className="col-span-1"></div>

          {/* Section 4: Visualizer Modes (Right) */}
          <div className="col-span-1"></div>
          <div className="col-span-1 flex flex-col justify-center text-left pl-8" id="visualizer-modes">
            <h2 className="text-3xl font-black text-white mb-6 tracking-tight">🎛 Visualizer Modes</h2>
            <p className="mb-6 text-white font-bold">Click to toggle Visual Experience Matrix</p>
            <div className="space-y-6 text-base">
              <div>
                <span className="text-white font-bold block mb-1">Neon Nebula</span>
                <span className="block">Ethereal particle storm expanding through deep space.</span>
                <span className="text-sm text-zinc-500 font-medium">Sub-Bass (20 - 80 Hz)</span>
              </div>
              <div>
                <span className="text-white font-bold block mb-1">Cyber Grid</span>
                <span className="block">Retro synthwave terrain deforming dynamically to rhythm.</span>
                <span className="text-sm text-zinc-500 font-medium">Drum Transients / Snares</span>
              </div>
              <div>
                <span className="text-white font-bold block mb-1">Quantum Wave</span>
                <span className="block">Fluid dynamic liquid simulations tracking harmonic vocals.</span>
                <span className="text-sm text-zinc-500 font-medium">Mid Harmonics (500 - 2000 Hz)</span>
              </div>
              <div>
                <span className="text-white font-bold block mb-1">Geometric Pulse</span>
                <span className="block">Crystalline 3D polyhedrons oscillating with high-end detail.</span>
                <span className="text-sm text-zinc-500 font-medium">Treble &amp; Hi-Hats</span>
              </div>
            </div>
          </div>

          {/* Section 5: Tech Stack (Left) */}
          <div className="col-span-1 flex flex-col justify-center text-right pr-8" id="tech-stack">
            <h2 className="text-3xl font-black text-white mb-6 tracking-tight">🛠 Tech Stack</h2>
            <p className="font-mono text-zinc-400">
              Next.js WASM Audio Three.js TailwindCSS Go
            </p>
          </div>
          <div className="col-span-1"></div>

        </div>

        <div className="w-full h-px bg-white/10 my-32"></div>

        {/* Contributors Section */}
        <div ref={contributorsRef} className="w-full text-center mb-32 bg-black/20 backdrop-blur-sm rounded-3xl p-10 border border-white/5 relative z-40">
          <h2 className="text-3xl font-black text-white mb-10 tracking-tight">Contributors</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {contributors.map((contributor) => (
              <ContributorCard key={contributor.name} contributor={contributor} />
            ))}
          </div>
        </div>

        <div className="text-center text-zinc-500 pb-20">
          <p className="tracking-widest uppercase text-xs font-semibold">Crafted with 🔊 for music purists worldwide.</p>
        </div>

      </div>
    </div>
  );
}
