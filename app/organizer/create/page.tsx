'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Globe, MapPin, Clock, Users, Wallet, Sparkles } from 'lucide-react';

export default function CreateEventPage() {
  const { user, bearerToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'TECH',
    price: '',
    capacity: '',
    isOnline: false,
  });

  const categories = [
    { value: 'TECH', label: 'Technology' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'SPORTS', label: 'Sports' },
    { value: 'ARTS', label: 'Arts' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'OTHER', label: 'Other' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user || !bearerToken) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const event = await response.json();
      router.push(`/events/${event.slug || event.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 flex flex-col">
      <Navigation />

      {/* Main Content: pt-32 ensures space for the floating Navigation */}
      <main className="flex-1 w-full max-w-[700px] mx-auto px-6 pt-32 pb-32">
        
        {/* Breadcrumb */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center text-sm font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-12"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <header className="mb-16 space-y-2 text-center sm:text-left">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
              Create Event
            </h1>
            <p className="text-xl text-neutral-500 font-medium italic font-serif">Something special is brewing.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-16">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Title & Description */}
            <div className="space-y-10">
              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Event Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="The Nairobi Creative Mixer"
                  className="border-0 bg-transparent px-0 h-16 text-2xl md:text-4xl font-semibold placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
                />
              </div>

              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell your guests the story of this event..."
                  className="w-full border-0 bg-transparent px-0 pt-4 text-lg leading-relaxed placeholder:text-neutral-200 focus:outline-none min-h-[150px] resize-none"
                />
              </div>
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Clock className="w-3 h-3" /> Date & Time
                </label>
                <div className="flex gap-4">
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg shadow-none" />
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg shadow-none" />
                </div>
              </div>

              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Sparkles className="w-3 h-3" /> Category
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border-0 bg-transparent px-0 h-8 focus:outline-none font-medium text-lg appearance-none cursor-pointer">
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <MapPin className="w-3 h-3" /> {formData.isOnline ? 'Virtual Link' : 'Location'}
                </label>
                <Input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder={formData.isOnline ? "Zoom, Google Meet, etc." : "Nairobi, Kenya"}
                  className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg shadow-none" 
                />
              </div>

              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Wallet className="w-3 h-3" /> Admission (USD)
                </label>
                <Input type="number" name="price" value={formData.price} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg shadow-none" placeholder="0.00" />
              </div>
            </div>

            {/* Capacity & Type */}
            <div className="flex flex-col md:flex-row items-center gap-12 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-12 h-7 rounded-full transition-all relative ${formData.isOnline ? 'bg-orange-500 shadow-lg shadow-orange-500/20' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
                  <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="sr-only" />
                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${formData.isOnline ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest group-hover:text-black dark:group-hover:text-white transition-colors">Virtual</span>
              </label>

              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-neutral-400" />
                <input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleChange} 
                  placeholder="100"
                  className="w-16 border-b border-black/[0.1] bg-transparent text-lg font-bold text-center focus:outline-none focus:border-black transition-colors" 
                />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Spots</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-12">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 rounded-full h-16 bg-black dark:bg-white text-white dark:text-black font-bold text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isLoading ? 'Creating...' : 'Publish Event'}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}