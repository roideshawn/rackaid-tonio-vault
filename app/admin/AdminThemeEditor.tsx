"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

export default function AdminThemeEditor() {
  const [draftBgUrl, setDraftBgUrl] = useState('');
  const [savedBgUrl, setSavedBgUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 1. Fetch current live setting on load
  useEffect(() => {
    async function fetchCurrentSettings() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('background_image_url')
        .eq('id', 1)
        .single();

      if (data?.background_image_url) {
        setSavedBgUrl(data.background_image_url);
        setDraftBgUrl(data.background_image_url);
      }
    }
    fetchCurrentSettings();
  }, []);

  // 2. Save new setting to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    const { error } = await supabase
      .from('site_settings')
      .update({ background_image_url: draftBgUrl })
      .eq('id', 1);

    setIsSaving(false);
    
    if (error) {
      setSaveMessage('Error saving changes.');
    } else {
      setSavedBgUrl(draftBgUrl);
      setSaveMessage('Look saved successfully! Live on site.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">
        Theme & Livery Editor
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
              Global Background Image URL
            </label>
            <input
              type="text"
              value={draftBgUrl}
              onChange={(e) => setDraftBgUrl(e.target.value)}
              placeholder="Paste image URL here..."
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Paste a direct image link (ending in .png, .jpg, .gif, or .webp).
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <button
              onClick={handleSave}
              disabled={isSaving || draftBgUrl === savedBgUrl}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black tracking-widest uppercase rounded transition-all"
            >
              {isSaving ? 'Pushing to Live...' : draftBgUrl === savedBgUrl ? 'Up to Date' : 'Save & Publish Look'}
            </button>
            
            {saveMessage && (
              <p className={`mt-3 text-sm font-bold text-center ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE MINIATURE PREVIEW */}
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-mono text-[#D4AF37] uppercase tracking-wider">
            Live Preview Monitor
          </label>
          
          {/* Miniature Website Frame */}
          <div className="relative w-full aspect-[4/3] bg-black rounded-lg border-2 border-zinc-700 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            
            {/* The Draft Background Image */}
            {draftBgUrl ? (
              <Image 
                src={draftBgUrl}
                alt="Draft Background"
                fill
                className="object-cover opacity-30" // Exact same opacity as the live site
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-700 font-mono text-sm">
                No Image Loaded
              </div>
            )}

            {/* Simulated Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>

            {/* Simulated Homepage UI overlay (just for scale/context) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
               <h1 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                 Rule The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Streets</span>
               </h1>
               <div className="mt-4 px-4 py-2 bg-red-600/50 rounded shadow-lg"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}