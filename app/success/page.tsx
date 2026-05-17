"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function SuccessPage() {
  const { items, removeFromCart } = useCart();

  // Clear the cart on successful checkout
  useEffect(() => {
    items.forEach(item => removeFromCart(item.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-[#0a0a0a]/80 backdrop-blur-2xl p-12 rounded-[3rem] border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] text-center relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#D4AF37]/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="w-20 h-20 bg-[#D4AF37] text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        
        <h1 className="text-3xl font-medium tracking-tight text-white mb-4">Transaction Secured</h1>
        <p className="text-zinc-400 font-light leading-relaxed mb-10">
          Your order has been encrypted and added to the ledger. You will receive a tracking confirmation shortly. Welcome to the inner circle.
        </p>

        <Link href="/shop" className="inline-block w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold uppercase tracking-widest rounded-xl transition-all">
          Return to Vault
        </Link>
      </div>
    </div>
  );
}