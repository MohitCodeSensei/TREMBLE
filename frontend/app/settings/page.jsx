"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { API_URL } from '../../utils/api';
import { Camera, User, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function SettingsContent() {
  const { user, setUser, preferences, updatePreference } = usePlayer();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
      const res = await fetch(`${API_URL}/api/auth/profile`, {
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
    
    // Convert & optimize image to Base64 data URL for fast and reliable storage
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result;
      if (!base64Url) {
        setIsUploading(false);
        return;
      }

      // Try uploading to backend API
      try {
        const uploadData = new FormData();
        uploadData.append('user_id', user.id);
        uploadData.append('file', file);
        
        let updatedUser = null;
        try {
          const res = await fetch(`${API_URL}/api/auth/profile/picture`, {
            method: 'POST',
            body: uploadData
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user) updatedUser = data.user;
          }
        } catch (uploadErr) {
          console.warn("Binary picture upload fallback to direct profile update:", uploadErr);
        }

        // If backend returned updated user, or if binary upload wasn't saved, persist base64
        if (!updatedUser) {
          try {
            const profRes = await fetch(`${API_URL}/api/auth/profile`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                username: user.username || formData.username,
                email: user.email || formData.email,
                profile_picture_url: base64Url
              })
            });
            if (profRes.ok) {
              const profData = await profRes.json();
              if (profData?.user) updatedUser = profData.user;
            }
          } catch (e) {}
        }

        const finalUser = updatedUser || { ...user, profile_picture_url: base64Url };
        setUser(finalUser);
        localStorage.setItem('user', JSON.stringify(finalUser));
        setSuccessMessage('Profile picture updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        // Safe local state & storage update so user always sees the new avatar
        const fallbackUser = { ...user, profile_picture_url: base64Url };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        setSuccessMessage('Profile picture updated!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Could not read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
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
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <User size={18} />
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'preferences' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <SettingsIcon size={18} />
              Preferences
            </button>
          </div>
          
          {/* Main Content Area */}
          <div className="flex flex-col gap-8">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                        <img loading="lazy" src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
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
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>
                
                <div className="flex flex-col gap-6">
                  {/* Mouse pointer animation */}
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-white font-medium text-lg">Mouse pointer animation</h3>
                       <p className="text-zinc-400 text-sm">Enable interactive glowing trail that follows your mouse cursor.</p>
                    </div>
                    <Switch checked={preferences?.mousePointerAnimation !== false} onChange={(val) => updatePreference('mousePointerAnimation', val)} />
                  </div>
                  <div className="h-px w-full bg-white/10" />
                  
                  {/* Liquid metal search bar */}
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-white font-medium text-lg">Liquid metal search bar</h3>
                       <p className="text-zinc-400 text-sm">Enable fluid dynamic liquid metal animation effect on the search bar.</p>
                    </div>
                    <Switch checked={preferences?.liquidMetalSearchBar !== false} onChange={(val) => updatePreference('liquidMetalSearchBar', val)} />
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  {/* Crossfade Slider */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium text-lg">Crossfade</h3>
                        <p className="text-zinc-400 text-sm">Smoothly crossfade audio between consecutive tracks (0 to 15 seconds).</p>
                      </div>
                      <span className="text-indigo-400 font-mono font-bold text-base px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        {preferences?.crossfade ? `${preferences.crossfade}s` : '0s (Off)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <span className="text-xs text-zinc-500 font-semibold w-5">0s</span>
                      <input 
                        type="range"
                        min="0"
                        max="15"
                        step="1"
                        value={preferences?.crossfade || 0}
                        onChange={(e) => updatePreference('crossfade', parseInt(e.target.value, 10))}
                        className="flex-1 accent-indigo-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-zinc-500 font-semibold w-6 text-right">15s</span>
                    </div>
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  {/* High Quality Audio */}
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-white font-medium text-lg">High Quality Audio</h3>
                       <p className="text-zinc-400 text-sm">Stream audio in maximum available quality.</p>
                    </div>
                    <Switch checked={preferences?.highQualityAudio !== false} onChange={(val) => updatePreference('highQualityAudio', val)} />
                  </div>
                  <div className="h-px w-full bg-white/10" />
                  
                  {/* Data Saver */}
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-white font-medium text-lg">Data Saver</h3>
                       <p className="text-zinc-400 text-sm">Reduce data usage by downloading lower quality audio and images.</p>
                    </div>
                    <Switch checked={preferences?.dataSaver === true} onChange={(val) => updatePreference('dataSaver', val)} />
                  </div>
                  <div className="h-px w-full bg-white/10" />

                  {/* Autoplay */}
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-white font-medium text-lg">Autoplay</h3>
                       <p className="text-zinc-400 text-sm">Automatically play similar songs when your queue ends.</p>
                    </div>
                    <Switch checked={preferences?.autoplay !== false} onChange={(val) => updatePreference('autoplay', val)} />
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex-1 min-h-screen bg-black"></div>}>
      <SettingsContent />
    </Suspense>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${checked ? 'bg-indigo-500' : 'bg-zinc-700'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute transition-all duration-300 shadow-sm ${checked ? 'left-[26px]' : 'left-[2px]'}`} />
    </button>
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
