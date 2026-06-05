import Link from 'next/link';

interface HeroModuleProps {
  content: {
    title?: string;
    subtitle?: string;
  };
}

export default function HeroModule({ content }: HeroModuleProps) {
  const title = content?.title || "Rule The Streets";
  const subtitle = content?.subtitle || "Exclusive drops. Unmatched quality.";

  // Split title to dynamically highlight the last word in gold
  const titleWords = title.split(' ');

  return (
    <div className="flex flex-col items-center text-center py-10 md:py-20 w-full">
      <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] text-white">
        {titleWords.map((word, i) => (
          <span 
            key={i} 
            className={i === titleWords.length - 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200" : ""}
          >
            {word}{' '}
          </span>
        ))}
      </h1>

      <p className="text-lg md:text-2xl text-zinc-200 mb-10 max-w-2xl font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {subtitle}
      </p>

      <div className="flex flex-col sm:flex-row gap-5">
        <Link
          href="/shop"
          className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg tracking-widest uppercase rounded shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105"
        >
          Enter Store
        </Link>
        <Link
          href="/about"
          className="px-10 py-4 border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] font-bold text-lg tracking-widest uppercase rounded transition-all bg-black/30 backdrop-blur-sm"
        >
          Join VIP List
        </Link>
      </div>
    </div>
  );
}