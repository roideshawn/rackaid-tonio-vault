"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

export default function SiteBackground() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const logos = ["/logo.png", "/logo_2.png", "/logo_3.png"];
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  useEffect(() => {
    // 1. Fetch initial background
    async function fetchBg() {
      const { data } = await supabase.from('site_settings').select('background_image_url').eq('id', 1).single();
      if (data?.background_image_url) setBgUrl(data.background_image_url);
    }
    fetchBg();

    // 2. LISTEN FOR INSTANT UPDATES (Supabase Realtime)
    const channel = supabase.channel('custom-bg-channel')
      // Added ': any' to payload to bypass strict TypeScript checking
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload: any) => {
        if (payload.new && payload.new.background_image_url) {
          setBgUrl(payload.new.background_image_url);
        }
      }).subscribe();

    // 3. Start the Canvas Shuffle
    const interval = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % logos.length);
    }, 3000); 

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel); // Cleanup listener
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
      {/* Primary Global Background Image */}
      {bgUrl && (
        <Image 
          src={bgUrl} 
          alt="Global Background" 
          fill 
          sizes="100vw"
          className="object-cover opacity-30 transition-all duration-1000" 
          priority 
        />
      )}
      
      {/* Shuffling Logo Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        <Image 
          src={logos[currentLogoIndex]} 
          alt="Canvas" 
          fill 
          sizes="100vw"
          className="object-contain md:object-cover transition-opacity duration-1000 ease-in-out" 
          priority 
        />
      </div>
      
      {/* Vignette / Dark Gradient Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
    </div>
  );
}