'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Globe, MapPin, Clock, Users, Wallet, Sparkles } from 'lucide-react';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [sellingRate, setSellingRate] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    capacity: '',
    category: 'TECH',
    isOnline: false,
  });

  useEffect(() => {
    if (!user || !bearerToken) {
      router.push('/auth/login');
      return;
    }
    fetchExchangeRate().then(() => fetchEvent());
  }, [eventId, user, bearerToken]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        const rate = data.sellingRate || data.exchangeRate;
        setSellingRate(rate);
        return rate;
      }
    } catch (err) { console.error('Rate fetch error:', err); }
    return null;
  };

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();

      if (data.organizer.id !== user?.id) {
        setError('You are not authorized to edit this event');
        return;
      }

      const eventDate = new Date(data.date);
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      const hours = String(eventDate.getHours()).padStart(2, '0');
      const minutes = String(eventDate.getMinutes()).padStart(2, '0');

      // Convert stored USD price back to KES for display
      const rate = sellingRate || await fetchExchangeRate();
      const priceInKES = rate ? Math.round(data.price * rate) : data.price;

      setFormData({
        title: data.title,
        description: data.description,
        date: `${year}-${month}-${day}`,
        time: `${hours}:${minutes}`,
        location: data.location,
        price: priceInKES.toString(),
        capacity: data.capacity.toString(),
        category: data.category,
        isOnline: data.isOnline,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Construct date in local timezone and convert to ISO for correct UTC storage
      const localDateTime = new Date(`${formData.date}T${formData.time || '00:00'}`);
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          ...formData,
          dateTime: localDateTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update event');
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-white flex items-center justify-center text-neutral-400 font-medium">Refining details...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 pb-32">
      <main className="max-w-[700px] mx-auto px-6 pt-16">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="group flex items-center text-sm font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-12"
        >
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to event
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12 space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">Edit Event</h1>
            <p className="text-neutral-500 font-medium italic font-serif text-lg">Make it unforgettable.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-6">
              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Event Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="border-0 bg-transparent px-0 h-12 text-2xl font-semibold placeholder:text-neutral-200 focus-visible:ring-0"
                  placeholder="The Nairobi Creative Mixer"
                />
              </div>

              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border-0 bg-transparent px-0 pt-3 text-lg leading-relaxed placeholder:text-neutral-200 focus:outline-none min-h-[150px] resize-none"
                  placeholder="What should guests expect?"
                />
              </div>
            </div>

            {/* Logistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-2 border-b border-black/[0.05] dark:border-white/[0.05] pb-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Clock className="w-3 h-3" /> Date & Time
                </label>
                <div className="flex gap-2">
                  <Input type="date" name="date" value={formData.date} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium" />
                  <Input type="time" name="time" value={formData.time} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium" />
                </div>
              </div>

              <div className="space-y-2 border-b border-black/[0.05] dark:border-white/[0.05] pb-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Sparkles className="w-3 h-3" /> Category
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full border-0 bg-transparent px-0 h-8 focus:outline-none font-medium text-sm appearance-none cursor-pointer">
                  <option value="TECH">Technology</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="ARTS">Arts</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>

              <div className="space-y-2 border-b border-black/[0.05] dark:border-white/[0.05] pb-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <MapPin className="w-3 h-3" /> Location
                </label>
                <Input name="location" value={formData.location} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-sm" placeholder="Venue or link" />
              </div>

              <div className="space-y-2 border-b border-black/[0.05] dark:border-white/[0.05] pb-2 focus-within:border-black dark:focus-within:border-white transition-colors">
                <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <Wallet className="w-3 h-3" /> Admission (KES)
                </label>
                <div className="flex items-center gap-3">
                  <Input type="number" name="price" value={formData.price} onChange={handleChange} className="border-0 bg-transparent px-0 h-8 focus-visible:ring-0 font-medium text-sm w-32" placeholder="0" />
                  {formData.price && sellingRate && (
                    <span className="text-xs font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                      ≈ {(parseFloat(formData.price) / sellingRate).toFixed(2)} USD
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-8 py-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${formData.isOnline ? 'bg-orange-500' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
                  <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="sr-only" />
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isOnline ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-black dark:group-hover:text-white transition-colors">Virtual Event</span>
              </label>

              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">Capacity</span>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="w-16 border-b border-black/[0.05] bg-transparent text-sm font-bold text-center focus:outline-none focus:border-black transition-colors" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-12">
              <Button 
                type="submit" 
                disabled={isSaving} 
                className="flex-1 rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isSaving ? 'Updating...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()} 
                className="rounded-full h-14 px-8 text-neutral-500 font-bold hover:bg-neutral-100 dark:hover:bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}