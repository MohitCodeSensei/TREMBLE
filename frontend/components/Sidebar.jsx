"use client";
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Home, Library, Clock, Settings, Info } from 'lucide-react';
import Link from 'next/link';

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = usePlayer();

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
        className="fixed top-4 left-4 z-50 p-2 rounded-lg glass-btn"
      >
        <div className="space-y-1">
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </div>
      </button>

      <aside className={`fixed left-0 top-0 h-full w-64 glass border-r border-zinc-800 transition-all duration-300 z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-20 space-y-8">
          <div className="text-2xl font-bold tracking-tighter text-white">TREMBLE</div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-md text-zinc-400 hover:text-black hover:bg-white transition-all duration-200 group"
              >
                <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
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
