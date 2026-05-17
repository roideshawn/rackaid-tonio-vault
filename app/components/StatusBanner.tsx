"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function StatusBanner() {
  const [data, setData] = useState({ mood: '💎', status: '' });

  useEffect(() => {
    async function fetchStatus() {
      const { data: initialData } = await supabase.from('site_settings').select('site_mood, site_status').eq('id', 1).single();
      if (initialData) setData({ mood: initialData.site_mood, status: initialData.site_status });
    }
    fetchStatus();

    const channel = supabase.channel('status-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        setData({ mood: payload.new.site_mood, status: payload.new.site_status });
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!data.status) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] h-10 flex items-center overflow-hidden pointer-events-none">
      
      {/* Floating Gold Label */}
      <div className="flex items-center px-6 h-full text-[#D4AF37] font-black text-[10px] tracking-widest uppercase mr-2 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        Live Feed
      </div>
      
      {/* Floating Scrolling Text */}
      <div className="flex-1 whitespace-nowrap overflow-hidden relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        <p className="text-xs font-medium tracking-wide text-zinc-100 inline-block animate-marquee-slow">
          <span className="mr-2">{data.mood}</span>
          {data.status}
        </p>
      </div>
      
    </div>
  );
}