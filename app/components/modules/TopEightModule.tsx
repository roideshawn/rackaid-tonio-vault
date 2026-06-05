interface TopEightProps {
  content: {
    heading?: string;
  };
}

export default function TopEightModule({ content }: TopEightProps) {
  const heading = content?.heading || "Tonio's Top 8";

  // Placeholder array until we wire up the actual product inventory in Phase 3
  const top8 = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    name: `Vault Scent 0${i + 1}`,
    image: '/logo.PNG' 
  }));

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg p-6 md:p-8 shadow-2xl">
      <h2 className="text-xl font-mono tracking-widest text-[#D4AF37] uppercase mb-6 border-b border-zinc-800 pb-2">
        {heading}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {top8.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-3 group cursor-pointer">
            <div className="w-full aspect-square bg-zinc-950 border border-zinc-800 rounded overflow-hidden relative transition-all group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              {/* Using standard img tag here to easily accept external Supabase Bucket URLs without throwing Next.js config domain errors */}
              <img 
                src={item.image} 
                alt={item.name} 
                className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity" 
              />
            </div>
            <p className="text-[10px] sm:text-xs font-mono text-zinc-400 text-center uppercase tracking-wider group-hover:text-white transition-colors truncate w-full px-1">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}