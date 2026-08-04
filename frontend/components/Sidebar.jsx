"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Home, Library, Clock, Settings, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = usePlayer();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const navItems = [
    { icon: <Home size={20} />, label: 'Home', href: '/' },
    { icon: <Library size={20} />, label: 'Library', href: '/library' },
    { icon: <Clock size={20} />, label: 'Recent', href: '/recent' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
    { icon: <Info size={20} />, label: 'About', href: '/about' },
  ];

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`fixed top-10 -translate-y-1/2 left-6 z-50 p-2 rounded-lg glass-btn transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="space-y-1">
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </div>
      </button>

      {/* Backdrop Blur Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed left-0 top-0 h-[calc(100vh-32px)] m-4 w-64 bg-zinc-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl transition-all duration-300 z-40 ${isSidebarOpen ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : '-translate-x-[120%]'}`}>
        <div className="p-6 pt-10 space-y-8 h-full overflow-y-auto no-scrollbar flex flex-col">
          <Link href="/" className="flex items-center gap-3 px-2 group/logo mb-2">
            <img loading="lazy" src="/images/logo.png" alt="TREMBLE" className="w-8 h-8 group-hover/logo:scale-110 transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover/logo:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" />
            <span className="text-xl font-black text-white tracking-widest transition-all duration-300 group-hover/logo:drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">TREMBLE</span>
          </Link>

          <nav className="space-y-2 group/nav relative flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-zinc-400 hover:text-black hover:bg-white transition-all duration-300 group/item hover:scale-[1.08] hover:my-1 hover:z-10 hover:shadow-lg group-hover/nav:opacity-60 hover:!opacity-100"
              >
                <span className="group-hover/item:scale-110 transition-transform">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
