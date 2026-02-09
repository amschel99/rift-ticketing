'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MapPin, Users, Search, Share2 } from 'lucide-react';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  category: string;
  isOnline: boolean;
  shareableUrl: string;
  image?: string | null;
  organizer: { id: string; externalId: string };
  rsvps: { id: string; status: string }[];
}

export default function EventsPage() {
  const { user, bearerToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('UPCOMING');
  const [sellingRate, setSellingRate] = useState<number | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
      console.error('Error fetching exchange rate:', err);
    }
  };

  useEffect(() => {
    let filtered = events;

    if (filterType === 'UPCOMING') {
      filtered = filtered.filter(e => new Date(e.date) > new Date());
    } else if (filterType === 'PAST') {
      filtered = filtered.filter(e => new Date(e.date) <= new Date());
    }

    if (search) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
    setShowSearchDropdown(search.length > 0 && filtered.length > 0);
    if (filtered.length > 0 && !selectedEventId) {
      setSelectedEventId(filtered[0].id);
    }
  }, [search, filterType, events, selectedEventId]);

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

  const selectedEvent = filteredEvents.find(e => e.id === selectedEventId) || filteredEvents[0];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#2E2E2E] px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-4xl font-bold text-white">Events</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setFilterType('UPCOMING')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'UPCOMING'
                    ? 'bg-[#2E2E2E] text-white'
                    : 'text-[#B4B4B4] hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilterType('PAST')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'PAST'
                    ? 'bg-[#2E2E2E] text-white'
                    : 'text-[#B4B4B4] hover:text-white'
                }`}
              >
                Past
              </button>
            </div>
          </div>
        </div>

        {/* Main content - Two column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Timeline (hidden on mobile) */}
          <div className="hidden lg:flex lg:w-80 border-r border-[#2E2E2E] px-8 py-8 flex-col gap-6 overflow-y-auto">
            {isLoading ? (
              <div className="text-[#B4B4B4]">Loading...</div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => {
                const eventDate = new Date(event.date);
                const dateStr = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const dayStr = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
                const isSelected = event.id === selectedEventId;

                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className={`group text-left transition-opacity hover:opacity-100 ${isSelected ? 'opacity-100' : 'opacity-60'}`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="flex flex-col items-center gap-3 pt-1">
                        <div className={`w-2 h-2 rounded-full transition-colors ${isSelected ? 'bg-[#FF6B35]' : 'bg-[#3A3A3A] group-hover:bg-[#FF6B35]'}`} />
                        {index < filteredEvents.length - 1 && (
                          <div className="w-0.5 h-16 bg-[#2E2E2E]" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-[#B4B4B4] text-sm font-medium">
                          {dateStr}
                          <br />
                          <span className="text-xs text-[#808080]">{dayStr}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-[#B4B4B4] text-sm">No events found</div>
            )}
          </div>

          {/* Right content - Event details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-8">
              {/* Search box */}
              <div className="mb-12 max-w-md" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#B4B4B4]" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => search && setShowSearchDropdown(true)}
                    className="w-full pl-12 pr-4 py-3 text-base border border-[#2E2E2E] focus:border-[#FF6B35] rounded-lg bg-[#1A1A1A] text-white placeholder:text-[#B4B4B4] transition-all focus:outline-none"
                  />

                  {/* Search Dropdown */}
                  {showSearchDropdown && filteredEvents.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                      {filteredEvents.slice(0, 5).map((event) => (
                        <Link
                          key={event.id}
                          href={`/events/${event.id}`}
                          onClick={() => {
                            setSearch('');
                            setShowSearchDropdown(false);
                          }}
                          className="block p-3 hover:bg-[#242424] border-b border-[#2E2E2E] last:border-b-0 transition-colors"
                        >
                          <h3 className="font-semibold text-white truncate">{event.title}</h3>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-[#B4B4B4]">Loading events...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg font-semibold text-white mb-2">No events found</p>
                  <p className="text-sm text-[#B4B4B4] mb-4">Try adjusting your search or filters</p>
                  {user && (
                    <Link href="/events/create">
                      <Button className="bg-[#FF6B35] hover:bg-[#E85A24] text-white border-0">
                        Create Your First Event
                      </Button>
                    </Link>
                  )}
                </div>
              ) : selectedEvent ? (
                <div className="max-w-2xl space-y-6">
                  {/* Event time */}
                  <div className="text-sm text-[#B4B4B4] font-medium">
                    {new Date(selectedEvent.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Event title */}
                  <h2 className="text-3xl font-bold text-white">{selectedEvent.title}</h2>

                  {/* Event organizer */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-xs font-bold">
                      {selectedEvent.organizer.externalId.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-[#B4B4B4]">By {selectedEvent.organizer.externalId}</span>
                  </div>

                  {/* Location */}
                  {!selectedEvent.isOnline && (
                    <div className="flex items-center gap-3 text-[#B4B4B4]">
                      <MapPin className="w-5 h-5 text-[#FF6B35]" />
                      <span className="text-sm">{selectedEvent.location}</span>
                    </div>
                  )}

                  {/* Status badge */}
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B35] text-white">
                      {new Date(selectedEvent.date) > new Date() ? 'Upcoming' : 'Ended'}
                    </span>
                  </div>

                  {/* Event image */}
                  {selectedEvent.image && (
                    <div className="relative w-full h-64 rounded-lg overflow-hidden mt-8">
                      <Image
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Event details */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#2E2E2E]">
                    <div>
                      <p className="text-xs text-[#808080] mb-1">Date</p>
                      <p className="text-white font-medium">
                        {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#808080] mb-1">Attendees</p>
                      <p className="text-white font-medium">
                        {selectedEvent.rsvps.filter(r => r.status === 'CONFIRMED').length} / {selectedEvent.capacity}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-6">
                    <Link href={`/events/${selectedEvent.id}`} className="flex-1">
                      <Button className="w-full bg-[#FF6B35] hover:bg-[#E85A24] text-white border-0">
                        View Details
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#2E2E2E] text-[#FF6B35] hover:bg-[#1A1A1A] hover:border-[#FF6B35]"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1A] border-[#2E2E2E]">
                        <DropdownMenuItem
                          onClick={() => {
                            const url = `${window.location.origin}/events/${selectedEvent.id}`;
                            const text = `Check out this event: ${selectedEvent.title}`;
                            window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
                          }}
                          className="text-[#B4B4B4] hover:bg-[#242424] hover:text-white cursor-pointer"
                        >
                          <span className="mr-2">📱</span> WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const url = `${window.location.origin}/events/${selectedEvent.id}`;
                            const text = `Check out this event: ${selectedEvent.title}`;
                            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="text-[#B4B4B4] hover:bg-[#242424] hover:text-white cursor-pointer"
                        >
                          <span className="mr-2">✈️</span> Telegram
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const url = `${window.location.origin}/events/${selectedEvent.id}`;
                            navigator.clipboard.writeText(url);
                          }}
                          className="text-[#B4B4B4] hover:bg-[#242424] hover:text-white cursor-pointer"
                        >
                          <span className="mr-2">🔗</span> Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
