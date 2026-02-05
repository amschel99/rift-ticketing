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
      <main className="min-h-screen bg-white flex flex-col">
      {/* Hero Carousel */}
      <HeroSection />

      {/* Gamified Quests Section */}
      <section className="w-full px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-[#F8FAFB] to-[#E9F1F4] relative overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#2E8C96]/8 rounded-full blur-3xl -mr-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2A7A84]/5 rounded-full blur-3xl -ml-48" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-20 text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 mb-4 text-xs font-bold tracking-widest text-[#2E8C96] bg-[#2E8C96]/10 rounded-full border border-[#2E8C96]/20">
              COMPLETE YOUR JOURNEY
            </span>
            <h2 className="text-5xl lg:text-6xl font-bold text-[#1F2D3A] leading-tight">
              Event Master Quests
            </h2>
            <p className="mt-6 text-xl text-[#4A5568]">Level up your event experience with exclusive rewards and achievements</p>
          </motion.div>

          {/* Quest Cards Grid */}
          <motion.div
            className="grid gap-6 md:grid-cols-3 auto-rows-fr"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.12 }}
          >
            {[
              {
                level: 'I',
                title: 'Discovery',
                desc: 'Explore your first event and discover what awaits',
                reward: '+100 XP',
                badge: '🎯',
                color: 'from-blue-400 to-[#2E8C96]'
              },
              {
                level: 'II',
                title: 'Collector',
                desc: 'Book 5 events in a single month',
                reward: '+500 XP',
                badge: '🏆',
                color: 'from-purple-400 to-[#2A7A84]'
              },
              {
                level: 'III',
                title: 'Creator',
                desc: 'Host your first event and invite friends',
                reward: '+1000 XP',
                badge: '👑',
                color: 'from-yellow-400 to-orange-400'
              },
            ].map((quest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className={`relative h-full rounded-2xl bg-gradient-to-br ${quest.color} p-[2px] overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
                  {/* Animated border glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse" />
                  
                  <div className="relative h-full rounded-2xl bg-white p-8 flex flex-col">
                    {/* Quest Level Badge */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] text-white font-bold text-lg mb-6 shadow-lg">
                      {quest.level}
                    </div>

                    {/* Emoji Badge */}
                    <div className="text-5xl mb-4 inline-block transform group-hover:scale-125 transition-transform duration-300">
                      {quest.badge}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-[#1F2D3A] mb-3">{quest.title}</h3>
                    <p className="text-[#4A5568] mb-6 flex-grow">{quest.desc}</p>

                    {/* Reward Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E8C96]/10 rounded-full border border-[#2E8C96]/30 w-fit mb-6">
                      <span className="text-sm font-bold text-[#2E8C96]">{quest.reward}</span>
                    </div>

                    {/* Unlock Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#4A5568]">
                        <span>Progress</span>
                        <span className="font-bold">{Math.floor(Math.random() * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#E9F1F4] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#2E8C96] to-[#2A7A84]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.floor(Math.random() * 100) + 20}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5 }}
                        />
                      </div>
                    </div>
                  </div>
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
