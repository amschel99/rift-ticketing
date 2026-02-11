'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MapPin, Calendar, Compass } from 'lucide-react';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  category: string;
  isOnline: boolean;
  image?: string | null;
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search State
  const [search, setSearch] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [category, setCategory] = useState('ALL');
  const [sellingRate, setSellingRate] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      if (response.ok) {
        const data = await response.json();
        setSellingRate(data.sellingRate || data.rate || null);
      }
    } catch (err) {
      console.error('Rate fetch failed:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Search and Filter Logic
  useEffect(() => {
    let filtered = events;
    if (category !== 'ALL') filtered = filtered.filter(e => e.category === category);
    if (search) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredEvents(filtered);
    // Only show dropdown if there's an active search and results
    setShowSearchDropdown(search.length > 0 && filtered.length > 0);
  }, [search, category, events]);

  // Handle Clicking Outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex flex-col selection:bg-orange-100">
      <Navigation />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 pt-28 pb-32">
        
        {/* Search Header with Restored Functionality */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="w-full md:max-w-md relative group" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <Input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length > 0 && setShowSearchDropdown(true)}
                className="w-full pl-11 pr-4 h-12 bg-white dark:bg-white/[0.03] border-black/[0.05] dark:border-white/[0.05] rounded-2xl focus:ring-0 focus:border-black dark:focus:border-white transition-all text-sm font-medium shadow-sm"
              />
            </div>

            {/* Restored Search Dropdown Results */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#111] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl shadow-2xl z-[60] overflow-hidden">
                {filteredEvents.slice(0, 5).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    onClick={() => setShowSearchDropdown(false)}
                    className="block p-4 hover:bg-neutral-50 dark:hover:bg-white/5 border-b border-black/[0.03] dark:border-white/[0.03] last:border-b-0 transition-colors"
                  >
                    <h4 className="font-semibold text-neutral-900 dark:text-white text-sm truncate">{event.title}</h4>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                      {new Date(event.date).toLocaleDateString()} • {event.category}
                    </p>
                  </Link>
                ))}
                {filteredEvents.length > 5 && (
                  <div className="p-3 text-center bg-neutral-50/50 dark:bg-white/2">
                    <button 
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 uppercase tracking-widest"
                    >
                      View All Results
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {user && (
            <Link href="/events/create" className="w-full md:w-auto">
              <Button className="w-full md:w-auto rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 h-11 px-8 font-bold shadow-xl shadow-black/5 active:scale-95 transition-all">
                <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                Host Event
              </Button>
            </Link>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-10 no-scrollbar">
          {['ALL', 'TECH', 'ENTERTAINMENT', 'SPORTS', 'ARTS', 'BUSINESS', 'EDUCATION'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all border ${
                category === cat
                  ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-md'
                  : 'bg-transparent text-neutral-400 border-black/[0.05] dark:border-white/[0.05] hover:border-black/20 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[3/4] bg-neutral-200/50 dark:bg-neutral-900 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-24 bg-neutral-200/50 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-4 w-full bg-neutral-200/50 dark:bg-neutral-800 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-neutral-200/50 dark:bg-neutral-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center space-y-4">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-2">
               <Compass className="w-8 h-8 text-neutral-300" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Nothing found.</h3>
            <p className="text-neutral-500 text-sm">Try searching for something else or browse another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {filteredEvents.map(event => {
              const eventDate = new Date(event.date);
              const eventPriceInKES = sellingRate ? (event.price * sellingRate) : null;

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
                    <div className="px-4 py-3.5 space-y-1.5">
                      <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-500">
                        {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <h3 className="font-semibold text-[15px] text-neutral-900 dark:text-white leading-snug truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-neutral-400 text-xs font-medium">
                          <MapPin className="w-3 h-3 mr-1 stroke-[2.5]" />
                          <span className="truncate max-w-[120px]">{event.isOnline ? 'Online' : event.location}</span>
                        </div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {event.price <= 0 ? 'Free' : `KES ${Math.round(eventPriceInKES || 0).toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}