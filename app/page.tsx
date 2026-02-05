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
      <main className="min-h-screen bg-gradient-to-br from-white via-[#F8FAFB] to-[#E9F1F4] flex flex-col">
      {/* Hero Carousel */}
      <HeroSection />

      {/* Featured Experiences Section - Art Book Style */}
      <section className="w-full px-4 py-32 sm:px-6 lg:px-8 bg-white relative">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <span className="text-xs font-black tracking-widest text-[#2E8C96] uppercase block mb-4">
              Why Choose Rift
            </span>
            <h2 className="text-6xl lg:text-7xl font-black text-[#1F2D3A] leading-tight max-w-3xl">
              Built for
              <br />
              <span className="text-[#2E8C96]">Extraordinary</span>
              <br />
              Moments
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.15 }}
          >
            {[
              { number: '01', title: 'Curated Events', desc: 'Handpicked experiences from around the world' },
              { number: '02', title: 'Instant Booking', desc: 'Secure tickets in seconds with blockchain verified' },
              { number: '03', title: 'Community First', desc: 'Connect with people who share your passions' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group"
              >
                <div className="relative p-0 border-b-4 border-[#2E8C96] pb-8 hover:border-[#2A7A84] transition-colors">
                  <div className="text-6xl font-black text-[#2E8C96]/20 mb-4 group-hover:text-[#2E8C96]/40 transition-colors">
                    {item.number}
                  </div>
                  <h3 className="text-2xl font-black text-[#1F2D3A] mb-3">{item.title}</h3>
                  <p className="text-[#4A5568] font-light text-base">{item.desc}</p>
                </div>
              </motion.div>
            ))}
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
