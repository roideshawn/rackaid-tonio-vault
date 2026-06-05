"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { deleteProduct } from './actions';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  is_featured: boolean;
  image_url: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This cannot be undone.')) return;
    const res = await deleteProduct(id);
    if (res.success) fetchProducts();
    else alert('Failed to delete product.');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-zinc-800 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-wider uppercase text-[#D4AF37]">Vault Inventory</h1>
            <p className="text-zinc-500 font-mono text-sm mt-1">Manage products and Top 8 featured items.</p>
          </div>
          <Link 
            href="/admin/products/form" 
            className="w-full sm:w-auto text-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            + New Drop
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 font-mono text-zinc-500 uppercase tracking-widest">Loading Inventory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex flex-col shadow-lg">
                <div className="aspect-[4/3] relative bg-zinc-900 border-b border-zinc-800">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs uppercase">No Image</div>
                  )}
                  {product.is_featured && (
                    <div className="absolute top-2 right-2 bg-[#D4AF37] text-black text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                      Top 8
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-lg uppercase tracking-wider mb-1 truncate">{product.name}</h3>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-red-500 font-mono">${product.price.toFixed(2)}</span>
                    <span className="text-zinc-500 font-mono text-xs">Stock: {product.stock}</span>
                  </div>
                  
                  <div className="mt-auto flex gap-2 pt-4 border-t border-zinc-900">
                    <Link 
                      href={`/admin/products/form?id=${product.id}`}
                      className="flex-1 py-3 text-center bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs uppercase tracking-widest rounded transition-colors"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 py-3 text-center bg-red-950/20 hover:bg-red-900 text-red-500 hover:text-white font-mono text-xs uppercase tracking-widest rounded border border-red-900/30 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-600 font-mono text-xs tracking-widest uppercase">
            The vault is currently empty.
          </div>
        )}
      </div>
    </div>
  );
}