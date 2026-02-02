'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, DollarSign, ReceiptText, Hash, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface RSVP {
  id: string;
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    price: number; // Price is now in KES
    isOnline: boolean;
    image?: string | null; // Added image
  };
  status: string;
  createdAt: string;
  receiptNumber?: string | null; // M-Pesa receipt
  transactionCode?: string | null; // Transaction hash/URL
  buyingRate?: number; // Exchange rate from API
}

export default function MyRSVPsPage() {
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRSVPs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/rsvps', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRsvps(data);
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#E9F1F4] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">My RSVPs</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your RSVPs...</p>
          </div>
        ) : rsvps.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <AlertDescription>
                  You haven't RSVPed to any events yet.{' '}
                  <Button
                    variant="link"
                    onClick={() => router.push('/events')}
                    className="p-0"
                  >
                    Browse events
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {rsvps.map(rsvp => {
              const eventDate = new Date(rsvp.event.date);
              const isUpcoming = eventDate > new Date();

              return (
                <Card key={rsvp.id} className="hover:shadow-lg transition-shadow">
                  {rsvp.event.image && (
                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                      <Image src={rsvp.event.image} alt={rsvp.event.title} fill className="object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{rsvp.event.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          RSVP Status: <span className="font-semibold capitalize">{rsvp.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        {isUpcoming ? (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            Upcoming
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Past Event
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-semibold">{eventDate.toLocaleDateString()}</p>
                        </div>
                      </div>

                      {!rsvp.event.isOnline && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <MapPin className="w-5 h-5" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-semibold">{rsvp.event.location}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-gray-600">
                        <DollarSign className="w-5 h-5" />
                        <div>
                          <p className="text-sm text-gray-500">Price Paid</p>
                          <p className="font-semibold">
                            {/* Price is stored in USD, convert to KES for display */}
                            KES {rsvp.buyingRate ? (rsvp.event.price * rsvp.buyingRate).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : rsvp.event.price.toFixed(2)}
                            {rsvp.buyingRate && <span className="text-sm text-gray-500 ml-2">(≈ {rsvp.event.price.toFixed(2)} USD)</span>}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(rsvp.receiptNumber || rsvp.transactionCode) && rsvp.status === 'CONFIRMED' && (
                      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
                        {rsvp.receiptNumber && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <ReceiptText className="w-4 h-4" />
                              M-Pesa Receipt:
                            </p>
                            <p className="font-mono text-sm font-semibold break-all">
                              {rsvp.receiptNumber}
                            </p>
                          </div>
                        )}
                        {rsvp.transactionCode && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                              <Hash className="w-4 h-4" />
                              Transaction Hash:
                            </p>
                            {rsvp.transactionCode.startsWith('http') || rsvp.transactionCode.startsWith('https') ? (
                              <a
                                href={rsvp.transactionCode}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm font-semibold break-all text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                              >
                                {rsvp.transactionCode}
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : (
                              <p className="font-mono text-sm font-semibold break-all">
                                {rsvp.transactionCode}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/events/${rsvp.event.id}`)}
                      >
                        View Event Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}
