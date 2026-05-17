"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [topEight, setTopEight] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Matrix Visibility States
  const [showTop8, setShowTop8] = useState(true);
  const [showInventory, setShowInventory] = useState(true);
  const [showCommentWall, setShowCommentWall] = useState(false);

  // New Comment State
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global Cart Engine
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchAll() {
      const { data: allProducts } = await supabase.from('products').select('*');
      
      const { data: settings } = await supabase.from('site_settings')
        .select('top_eight_ids, show_top_8, show_inventory, show_comment_wall')
        .eq('id', 1)
        .single();
      
      if (settings) {
        setShowTop8(settings.show_top_8 ?? true);
        setShowInventory(settings.show_inventory ?? true);
        setShowCommentWall(settings.show_comment_wall ?? false);
      }

      if (allProducts && settings?.top_eight_ids) {
        const topIds = settings.top_eight_ids;
        const curated = topIds.map((id: string) => allProducts.find(p => p.id === id)).filter(Boolean);
        setTopEight(curated);
        const rest = allProducts.filter(p => !topIds.includes(p.id));
        setProducts(rest);
      } else if (allProducts) {
        setProducts(allProducts);
      }

      // Fetch Approved Comments
      const { data: approvedComments } = await supabase
        .from('guestbook_comments')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (approvedComments) setComments(approvedComments);

      setIsLoading(false);
    }
    fetchAll();

    // Listen for new approved comments in realtime
    const channel = supabase.channel('public-comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guestbook_comments', filter: 'is_approved=eq.true' }, () => {
        supabase.from('guestbook_comments').select('*').eq('is_approved', true).order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setComments(data); });
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('guestbook_comments').insert([
      { author_name: newCommentName, content: newCommentText }
    ]);

    if (!error) {
      alert("Thanks! Your message has been sent to the admin for review.");
      setNewCommentName('');
      setNewCommentText('');
    } else {
      alert("Failed to post comment. Try again later.");
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white font-black italic animate-pulse">DECRYPTING_VAULT...</div>;

  return (
    <div className="w-full min-h-screen pt-10 pb-32 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-[1400px] bg-[#0a0a0a]/50 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl p-6 sm:p-12 border border-white/5 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col mb-16 relative z-10">
          <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em] mb-3">Official Storefront</p>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-white">
            Rackaid <span className="text-zinc-500 font-light italic">Collection</span>
          </h1>
        </div>

        {!showTop8 && !showInventory && !showCommentWall && (
           <div className="w-full py-40 flex flex-col items-center justify-center text-center">
             <h2 className="text-3xl text-white font-medium mb-4">The Vault is Currently Sealed</h2>
           </div>
        )}

        {/* TOP 8 */}
        {showTop8 && topEight.length > 0 && (
          <div className="mb-24 relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-xl text-white font-medium uppercase tracking-widest">The Top 8</h2>
               <div className="h-px bg-white/10 flex-1"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {topEight.map((p, i) => (
                <div key={p.id} className={`group relative bg-[#050505] rounded-[2rem] overflow-hidden transition-all duration-700 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] cursor-pointer ${i === 0 ? 'md:col-span-2 md:row-span-2 aspect-auto h-full min-h-[400px]' : 'aspect-[4/5]'}`}>
                  {p.image_url ? (
                    <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-zinc-500">No Image</div>
                  )}
                  
                  <div className="absolute inset-x-4 bottom-4 z-10 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                     <h3 className={`font-medium text-white mb-1 leading-tight ${i === 0 ? 'text-2xl' : 'text-base'}`}>{p.name}</h3>
                     <div className="flex justify-between items-center">
                        <p className="text-[#D4AF37] font-bold text-sm">${p.price.toFixed(2)}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(p); }} 
                          className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-medium hover:bg-zinc-200 transition-colors"
                        >
                          Add to Cart
                        </button>
                     </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MASTER INVENTORY */}
        {showInventory && products.length > 0 && (
          <div className="mb-24 relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-xl text-zinc-500 font-medium uppercase tracking-widest italic">All Items</h2>
               <div className="h-px bg-white/5 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {products.map(p => (
                 <div key={p.id} className="group flex flex-col cursor-pointer">
                    <div className="aspect-[4/5] bg-[#050505] rounded-[2rem] overflow-hidden relative mb-5">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-zinc-500">No Image</div>
                      )}
                      <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(p); }} 
                          className="w-full py-3.5 bg-white/90 backdrop-blur-md hover:bg-white text-black font-medium rounded-xl shadow-xl transition-all text-sm"
                        >
                          Add to Cart
                        </button>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <div className="flex flex-col px-1">
                       <div className="flex justify-between items-start mb-1">
                         <h3 className="font-medium text-lg text-white leading-tight pr-2">{p.name}</h3>
                         <p className="font-medium text-[#D4AF37]">${p.price.toFixed(2)}</p>
                       </div>
                       <p className="text-xs text-zinc-500 uppercase tracking-widest">{p.category}</p>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        )}

        {/* MATRIX NODE: VIP COMMENT WALL (GUESTBOOK) */}
        {showCommentWall && (
          <div className="mt-20 pt-20 border-t border-white/5 relative z-10">
            <div className="flex flex-col md:flex-row gap-16">
              
              {/* Left: The Form */}
              <div className="w-full md:w-1/3">
                <h2 className="text-3xl font-medium text-white mb-2">Guestbook</h2>
                <p className="text-zinc-500 text-sm mb-8">Leave a note on the wall. All comments are reviewed by the admin before going live.</p>
                
                <form onSubmit={handlePostComment} className="bg-[#1c1c1e]/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Your Name</label>
                    <input type="text" required maxLength={30} value={newCommentName} onChange={e => setNewCommentName(e.target.value)} className="w-full bg-[#050505] text-white rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none border-none placeholder:text-zinc-600" placeholder="e.g. Virgil" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">Message</label>
                    <textarea required maxLength={300} rows={4} value={newCommentText} onChange={e => setNewCommentText(e.target.value)} className="w-full bg-[#050505] text-white rounded-xl px-4 py-3 focus:ring-1 focus:ring-[#D4AF37]/50 outline-none border-none resize-none placeholder:text-zinc-600" placeholder="Drop a comment..."></textarea>
                  </div>
                  <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black font-medium rounded-xl transition-all shadow-xl">
                    {isSubmitting ? 'Sending...' : 'Post to Wall'}
                  </button>
                </form>
              </div>

              {/* Right: The Wall */}
              <div className="w-full md:w-2/3">
                {comments.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 bg-[#1c1c1e]/20 rounded-[2rem] border border-white/5 border-dashed">
                    <p className="text-zinc-500 font-medium italic">The wall is currently empty. Be the first to leave a mark.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map(comment => (
                      <div key={comment.id} className={`p-6 rounded-[2rem] backdrop-blur-md transition-all ${comment.is_vip ? 'bg-gradient-to-br from-[#1c1c1e] to-[#0a0a0a] border border-[#D4AF37]/40 shadow-[0_0_30px_rgba(212,175,55,0.05)]' : 'bg-[#1c1c1e]/40 border border-white/5'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            {comment.is_vip && <span className="text-[#D4AF37]"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20v2H2v-2zm2-2l2-10h2l2 6 2-6h2l2 6 2-6h2l2 10H4z"/></svg></span>}
                            <h4 className={`text-lg font-medium ${comment.is_vip ? 'text-[#D4AF37]' : 'text-white'}`}>{comment.author_name}</h4>
                          </div>
                          <span className="text-xs font-medium text-zinc-600">{new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <p className={`leading-relaxed ${comment.is_vip ? 'text-zinc-200' : 'text-zinc-400 font-light'}`}>"{comment.content}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}