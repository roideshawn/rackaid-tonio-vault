"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../../lib/supabase';

// Define our product shape to match the database
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  details: string[];
  image_url: string | null;
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  // We use React.use() to unwrap the params promise for Next.js 15+
  const { id } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const sizes = ["S", "M", "L", "XL", "XXL"];

  // Fetch the specific product from Supabase based on the URL parameter
  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else if (data) {
        setProduct(data);
      }
      setIsLoading(false);
    }

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      size: selectedSize,
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <span className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
          Retrieving Data...
        </span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <h1 className="text-3xl font-black uppercase tracking-widest text-zinc-500">Item Not Found</h1>
        <Link href="/shop" className="px-8 py-3 border border-zinc-700 hover:border-white text-white font-bold transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <nav className="text-sm text-zinc-500 mb-8 uppercase tracking-widest font-bold">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{product.category}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        <div className="flex-1 flex gap-4">
          <div className="hidden md:flex flex-col gap-4 w-24">
            {[1, 2, 3].map((img) => (
              <div key={img} className="w-full aspect-[4/5] bg-zinc-900 rounded cursor-pointer border-2 border-transparent hover:border-zinc-500 transition-all flex items-center justify-center overflow-hidden relative">
                <span className="text-zinc-700 text-xs uppercase z-10">Img {img}</span>
                {product.image_url && (
                   <Image src={product.image_url} alt="" fill className="object-cover opacity-50 hover:opacity-100 transition-opacity" />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex-1 aspect-[4/5] bg-zinc-900 rounded-lg flex items-center justify-center relative overflow-hidden">
             {product.image_url ? (
               <Image 
                 src={product.image_url} 
                 alt={product.name} 
                 fill 
                 className="object-cover"
                 priority
                 sizes="(max-width: 768px) 100vw, 50vw"
               />
             ) : (
               <span className="text-zinc-700 font-bold uppercase tracking-widest z-10">
                 Image Pending
               </span>
             )}
             <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 pointer-events-none"></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
            {product.name}
          </h1>
          <p className="text-2xl font-light text-zinc-300 mb-8">
            ${Number(product.price).toFixed(2)}
          </p>

          <p className="text-zinc-400 mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold uppercase tracking-widest">Select Size</span>
              <button className="text-xs text-zinc-500 underline hover:text-white transition-colors">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 flex items-center justify-center border transition-all ${
                    selectedSize === size 
                      ? 'border-white bg-white text-black font-black' 
                      : 'border-zinc-700 text-zinc-300 hover:border-white hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`w-full py-5 font-black text-lg uppercase tracking-widest transition-all mb-8 ${
              selectedSize 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {selectedSize ? "Add to Cart" : "Select a Size"}
          </button>

          {product.details && product.details.length > 0 && (
            <div className="border-t border-zinc-800 pt-6 mt-2">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Product Details</h3>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}