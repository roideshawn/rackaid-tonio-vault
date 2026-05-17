"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../context/CartContext'; 

export default function Navbar() {
  const [brandPrimary, setBrandPrimary] = useState('Rackaid');
  const [brandAccent, setBrandAccent] = useState('Tonio');
  
  // Connect to the Global Cart Engine
  const { toggleCart, items } = useCart(); 

  // Dynamically calculate total items (accounting for multiple quantities of the same item)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // 1. Fetch the initial brand identity from the vault
    async function fetchBrand() {
      const { data } = await supabase
        .from('site_settings')
        .select('brand_name_primary, brand_name_accent')
        .eq('id', 1)
        .single();
        
      if (data) {
        setBrandPrimary(data.brand_name_primary || 'Rackaid');
        setBrandAccent(data.brand_name_accent || 'Tonio');
      }
    }
    fetchBrand();

    // 2. Listen to the Customization Matrix for instant OS updates
    const channel = supabase.channel('brand-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        setBrandPrimary(payload.new.brand_name_primary || 'Rackaid');
        setBrandAccent(payload.new.brand_name_accent || 'Tonio');
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <nav className="fixed top-10 left-0 w-full z-[90] bg-black/30 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Dynamic Matrix-Controlled Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter uppercase drop-shadow-md">
          {brandPrimary} <span className="text-red-600">{brandAccent}</span>
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/shop" className="text-sm font-medium hover:text-[#D4AF37] transition-colors">
            Storefront
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-[#D4AF37] transition-colors hidden sm:block">
            Archive
          </Link>
          
          {/* Global Cart Trigger */}
          <button 
            onClick={toggleCart} 
            className="text-sm font-bold bg-white text-black pl-4 pr-1.5 py-1.5 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-lg"
          >
            Cart 
            <span className={`text-[10px] w-6 h-6 flex items-center justify-center rounded-full transition-colors ${totalItems > 0 ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}