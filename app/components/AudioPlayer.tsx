"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const [trackData, setTrackData] = useState({ title: '', artist: '' });
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // 1. Fetch initial song and metadata
    async function fetchSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('profile_song_url, profile_song_title, profile_song_artist')
        .eq('id', 1)
        .single();
        
      if (data) {
        if (data.profile_song_url) setSongUrl(data.profile_song_url);
        setTrackData({
          title: data.profile_song_title || 'Unknown Track',
          artist: data.profile_song_artist || 'Rackaid Tonio'
        });
      }
      setIsLoading(false);
    }
    fetchSettings();

    // 2. LISTEN FOR INSTANT UPDATES (Supabase Realtime)
    const channel = supabase.channel('custom-audio-channel')
      // Added ': any' to payload to bypass strict TypeScript checking
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload: any) => {
        if (payload.new) {
          if (payload.new.profile_song_url) setSongUrl(payload.new.profile_song_url);
          setTrackData({
            title: payload.new.profile_song_title || 'Unknown Track',
            artist: payload.new.profile_song_artist || 'Rackaid Tonio'
          });
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 3. AGGRESSIVE AUTOPLAY LOGIC
  useEffect(() => {
    if (!songUrl || !audioRef.current) return;

    const attemptPlay = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (err) {
        const playOnInteraction = async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
          } catch (e) {}
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
      }
    };

    attemptPlay();
  }, [songUrl]);

  const togglePlay = () => {
    if (audioRef.current && songUrl) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  if (isLoading) return null; 

  const displayText = !songUrl 
    ? "NO_TRACK_LOADED" 
    : `${trackData.artist} - ${trackData.title}`;

  return (
    <>
      {/* Inline style for the classic MySpace/Winamp scrolling text effect */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-150%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 8s linear infinite;
        }
      `}</style>

      <div className="fixed bottom-4 left-4 z-50 bg-black border-2 border-zinc-800 p-2 shadow-[4px_4px_0px_rgba(212,175,55,0.6)] flex items-center gap-3 w-64 opacity-90 hover:opacity-100 transition-opacity rounded-sm backdrop-blur-md">
        {songUrl && <audio ref={audioRef} src={songUrl} loop />}
        
        <button 
          onClick={togglePlay}
          disabled={!songUrl}
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-zinc-900 border border-zinc-700 hover:bg-[#D4AF37] hover:border-[#B5952F] hover:text-black text-white disabled:opacity-50 transition-colors text-xs font-mono rounded-sm"
        >
          {isPlaying ? '||' : '>'}
        </button>

        <div className="flex-1 overflow-hidden relative h-8 flex flex-col justify-center">
          <p className="text-[9px] text-[#D4AF37] uppercase font-black tracking-[0.2em] mb-0.5 z-10 bg-black/80 w-fit pr-2 absolute top-0 left-0">
            Now Playing
          </p>
          <div className="w-full overflow-hidden whitespace-nowrap mt-3">
            <p className={`text-xs font-mono ${!songUrl ? 'text-red-900' : isPlaying ? 'text-white animate-marquee' : 'text-zinc-500'}`}>
              {displayText}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}