'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, Image as ImageIcon, Globe, MapPin, 
  Clock, Users, Wallet, Loader2, Plus 
} from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();
  const { user, bearerToken, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    price: '',
    capacity: '',
    category: 'TECH',
    isOnline: false,
    image: null as File | null,
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellingRate, setSellingRate] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    if (bearerToken) fetchExchangeRate();
  }, [user, authLoading, router, bearerToken]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSellingRate(data.sellingRate || data.exchangeRate);
      }
    } catch (err) { console.error('Rate fetch error:', err); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    
    if (name === 'image' && (e.target as HTMLInputElement).files?.[0]) {
      const file = (e.target as HTMLInputElement).files![0];
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.image);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadFormData });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.imageUrl;
      }

      // Construct date in local timezone and convert to ISO for correct UTC storage
      const localDateTime = new Date(`${formData.date}T${formData.time || '00:00'}`);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ ...formData, image: imageUrl, dateTime: localDateTime.toISOString() }),
      });

      if (!response.ok) throw new Error('Failed to create event');
      const event = await response.json();
      router.push(`/events/${event.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest">Preparing Workspace</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100">
      <main className="max-w-[800px] mx-auto px-6 py-12 md:py-24">
        
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center text-sm font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-16"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Cancel
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <header className="mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
              Create Event
            </h1>
            <p className="text-xl text-neutral-500 font-medium italic font-serif">A new experience begins here.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-20">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Image Upload - The "Poster" Spot */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Event Cover</label>
              <label className="relative block aspect-[16/9] md:aspect-[16/7] w-full rounded-[32px] border-2 border-dashed border-black/[0.05] dark:border-white/[0.05] hover:border-orange-500/50 transition-all cursor-pointer overflow-hidden group">
                <input type="file" name="image" accept="image/*" onChange={handleChange} className="sr-only" />
                {imagePreview ? (
                  <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-6">
                    <div className="relative w-full h-full">
                      <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-400">Upload a high-res cover</p>
                  </div>
                )}
              </label>
            </div>

            {/* Title & Description - Editorial Style */}
            <div className="space-y-12">
              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="The Weekend Retreat"
                  className="border-0 bg-transparent px-0 h-14 md:h-16 text-2xl md:text-3xl lg:text-5xl font-semibold placeholder:text-neutral-200 focus-visible:ring-0"
                />
              </div>

              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-4">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Share the story of your event..."
                  className="w-full border-0 bg-transparent px-0 pt-4 text-xl leading-relaxed placeholder:text-neutral-200 focus:outline-none min-h-[200px] resize-none"
                />
              </div>
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Clock className="w-3 h-3" /> Date & Time
                </label>
                <div className="flex gap-4">
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg" />
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg" />
                </div>
              </div>

              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Plus className="w-3 h-3" /> Category
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border-0 bg-transparent px-0 h-8 focus:outline-none font-medium text-lg appearance-none cursor-pointer">
                  <option value="TECH">Technology</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="ARTS">Arts</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>

              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <MapPin className="w-3 h-3" /> {formData.isOnline ? 'Access Link' : 'Location'}
                </label>
                <Input 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder={formData.isOnline ? "https://zoom.us/..." : "Nairobi, Kenya"}
                  className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg" 
                />
              </div>

              <div className="space-y-3 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Wallet className="w-3 h-3" /> Admission (KES)
                </label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    placeholder="0"
                    className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-lg w-32" 
                  />
                  {formData.price && sellingRate && (
                    <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                      ≈ {(parseFloat(formData.price) / sellingRate).toFixed(2)} USD
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Toggles & Final Action */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 border-t border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex items-center gap-8">
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
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Capacity</span>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full md:w-auto rounded-full h-16 px-12 bg-black dark:bg-white text-white dark:text-black font-bold text-xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Event'}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}