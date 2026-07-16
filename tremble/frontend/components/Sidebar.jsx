"use client";
import { Home, Library, Clock, Settings, Info, X } from "lucide-react";

const links = [
  { label: "Home", icon: Home },
  { label: "Library", icon: Library },
  { label: "Recent", icon: Clock },
  { label: "Settings", icon: Settings },
  { label: "About", icon: Info },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40"
             onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 p-6 glass-strong rounded-r-3xl
        transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-extrabold tracking-tight
                         bg-gradient-to-r from-tremble-magenta to-tremble-cyan
                         bg-clip-text text-transparent">TREMBLE</h1>
          <button className="glass-btn w-9 h-9" onClick={onClose}><X size={18} /></button>
        </div>
        <nav className="space-y-2">
          {links.map(({ label, icon: Icon }) => (
            <a key={label} href="#"
               className="flex items-center gap-4 px-4 py-3 rounded-xl
                          text-white/70 hover:text-white hover:bg-white/10 transition">
              <Icon size={20} /> <span className="font-medium">{label}</span>
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
