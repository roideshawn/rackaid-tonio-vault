import { supabase } from '../lib/supabase';
import SiteBackground from './components/SiteBackground';
import HeroModule from './components/modules/HeroModule';
import TopEightModule from './components/modules/TopEightModule';
import CommentWallModule from './components/modules/CommentWallModule';

// Force Next.js to dynamically render this page so the CMS changes are instantly visible
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch active modules directly from Supabase on the server
  const { data: modules } = await supabase
    .from('custom_modules')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });

  return (
    <div className="flex flex-col items-center justify-start w-full flex-1 relative min-h-[100dvh] pb-24">
      
      {/* Dynamic Canvas Background */}
      <SiteBackground />

      {/* MAIN MODULAR CANVAS */}
      <div className="z-10 w-full max-w-5xl px-4 sm:px-6 flex flex-col gap-8 sm:gap-12 mt-10 md:mt-20">
        
        {/* Render Engine */}
        {modules?.map((mod) => {
          switch (mod.module_type) {
            case 'hero':
              return <HeroModule key={mod.id} content={mod.content} />;
            case 'top_8':
              return <TopEightModule key={mod.id} content={mod.content} />;
            case 'comment_wall':
              return <CommentWallModule key={mod.id} content={mod.content} />;
            default:
              return null; // Ignore unknown module types safely
          }
        })}

        {/* CMS Failsafe */}
        {(!modules || modules.length === 0) && (
           <div className="text-center py-20 text-zinc-500 font-mono text-xs uppercase tracking-widest bg-black/50 backdrop-blur-md rounded border border-zinc-800">
             No layout modules active. Configure in Admin Portal.
           </div>
        )}

      </div>
    </div>
  );
}