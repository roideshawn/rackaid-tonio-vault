'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { supabase } from '../../../lib/supabase';
import { uploadMediaAsset, deleteMediaAsset } from './actions';

interface StorageFile {
  name: string;
  id: string;
  url: string;
}

export default function AdminMediaDashboard() {
  const buckets = ['brand-assets', 'product-images', 'audio-vault'];
  const [activeBucket, setActiveBucket] = useState('brand-assets');
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusMsg, setStatusMsg] = useState('');

  async function loadFiles(bucket: string) {
    const { data, error } = await supabase.storage.from(bucket).list('', {
      limit: 100,
      sortBy: { column: 'name', order: 'desc' },
    });

    if (error || !data) {
      setFiles([]);
      return;
    }

    const compiledFiles = data
      .filter((file) => file.name !== '.emptyFolderPlaceholder')
      .map((file) => {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(file.name);
        return {
          name: file.name,
          id: file.id ?? file.name, // TYPE FIX: Fallback to file.name if Supabase id is null
          url: urlData.publicUrl,
        };
      });

    setFiles(compiledFiles);
  }

  useEffect(() => {
    loadFiles(activeBucket);
  }, [activeBucket]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    setStatusMsg('');

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', activeBucket);

    const res = await uploadMediaAsset(formData);
    setUploading(false);

    if (res.success) {
      setStatusMsg('Uploaded successfully!');
      loadFiles(activeBucket);
    } else {
      setStatusMsg(`Upload Error: ${res.error}`);
    }
  };

  const handleDelete = (fileName: string) => {
    if (!confirm('Are you sure you want to permanently clear this file?')) return;
    startTransition(async () => {
      const res = await deleteMediaAsset(activeBucket, fileName);
      if (res.success) {
        loadFiles(activeBucket);
      } else {
        alert(`Deletion error: ${res.error}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-[#D4AF37] to-zinc-400 uppercase mb-8">
          Rackaid Cloud Storage Media Hub
        </h1>

        {/* Bucket Selection Toggle Bar */}
        <div className="flex flex-wrap gap-2 mb-8 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
          {buckets.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBucket(b)}
              className={`flex-1 min-w-[120px] text-center py-3 px-4 rounded text-xs font-mono tracking-widest uppercase transition-all min-h-[44px] ${
                activeBucket === b 
                  ? 'bg-red-600 text-white font-bold shadow-md' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {b.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Upload Control Center */}
        <div className="mb-10 p-6 bg-zinc-950 rounded-lg border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-mono text-[#D4AF37] uppercase tracking-widest mb-1">Upload New Asset</h3>
            <p className="text-xs text-zinc-500">Target Bucket: <span className="text-zinc-300 font-mono">{activeBucket}</span></p>
          </div>
          <div className="relative w-full md:w-auto">
            <label className="block w-full md:w-64 text-center py-4 px-6 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded cursor-pointer transition-all text-xs font-mono tracking-wider uppercase text-zinc-200 min-h-[48px]">
              {uploading ? 'Processing File...' : 'Choose File Roll / Directory'}
              <input 
                type="file" 
                disabled={uploading} 
                onChange={handleFileChange} 
                className="hidden" 
                accept={activeBucket === 'audio-vault' ? 'audio/*' : 'image/*'}
              />
            </label>
          </div>
        </div>

        {statusMsg && (
          <p className="text-center text-xs font-mono text-[#D4AF37] mb-6 bg-zinc-950 py-2 border border-zinc-800 rounded">
            {statusMsg}
          </p>
        )}

        {/* Dynamic Gallery Presentation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file) => (
            <div key={file.id} className="group bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden flex flex-col justify-between shadow-lg transition-transform hover:scale-[1.01]">
              <div className="relative aspect-square w-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                {activeBucket === 'audio-vault' ? (
                  <div className="p-4 text-center">
                    <span className="text-3xl">🎵</span>
                    <p className="text-[10px] font-mono mt-2 text-zinc-400 truncate max-w-[150px]">{file.name}</p>
                  </div>
                ) : (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="object-cover w-full h-full transition-opacity group-hover:opacity-80"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Asset Action Panel */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex flex-col gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(file.url);
                    alert('Asset direct URL saved to system clipboard.');
                  }}
                  className="w-full h-11 text-[11px] font-mono tracking-widest bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded uppercase transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  disabled={isPending}
                  className="w-full h-11 text-[11px] font-mono tracking-widest bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white rounded uppercase transition-all"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          ))}
        </div>

        {files.length === 0 && (
          <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-lg text-zinc-600 font-mono text-xs tracking-widest uppercase">
            No files discovered inside this storage bucket directory.
          </div>
        )}
      </div>
    </div>
  );
}