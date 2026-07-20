"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InteractiveBackground from '../../components/ui/InteractiveBackground';

export default function UserLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white font-sans selection:bg-white/20">
      <InteractiveBackground />

      <div className="relative z-10 w-full max-w-md p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white mb-3 opacity-90">
            TREMBLE
          </h1>
          <p className="text-xs text-white/40 tracking-[0.4em] uppercase font-medium">
            User Authentication
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 text-sm text-center text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <div className="bg-black border border-zinc-800 p-8 rounded-lg space-y-6 shadow-2xl ring-1 ring-zinc-900">
            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-white/80">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 ring-zinc-700 transition-all duration-300 text-sm text-white placeholder:text-zinc-600"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-white/80">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 ring-zinc-700 transition-all duration-300 text-sm text-white placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold tracking-[0.2em] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-white/30 tracking-wide">
            ARE YOU AN ARTIST? <br className="hidden sm:block" />
            <a href="/artist/login" className="text-white/60 hover:text-white transition-all duration-300 underline underline-offset-4 decoration-white/20 hover:decoration-white/60 font-medium">
              ACCESS ARTIST PORTAL
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
