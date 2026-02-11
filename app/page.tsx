'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  image?: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 flex flex-col">
      <Navigation />
      
      {/* Hero Section - Framed by the fixed Navigation */}
      <div className="relative z-0">
         <HeroSection />
      </div>

      {/* Main Content Area - Z-index context prevents bleeding */}
      <main className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-16 md:space-y-24 lg:space-y-40 pb-20 md:pb-32">
        
        {/* 1. Featured Events - The "Postcard" Grid */}
        <section className="pt-12 md:pt-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 font-bold text-[10px] uppercase tracking-[0.25em]">
                <Sparkles className="w-3.5 h-3.5" />
                Curated
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-6xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-[0.95]">
                Discover <br className="hidden md:block" /> what&apos;s next.
              </h2>
            </div>
            <Link href="/events" className="group flex items-center text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black dark:hover:text-white transition-colors pb-1">
              View all events <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <div className="aspect-[3/4] bg-neutral-200/50 dark:bg-neutral-900/50 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-20 bg-neutral-200/50 dark:bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-full bg-neutral-200/50 dark:bg-neutral-800 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : (
              events.map((event) => {
                const eventDate = new Date(event.date);
                return (
                  <Link key={event.id} href={`/events/${event.id}`} className="group">
                    <div className="rounded-2xl overflow-hidden bg-white dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.06] transition-all duration-300 group-hover:shadow-xl group-hover:shadow-black/[0.08] group-hover:-translate-y-1">
                      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                        <Image
                          src={event.image || '/placeholder.jpeg'}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="px-4 py-3.5 space-y-1">
                        <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-500">
                          {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <h3 className="font-semibold text-[15px] text-neutral-900 dark:text-white leading-snug truncate">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* 2. Attendee-Focused FAQ Section */}
        <section className="max-w-2xl mx-auto w-full px-2">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-16 tracking-tighter text-neutral-900 dark:text-white">
              Joining an Event
            </h2>
            <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
              <AttendeeFAQ />
            </div>
        </section>

        {/* 3. Final Mobile-Responsive CTA */}
        <section className="relative rounded-[32px] md:rounded-[48px] lg:rounded-[64px] bg-black dark:bg-white p-8 md:p-16 lg:p-32 overflow-hidden text-center group">
            <div className="relative z-10 space-y-8 md:space-y-14">
                <h2 className="text-3xl md:text-5xl lg:text-8xl font-semibold text-white dark:text-black tracking-tighter leading-[0.9]">
                    Ready to bring <br /> people together?
                </h2>
                <div className="flex justify-center">
                    <Link href="/events/create">
                        <Button size="lg" className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-8 md:px-12 h-14 md:h-16 lg:h-20 text-base md:text-lg lg:text-xl font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95">
                            <Plus className="w-6 h-6 mr-3 stroke-[3]" />
                            Create your event
                        </Button>
                    </Link>
                </div>
            </div>
            {/* Optimized Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[100px] rounded-full" />
        </section>

      </main>

      <Footer />
    </div>
  );
}

function AttendeeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const faqs = [
    { q: "How do I get my tickets?", a: "Your tickets are sent immediately to your email after booking. You can also find them under 'My RSVPs' in your Hafla dashboard." },
    { q: "What payment methods are supported?", a: "We support M-Pesa for local mobile money and USDC for global crypto payments. Both are instant and secure." },
    { q: "Can I cancel my registration?", a: "Host-specific refund policies apply. Check the 'About' section on the event page to see the organizer's policy." },
    { q: "Do I need an account to browse?", a: "Not at all. You can explore all featured events freely. You'll only need to log in to manage your tickets or wallet." }
  ];

  return (
    <>
      {faqs.map((faq, i) => (
        <div key={i} className="py-2">
          <button 
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full py-8 flex justify-between items-center text-left group"
          >
            <span className="text-xl md:text-2xl font-semibold text-neutral-800 dark:text-neutral-200 group-hover:opacity-60 transition-opacity tracking-tight">
              {faq.q}
            </span>
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-500 ${openIndex === i ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="pb-10 text-neutral-500 text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
}