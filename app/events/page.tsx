'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, DollarSign, Search } from 'lucide-react';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number; // Price is now in KES
  capacity: number;
  category: string;
  isOnline: boolean;
  shareableUrl: string;
  image?: string | null;
  organizer: { id: string; externalId: string };
  rsvps: { id: string; status: string }[]; // Added status to RSVP
}

export default function EventsPage() {
  const { user, bearerToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [buyingRate, setBuyingRate] = useState<number | null>(null); // For KES conversion
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
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

  useEffect(() => {
    let filtered = events;

    if (category !== 'ALL') {
      filtered = filtered.filter(e => e.category === category);
    }

    if (search) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
    setShowSearchDropdown(search.length > 0 && filtered.length > 0);
  }, [search, category, events]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#E9F1F4]">
        <div className="bg-gradient-to-r from-[#2E8C96] to-[#2A7A84] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Discover Events</h1>
          <p className="text-white/90">Browse and RSVP to amazing events</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8 gap-4">
          <div className="flex-1 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#4A5568]" />
              <Input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search && setShowSearchDropdown(true)}
                className="max-w-md pl-10"
              />
            </div>
            {/* Search Dropdown */}
            {showSearchDropdown && filteredEvents.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white border border-[#E9F1F4] rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {filteredEvents.slice(0, 5).map((event) => {
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      onClick={() => {
                        setSearch('');
                        setShowSearchDropdown(false);
                      }}
                      className="block p-3 hover:bg-[#F8F9FA] border-b border-[#E9F1F4] last:border-b-0 transition-colors"
                    >
                      <h3 className="font-semibold text-[#1F2D3A] truncate">{event.title}</h3>
                    </Link>
                  );
                })}
                {filteredEvents.length > 5 && (
                  <div className="p-3 text-center border-t border-[#E9F1F4]">
                    <Link
                      href={`/events?search=${encodeURIComponent(search)}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-sm text-[#2E8C96] hover:underline"
                    >
                      View all {filteredEvents.length} results
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          {user && (
            <Link href="/events/create">
              <Button>Create Event</Button>
            </Link>
          )}
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {['ALL', 'TECH', 'ENTERTAINMENT', 'SPORTS', 'ARTS', 'BUSINESS', 'EDUCATION'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                category === cat
                  ? 'bg-[#2E8C96] text-white hover:bg-[#2A7A84]'
                  : 'bg-white text-[#1F2D3A] border border-[#E9F1F4] hover:border-[#2E8C96]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const eventDate = new Date(event.date);
              const confirmedRsvpsCount = event.rsvps.filter(r => r.status === 'CONFIRMED').length;
              const spotsLeft = event.capacity - confirmedRsvpsCount;
              // Price is stored in USD, convert to KES for display
              const eventPriceInKES = buyingRate ? (event.price * buyingRate) : null;

              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  {event.image && (
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                      <Image src={event.image} alt={event.title} fill className="object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-[#2E8C96] bg-[#E9F1F4] px-2 py-1 rounded">
                        {event.category}
                      </span>
                      {event.isOnline && (
                        <span className="text-xs font-semibold text-[#30a46c] bg-[#adddc0] px-2 py-1 rounded">
                          Online
                        </span>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {eventDate.toLocaleDateString()}
                      </div>
                      {!event.isOnline && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        {confirmedRsvpsCount} / {event.capacity} attendees ({spotsLeft} left)
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        {eventPriceInKES !== null ? (
                          <>
                            KES {eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span className="text-sm text-gray-500 ml-1">(≈ {event.price.toFixed(2)} USD)</span>
                          </>
                        ) : (
                          <span>{event.price.toFixed(2)} USD</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`
                          );
                          alert('Event link copied!');
                        }}
                      >
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
    </>
  );
}
