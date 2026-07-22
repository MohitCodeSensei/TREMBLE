"use client";
import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

const SplashScreen = () => {
  const { hasBooted, setHasBooted } = usePlayer();
  const [stage, setStage] = useState('initial'); 

  useEffect(() => {
    if (hasBooted) return;
    
    // Trigger entrance animation right after mount
    const enterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStage('entering');
      });
    });

    // Hold for 2 seconds, then rocket out
    const exitTimer = setTimeout(() => {
      setStage('exiting');
    }, 2000); 

    // Wait for the exit animation to finish before unmounting
    const doneTimer = setTimeout(() => {
      setHasBooted(true);
    }, 2800); 

    return () => {
      cancelAnimationFrame(enterFrame);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [hasBooted, setHasBooted]);

  if (hasBooted) return null;

  let animationClass = "translate-y-[150vh] opacity-0 scale-50"; 
  
  if (stage === 'entering') {
    // Rushes upwards into center
    animationClass = "translate-y-0 opacity-100 scale-100 transition-all duration-[600ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]";
  } else if (stage === 'exiting') {
    // Rockets upwards out of frame
    animationClass = "-translate-y-[150vh] opacity-0 scale-90 transition-all duration-[800ms] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)]"; 
  }

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-[800ms] ${stage === 'exiting' ? 'bg-black/0 backdrop-blur-none pointer-events-none' : 'bg-black backdrop-blur-2xl'}`}>
      <div className={`flex flex-col items-center gap-6 ${animationClass}`}>
        <img 
          src="/images/logo.png" 
          alt="TREMBLE" 
          className="w-40 h-40 object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] animate-pulse"
        />
        <h1 className="text-7xl font-black tracking-[0.3em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
          TREMBLE
        </h1>
      </div>
    </div>
  );
};

export default SplashScreen;
