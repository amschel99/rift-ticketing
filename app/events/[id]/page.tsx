'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, DollarSign, Share2, Edit, Trash2, BarChart3 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number; // Price is stored in USD
  capacity: number;
  category: string;
  isOnline: boolean;
  shareableUrl: string;
  image?: string | null;
  organizer: { id: string; externalId: string; walletAddress?: string | null };
  rsvps: { id: string; userId: string; status: string }[]; // Added status to RSVP
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasRsvped, setHasRsvped] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [buyingRate, setBuyingRate] = useState<number | null>(null); // For displaying KES
  const [sellingRate, setSellingRate] = useState<number | null>(null); // For invoice calculations

  // Check for payment redirect query parameters
  useEffect(() => {
    if (!user || !bearerToken) return;

    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      router.replace(`/events/${eventId}`);
      return;
    }

    // Check if this is a payment redirect
    // M-Pesa: ?transaction_code=...&order_id=...
    // On-chain: ?hash=0x...&order_id=...
    const transactionCode = urlParams.get('transaction_code'); // M-Pesa
    const hash = urlParams.get('hash'); // On-chain
    const orderId = urlParams.get('order_id') || urlParams.get('orderId'); // Support both formats

    if ((transactionCode || hash) && orderId) {
      // Process the payment
      handlePaymentRedirect(transactionCode, hash, orderId);
      // Clean up URL
      router.replace(`/events/${eventId}`);
    }
  }, [eventId, user, bearerToken, router]);

  const handlePaymentRedirect = async (transactionCode: string | null, hash: string | null, orderId: string) => {
    if (!bearerToken) return;

    try {
      const response = await fetch(`/api/events/${eventId}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ 
          transactionCode, 
          hash, 
          orderId,
          paymentType: transactionCode ? 'mpesa' : 'onchain'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // If payment failed (status: failed), set payment status to failed
        if (data.status === 'failed') {
          setPaymentStatus('failed');
        }
        throw new Error(data.error || 'Failed to process payment');
      }

      // Refresh event details to show updated status
      await fetchEventDetails();
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message || 'Failed to process payment');
      // Don't redirect - show error on current page
    }
  };

  useEffect(() => {
    fetchEventDetails();
    if (user && bearerToken) {
      checkWalletBalance();
    }
  }, [eventId, user, bearerToken]);

  const checkWalletBalance = async () => {
    if (!bearerToken) return;
    setIsCheckingBalance(true);
    try {
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance);
        setBuyingRate(data.exchangeRate || data.buyingRate); // buying_rate for balance display
        setSellingRate(data.sellingRate); // selling_rate for invoice RSVPs
      }
    } catch (err) {
      console.error('Error checking wallet balance:', err);
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();
      setEvent(data);

      // Check if user has already RSVPed
      if (user && data.rsvps) {
        const userRsvp = data.rsvps.some((rsvp: any) => rsvp.userId === user.id && rsvp.status === 'CONFIRMED');
        setHasRsvped(userRsvp);
        
        // Fetch invoice status to check payment status
        if (bearerToken) {
          try {
            const invoiceResponse = await fetch(`/api/events/${eventId}/invoice-status`, {
              headers: {
                'Authorization': `Bearer ${bearerToken}`,
              },
            });
            
            if (invoiceResponse.ok) {
              const invoiceData = await invoiceResponse.json();
              
              // If invoice was cleaned up (old transaction code), reset payment state
              if (invoiceData.cleanedUp) {
                setPaymentUrl(null);
                setPaymentStatus(null);
                setError('Previous payment attempt expired. Please try again.');
                return;
              }
              
              if (invoiceData.hasInvoice) {
                setPaymentUrl(invoiceData.invoiceUrl);
                
                // Determine payment status
                // Only show "pending" if we have a transaction code (payment widget redirected back)
                if (invoiceData.receiptNumber && invoiceData.status === 'CONFIRMED') {
                  setPaymentStatus('success');
                  setHasRsvped(true);
                } else if (invoiceData.transactionCode && !invoiceData.receiptNumber && invoiceData.status === 'PENDING') {
                  // We have transaction code but no receipt = payment is being processed
                  setPaymentStatus('pending');
                } else if (invoiceData.status === 'FAILED') {
                  setPaymentStatus('failed');
                }
                // If no transaction code, don't set pending status - just show payment button
              }
            }
          } catch (err) {
            console.error('Error fetching invoice status:', err);
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRsvp = async (paymentMethod: 'invoice' | 'wallet' = 'invoice') => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setIsRsvping(true);
    try {
      // Generate unique orderId
      const orderId = crypto.randomUUID();
      
      // Get current URL as originUrl (Rift will append ?ref=pay&transaction_code=...&order_id=...)
      const originUrl = window.location.origin + window.location.pathname;
      
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ originUrl, orderId, paymentMethod }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to RSVP');
      }

      const result = await response.json();
      
      // If wallet payment was successful, RSVP is confirmed immediately
      if (paymentMethod === 'wallet' && result.success) {
        setHasRsvped(true);
        setPaymentStatus('success');
        setError('');
        // Refresh event details
        await fetchEventDetails();
        await checkWalletBalance();
      } else if (result.paymentUrl) {
        // Invoice payment - show payment link
        setPaymentUrl(result.paymentUrl);
        setError(''); // Clear any errors
      } else {
        throw new Error('Payment link not received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to RSVP');
    } finally {
      setIsRsvping(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !bearerToken) return;
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      router.push('/events');
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOrganizer = user && event && event.organizer.id === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-gray-500">Loading event...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Event not found'}</AlertDescription>
            </Alert>
            <Button onClick={() => router.back()} className="w-full mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const confirmedRsvpsCount = event.rsvps.filter(r => r.status === 'CONFIRMED').length;
  const spotsLeft = event.capacity - confirmedRsvpsCount;
  const isFull = spotsLeft <= 0;
  
  // Price is stored in USD, convert to KES for display
  const eventPriceInKES = buyingRate ? (event.price * buyingRate) : event.price;
  const eventPriceInUSDC = event.price; // Price is already in USD

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#E9F1F4] py-8 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="text-[#2E8C96] hover:text-[#2A7A84] mb-6"
        >
          ← Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                {/* Event Image */}
                {event.image && (
                  <div className="mb-4 -mx-6 -mt-6">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold text-[#2E8C96] bg-[#E9F1F4] px-3 py-1 rounded-full">
                      {event.category}
                    </span>
                    {event.isOnline && (
                      <span className="ml-2 text-xs font-semibold text-[#30a46c] bg-[#adddc0] px-3 py-1 rounded-full">
                        Online Event
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isOrganizer && (
                      <>
                        <Link href={`/events/${eventId}/dashboard`}>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View RSVPs
                          </Button>
                        </Link>
                        <Link href={`/events/${eventId}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="text-[#e54d2e] hover:text-[#c7361e]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/events/${event.id}?url=${event.shareableUrl}`
                        );
                        alert('Event link copied to clipboard!');
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-3xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold">{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {!event.isOnline && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Attendees</p>
                      <p className="font-semibold">{confirmedRsvpsCount} / {event.capacity} ({spotsLeft} spots left)</p>
                    </div>
                  </div>

                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-semibold text-lg">
                            KES {eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {buyingRate && <span className="text-sm text-gray-500 ml-2">(≈ {event.price.toFixed(2)} USD)</span>}
                          </p>
                        </div>
                      </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">About This Event</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {event.description.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line || '\u00A0'}</p>
                    ))}
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Organized by</p>
                  <p className="font-semibold">{event.organizer.externalId}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                {isFull ? (
                  <Alert>
                    <AlertDescription>This event is fully booked.</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-[#2E8C96]">
                        KES {eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {buyingRate && (
                        <p className="text-sm text-gray-600">
                          ≈ {event.price.toFixed(2)} USD per ticket
                        </p>
                      )}
                    </div>

                    <div className="mb-4 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold text-[#30a46c]">{spotsLeft}</span> spots available
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {paymentStatus === 'success' || hasRsvped ? (
                      <Alert className="bg-[#adddc0] border-[#30a46c]">
                        <AlertDescription className="text-[#30a46c]">
                          ✅ Payment successful! Your RSVP is confirmed.
                        </AlertDescription>
                      </Alert>
                    ) : paymentStatus === 'failed' ? (
                      <div className="space-y-3">
                        <Alert variant="destructive">
                          <AlertDescription>
                            Payment failed. Please try again.
                          </AlertDescription>
                        </Alert>
                        {walletBalance !== null && walletBalance >= event.price && (
                          <div className="bg-[#adddc0] border border-[#30a46c] rounded-lg p-3 mb-3">
                            <p className="text-sm text-[#30a46c] mb-2">
                              💰 Wallet Balance: {walletBalance.toFixed(2)} USD
                            </p>
                            <Button
                              onClick={() => handleRsvp('wallet')}
                              disabled={isRsvping || !user}
                              className="w-full bg-[#30a46c] hover:bg-[#2a8a5a] text-white"
                              size="lg"
                            >
                              {isRsvping ? 'Processing...' : `Pay with Wallet (${event.price} USD)`}
                            </Button>
                          </div>
                        )}
                        <Button
                          onClick={() => handleRsvp('invoice')}
                          disabled={isRsvping || !user}
                          className="w-full"
                          size="lg"
                          variant={walletBalance !== null && walletBalance >= eventPriceInUSDC ? "outline" : "default"}
                        >
                          {isRsvping ? 'Generating payment link...' : 'Try Again - Checkout'}
                        </Button>
                      </div>
                    ) : paymentStatus === 'pending' ? (
                      <div className="space-y-3">
                        <Alert>
                          <AlertDescription>
                            Payment is being processed. Please wait for confirmation...
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={() => fetchEventDetails()}
                          className="w-full"
                          variant="outline"
                        >
                          Refresh Status
                        </Button>
                      </div>
                    ) : paymentUrl ? (
                      <div className="space-y-3">
                        <Alert>
                          <AlertDescription>
                            Click the button below to complete your payment and confirm your RSVP.
                          </AlertDescription>
                        </Alert>
                        <Button
                          onClick={() => window.open(paymentUrl!, '_blank')}
                          className="w-full"
                          size="lg"
                        >
                          Pay KES {eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - Complete RSVP
                        </Button>
                        <p className="text-xs text-gray-500 text-center">
                          Your RSVP will be confirmed after payment
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {walletBalance !== null && buyingRate && (
                          <div className={`border rounded-lg p-3 mb-3 ${walletBalance >= eventPriceInUSDC ? 'bg-[#adddc0] border-[#30a46c]' : 'bg-[#ffffc4] border-[#ffd13f]'}`}>
                            <p className={`text-sm mb-2 ${walletBalance >= eventPriceInUSDC ? 'text-[#30a46c]' : 'text-[#ffd13f]'}`}>
                              💰 Wallet Balance: {walletBalance.toFixed(2)} USD
                              {buyingRate && ` (KES ${(walletBalance * buyingRate).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                            </p>
                            {walletBalance >= eventPriceInUSDC ? (
                              <Button
                                onClick={() => handleRsvp('wallet')}
                                disabled={isRsvping || !user}
                                className="w-full bg-[#30a46c] hover:bg-[#2a8a5a] text-white"
                                size="lg"
                              >
                                {isRsvping ? 'Processing...' : `Pay with Wallet (KES ${eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                              </Button>
                            ) : (
                              <p className="text-xs text-[#ffd13f]">
                                ⚠️ Insufficient balance. Top up your wallet to pay with balance.
                              </p>
                            )}
                          </div>
                        )}
                        <Button
                          onClick={() => handleRsvp('invoice')}
                          disabled={isRsvping || !user}
                          className="w-full"
                          size="lg"
                          variant={walletBalance !== null && walletBalance >= eventPriceInUSDC ? "outline" : "default"}
                        >
                          {isRsvping ? 'Generating payment link...' : `Checkout (KES ${eventPriceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`}
                        </Button>
                      </div>
                    )}

                    {!user && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        <button
                          onClick={() => router.push('/auth/login')}
                          className="text-[#2E8C96] hover:underline"
                        >
                          Sign in
                        </button>
                        {' '}to RSVP to this event
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
