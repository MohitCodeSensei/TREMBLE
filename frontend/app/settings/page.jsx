"use client";
import React, { useState } from 'react';
import { Camera, Shield, Lock, Wifi, Signal, Download, Settings2, ShieldBan, HardDrive, Smartphone, UserMinus, Plus } from 'lucide-react';

export default function SettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [crossfade, setCrossfade] = useState(true);
  const [crossfadeTime, setCrossfadeTime] = useState(3);
  const [gapless, setGapless] = useState(true);
  const [normalize, setNormalize] = useState(false);
  const [eqPreset, setEqPreset] = useState('Pop');
  const [storage, setStorage] = useState('internal');

  // Mock data for block list
  const [blockList, setBlockList] = useState([
    { id: 1, name: 'Taylor Swift', type: 'Artist', avatar: 'https://i.pravatar.cc/150?u=taylor' },
    { id: 2, name: 'DJ Noise', type: 'User', avatar: 'https://i.pravatar.cc/150?u=djnoise' },
    { id: 3, name: 'Kanye West', type: 'Artist', avatar: 'https://i.pravatar.cc/150?u=kanye' },
  ]);

  const handleUnblock = (id) => {
    setBlockList(blockList.filter(item => item.id !== id));
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button 
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="min-h-screen pt-24 pb-32 px-8 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-zinc-400 text-lg">Manage your account preferences and app settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column (Main Settings) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* SECTION 1: ACCOUNT & PROFILE */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">1</span>
              Account & Profile
            </h2>
            
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              {/* Profile Edit Card */}
              <div className="flex flex-col sm:flex-row gap-8 pb-6 border-b border-white/10">
                <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/10 mx-auto sm:mx-0">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
                    <input type="text" defaultValue="Alex Audiophile" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Public Bio</label>
                    <textarea rows="3" defaultValue="Music enthusiast and playlist curator." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                  </div>
                </div>
              </div>

              {/* Credentials Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="text-white font-medium">alex@audiophile.com</div>
                  </div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white transition-colors">Edit</button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Lock size={18} />
                    </div>
                    <div>
                      <div className="text-white font-medium">Password</div>
                      <div className="text-zinc-500 text-sm">Last changed 3 months ago</div>
                    </div>
                  </div>
                  <button className="text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors">Change Password</button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <Shield size={18} />
                    </div>
                    <div>
                      <div className="text-white font-medium">Two-Factor Authentication</div>
                      <div className="text-zinc-500 text-sm">Protect your account with 2FA</div>
                    </div>
                  </div>
                  <ToggleSwitch enabled={twoFactor} onChange={setTwoFactor} />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: PLAYBACK & AUDIO QUALITY */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm">2</span>
              Playback & Quality
            </h2>

            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-8">
              
              {/* Quality Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    <Wifi size={14} /> Wi-Fi Quality
                  </label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors">
                    <option>Low (96 kbps)</option>
                    <option>Normal (160 kbps)</option>
                    <option>High (320 kbps)</option>
                    <option>Lossless/Hi-Fi</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    <Signal size={14} /> Cellular Quality
                  </label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors">
                    <option>Low (96 kbps)</option>
                    <option>Normal (160 kbps)</option>
                    <option>High (320 kbps)</option>
                    <option>Lossless/Hi-Fi</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                    <Download size={14} /> Download Quality
                  </label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors">
                    <option>Normal (160 kbps)</option>
                    <option>High (320 kbps)</option>
                    <option>Lossless/Hi-Fi</option>
                  </select>
                </div>
              </div>

              <div className="w-full h-px bg-white/10" />

              {/* Audio Equalizer */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-white mb-2">
                    <Settings2 size={18} /> Audio Equalizer
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Flat', 'Bass Booster', 'Acoustic', 'Pop', 'Electronic'].map(preset => (
                    <button
                      key={preset}
                      onClick={() => setEqPreset(preset)}
                      className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                        eqPreset === preset 
                          ? 'bg-purple-500 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                          : 'bg-black/40 border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                {/* 10-Band Mockup */}
                <div className="h-32 bg-black/50 rounded-xl border border-white/5 p-4 flex items-end justify-between gap-1 overflow-hidden">
                  {[40, 60, 30, 70, 80, 50, 45, 65, 85, 55].map((val, i) => (
                    <div key={i} className="w-full max-w-[24px] h-full bg-zinc-800 rounded-full flex flex-col justify-end group">
                      <div 
                        className="w-full rounded-full bg-gradient-to-t from-purple-600 to-indigo-400 transition-all duration-300 group-hover:brightness-125" 
                        style={{ height: `${val}%` }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-white/10" />

              {/* Toggles */}
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">Crossfade</div>
                    <div className="text-zinc-500 text-sm mb-4">Seamlessly transition between songs</div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-zinc-500">0s</span>
                      <input 
                        type="range" 
                        min="0" max="12" 
                        value={crossfadeTime}
                        onChange={(e) => setCrossfadeTime(e.target.value)}
                        disabled={!crossfade}
                        className={`flex-1 h-1.5 rounded-full appearance-none bg-zinc-700 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full ${crossfade ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                      />
                      <span className="text-xs text-zinc-500 font-bold w-4">{crossfadeTime}s</span>
                    </div>
                  </div>
                  <ToggleSwitch enabled={crossfade} onChange={setCrossfade} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">Gapless Playback</div>
                    <div className="text-zinc-500 text-sm">Eliminate silence between album tracks</div>
                  </div>
                  <ToggleSwitch enabled={gapless} onChange={setGapless} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-white font-medium">Volume Normalization</div>
                    <div className="text-zinc-500 text-sm">Keep all songs at a consistent volume level</div>
                  </div>
                  <ToggleSwitch enabled={normalize} onChange={setNormalize} />
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* Right Column (Secondary Settings) */}
        <div className="space-y-10">
          
          {/* SECTION 3: PRIVACY & BLOCK LIST */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm">3</span>
              Privacy
            </h2>
            
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldBan size={18} className="text-zinc-400" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Block List</span>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {blockList.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-sm">No blocked items</div>
                ) : (
                  blockList.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <div className="text-white text-sm font-bold">{item.name}</div>
                          <div className="text-zinc-500 text-xs">{item.type}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUnblock(item.id)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* SECTION 4: STORAGE LOCATION */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">4</span>
              Storage
            </h2>
            
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm space-y-6">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Choose where your offline music and cache data should be stored. Managing space efficiently ensures smooth playback.
              </p>

              <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 relative">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-zinc-800 transition-all duration-300 ease-out ${storage === 'internal' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
                />
                
                <button 
                  onClick={() => setStorage('internal')}
                  className={`relative flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors z-10 ${storage === 'internal' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Smartphone size={16} /> Internal
                </button>
                <button 
                  onClick={() => setStorage('external')}
                  className={`relative flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors z-10 ${storage === 'external' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <HardDrive size={16} /> SD / External
                </button>
              </div>

              <div className="text-xs text-zinc-500 text-center">
                Currently using <span className="text-white font-bold">2.4 GB</span> of {storage === 'internal' ? '128 GB' : '512 GB'}
              </div>
            </div>
          </section>

        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </div>
  );
}
