interface CommentWallProps {
  content: {
    heading?: string;
  };
}

export default function CommentWallModule({ content }: CommentWallProps) {
  const heading = content?.heading || "Guestbook & Reviews";

  return (
    <div className="w-full bg-black/60 backdrop-blur-md border border-zinc-800 rounded-lg p-6 md:p-8 shadow-2xl">
      <h2 className="text-xl font-mono tracking-widest text-[#D4AF37] uppercase mb-6 border-b border-zinc-800 pb-2">
        {heading}
      </h2>
      
      <div className="space-y-6">
        {/* Placeholder Comment - We will connect this to the database later */}
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-zinc-950 rounded flex-shrink-0 border border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.2)]"></div>
          <div className="flex-1 bg-zinc-900/50 p-4 rounded border border-zinc-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Verified VIP</span>
              <span className="text-[10px] font-mono text-zinc-500">10/24/2026</span>
            </div>
            <p className="text-sm text-zinc-300 font-light leading-relaxed">
              &quot;Absolutely insane presentation. The packaging alone feels like a vault opening. The scent profiles are completely unmatched.&quot;
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800">
         <button className="w-full py-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 hover:border-[#D4AF37] text-zinc-300 hover:text-[#D4AF37] text-xs font-mono uppercase tracking-widest rounded transition-all">
           Leave a Note
         </button>
      </div>
    </div>
  );
}