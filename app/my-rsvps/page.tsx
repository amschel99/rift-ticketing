'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { 
  Calendar, MapPin, Mail, 
  CheckCircle2, Compass 
} from 'lucide-react';
import Image from 'next/image';

interface RSVP {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    price: number;
    isOnline: boolean;
    image?: string | null;
  };
  status: string;
  createdAt: string;
  ticketEmailSent?: boolean;
}

export default function MyRSVPsPage() {
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingTicket, setSendingTicket] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    fetchRSVPs();
  }, [user, bearerToken, router]);

  const fetchRSVPs = async () => {
    if (!bearerToken) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/rsvps', {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      });
      const data = await response.json();
      setRsvps(data);
    } catch (error) { 
      console.error('Error fetching RSVPs:', error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleSendTicket = async (eventId: string) => {
    if (!bearerToken) return;
    setSendingTicket(eventId);
    try {
      const response = await fetch(`/api/rsvps/${eventId}/send-ticket`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      });
      if (response.ok) {
        await fetchRSVPs();
      }
    } catch (error) { 
      console.error('Error sending ticket:', error); 
    } finally { 
      setSendingTicket(null); 
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-neutral-400 font-medium">
      Loading your schedule...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 flex flex-col relative">
      {/* Z-INDEX FIX: Ensure Navigation is fixed at the very top 
          of the stack with a higher z-index than main content. 
      */}
      <div className="fixed top-0 left-0 right-0 z-[100] w-full ">
        <Navigation />
      </div>
      
      {/* PADDING FIX: Added pt-40 to prevent content from hitting the 
          floating navbar and ensuring a clean Luma-style "safe area".
      */}
      <main className="flex-1 max-w-[1000px] mx-auto px-6 pt-40 pb-32 w-full relative z-10">
        <header className="mb-16 space-y-2 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 dark:text-white">
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
              const eventDate = new Date(rsvp.event.date);
              const isPast = eventDate < new Date();

              return (
                <motion.div 
                    key={rsvp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`group flex flex-col md:flex-row gap-8 items-start pb-12 border-b border-black/[0.03] dark:border-white/[0.03] ${isPast ? 'opacity-50' : ''}`}
                >
                  <div className="relative w-full md:w-48 aspect-[4/5] rounded-[32px] overflow-hidden bg-neutral-100 dark:bg-neutral-900/40 p-4 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-neutral-200/50">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-neutral-800">
                      <Image 
                        src={rsvp.event.image || '/placeholder.jpeg'} 
                        alt={rsvp.event.title} 
                        fill 
                        className="object-contain" 
                      />
                    </div>
                  </div>

                  <div className="flex-grow space-y-4 w-full">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-2">
                             <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                                rsvp.status === 'CONFIRMED' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30' 
                                : 'bg-orange-100 text-orange-600 dark:bg-orange-950/30'
                            }`}>
                                {rsvp.status}
                            </span>
                            {isPast && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 italic">Past Event</span>}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white transition-colors">
                            {rsvp.event.title}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                            <Calendar className="w-4 h-4" />
                            {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-neutral-500">
                            <MapPin className="w-4 h-4" />
                            {rsvp.event.isOnline ? 'Virtual Experience' : rsvp.event.location}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Button 
                            variant="outline"
                            onClick={() => router.push(`/events/${rsvp.event.id}`)}
                            className="rounded-full h-10 px-6 border-black/[0.08] dark:border-white/[0.08] text-xs font-bold uppercase tracking-wider transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                        >
                            Details
                        </Button>
                        
                        {rsvp.status === 'CONFIRMED' && !isPast && (
                            <Button
                                onClick={() => handleSendTicket(rsvp.event.id)}
                                disabled={sendingTicket === rsvp.event.id || rsvp.ticketEmailSent}
                                variant="ghost"
                                className="rounded-full h-10 px-6 text-xs font-bold uppercase tracking-wider text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                {sendingTicket === rsvp.event.id 
                                    ? 'Sending...' 
                                    : rsvp.ticketEmailSent 
                                    ? 'Ticket Sent' 
                                    : 'Email Ticket'}
                            </Button>
                        )}
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