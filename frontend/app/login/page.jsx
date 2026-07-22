"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function UserLoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (!isRegister) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen z-40 flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* Solid Black Background covering global layout's mesh */}
      <div className="fixed inset-0 bg-black z-0 pointer-events-none"></div>

      {/* Main Split Layout Grid */}
      <div className="relative z-10 w-full flex-grow grid grid-cols-1 md:grid-cols-2">
        
        {/* LEFT COLUMN: Login Form */}
        <div className="flex flex-col items-center justify-center p-8 lg:p-16 border-r border-white/5">
          {/* Main Card */}
          <div className="w-full max-w-[440px] animate-fade-in-up bg-white/5 backdrop-blur-3xl border border-white/20 p-10 rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col items-center space-y-10 relative overflow-hidden">
            
            {/* Subtle top highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            
            <div className="space-y-3 text-center w-full mt-4">
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 tracking-tight">
                {isRegister ? 'Join Tremble.' : 'Welcome back.'}
              </h1>
              <p className="text-zinc-400 text-sm font-medium">
                {isRegister ? 'Experience the future of music streaming' : 'Your personalized music universe awaits'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-5">
              {error && (
                <div className="p-4 text-sm text-center text-red-200 bg-red-900/30 border border-red-500/30 rounded-2xl backdrop-blur-md animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {isRegister && (
                  <div className="relative group transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={20} strokeWidth={2.5} />
                    </div>
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 text-white placeholder:text-zinc-500 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 shadow-inner"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                    />
                  </div>
                )}

                <div className="relative group transition-all duration-300">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={20} strokeWidth={2.5} />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/5 text-white placeholder:text-zinc-500 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 shadow-inner"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="relative group transition-all duration-300">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-zinc-500 group-focus-within:text-indigo-400 transition-colors duration-300" size={20} strokeWidth={2.5} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/5 text-white placeholder:text-zinc-500 rounded-2xl focus:bg-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 shadow-inner"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors duration-200 outline-none focus:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-4 mt-2 rounded-2xl bg-white text-black font-extrabold text-lg flex items-center justify-center space-x-2 hover:bg-zinc-100 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 overflow-hidden"
              >
                {/* Button inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                
                <span>{isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}</span>
                {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />}
              </button>
            </form>

            <div className="text-zinc-400 text-sm font-medium pt-2 pb-2">
              {isRegister ? 'Already part of Tremble?' : "New to Tremble?"}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setFormData({ username: '', email: '', password: '' });
                }}
                className="ml-2 text-white hover:text-indigo-400 transition-colors duration-300 focus:outline-none focus:underline"
              >
                {isRegister ? 'Sign in instead' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Brand & Action */}
        <div className="flex flex-col items-center justify-between py-16 px-8 relative">
          
          {/* Top Logo */}
          <div className="flex items-center gap-4 mt-12 animate-fade-in-up">
            <img
              src="/images/logo.png"
              alt="TREMBLE logo"
              className="h-16 w-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            />
            <span className="text-4xl font-black tracking-[0.2em] text-white">
              TREMBLE
            </span>
          </div>

          {/* Center/Bottom Stop the Hassle Button */}
          <div className="flex-grow flex items-center justify-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Link 
              href="/"
              className="group relative px-12 py-6 rounded-full bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.4)] flex items-center gap-4 hover:bg-white/10 hover:scale-105 hover:border-white/40 transition-all duration-300"
            >
              {/* Subtle inner gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <span className="text-white text-xl font-bold tracking-wider z-10">Skip to Listening</span>
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center z-10 group-hover:rotate-45 transition-transform duration-300 shadow-xl">
                <ArrowUpRight size={20} strokeWidth={3} />
              </div>
            </Link>
          </div>

          <div className="mb-4">
             <p className="text-zinc-600 text-sm font-medium">
              &copy; {new Date().getFullYear()} TREMBLE. All rights reserved.
            </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
