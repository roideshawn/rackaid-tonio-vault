"use client";

import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 relative min-h-[85vh]">
      
      {/* MAIN FLOATING CONTENT */}
      <div className="z-10 flex flex-col items-center text-center px-6 py-20 w-full max-w-5xl mt-10">
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
          Rule The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Streets</span>
        </h1>

        <p className="text-lg md:text-2xl text-zinc-200 mb-10 max-w-2xl font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Exclusive drops. Unmatched quality. The official Rackaid Tonio storefront is launching soon.
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
            className="px-10 py-4 border-2 border-zinc-500 hover:border-white text-white font-bold text-lg tracking-widest uppercase rounded transition-all bg-black/30 backdrop-blur-sm"
          >
            Join VIP List
          </Link>
        </div>
      </div>
      
    </div>
  );
}