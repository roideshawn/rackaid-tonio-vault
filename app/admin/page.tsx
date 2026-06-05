"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

export default function AdminDashboardHub() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthChecking(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoggingIn(true); setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoggingIn(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center text-[#D4AF37] font-mono text-sm animate-pulse uppercase tracking-widest">Decrypting Admin...</div>;
  
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-black">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-10 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-black text-center text-white mb-8 uppercase tracking-widest">Vault Access</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-4 outline-none font-mono text-sm focus:border-red-500 transition-colors" />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-zinc-800 text-white rounded-xl px-4 py-4 outline-none font-mono text-sm focus:border-red-500 transition-colors" />
          {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
          <button disabled={isLoggingIn} className="w-full mt-4 py-4 bg-white hover:bg-zinc-200 text-black font-black uppercase tracking-widest rounded-xl transition-colors">
            {isLoggingIn ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>
      </div>
    </div>
  );

  const apps = [
    { name: 'Products & Drops', icon: '📦', href: '/admin/products', color: 'border-white' },
    { name: 'Order Ledger', icon: '🚚', href: '/admin/orders', color: 'border-blue-500/50' },
    { name: 'Theme Engine', icon: '🎨', href: '/admin/theme', color: 'border-[#D4AF37]/50' },
    { name: 'Layout Engine', icon: '📐', href: '/admin/layout-editor', color: 'border-emerald-500/50' },
    { name: 'Media Hub', icon: '☁️', href: '/admin/media', color: 'border-purple-500/50' },
    { name: 'Guestbook', icon: '💬', href: '/admin/comments', color: 'border-red-500/50' },
  ];

  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">Command Center</h1>
            <p className="text-zinc-500 font-mono text-sm mt-2">Welcome back, Admin.</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-zinc-900 hover:bg-red-900 hover:text-white text-zinc-400 font-mono text-xs uppercase tracking-widest rounded transition-colors">
            Lock Vault
          </button>
        </div>

        {/* Mobile-Optimized Touch Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {apps.map((app) => (
            <Link 
              key={app.name} 
              href={app.href}
              className={`aspect-square bg-zinc-950 border ${app.color} hover:bg-zinc-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all hover:scale-[1.02] shadow-lg`}
            >
              <span className="text-4xl md:text-5xl mb-4 drop-shadow-md">{app.icon}</span>
              <span className="text-sm font-bold uppercase tracking-widest text-zinc-300">{app.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}