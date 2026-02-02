'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Users, TrendingUp } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  capacity: number;
  category: string;
  image?: string;
  rsvps: { id: string }[];
}

export default function OrganizerPage() {
  const { user, bearerToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !bearerToken) {
      return;
    }

    const loadEvents = async () => {
      try {
        const response = await fetch('/api/events', {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        const allEvents = await response.json();
        // Filter events by organizer (you may want to create a dedicated API endpoint)
        const organizerEvents = allEvents.filter(
          (e: any) => e.organizer?.id === user.id
        );
        setEvents(organizerEvents);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [user, bearerToken]);

  const totalRevenue = events.reduce((sum, e) => sum + e.rsvps.length * e.price, 0);
  const totalAttendees = events.reduce((sum, e) => sum + e.rsvps.length, 0);

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  if (user?.role !== 'ORGANIZER') {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">
              Not authorized
            </h1>
            <p className="text-muted-foreground mb-6">
              You need to be an organizer to access this page.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Events</h1>
              <p className="text-muted-foreground">
                Manage and track your organized events
              </p>
            </div>
            <Link href="/organizer/create">
              <Button className="gap-2">
                <Plus className="h-5 w-5" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">
                  Events organized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Attendees
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAttendees}</div>
                <p className="text-xs text-muted-foreground">
                  People booked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue}</div>
                <p className="text-xs text-muted-foreground">
                  From ticket sales
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          {events.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <h2 className="text-lg font-semibold mb-2">No events yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first event to get started
                </p>
                <Link href="/organizer/create">
                  <Button>Create Event</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Event Image */}
                      <div className="md:w-1/4 h-48 md:h-auto bg-muted overflow-hidden">
                        <img
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold">
                                {event.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()} • {event.location}
                              </p>
                            </div>
                            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {event.category}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">
                                Price
                              </div>
                              <div className="font-semibold">
                                ${event.price}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Attendees
                              </div>
                              <div className="font-semibold">
                                {event.rsvps.length} / {event.capacity}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Revenue
                              </div>
                              <div className="font-semibold text-primary">
                                ${event.rsvps.length * event.price}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Capacity
                              </div>
                              <div className="font-semibold">
                                {Math.round(
                                  (event.rsvps.length / event.capacity) * 100
                                )}
                                % full
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="md:w-48 p-6 bg-muted border-l border-border flex flex-col justify-center gap-2">
                        <Link href={`/organizer/edit/${event.id}`}>
                          <Button size="sm" variant="outline" className="w-full gap-2 bg-transparent">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-2 text-red-600 hover:text-red-700 bg-transparent"
                          onClick={async () => {
                            if (confirm('Are you sure?')) {
                              try {
                                const response = await fetch(`/api/events/${event.id}`, {
                                  method: 'DELETE',
                                });
                                if (response.ok) {
                                  setEvents(events.filter((e) => e.id !== event.id));
                                } else {
                                  alert('Failed to delete event');
                                }
                              } catch (error) {
                                console.error('Error deleting event:', error);
                                alert('Failed to delete event');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
