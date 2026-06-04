"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Module {
  id: string;
  module_type: string;
  is_visible: boolean;
  sort_order: number;
}

export default function LayoutEditor() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    const { data, error } = await supabase
      .from('custom_modules')
      .select('id, module_type, is_visible, sort_order')
      .order('sort_order', { ascending: true });
    
    if (data) setModules(data);
  }

  const moveModule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;

    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newModules[index];
    newModules[index] = newModules[targetIndex];
    newModules[targetIndex] = temp;

    // Update sort orders to match new array index
    const reordered = newModules.map((mod, i) => ({ ...mod, sort_order: i + 1 }));
    setModules(reordered);
  };

  const toggleVisibility = (index: number) => {
    const newModules = [...modules];
    newModules[index].is_visible = !newModules[index].is_visible;
    setModules(newModules);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Supabase upsert requires updating rows efficiently
    const updates = modules.map(mod => ({
      id: mod.id,
      module_type: mod.module_type,
      is_visible: mod.is_visible,
      sort_order: mod.sort_order
    }));

    const { error } = await supabase.from('custom_modules').upsert(updates);
    
    setIsSaving(false);
    if (!error) alert("Layout successfully updated on the live storefront!");
    else alert("Error saving layout: " + error.message);
  };

  const formatModuleName = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-3xl font-black tracking-wider uppercase">Layout Engine</h1>
            <p className="text-zinc-500 font-mono text-sm mt-1">Reorder and toggle your MySpace profile modules.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-3 bg-[#D4AF37] hover:bg-yellow-600 text-black font-black uppercase tracking-widest rounded transition-all disabled:opacity-50"
          >
            {isSaving ? 'Deploying...' : 'Deploy Layout'}
          </button>
        </div>

        <div className="space-y-3">
          {modules.map((mod, index) => (
            <div 
              key={mod.id} 
              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                mod.is_visible ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-950 border-red-900/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-6">
                {/* Touch-Friendly Up/Down Controls */}
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => moveModule(index, 'up')}
                    disabled={index === 0}
                    className="w-10 h-10 bg-black border border-zinc-700 rounded flex items-center justify-center disabled:opacity-20 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    ▲
                  </button>
                  <button 
                    onClick={() => moveModule(index, 'down')}
                    disabled={index === modules.length - 1}
                    className="w-10 h-10 bg-black border border-zinc-700 rounded flex items-center justify-center disabled:opacity-20 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
                  >
                    ▼
                  </button>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                    {formatModuleName(mod.module_type)}
                  </h3>
                  <p className="text-xs font-mono text-zinc-500">Position: {mod.sort_order}</p>
                </div>
              </div>

              {/* Visibility Toggle */}
              <button 
                onClick={() => toggleVisibility(index)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest rounded border ${
                  mod.is_visible 
                    ? 'bg-green-950/30 text-green-400 border-green-900/50 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50' 
                    : 'bg-red-950/30 text-red-400 border-red-900/50 hover:bg-green-950/30 hover:text-green-400 hover:border-green-900/50'
                }`}
              >
                {mod.is_visible ? 'Visible (Hide)' : 'Hidden (Show)'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}