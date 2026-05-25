"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';

export default function SiteBackground() {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  
  // Default fallback
  const [logos, setLogos] = useState<string[]>(["/logo.PNG", "/logo_2.PNG", "/logo_3.PNG"]);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  useEffect(() => {
    // 1. Fetch live database links
    async function fetchTheme() {
      const { data } = await supabase
        .from('site_settings')
        .select('background_image_url, canvas_logo_1, canvas_logo_2, canvas_logo_3')
        .eq('id', 1)
        .single();
        
      if (data) {
        if (data.background_image_url) setBgUrl(data.background_image_url);
        
        // Extract valid logo URLs from DB
        const dbLogos = [data.canvas_logo_1, data.canvas_logo_2, data.canvas_logo_3].filter(url => url && url.trim() !== '');
        if (dbLogos.length > 0) setLogos(dbLogos);
      }
    }
    fetchTheme();

    // 2. LISTEN FOR INSTANT UPDATES FROM ADMIN PORTAL
    const channel = supabase.channel('custom-bg-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload: Record<string, any>) => {
        if (payload.new) {
          if (payload.new.background_image_url) setBgUrl(payload.new.background_image_url);
          
          const newLogos = [payload.new.canvas_logo_1, payload.new.canvas_logo_2, payload.new.canvas_logo_3].filter(url => url && url.trim() !== '');
          if (newLogos.length > 0) {
            setLogos(newLogos);
            setCurrentLogoIndex(0); // Reset animation index
          }
        }
      }).subscribe();

    // 3. Start the Canvas Shuffle
    const interval = setInterval(() => {
      setLogos(currentLogos => {
        setCurrentLogoIndex((prev) => (prev + 1) % currentLogos.length);
        return currentLogos;
      });
    }, 3000); 

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] z-[-1] pointer-events-none bg-black">
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
      
      {logos.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <Image 
            src={logos[currentLogoIndex] || logos[0]} 
            alt="Canvas" 
            fill 
            sizes="100vw"
            className="object-cover transition-opacity duration-1000 ease-in-out" 
            priority 
          />
        </div>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
    </div>
  );
}