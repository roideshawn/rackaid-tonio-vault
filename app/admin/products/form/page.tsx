"use client";

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { saveProduct } from '../actions';

export default function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [isPending, startTransition] = useTransition();
  const [loadingInitial, setLoadingInitial] = useState(!!id);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '0.00',
    stock: '0',
    is_featured: false,
    existing_image_url: ''
  });

  useEffect(() => {
    if (id) {
      async function fetchProduct() {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setFormData({
            name: data.name,
            description: data.description || '',
            price: data.price.toString(),
            stock: data.stock.toString(),
            is_featured: data.is_featured,
            existing_image_url: data.image_url || ''
          });
          if (data.image_url) setImagePreview(data.image_url);
        }
        setLoadingInitial(false);
      }
      fetchProduct();
    }
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (id) form.append('id', id);
    form.append('is_featured', formData.is_featured.toString());
    form.append('existing_image_url', formData.existing_image_url);

    startTransition(async () => {
      const res = await saveProduct(form);
      if (res.success) {
        router.push('/admin/products');
      } else {
        alert('Error saving product: ' + res.error);
      }
    });
  };

  if (loadingInitial) return <div className="min-h-screen bg-black text-white p-8 font-mono text-zinc-500 text-center">Loading product data...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-24">
      <div className="max-w-3xl mx-auto bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl p-6 md:p-10">
        
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-black tracking-wider uppercase text-white">
            {id ? 'Edit Drop' : 'New Drop'}
          </h1>
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-white font-mono text-xs uppercase transition-colors">
            [ Cancel ]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Product Name</label>
                <input required name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-red-500 font-mono text-sm" placeholder="Vault Scent 01" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Price (USD)</label>
                  <input required name="price" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} type="number" step="0.01" min="0" className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-red-500 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Stock Level</label>
                  <input required name="stock" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} type="number" min="0" className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-red-500 font-mono text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="w-full bg-black border border-zinc-700 text-white p-3 rounded focus:outline-none focus:border-red-500 font-mono text-sm resize-none" placeholder="Notes of cedar, tobacco, and rebellion..."></textarea>
              </div>

              {/* MySpace Top 8 Toggle */}
              <label className="flex items-center gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded cursor-pointer hover:bg-zinc-800 transition-colors">
                <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-[#D4AF37] bg-black border-zinc-700 rounded" />
                <div>
                  <span className="block text-sm font-bold uppercase text-[#D4AF37] tracking-wider">Feature in Top 8</span>
                  <span className="block text-[10px] font-mono text-zinc-400">Display this item on the main profile page.</span>
                </div>
              </label>
            </div>

            {/* Image Uploader */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">Product Image</label>
              <div className="relative w-full aspect-[4/5] bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center overflow-hidden hover:border-[#D4AF37] transition-colors group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity" />
                ) : (
                  <div className="text-zinc-600 text-4xl mb-2">+</div>
                )}
                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${imagePreview ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
                  <span className="bg-black/80 text-white font-mono text-xs px-4 py-2 rounded border border-zinc-700 uppercase tracking-widest">
                    {imagePreview ? 'Change Image' : 'Select File'}
                  </span>
                </div>
                <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <button disabled={isPending} type="submit" className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-black tracking-widest uppercase rounded transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:shadow-none">
              {isPending ? 'Encrypting Data...' : id ? 'Update Product' : 'Drop Product to Vault'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}