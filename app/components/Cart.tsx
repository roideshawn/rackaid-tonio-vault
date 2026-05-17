"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { createCheckoutSession } from '../actions/checkout';

export default function Cart() {
  const { isOpen, toggleCart, items, removeFromCart, cartTotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      
      // 1. Call our Next.js Server Action
      const { url } = await createCheckoutSession(items);
      
      // 2. Standard browser redirect to the secure Stripe URL
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No URL returned from Stripe.");
      }
      
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={toggleCart} />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border-l border-white/5 shadow-2xl z-[101] flex flex-col animate-slide-in-right">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-medium tracking-tight text-white uppercase">Your Bag</h2>
          <button onClick={toggleCart} className="text-zinc-500 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <p className="font-light italic">Your bag is currently empty.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 items-center bg-[#1c1c1e]/40 p-3 rounded-2xl border border-white/5">
                <div className="w-20 h-20 bg-black rounded-xl relative overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700">No Img</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white line-clamp-1">{item.name}</h3>
                  <p className="text-[#D4AF37] text-xs font-bold mt-1">${item.price.toFixed(2)}</p>
                  <p className="text-zinc-500 text-xs mt-1">Qty: {item.quantity}</p>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-[#050505]/80">
          <div className="flex justify-between items-center mb-6">
            <span className="text-zinc-400 font-medium uppercase tracking-widest text-xs">Subtotal</span>
            <span className="text-xl font-medium text-white">${cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={items.length === 0 || isCheckingOut}
            className="w-full py-4 bg-[#D4AF37] hover:bg-[#B5952F] disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-center"
          >
            {isCheckingOut ? 'Securing Connection...' : 'Secure Checkout'}
          </button>
        </div>

      </div>
    </>
  );
}