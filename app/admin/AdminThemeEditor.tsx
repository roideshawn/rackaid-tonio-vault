"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

export default function AdminThemeEditor() {
  const [draftBgUrl, setDraftBgUrl] = useState('');
  const [draftLogos, setDraftLogos] = useState(['', '', '']);
  const [savedData, setSavedData] = useState({ bg: '', l1: '', l2: '', l3: '' });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Preview Animation State
  const [previewLogoIndex, setPreviewLogoIndex] = useState(0);

  // 1. Fetch current live setting on load
  useEffect(() => {
    async function fetchCurrentSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('background_image_url, canvas_logo_1, canvas_logo_2, canvas_logo_3')
        .eq('id', 1)
        .single();

      if (data) {
        setDraftBgUrl(data.background_image_url || '');
        setDraftLogos([data.canvas_logo_1 || '', data.canvas_logo_2 || '', data.canvas_logo_3 || '']);
        setSavedData({
          bg: data.background_image_url || '',
          l1: data.canvas_logo_1 || '',
          l2: data.canvas_logo_2 || '',
          l3: data.canvas_logo_3 || ''
        });
      }
    }
    fetchCurrentSettings();
  }, []);

  // 2. Animate the Preview Monitor
  useEffect(() => {
    const validLogos = draftLogos.filter(url => url.trim() !== '');
    if (validLogos.length === 0) return;

    const interval = setInterval(() => {
      setPreviewLogoIndex((prev) => (prev + 1) % validLogos.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, [draftLogos]);

  // 3. Save to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    const { error } = await supabase
      .from('site_settings')
      .update({ 
        background_image_url: draftBgUrl,
        canvas_logo_1: draftLogos[0],
        canvas_logo_2: draftLogos[1],
        canvas_logo_3: draftLogos[2],
      })
      .eq('id', 1);

    setIsSaving(false);
    
    if (error) {
      setSaveMessage('Error saving changes.');
    } else {
      setSavedData({ bg: draftBgUrl, l1: draftLogos[0], l2: draftLogos[1], l3: draftLogos[2] });
      setSaveMessage('Look saved successfully! Live on site.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const updateDraftLogo = (index: number, value: string) => {
    const newLogos = [...draftLogos];
    newLogos[index] = value;
    setDraftLogos(newLogos);
  };

  const hasChanges = 
    draftBgUrl !== savedData.bg || 
    draftLogos[0] !== savedData.l1 || 
    draftLogos[1] !== savedData.l2 || 
    draftLogos[2] !== savedData.l3;

  const validPreviewLogos = draftLogos.filter(url => url.trim() !== '');

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl">
      <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">
        Theme & Canvas Editor
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT COLUMN: CONTROLS */}
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">Global Background Image</label>
            <input
              type="text"
              value={draftBgUrl}
              onChange={(e) => setDraftBgUrl(e.target.value)}
              placeholder="Paste Supabase public URL..."
              className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
            />
          </div>

          <div className="space-y-4 p-4 border border-zinc-800 rounded bg-black/50">
            <label className="block text-xs font-mono text-[#D4AF37] uppercase tracking-wider">Canvas Shuffling Logos</label>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="text"
                value={draftLogos[i]}
                onChange={(e) => updateDraftLogo(i, e.target.value)}
                placeholder={`Logo ${i + 1} URL...`}
                className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-[#D4AF37] transition-colors font-mono text-sm"
              />
            ))}
            <p className="text-xs text-zinc-500">Upload images to Supabase Storage and paste the Public URLs here.</p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black tracking-widest uppercase rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:shadow-none"
            >
              {isSaving ? 'Pushing to Live...' : !hasChanges ? 'Up to Date' : 'Save & Publish Look'}
            </button>
            {saveMessage && <p className={`mt-3 text-sm font-bold text-center ${saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{saveMessage}</p>}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE MINIATURE PREVIEW */}
        <div className="flex flex-col gap-2">
          <label className="block text-xs font-mono text-[#D4AF37] uppercase tracking-wider">Live Preview Monitor</label>
          <div className="relative w-full aspect-[4/3] bg-black rounded-lg border-2 border-zinc-700 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            {draftBgUrl && <Image src={draftBgUrl} alt="Bg" fill className="object-cover opacity-30" />}
            {validPreviewLogos.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Image 
                  src={validPreviewLogos[previewLogoIndex] || validPreviewLogos[0]} 
                  alt="Draft Logo" 
                  fill 
                  className="object-cover transition-opacity duration-1000 ease-in-out" 
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50">
               <h1 className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                 Rule The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Streets</span>
               </h1>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}