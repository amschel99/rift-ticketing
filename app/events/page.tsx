'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, Users, Search, Share2 } from 'lucide-react';
import Image from 'next/image';
import { EmptyEventsIllustration } from '@/components/illustrations';

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
  const [sellingRate, setSellingRate] = useState<number | null>(null); // For displaying ticket prices in KES
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
      <div className="min-h-screen bg-[#E9F1F4] flex flex-col">
        <div className="bg-gradient-to-r from-[#2E8C96] to-[#2A7A84] text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Discover Events</h1>
          <p className="text-white/90">Browse and RSVP to amazing events</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 flex-1">
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
          <div className="text-center py-12 space-y-6">
            <div className="max-w-md mx-auto h-64 flex items-center justify-center">
              <EmptyEventsIllustration />
            </div>
            <div>
              <p className="text-lg font-semibold text-[#1F2D3A] mb-2">No events found</p>
              <p className="text-sm text-[#4A5568] mb-4">Try adjusting your search or filters</p>
              {user && (
                <Link href="/events/create">
                  <Button className="bg-[#2E8C96] hover:bg-[#2A7A84] text-white">
                    Create Your First Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => {
              const eventDate = new Date(event.date);
              const confirmedRsvpsCount = event.rsvps.filter(r => r.status === 'CONFIRMED').length;
              const spotsLeft = event.capacity - confirmedRsvpsCount;
              // Price is stored in USD, convert to KES for display using selling_rate
              const eventPriceInKES = sellingRate ? (event.price * sellingRate) : null;

              return (
                <Card
                  key={event.id}
                  className="flex h-full flex-col hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#E9F1F4] hover:border-[#2E8C96] group p-0"
                >
                  {event.image && (
                    <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-[#2E8C96] to-[#2A7A84]">
                      <Image 
                        src={event.image} 
                        alt={event.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <span className="text-xs font-semibold text-white bg-[#2E8C96]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          {event.category}
                        </span>
                        {event.isOnline && (
                          <span className="text-xs font-semibold text-white bg-[#30a46c]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {!event.image && (
                    <div className="relative w-full h-56 overflow-hidden bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] flex items-center justify-center">
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <span className="text-xs font-semibold text-white bg-[#2E8C96]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                          {event.category}
                        </span>
                        {event.isOnline && (
                          <span className="text-xs font-semibold text-white bg-[#30a46c]/90 backdrop-blur-sm px-3 py-1 rounded-full">
                            Online
                          </span>
                        )}
                      </div>
                      <Calendar className="h-16 w-16 text-white/20" />
                    </div>
                  )}
                  <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="line-clamp-2 text-xl mb-2 group-hover:text-[#2E8C96] transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-gray-600">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between space-y-4 pt-0 px-6 pb-6">
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-[#2E8C96]" />
                        <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {!event.isOnline && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-[#2E8C96]" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-4 h-4 text-[#2E8C96]" />
                        <span>{confirmedRsvpsCount} / {event.capacity} attendees</span>
                        <span className="text-xs text-gray-500">({spotsLeft} left)</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        {eventPriceInKES !== null ? (
                          <>
                            <span className="text-[#2E8C96]">KES {eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <span className="text-xs text-gray-500 font-normal">(≈ {event.price.toFixed(2)} USD)</span>
                          </>
                        ) : (
                          <span className="text-[#2E8C96]">{event.price.toFixed(2)} USD</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#E9F1F4]">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button className="w-full bg-[#2E8C96] hover:bg-[#2A7A84] text-white">
                          View Details
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96] hover:text-white"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              const url = `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`;
                              const text = `Check out this event: ${event.title}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
                            }}
                          >
                            <span className="mr-2">📱</span> WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const url = `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`;
                              const text = `Check out this event: ${event.title}`;
                              window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                            }}
                          >
                            <span className="mr-2">✈️</span> Telegram
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const url = `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`;
                              const text = `Check out this event: ${event.title}`;
                              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                            }}
                          >
                            <span className="mr-2">🐦</span> Twitter/X
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const url = `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`;
                              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                            }}
                          >
                            <span className="mr-2">👤</span> Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const url = `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`;
                              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                            }}
                          >
                            <span className="mr-2">💼</span> LinkedIn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`
                              );
                              alert('Event link copied to clipboard!');
                            }}
                          >
                            <span className="mr-2">🔗</span> Copy Link
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
