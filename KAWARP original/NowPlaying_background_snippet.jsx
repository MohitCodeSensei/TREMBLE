{/* Dynamic Fluid Background using KAWARP in NowPlaying.jsx */}
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
  {/* Instant Placeholder while Kawarp loads */}
  <div 
    className="absolute inset-0 opacity-50" 
    style={{ 
      backgroundImage: `url(${currentTrack?.cover_url})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center', 
      filter: 'blur(25px) saturate(180%)' 
    }}
  />
  
  {/* WebGL Kawarp Overlay */}
  {currentTrack?.cover_url && (
     <Kawarp
       src={currentTrack.cover_url}
       warpIntensity={0.8}
       animationSpeed={1.2}
       blurPasses={5}
       saturation={1.5}
       style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1.0 }}
     />
  )}
  <div className="absolute inset-0 bg-black/10 backdrop-blur-[7px]"></div>
  <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay"></div>
</div>
