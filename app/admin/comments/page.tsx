"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

interface Comment { id: string; author_name: string; content: string; is_approved: boolean; is_vip: boolean; created_at: string; }

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchComments() {
    setLoading(true);
    const { data } = await supabase.from('guestbook_comments').select('*').order('created_at', { ascending: false });
    if (data) setComments(data);
    setLoading(false);
  }

  useEffect(() => { fetchComments(); }, []);

  const toggleStatus = async (id: string, field: 'is_approved' | 'is_vip', currentVal: boolean) => {
    await supabase.from('guestbook_comments').update({ [field]: !currentVal }).eq('id', id); 
    fetchComments();
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Permanently delete this comment?")) return;
    await supabase.from('guestbook_comments').delete().eq('id', id); 
    fetchComments();
  };

  return (
    <div className="min-h-screen bg-black pt-8 pb-24 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-zinc-500 hover:text-white font-mono text-xs uppercase tracking-widest transition-colors">← Back to Hub</Link>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest mt-4">Guestbook Moderator</h1>
        </div>

        {loading ? (
          <p className="text-zinc-500 font-mono text-xs uppercase animate-pulse">Loading Wall...</p>
        ) : (
          <div className="space-y-4">
            {comments.length === 0 ? <p className="text-zinc-500 italic text-sm">No comments yet.</p> : comments.map(comment => (
              <div key={comment.id} className={`p-5 rounded-xl border transition-all ${comment.is_vip ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : comment.is_approved ? 'bg-zinc-900 border-zinc-700' : 'bg-red-950/20 border-red-900/50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold ${comment.is_vip ? 'text-[#D4AF37]' : 'text-white'}`}>{comment.author_name}</h4>
                    {!comment.is_approved && <span className="bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">Pending</span>}
                    {comment.is_vip && <span className="bg-[#D4AF37] text-black text-[9px] font-black uppercase px-2 py-0.5 rounded">VIP</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button onClick={() => toggleStatus(comment.id, 'is_approved', comment.is_approved)} className={`flex-1 sm:flex-none text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded transition-colors ${comment.is_approved ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}>{comment.is_approved ? 'Hide' : 'Approve'}</button>
                    <button onClick={() => toggleStatus(comment.id, 'is_vip', comment.is_vip)} className={`flex-1 sm:flex-none text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded transition-colors ${comment.is_vip ? 'bg-[#D4AF37] text-black' : 'bg-zinc-800 text-zinc-400 hover:text-[#D4AF37]'}`}>VIP</button>
                    <button onClick={() => deleteComment(comment.id)} className="flex-1 sm:flex-none text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white">Delete</button>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed font-light">"{comment.content}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}