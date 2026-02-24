'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, MapPin, Compass, Ticket, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface RSVP {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    slug?: string | null;
    title: string;
    date: string;
    location: string;
    price: number;
    category: string;
    isOnline: boolean;
    image?: string | null;
  };
}

export default function TicketsPage() {
  const { user, bearerToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && bearerToken) {
      loadRSVPs();
    }
  }, [user, bearerToken, authLoading, router]);

  const loadRSVPs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rsvps', {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch RSVPs');
      const data = await response.json();
      setRsvps(data);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-neutral-400 font-medium tracking-widest uppercase text-xs">
      Loading your tickets...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 flex flex-col">
      <Navigation />

      {/* Main Content: pt-32 ensures space for the floating Navigation */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 pt-32 pb-32">
        
        {/* Luma Header */}
        <header className="mb-16 space-y-2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
            My RSVPs
          </h1>
          <p className="text-lg text-neutral-500 font-medium italic font-serif">Your upcoming experiences.</p>
        </header>

        {rsvps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center">
               <Compass className="w-8 h-8 text-neutral-300" />
            </div>
            <div className="space-y-2">
                <p className="text-neutral-900 dark:text-white font-semibold">No tickets yet.</p>
                <p className="text-neutral-500 text-sm">Discover your first event today.</p>
            </div>
            <Button 
                onClick={() => router.push('/events')}
                className="rounded-full bg-black dark:bg-white text-white dark:text-black px-8 font-bold h-12"
            >
                Browse Events
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {rsvps.map((rsvp, index) => {
              const event = rsvp.event;
              const eventDate = new Date(event.date);

              return (
                <motion.div 
                    key={rsvp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-black/[0.03] dark:border-white/[0.03]"
                >
                  {/* Event Thumbnail - Luma Postcard Style */}
                  <div className="relative w-full md:w-48 aspect-[4/5] rounded-[32px] overflow-hidden bg-neutral-100 dark:bg-neutral-900/40 p-4 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-neutral-200/50">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-neutral-800">
                      {event.image ? (
                         <Image src={event.image} alt={event.title} fill className="object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-500">
                           <Ticket className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="flex-grow space-y-4 w-full pt-2">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                             <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                                rsvp.status === 'CONFIRMED' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30' 
                                : 'bg-orange-100 text-orange-600 dark:bg-orange-950/30'
                            }`}>
                                {rsvp.status}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                            {event.title}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                            <Calendar className="w-4 h-4" />
                            {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                            <MapPin className="w-4 h-4" />
                            {event.isOnline ? 'Virtual Experience' : event.location}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Button 
                            variant="outline"
                            onClick={() => router.push(`/events/${event.slug || event.id}`)}
                            className="rounded-full h-10 px-6 border-black/[0.08] dark:border-white/[0.08] text-xs font-bold uppercase tracking-wider transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                            Event Details
                        </Button>
                        
                        <div className="flex items-center gap-2 px-4 h-10 rounded-full bg-neutral-50 dark:bg-white/5 border border-black/[0.03] dark:border-white/[0.03]">
                            <QrCode className="w-4 h-4 text-neutral-400" />
                            <span className="text-[10px] font-mono font-bold text-neutral-400">#{rsvp.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}