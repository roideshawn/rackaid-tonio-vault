'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface MediaPickerProps {
  bucket: 'brand-assets' | 'product-images';
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPickerModal({ bucket, onSelect, onClose }: MediaPickerProps) {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBucketAssets() {
      setLoading(true);
      const { data, error } = await supabase.storage.from(bucket).list('', {
        limit: 80,
        sortBy: { column: 'name', order: 'desc' }
      });

      if (!error && data) {
        const structuralLinks = data
          .filter((file) => file.name !== '.emptyFolderPlaceholder')
          .map((file) => {
            const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
            return { name: file.name, url: urlData.publicUrl };
          });
        setImages(structuralLinks);
      }
      setLoading(false);
    }
    loadBucketAssets();
  }, [bucket]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl h-[80vh] flex flex-col rounded-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black">
          <h3 className="text-sm font-mono tracking-widest uppercase text-white">
            Library Browser &mdash; Select Asset from: <span className="text-[#D4AF37]">{bucket}</span>
          </h3>
          <button 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] font-mono text-zinc-400 hover:text-white text-xs uppercase"
          >
            [ Close ]
          </button>
        </div>

        {/* Modal Main Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/40">
          {loading ? (
            <div className="h-full flex items-center justify-center font-mono text-xs text-zinc-500 uppercase tracking-widest">
              Indexing Cloud Asset Manifest...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <button
                  key={img.name}
                  onClick={() => {
                    onSelect(img.url);
                    onClose();
                  }}
                  className="group relative aspect-square w-full bg-zinc-900 border border-zinc-800 rounded overflow-hidden focus:outline-none focus:border-[#D4AF37] transition-all hover:scale-[1.02]"
                >
                  <img 
                    src={img.url} 
                    alt={img.name} 
                    className="object-cover h-full w-full opacity-60 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 border-t border-zinc-900 truncate text-[10px] text-zinc-400 font-mono group-hover:text-[#D4AF37]">
                    {img.name}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && images.length === 0 && (
            <div className="h-full flex items-center justify-center font-mono text-xs text-zinc-600 uppercase tracking-widest">
              Directory is completely clean. Upload data first via Media Hub dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}