"use client";
import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Camera, User, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = usePlayer();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username || '', email: user.email || '' });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const res = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          username: formData.username,
          email: formData.email
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to update profile');
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    setError('');
    setSuccessMessage('');
    
    const uploadData = new FormData();
    uploadData.append('user_id', user.id);
    uploadData.append('file', file);
    
    try {
      const res = await fetch('http://localhost:8000/api/auth/profile/picture', {
        method: 'POST',
        body: uploadData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to upload picture');
      
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccessMessage('Profile picture updated!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col pt-24 px-8 min-h-screen">
        <h1 className="text-3xl font-black text-white mb-8">Settings</h1>
        <div className="text-zinc-400">Please log in to view your settings.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-24 px-8 pb-32 min-h-screen relative overflow-y-auto z-0">
      
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none -z-10" />
      
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Settings</h1>
        <p className="text-zinc-400 mb-10">Manage your account settings and preferences.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-10">
          
          {/* Sidebar Menu */}
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-medium transition-colors">
              <User size={18} />
              Profile
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-medium transition-colors">
              <SettingsIcon size={18} />
              Preferences
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="flex flex-col gap-8">
            
            {/* Profile Card */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl font-bold text-white mb-6">Public Profile</h2>
              
              {/* Picture Upload Section */}
              <div className="flex items-center gap-8 mb-8">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center border-4 border-zinc-900 shadow-xl group-hover:border-indigo-500/50 transition-all duration-300">
                    {isUploading ? (
                      <Loader2 className="animate-spin text-indigo-400" size={32} />
                    ) : user.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-white">{user.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <Camera className="text-white" size={28} />
                  </div>
                  
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-white font-bold text-lg mb-1">Profile Picture</h3>
                  <p className="text-zinc-400 text-sm max-w-xs">Upload a new avatar. Larger images will be automatically resized. Maximum size 5MB.</p>
                </div>
              </div>
              
              <div className="h-px w-full bg-white/10 mb-8" />
              
              {/* Form Section */}
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300 pl-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-zinc-500" size={18} />
                    </div>
                    <input 
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:bg-black/60 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="Your username"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300 pl-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-zinc-500" size={18} />
                    </div>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:bg-black/60 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                      placeholder="Your email address"
                      required
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                    <CheckCircle2 size={18} /> {successMessage}
                  </div>
                )}
                
                <div className="flex justify-end pt-4 mt-2">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick inline icon component to avoid adding more imports
function SettingsIcon({ size = 24, className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}
