'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  Calendar, MapPin, Users, Share2, Edit, Trash2,
  BarChart3, Mail, CheckCircle2, AlertCircle, ChevronLeft,
  ArrowRight, Copy, Check, MessageCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateGoogleCalendarUrl } from '@/lib/calendar';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const eventId = params.id as string;

  const searchParams = useSearchParams();

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasRsvped, setHasRsvped] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [sellingRate, setSellingRate] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [sendingTicket, setSendingTicket] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle Rift payment redirect: ?transaction_code=X&order_id=Y or ?hash=Z&order_id=Y
  const paymentConfirmedRef = useRef(false);

  // Show confirming state immediately when payment params are detected (before auth loads)
  useEffect(() => {
    const transactionCode = searchParams.get('transaction_code');
    const orderId = searchParams.get('order_id');
    const hash = searchParams.get('hash');

    if ((transactionCode || hash) && orderId && !paymentConfirmedRef.current) {
      setIsConfirming(true);
    }
  }, [searchParams]);

  // Actually confirm payment once bearerToken is available
  useEffect(() => {
    if (paymentConfirmedRef.current) return;

    const transactionCode = searchParams.get('transaction_code');
    const orderId = searchParams.get('order_id');
    const hash = searchParams.get('hash');

    if ((transactionCode || hash) && orderId && bearerToken) {
      paymentConfirmedRef.current = true;
      const confirmPayment = async () => {
        try {
          const response = await fetch(`/api/events/${eventId}/transaction`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${bearerToken}`,
            },
            body: JSON.stringify({ transactionCode, hash, orderId }),
          });
          const result = await response.json();
          if (result.success && result.status !== 'pending') {
            setHasRsvped(true);
            setPaymentUrl(null);
          } else if (!response.ok) {
            setError(result.error || 'Payment confirmation failed');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to confirm payment');
        } finally {
          setIsConfirming(false);
          // Clean up URL params
          router.replace(`/events/${eventId}`);
        }
      };
      confirmPayment();
    }
  }, [searchParams, bearerToken, eventId, router]);

  useEffect(() => {
    fetchEventDetails();
    fetchExchangeRate();
  }, [eventId, user]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('/api/exchange-rate');
      if (response.ok) {
        const data = await response.json();
        setSellingRate(data.sellingRate || data.rate || null);
      }
    } catch (err) { console.error(err); }
  };

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error('Event not found');
      const data = await response.json();
      setEvent(data);
      if (user && data.rsvps) {
        setHasRsvped(data.rsvps.some((r: any) => r.userId === user.id && r.status === 'CONFIRMED'));
      }
      if (user && data.invoices) {
        const userInvoice = data.invoices.find((i: any) => i.userId === user.id && i.ticketEmailSent);
        if (userInvoice) setTicketSent(true);
      }
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  const handleRsvp = async (method: 'invoice' | 'wallet' = 'invoice') => {
    if (!user) { router.push('/auth/login'); return; }
    setIsRsvping(true);
    setError('');
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${bearerToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ originUrl: window.location.href, paymentMethod: method }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to register');
      } else if (result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
      } else if (result.success) {
        setHasRsvped(true);
      }
    } catch (err: any) { setError(err.message); }
    finally { setIsRsvping(false); }
  };

  if (isLoading || isConfirming) return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-200/20 dark:bg-orange-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[250px] h-[250px] bg-orange-100/30 dark:bg-orange-950/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Animated rings */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-1 rounded-full border border-black/[0.04] dark:border-white/[0.04]" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            {isConfirming ? (
              <svg className="w-4 h-4 text-white animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">
            {isConfirming ? 'Confirming your payment' : 'Loading experience'}
          </h2>
          <p className="text-sm text-neutral-400 font-medium">
            {isConfirming ? 'This will only take a moment.' : 'Preparing event details...'}
          </p>
        </div>

        {/* Subtle progress dots */}
        {isConfirming && (
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-orange-500/60"
                style={{ animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const eventDate = new Date(event?.date);
  const isOrganizer = user && event && event.organizer.id === user.id;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 pb-20">
      <main className="max-w-[1100px] mx-auto px-6 pt-12">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-12">
          <button onClick={() => router.back()} className="group flex items-center text-sm font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            {isOrganizer && (
              <div className="flex items-center gap-2 mr-4 border-r pr-4 border-black/5">
                <Link href={`/events/${eventId}/dashboard`}>
                  <Button variant="ghost" size="sm" className="rounded-full h-9"><BarChart3 className="w-4 h-4 mr-2" /> Stats</Button>
                </Link>
                <Link href={`/events/${eventId}/edit`}>
                  <Button variant="ghost" size="sm" className="rounded-full h-9"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                </Link>
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full h-9 px-4 border-black/[0.08] dark:border-white/[0.08]">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl mt-2 border-black/[0.08] dark:border-white/[0.08] shadow-2xl">
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer py-2.5"
                  onClick={() => {
                    const url = `${window.location.origin}/events/${eventId}`;
                    const text = `Check out ${event?.title}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer py-2.5"
                  onClick={() => {
                    const url = `${window.location.origin}/events/${eventId}`;
                    const text = `Check out ${event?.title}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                  }}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X (Twitter)
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer py-2.5"
                  onClick={() => {
                    const url = `${window.location.origin}/events/${eventId}`;
                    const subject = event?.title || 'Check out this event';
                    const body = `Hey, check out this event: ${event?.title}\n\n${url}`;
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" /> Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer py-2.5"
                  onClick={() => {
                    const url = `${window.location.origin}/events/${eventId}`;
                    navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Left Column: Visuals & Content */}
          <div className="lg:col-span-7 space-y-12">
         {/* Event Hero Image - Refactored for full visibility */}
<div className="relative aspect-[16/10] w-full rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center p-6 md:p-10">
  {/* Blurred background for a premium Luma effect if the image doesn't fill the space */}
  <div className="absolute inset-0 opacity-20 blur-3xl scale-110 pointer-events-none">
    <Image 
      src={event.image || '/placeholder.jpeg'} 
      alt=""
      fill 
      className="object-cover"
    />
  </div>
  
  <div className="relative w-full h-full">
    <Image 
      src={event.image || '/placeholder.jpeg'} 
      alt={event.title} 
      fill 
      className="object-contain" // This ensures the whole image is visible
      priority
    />
  </div>
</div>

            {/* Typography & Title */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest">
                  {event.category}
                </span>
                {event.isOnline && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                    Virtual
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-[0.95] text-neutral-900 dark:text-white">
                {event.title}
              </h1>

              <div className="flex items-center gap-4 text-neutral-500">
                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-sm">
                  {event.organizer.externalId[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Hosted by</p>
                  <p className="font-semibold text-neutral-900 dark:text-white">{event.organizer.externalId}</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white tracking-tight">About this experience</h3>
              <div className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky RSVP Info */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-[#0c0c0c] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 shadow-sm">
                
                {/* Time & Location Details */}
                <div className="space-y-8 mb-10">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {event.isOnline ? 'Online via Link' : event.location}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {event.isOnline ? 'Access details sent after RSVP' : 'Physical Location'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-50 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">
                        {event.capacity - event.rsvps.length} spots remaining
                      </p>
                      <p className="text-sm text-neutral-500">
                        {event.rsvps.length} people attending
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing & Call to Action */}
                <div className="space-y-4 pt-8 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-500 font-medium">Admission</span>
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {event.price === 0 ? 'Free' : `KES ${Math.round(event.price * (sellingRate || 1)).toLocaleString()}`}
                    </span>
                  </div>

                  {hasRsvped ? (
                    <div className="space-y-3">
                      <div className="w-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        You&apos;re attending
                      </div>
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl h-14 font-bold border-black/[0.08]"
                        disabled={sendingTicket || ticketSent}
                        onClick={async () => {
                          setSendingTicket(true);
                          try {
                            const res = await fetch(`/api/rsvps/${eventId}/send-ticket`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${bearerToken}` },
                            });
                            const data = await res.json();
                            if (res.ok) { setError(''); setTicketSent(true); }
                            else setError(data.error || 'Failed to send ticket');
                          } catch { setError('Failed to send ticket email'); }
                          finally { setSendingTicket(false); }
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {ticketSent ? 'Ticket Sent!' : sendingTicket ? 'Sending...' : 'Send Ticket to Email'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl h-14 font-bold border-black/[0.08]"
                        onClick={() => window.open(generateGoogleCalendarUrl({ title: event.title, description: event.description, location: event.location, startDate: eventDate }), '_blank')}
                      >
                        Add to Calendar
                      </Button>
                    </div>
                  ) : paymentUrl ? (
                    <Button 
                      className="w-full rounded-2xl h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-xl"
                      onClick={() => window.open(paymentUrl, '_blank')}
                    >
                      Complete Payment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={() => handleRsvp('invoice')}
                        disabled={isRsvping}
                        className="w-full rounded-2xl h-14 bg-black dark:bg-white text-white dark:text-black font-bold shadow-xl hover:scale-[1.01] transition-transform active:scale-95"
                      >
                        {isRsvping ? 'Processing...' : event.price === 0 ? 'Register for Event' : 'Pay with M-Pesa or USDC'}
                      </Button>
                      {event.price > 0 && user && (
                        <Button
                          variant="outline"
                          onClick={() => handleRsvp('wallet')}
                          disabled={isRsvping}
                          className="w-full rounded-2xl h-14 font-bold border-black/[0.08] dark:border-white/[0.08]"
                        >
                          {isRsvping ? 'Processing...' : 'Pay with Wallet'}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {!user && (
                    <p className="text-center text-xs text-neutral-400 mt-4 font-medium uppercase tracking-widest">
                      Sign in to confirm your spot
                    </p>
                  )}
                </div>
              </div>

              {/* Subtle Luma-style Notification */}
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-600 font-medium leading-tight">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}