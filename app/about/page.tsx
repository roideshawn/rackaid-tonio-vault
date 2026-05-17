"use client";

import { useState } from 'react';
import Image from 'next/image';

export default function AboutContact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for backend form submission
    setStatus('Message received. The team will be in touch shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Clear status after 5 seconds
    setTimeout(() => setStatus(''), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
      
      {/* Hero Section */}
      <div className="text-center mb-20 relative">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
          Built For The <span className="text-red-600">Streets</span>
        </h1>
        <p className="text-xl text-zinc-400 font-light max-w-2xl mx-auto">
          Rackaid Tonio isn't just a label; it's a lifestyle. We engineer premium streetwear for those who demand excellence and refuse to blend in.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        
        {/* Left Side: The Story */}
        <div className="flex-1 space-y-8">
          <div className="relative w-full aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center mb-8">
            <span className="text-zinc-700 font-bold uppercase tracking-widest text-sm z-10">
              Brand Image / Workshop Placeholder
            </span>
            {/* Subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-transparent to-transparent"></div>
          </div>

          <div>
            <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Our Manifesto</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Founded on the principles of grit, authenticity, and uncompromising quality, Rackaid Tonio bridges the gap between raw street culture and high-end fashion. Every piece is meticulously designed, heavily tested, and crafted to make a statement.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              We secure the best fabrics, enforce strict manufacturing standards, and drop limited collections to ensure our community wears nothing but the best. When you wear RT, you wear the crown.
            </p>
          </div>

          <div className="pt-8 border-t border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4">Direct Lines</h3>
            <ul className="space-y-3 font-medium text-lg">
              <li><span className="text-zinc-500 mr-2">Email:</span> support@rackaid.store</li>
              <li><span className="text-zinc-500 mr-2">HQ:</span> Winston-Salem, NC</li>
              <li className="flex gap-4 pt-4">
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-red-600 transition-colors">IG</a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-red-600 transition-colors">X</a>
                <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-red-600 transition-colors">TT</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="flex-1 bg-zinc-950 p-8 md:p-10 border border-zinc-800 rounded-lg shadow-2xl relative overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900"></div>

          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">Transmission</h2>
          <p className="text-zinc-500 mb-8 font-light">Questions about a drop? Hit our line below.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Subject</label>
              <input 
                type="text" 
                id="subject" 
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-black border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Order inquiry, Collab, etc."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-zinc-400">Message</label>
              <textarea 
                id="message" 
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-black border border-zinc-800 rounded px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="Speak your mind..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
            >
              Send Message
            </button>

            {status && (
              <div className="mt-4 p-4 border border-green-800 bg-green-900/20 text-green-400 text-sm font-bold rounded text-center">
                {status}
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}