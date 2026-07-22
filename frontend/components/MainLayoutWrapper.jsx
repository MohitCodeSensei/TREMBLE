"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { usePathname } from 'next/navigation';

const MainLayoutWrapper = ({ children }) => {
  const { isSidebarOpen } = usePlayer();
  const pathname = usePathname();

  const isLogin = pathname === '/login';

  return (
    <main 
      className={isLogin ? "min-h-screen relative z-10" : `pt-20 pb-24 min-h-screen relative z-10 transition-all duration-300 ${isSidebarOpen ? 'pl-0 md:pl-64' : 'pl-0'}`}
    >
      {children}
    </main>
  );
};

export default MainLayoutWrapper;
