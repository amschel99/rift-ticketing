'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Users, Zap } from 'lucide-react';
import Image from 'next/image';

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
  const [buyingRate, setBuyingRate] = useState<number | null>(null);

  useEffect(() => {
    fetchFeaturedEvents();
    fetchExchangeRate(); // Fetch exchange rate regardless of auth status
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      if (response.ok) {
        const data = await response.json();
        setBuyingRate(data.buyingRate || data.rate || null);
      } else {
        console.error('Failed to fetch exchange rate');
        setBuyingRate(null);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
      setBuyingRate(null);
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
      <main className="min-h-screen bg-[#E9F1F4] flex flex-col">
      {/* Hero Carousel */}
      <HeroSection />

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold mb-12 text-[#1F2D3A]">Why Choose Rift?</h2>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="rounded-lg border border-[#E9F1F4] bg-[#F8F9FA] p-6">
              <Calendar className="h-8 w-8 mb-4 text-[#2E8C96]" />
              <h3 className="font-semibold mb-2 text-[#1F2D3A]">Easy Booking</h3>
              <p className="text-sm text-[#4A5568]">
                Book your favorite events in just a few clicks. Instant confirmation with Rift integration.
              </p>
            </div>
            <div className="rounded-lg border border-[#E9F1F4] bg-[#F8F9FA] p-6">
              <Users className="h-8 w-8 mb-4 text-[#2E8C96]" />
              <h3 className="font-semibold mb-2 text-[#1F2D3A]">Share Events</h3>
              <p className="text-sm text-[#4A5568]">
                Generate unique shareable links for each event. Invite friends easily.
              </p>
            </div>
            <div className="rounded-lg border border-[#E9F1F4] bg-[#F8F9FA] p-6">
              <Zap className="h-8 w-8 mb-4 text-[#2E8C96]" />
              <h3 className="font-semibold mb-2 text-[#1F2D3A]">Crypto Payments</h3>
              <p className="text-sm text-[#4A5568]">
                Pay with USD directly. Fast, secure, and decentralized transactions.
              </p>
            </div>
            <div className="rounded-lg border border-[#E9F1F4] bg-[#F8F9FA] p-6">
              <Search className="h-8 w-8 mb-4 text-[#2E8C96]" />
              <h3 className="font-semibold mb-2 text-[#1F2D3A]">Smart Search</h3>
              <p className="text-sm text-[#4A5568]">
                Filter by category, location, date, and price range. Find exactly what you want.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-[#1F2D3A]">Featured Events</h2>
            <Link href="/events">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border border-gray-200 h-64 bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const confirmedRsvpsCount = event.rsvps.filter(r => r.status === 'CONFIRMED').length;
                return (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="group overflow-hidden rounded-lg border border-[#E9F1F4] bg-white transition-all hover:shadow-lg hover:border-[#2E8C96] h-full flex flex-col">
                      {event.image ? (
                        <div className="relative h-40 w-full overflow-hidden">
                          <Image 
                            src={event.image} 
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#2E8C96]">
                              {event.category}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-[#2E8C96] to-[#2A7A84]">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Calendar className="h-12 w-12 text-white/20" />
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#2E8C96]">
                              {event.category}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-[#2E8C96] transition-colors text-[#1F2D3A]">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-sm text-[#4A5568] line-clamp-2 flex-1">
                          {event.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#E9F1F4]">
                          {/* Price is stored in USD, convert to KES for display */}
                          <div className="text-lg font-semibold text-[#2E8C96]">
                            {buyingRate ? (
                              <>
                                KES {(event.price * buyingRate).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-sm text-gray-500 ml-1">(≈ {event.price.toFixed(2)} USD)</span>
                              </>
                            ) : (
                              <span>{event.price.toFixed(2)} USD</span>
                            )}
                          </div>
                          <div className="text-xs text-[#4A5568]">{confirmedRsvpsCount} attendees</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No events available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#2E8C96] via-[#2A7A84] to-[#2E8C96]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="relative h-[250px] sm:h-[300px] lg:h-[400px] order-2 lg:order-1">
              <div className="relative w-full h-full">
                <Image
                  src="/event1.jpeg"
                  alt="Get started illustration"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="text-center lg:text-left text-white space-y-6 order-1 lg:order-2">
              <div className="inline-block">
                <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  🎯 Ready to Get Started?
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
                    🎫 Browse Events
                  </Button>
                </Link>
                <Link href={user ? '/events/create' : '/auth/signup'}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 backdrop-blur-sm">
                    {user ? '✨ Create Event' : '🚀 Become an Organizer'}
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
