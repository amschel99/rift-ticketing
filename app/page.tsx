'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { EventShowcase } from '@/components/event-showcase';
import { StatsSection } from '@/components/stats-section';
import { Button } from '@/components/ui/button';
import { Zap, Heart, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  price: number; // Price is stored in USD
  rsvps: { id: string; status: string }[];
  category: string;
  image?: string | null;
}

export default function HomePage() {
  const { user, bearerToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sellingRate, setSellingRate] = useState<number | null>(null); // For displaying ticket prices in KES

  useEffect(() => {
    fetchFeaturedEvents();
    fetchExchangeRate(); // Fetch exchange rate regardless of auth status
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      if (response.ok) {
        const data = await response.json();
        setSellingRate(data.sellingRate || data.rate || null);
      } else {
        console.error('Failed to fetch exchange rate');
        setSellingRate(null);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setSellingRate(null);
    }
  };

  const fetchFeaturedEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white flex flex-col">
      {/* Hero Carousel */}
      <HeroSection />

      {/* Features Section - Premium redesign */}
      <section className="w-full px-4 py-24 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 right-1/4 w-64 h-64 bg-[#2E8C96]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#2E8C96]/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center max-w-2xl mx-auto"
          >
            <span className="text-xs font-bold tracking-widest text-[#2E8C96] uppercase">Why Rift</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1F2D3A] mt-3">
              Built for Unforgettable Moments
            </h2>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
          >
            {[
              { icon: Heart, title: 'Curated Experiences', desc: 'Handpicked events that match your interests and create lasting memories.' },
              { icon: Zap, title: 'Instant Access', desc: 'Get your tickets instantly with secure, blockchain-verified transactions.' },
              { icon: Lock, title: 'Safe & Secure', desc: 'Your data and payments are protected with military-grade encryption.' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white to-[#F8FAFB] border border-[#E9F1F4] transition-all hover:shadow-lg hover:border-[#2E8C96]">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-[#2E8C96]/5 rounded-full blur-2xl group-hover:bg-[#2E8C96]/10 transition-colors" />
                    <Icon className="w-8 h-8 text-[#2E8C96] mb-4 relative" />
                    <h3 className="text-lg font-bold text-[#1F2D3A] mb-2 relative">{feature.title}</h3>
                    <p className="text-sm text-[#4A5568] relative">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Events Section */}
      <EventShowcase 
        events={events}
        isLoading={isLoading}
        sellingRate={sellingRate || 1}
      />

      {/* CTA Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#2E8C96] via-[#2A7A84] to-[#2E8C96]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="relative h-[250px] sm:h-[300px] lg:h-[400px] order-2 lg:order-1">
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [0.8, 1.1, 0.8],
                    rotateZ: [0, 5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="text-8xl">🎭</div>
                </motion.div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="text-center lg:text-left text-white space-y-6 order-1 lg:order-2">
              <div className="inline-block">
                <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  Ready to Get Started?
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                Join the Rift Community
              </h2>
              <p className="text-lg sm:text-xl opacity-90 max-w-xl mx-auto lg:mx-0">
                Browse amazing events or create your own. Join Rift to discover and organize unforgettable experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/events">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-[#2E8C96] hover:bg-[#F8F9FA] shadow-lg hover:shadow-xl transition-all">
                    Browse Events
                  </Button>
                </Link>
                <Link href={user ? '/events/create' : '/auth/signup'}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 backdrop-blur-sm">
                    {user ? 'Create Event' : 'Become an Organizer'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
    </>
  );
}
