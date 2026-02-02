'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download, Calendar, MapPin } from 'lucide-react';

interface RSVP {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    price: number;
    category: string;
    isOnline: boolean;
  };
}

export default function TicketsPage() {
  const { user, bearerToken, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && bearerToken) {
      loadRSVPs();
    }
  }, [user, bearerToken, authLoading, router]);

  const loadRSVPs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rsvps', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch RSVPs');
      const data = await response.json();
      setRsvps(data);
    } catch (error) {
      console.error('Error loading RSVPs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background px-4 py-12">
          <div className="mx-auto max-w-4xl">
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

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">My RSVPs</h1>

          {rsvps.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-lg font-semibold mb-2">No RSVPs yet</h2>
                <p className="text-muted-foreground mb-6">
                  You haven't RSVPed to any events yet. Browse available events and RSVP to your first event.
                </p>
                <Button onClick={() => router.push('/events')}>
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rsvps.map((rsvp) => {
                const event = rsvp.event;
                const eventDate = new Date(event.date);

                return (
                  <Card key={rsvp.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Event Image */}
                        <div className="md:w-1/4 h-48 md:h-auto bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-white/20" />
                        </div>

                        {/* RSVP Details */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
                              {rsvp.status}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString()}
                              </div>
                              {!event.isOnline && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Price</div>
                                <div className="font-semibold text-lg">
                                  {event.price} USD
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  RSVP Date
                                </div>
                                <div className="text-sm font-semibold">
                                  {new Date(rsvp.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Category
                                </div>
                                <div className="text-sm font-semibold">
                                  {event.category}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="md:w-48 p-6 bg-muted flex flex-col items-center justify-center border-l border-border">
                          <div className="mb-4 w-32 h-32 rounded-lg bg-white border-2 border-border flex items-center justify-center">
                            <div className="text-center text-xs text-muted-foreground">
                              RSVP
                              <br />
                              {rsvp.id.slice(0, 8)}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full gap-2 bg-transparent"
                            onClick={() => router.push(`/events/${event.id}`)}
                          >
                            View Event
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
