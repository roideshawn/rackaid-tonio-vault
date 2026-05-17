"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../../lib/supabase';
import { sendDispatchEmail } from '../actions/email';

interface Product { id: string; name: string; price: number; category: string; image_url: string | null; }
interface Comment { id: string; author_name: string; content: string; is_approved: boolean; is_vip: boolean; created_at: string; }
interface Order { id: string; customer_email: string; customer_name: string; total_amount: number; payment_status: string; tracking_number: string | null; created_at: string; order_items: any[]; }

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // OS State (Tabs)
  const [activeTab, setActiveTab] = useState<'inventory' | 'curation' | 'fulfillment' | 'matrix'>('inventory');

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Forms & Settings State
  const [name, setName] = useState(''); const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Fragrances');
  const [description, setDescription] = useState(''); const [details, setDetails] = useState(''); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fulfillment State
  const [trackingInputs, setTrackingInputs] = useState<{[key: string]: string}>({});

  // Customization Engine State
  const [brandPrimary, setBrandPrimary] = useState('Rackaid');
  const [brandAccent, setBrandAccent] = useState('Tonio');
  const [topEightIds, setTopEightIds] = useState<string[]>([]);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [songTitle, setSongTitle] = useState(''); const [songArtist, setSongArtist] = useState('');
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [siteMood, setSiteMood] = useState('💎'); const [siteStatus, setSiteStatus] = useState('');
  const [showTop8, setShowTop8] = useState(true); const [showInventory, setShowInventory] = useState(true); const [showCommentWall, setShowCommentWall] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [isUpdatingSite, setIsUpdatingSite] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
      if (session) fetchData();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    const [prodRes, commRes, setRes, ordRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('guestbook_comments').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    if (commRes.data) setComments(commRes.data);
    if (ordRes.data) setOrders(ordRes.data);
    if (setRes.data) {
      setBrandPrimary(setRes.data.brand_name_primary || 'Rackaid');
      setBrandAccent(setRes.data.brand_name_accent || 'Tonio');
      setSongTitle(setRes.data.profile_song_title || '');
      setSongArtist(setRes.data.profile_song_artist || '');
      setTopEightIds(setRes.data.top_eight_ids || []);
      setSiteMood(setRes.data.site_mood || '💎'); setSiteStatus(setRes.data.site_status || '');
      setShowTop8(setRes.data.show_top_8 ?? true); setShowInventory(setRes.data.show_inventory ?? true); setShowCommentWall(setRes.data.show_comment_wall ?? false);
      setEmailTemplate(setRes.data.shipping_email_template || '');
    }
    setIsLoading(false);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoggingIn(true); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoggingIn(false);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  // --- ACTIONS ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault(); setIsUploading(true);
    let image_url = null;
    if (imageFile) {
      const fileName = `${Math.random()}.${imageFile.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (!error) image_url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }
    const detailsArray = details.split(',').map(i => i.trim()).filter(i => i !== '');
    await supabase.from('products').insert([{ name, price: parseFloat(price), category, description, details: detailsArray, image_url }]);
    alert("Product published!");
    setName(''); setPrice(''); setDescription(''); setDetails(''); setImageFile(null);
    fetchData(); setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from('products').delete().eq('id', id); fetchData();
  };

  const toggleTopEight = (id: string) => {
    setTopEightIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 8) return prev; 
      return [...prev, id];
    });
  };
  const saveTopEight = async () => {
    await supabase.from('site_settings').update({ top_eight_ids: topEightIds }).eq('id', 1);
    alert("Top 8 Curation Updated.");
  };

  const handleUpdateMatrix = async (e: React.FormEvent) => {
    e.preventDefault(); setIsUpdatingSite(true);
    let song_url = null; let bg_url = null;
    if (songFile) {
      const fileName = `song-${Date.now()}.mp3`;
      await supabase.storage.from('site-assets').upload(fileName, songFile);
      song_url = supabase.storage.from('site-assets').getPublicUrl(fileName).data.publicUrl;
    }
    if (bgFile) {
      const fileName = `bg-${Date.now()}.${bgFile.name.split('.').pop()}`;
      await supabase.storage.from('site-assets').upload(fileName, bgFile);
      bg_url = supabase.storage.from('site-assets').getPublicUrl(fileName).data.publicUrl;
    }

    const updates: any = { 
      id: 1, brand_name_primary: brandPrimary, brand_name_accent: brandAccent,
      profile_song_title: songTitle, profile_song_artist: songArtist,
      site_mood: siteMood, site_status: siteStatus, show_top_8: showTop8, show_inventory: showInventory, show_comment_wall: showCommentWall,
      shipping_email_template: emailTemplate
    }; 
    if (song_url) updates.profile_song_url = song_url;
    if (bg_url) updates.background_image_url = bg_url;

    await supabase.from('site_settings').upsert(updates);
    alert("The Matrix has been updated."); setSongFile(null); setBgFile(null); setIsUpdatingSite(false);
  };

  const toggleComment = async (id: string, field: 'is_approved' | 'is_vip', currentVal: boolean) => {
    await supabase.from('guestbook_comments').update({ [field]: !currentVal }).eq('id', id); fetchData();
  };
  const deleteComment = async (id: string) => {
    if (!confirm("Delete comment?")) return;
    await supabase.from('guestbook_comments').delete().eq('id', id); fetchData();
  };

  const handleFulfillOrder = async (orderId: string, customerEmail: string) => {
    const tracking = trackingInputs[orderId];
    if (!tracking) return alert("Please enter a tracking number.");
    
    // 1. Update DB to 'shipped'
    await supabase.from('orders').update({ tracking_number: tracking, payment_status: 'shipped' }).eq('id', orderId);
    
    // 2. Trigger the Real Email via Resend Action
    const response = await sendDispatchEmail(customerEmail, tracking, emailTemplate);
    
    if (response.success) {
      alert(`Order updated! Dispatch email sent to ${customerEmail}`);
    } else {
      alert(`Order updated, but email failed: ${response.error}. (Remember: in test mode, you can only send to your own email address).`);
    }
    
    fetchData();
  };

  // --- RENDER ---
  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center text-[#D4AF37] font-bold animate-pulse">Initializing...</div>;
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#0a0a0a]/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl">
        <h1 className="text-2xl text-center text-white mb-8">Admin Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#1c1c1e] text-white rounded-xl px-4 py-4 outline-none border-none" />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#1c1c1e] text-white rounded-xl px-4 py-4 outline-none border-none" />
          <button disabled={isLoggingIn} className="w-full mt-4 py-4 bg-white text-black font-medium rounded-xl">Sign In</button>
        </form>
      </div>
    </div>
  );

  const pendingOrdersCount = orders.filter(o => o.payment_status === 'paid' && !o.tracking_number).length;

  return (
    <div className="flex min-h-screen bg-transparent pt-10">
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-64 fixed top-24 left-6 bottom-6 bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 flex flex-col hidden md:flex z-20 shadow-2xl">
        <h1 className="text-xl font-medium tracking-tight text-white mb-10 px-2">Command Center</h1>
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('inventory')} className={`text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'inventory' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:bg-[#1c1c1e] hover:text-white'}`}>📦 Inventory</button>
          <button onClick={() => setActiveTab('curation')} className={`text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex justify-between items-center ${activeTab === 'curation' ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'text-zinc-400 hover:bg-[#1c1c1e] hover:text-white'}`}>
            <span>👑 Curation</span>
          </button>
          <button onClick={() => setActiveTab('fulfillment')} className={`text-left px-4 py-3 rounded-xl transition-all text-sm font-medium flex justify-between items-center ${activeTab === 'fulfillment' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:bg-[#1c1c1e] hover:text-white'}`}>
            <span>🚚 Fulfillment</span>
            {pendingOrdersCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrdersCount}</span>}
          </button>
          <button onClick={() => setActiveTab('matrix')} className={`text-left px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === 'matrix' ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700' : 'text-zinc-400 hover:bg-[#1c1c1e] hover:text-white'}`}>⚙️ The Matrix</button>
        </nav>
        <button onClick={handleLogout} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors py-3 text-left px-4">Sign Out</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-72 p-6 max-w-[1200px] mb-32 z-10">
        
        {/* MOBILE TABS */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-6 mb-4 hide-scrollbar">
          <button onClick={() => setActiveTab('inventory')} className={`whitespace-nowrap px-5 py-3 rounded-full text-sm font-medium ${activeTab === 'inventory' ? 'bg-white text-black' : 'bg-[#1c1c1e] text-zinc-400'}`}>Inventory</button>
          <button onClick={() => setActiveTab('curation')} className={`whitespace-nowrap px-5 py-3 rounded-full text-sm font-medium ${activeTab === 'curation' ? 'bg-[#D4AF37] text-black' : 'bg-[#1c1c1e] text-zinc-400'}`}>Curation</button>
          <button onClick={() => setActiveTab('fulfillment')} className={`whitespace-nowrap px-5 py-3 rounded-full text-sm font-medium ${activeTab === 'fulfillment' ? 'bg-blue-600 text-white' : 'bg-[#1c1c1e] text-zinc-400'}`}>Fulfillment</button>
          <button onClick={() => setActiveTab('matrix')} className={`whitespace-nowrap px-5 py-3 rounded-full text-sm font-medium ${activeTab === 'matrix' ? 'bg-zinc-800 text-white' : 'bg-[#1c1c1e] text-zinc-400'}`}>The Matrix</button>
        </div>

        {isLoading ? ( <p className="text-zinc-500 animate-pulse">Loading modules...</p> ) : (
          <>
            {/* VIEW 1: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="flex flex-col gap-10">
                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/5">
                  <h2 className="text-2xl font-medium tracking-tight mb-6 text-white">Deploy Item</h2>
                  <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Product Name" required value={name} onChange={e=>setName(e.target.value)} className="bg-[#1c1c1e] text-white rounded-xl px-4 py-3 outline-none border-none" />
                    <div className="flex gap-4">
                      <input type="number" step="0.01" placeholder="Price ($)" required value={price} onChange={e=>setPrice(e.target.value)} className="w-1/2 bg-[#1c1c1e] text-white rounded-xl px-4 py-3 outline-none border-none" />
                      <select value={category} onChange={e=>setCategory(e.target.value)} className="w-1/2 bg-[#1c1c1e] text-white rounded-xl px-4 py-3 outline-none border-none cursor-pointer"><option>Fragrances</option><option>Apparel</option><option>Accessories</option></select>
                    </div>
                    <textarea required rows={3} placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="md:col-span-2 bg-[#1c1c1e] text-white rounded-xl px-4 py-3 outline-none border-none resize-none" />
                    <input type="text" placeholder="Bullet Details (comma separated)" value={details} onChange={e=>setDetails(e.target.value)} className="bg-[#1c1c1e] text-white rounded-xl px-4 py-3 outline-none border-none" />
                    <div className="bg-[#1c1c1e] rounded-xl px-4 py-2 flex items-center"><input type="file" onChange={e=>setImageFile(e.target.files?e.target.files[0]:null)} className="text-xs text-zinc-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-white file:text-black cursor-pointer" /></div>
                    <button disabled={isUploading} type="submit" className="md:col-span-2 py-4 bg-white hover:bg-zinc-200 text-black font-medium rounded-xl shadow-lg mt-2">{isUploading ? 'Uploading...' : 'Publish Item'}</button>
                  </form>
                </div>
                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/5">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-medium text-white">Catalog</h2><span className="bg-[#1c1c1e] text-zinc-400 text-xs px-3 py-1 rounded-full">{products.length} Items</span></div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(p => (
                      <div key={p.id} className="bg-[#1c1c1e]/40 p-4 rounded-2xl group relative hover:bg-[#1c1c1e] transition-all">
                        <div className="aspect-square bg-black rounded-xl overflow-hidden relative mb-3">{p.image_url ? <Image src={p.image_url} alt={p.name} fill sizes="200px" className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600">No Img</div>}</div>
                        <h3 className="text-sm text-white font-medium line-clamp-1">{p.name}</h3><p className="text-[#D4AF37] text-xs font-bold mt-1">${p.price.toFixed(2)}</p>
                        <button onClick={()=>handleDelete(p.id)} className="absolute top-6 right-6 bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: CURATION & VIPS */}
            {activeTab === 'curation' && (
              <div className="flex flex-col gap-10">
                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-[#D4AF37]/30">
                  <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-medium text-white">The Top 8 Curator</h2><button onClick={saveTopEight} className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-full text-sm font-medium shadow-[0_0_15px_rgba(212,175,55,0.4)]">Save Curation</button></div>
                  <div className="grid grid-cols-4 gap-4 mb-8">
                     {[...Array(8)].map((_, i) => {
                       const pId = topEightIds[i]; const product = products.find(p => p.id === pId);
                       return (
                         <div key={i} className="aspect-square bg-black/50 rounded-2xl relative overflow-hidden group border border-white/5">
                            {product ? (
                              <>{product.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="150px" className="object-cover opacity-60" /> : <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-zinc-500">No Img</div>}<span className="absolute bottom-2 left-2 text-[9px] text-[#D4AF37] font-black uppercase bg-black/60 px-2 py-1 rounded">Slot {i+1}</span><button onClick={()=>toggleTopEight(product.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button></>
                            ) : ( <div className="flex h-full items-center justify-center text-xs text-zinc-700 font-bold">SLOT {i+1}</div> )}
                         </div>
                       );
                     })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {products.filter(p=>!topEightIds.includes(p.id)).map(p => <button key={p.id} onClick={()=>toggleTopEight(p.id)} className="px-4 py-2 bg-[#1c1c1e] text-xs text-zinc-400 rounded-full hover:bg-white hover:text-black transition-colors">+ {p.name}</button>)}
                  </div>
                </div>

                <div className="bg-[#0a0a0a]/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/5">
                  <div className="flex items-center gap-3 mb-8"><h2 className="text-2xl font-medium tracking-tight text-white">Guestbook Moderation</h2></div>
                  <div className="space-y-4">
                    {comments.length === 0 ? <p className="text-zinc-500 italic text-sm">No comments yet.</p> : comments.map(comment => (
                      <div key={comment.id} className={`p-5 rounded-2xl border transition-all ${comment.is_vip ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : comment.is_approved ? 'bg-[#1c1c1e]/50 border-white/10' : 'bg-red-900/10 border-red-500/30'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2"><h4 className={`font-bold ${comment.is_vip ? 'text-[#D4AF37]' : 'text-white'}`}>{comment.author_name}</h4>{!comment.is_approved && <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">Pending Approval</span>}{comment.is_vip && <span className="bg-[#D4AF37] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded">VIP</span>}</div>
                          <div className="flex gap-2">
                            <button onClick={()=>toggleComment(comment.id, 'is_approved', comment.is_approved)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${comment.is_approved ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}>{comment.is_approved ? 'Hide' : 'Approve'}</button>
                            <button onClick={()=>toggleComment(comment.id, 'is_vip', comment.is_vip)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${comment.is_vip ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-[#D4AF37]'}`}>VIP</button>
                            <button onClick={()=>deleteComment(comment.id)} className="text-xs px-3 py-1.5 rounded-full bg-red-900/40 text-red-400 hover:bg-red-500 hover:text-white">Delete</button>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">"{comment.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: FULFILLMENT ENGINE */}
            {activeTab === 'fulfillment' && (
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/5">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-medium tracking-tight text-white">Order Fulfillment</h2>
                </div>
                
                {orders.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500 italic">No orders in the ledger yet. Your test orders will appear here once the webhook is live.</div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => (
                      <div key={order.id} className="bg-[#1c1c1e]/60 p-6 rounded-2xl border border-white/5">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-white/5">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-white text-lg">{order.customer_name || 'Valued Client'}</h3>
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${order.payment_status === 'shipped' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'}`}>
                                {order.payment_status === 'shipped' ? 'Shipped' : 'Paid - Pending Dispatch'}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-400">{order.customer_email} • {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-[#D4AF37]">${order.total_amount.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Items Ordered</p>
                          <ul className="space-y-2">
                            {order.order_items?.map(item => (
                              <li key={item.id} className="flex justify-between text-sm text-zinc-300">
                                <span>{item.quantity}x {item.product_name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {order.payment_status !== 'shipped' ? (
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <label className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-2">Tracking Number</label>
                              <input 
                                type="text" 
                                placeholder="Paste tracking code here..." 
                                value={trackingInputs[order.id] || ''} 
                                onChange={e => setTrackingInputs({...trackingInputs, [order.id]: e.target.value})}
                                className="w-full bg-black text-white rounded-xl px-4 py-3 outline-none border border-white/10" 
                              />
                            </div>
                            <button 
                              onClick={() => handleFulfillOrder(order.id, order.customer_email)}
                              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all"
                            >
                              Fulfill & Email
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                            <p className="text-sm text-emerald-400 font-medium">Tracking: <span className="text-white">{order.tracking_number}</span></p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: THE MATRIX */}
            {activeTab === 'matrix' && (
              <div className="bg-[#0a0a0a]/60 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/5">
                <h2 className="text-2xl font-medium tracking-tight mb-8 text-white">The Customization Engine</h2>
                <form onSubmit={handleUpdateMatrix} className="space-y-8">
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border-none">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-4">Brand Identity</h3>
                    <div className="flex gap-4"><div className="flex-1"><label className="text-xs text-zinc-500 block mb-2">Primary Text</label><input type="text" value={brandPrimary} onChange={e=>setBrandPrimary(e.target.value)} className="w-full bg-black/50 text-white rounded-xl px-4 py-3 outline-none" /></div><div className="flex-1"><label className="text-xs text-zinc-500 block mb-2">Accent Text</label><input type="text" value={brandAccent} onChange={e=>setBrandAccent(e.target.value)} className="w-full bg-black/50 text-white rounded-xl px-4 py-3 outline-none" /></div></div>
                  </div>
                  
                  {/* Shipping Email Template Editor */}
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border-none">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Dispatch Email Template</h3>
                    <p className="text-xs text-zinc-500 mb-4">This message is sent when you fulfill an order. Keep {"{TRACKING_NUMBER}"} in the text so the system can inject the code.</p>
                    <textarea 
                      rows={4} 
                      value={emailTemplate} 
                      onChange={e=>setEmailTemplate(e.target.value)} 
                      className="w-full bg-black/50 text-white rounded-xl px-4 py-3 outline-none resize-none" 
                    />
                  </div>

                  <div className="bg-[#1c1c1e] rounded-2xl p-6 border-none space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Layout Architecture</h3>
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-zinc-300">Show "Top 8" Curation</span><div className="relative"><input type="checkbox" className="sr-only peer" checked={showTop8} onChange={e=>setShowTop8(e.target.checked)} /><div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label>
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-zinc-300">Show Master Inventory</span><div className="relative"><input type="checkbox" className="sr-only peer" checked={showInventory} onChange={e=>setShowInventory(e.target.checked)} /><div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label>
                    <label className="flex items-center justify-between cursor-pointer"><span className="text-sm text-zinc-300">Show VIP Comment Wall</span><div className="relative"><input type="checkbox" className="sr-only peer" checked={showCommentWall} onChange={e=>setShowCommentWall(e.target.checked)} /><div className="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div></div></label>
                  </div>
                  
                  <div className="bg-[#1c1c1e] rounded-2xl p-6 space-y-6 border-none">
                    <div><h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Audio Track</h3><input type="file" accept="audio/mpeg" onChange={e=>setSongFile(e.target.files?e.target.files[0]:null)} className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white cursor-pointer mb-3" /><div className="flex gap-4"><input type="text" value={songTitle} onChange={e=>setSongTitle(e.target.value)} placeholder="Track Name" className="w-1/2 bg-black/50 text-white rounded-xl px-4 py-3 outline-none text-sm" /><input type="text" value={songArtist} onChange={e=>setSongArtist(e.target.value)} placeholder="Artist Name" className="w-1/2 bg-black/50 text-white rounded-xl px-4 py-3 outline-none text-sm" /></div></div>
                    <div><h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Global Background</h3><input type="file" accept="image/*" onChange={e=>setBgFile(e.target.files?e.target.files[0]:null)} className="w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-white cursor-pointer" /></div>
                    <div><h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Live Feed Status</h3><div className="flex gap-3"><input type="text" value={siteMood} onChange={e=>setSiteMood(e.target.value)} placeholder="💎" className="w-16 bg-black/50 text-white rounded-xl px-2 py-3 outline-none text-center text-sm" /><input type="text" value={siteStatus} onChange={e=>setSiteStatus(e.target.value)} placeholder="Live status message..." className="flex-1 bg-black/50 text-white rounded-xl px-4 py-3 outline-none text-sm" /></div></div>
                  </div>
                  <button disabled={isUpdatingSite} type="submit" className="w-full py-5 bg-[#D4AF37] text-black font-bold text-lg rounded-xl transition-all hover:bg-[#B5952F] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    {isUpdatingSite ? 'Injecting Code...' : 'Compile & Push Live'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}