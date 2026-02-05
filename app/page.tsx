'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { HeroSection } from '@/components/hero-section';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Users, Zap, Shield, CheckCircle, Clock, DollarSign, Smartphone, Globe, Lock, ArrowRight, HelpCircle, ChevronDown, Wallet } from 'lucide-react';
import Image from 'next/image';
import { EventCreationIllustration, PaymentIllustration, SharingIllustration, CommunityIllustration } from '@/components/illustrations';
import { HowItWorksOrganizerIllustration, HowItWorksAttendeeIllustration, SecurityIllustration, BenefitsAttendeeIllustration } from '@/components/more-illustrations';

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

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I create an event?',
      answer: 'Click "Create Event" in the navigation, fill in your event details (title, description, date, location, price, capacity), upload an image, and publish. It takes less than 2 minutes!',
      icon: Calendar,
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'Attendees can pay using M-Pesa (for local payments) or USDC (crypto payments). Both methods are supported and processed instantly.',
      icon: DollarSign,
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'All payments go directly to your Rift wallet. You can withdraw funds instantly to your connected wallet—no waiting periods or holds.',
      icon: Wallet,
    },
    {
      question: 'Is there a fee for using Rift?',
      answer: 'Rift is free to use for creating and discovering events. Payment processing fees may apply depending on the payment method chosen by attendees.',
      icon: HelpCircle,
    },
    {
      question: 'Can I share my event on social media?',
      answer: 'Yes! Every event gets a unique shareable link optimized for WhatsApp, Telegram, Twitter/X, Facebook, and LinkedIn. Share directly from the event page.',
      icon: Globe,
    },
    {
      question: 'How do attendees receive their tickets?',
      answer: 'After payment, attendees receive instant email confirmation with their ticket details. They can also request a ticket email to be sent at any time from the event page.',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const Icon = faq.icon;
        const isOpen = openIndex === index;
        return (
          <motion.div
            key={index}
            className="rounded-xl border border-[#E9F1F4] bg-white overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-[#F8F9FA] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2E8C96]/10">
                    <Icon className="h-5 w-5 text-[#2E8C96]" />
                  </div>
                </div>
                <h3 className="font-semibold text-[#1F2D3A] flex-1">{faq.question}</h3>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-[#4A5568] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pl-20">
                  <p className="text-sm text-[#4A5568] leading-relaxed">{faq.answer}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const { user, bearerToken } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sellingRate, setSellingRate] = useState<number | null>(null); // For displaying ticket prices in KES

  useEffect(() => {
    fetchFeaturedEvents();
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
        {/* Hero */}
        <HeroSection />

        {/* Why Rift */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-[#1F2D3A]">Why organizers choose Rift</h2>
              <p className="text-sm sm:text-base text-[#4A5568]">
                A modern ticketing platform that makes event creation and payment collection simple.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-4">
              <motion.div
                className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="h-32 mb-4 flex items-center justify-center">
                  <EventCreationIllustration />
                </div>
                <h3 className="font-semibold mb-2 text-[#1F2D3A]">Set up in minutes</h3>
                <p className="text-sm text-[#4A5568]">
                  Publish events, define capacity and pricing, and start selling tickets—no custom dev required.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="h-32 mb-4 flex items-center justify-center">
                  <SharingIllustration />
                </div>
                <h3 className="font-semibold mb-2 text-[#1F2D3A]">Viral sharing</h3>
                <p className="text-sm text-[#4A5568]">
                  Shareable links, optimized for WhatsApp, Telegram, and X—engineered for word‑of‑mouth growth.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="h-32 mb-4 flex items-center justify-center">
                  <PaymentIllustration />
                </div>
                <h3 className="font-semibold mb-2 text-[#1F2D3A]">Flexible payments</h3>
                <p className="text-sm text-[#4A5568]">
                  Accept M-Pesa and USDC payments. Withdraw directly to your wallet with instant settlement.
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6 hover:-translate-y-1 hover:shadow-lg transition-all"
                whileHover={{ y: -6 }}
              >
                <Search className="h-8 w-8 mb-4 text-[#2E8C96]" />
                <h3 className="font-semibold mb-2 text-[#1F2D3A]">Smart discovery</h3>
                <p className="text-sm text-[#4A5568]">
                  Curated feeds by category, price, and location so the right attendees find your events.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Featured Events Section */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[#1F2D3A]">Featured events</h2>
                <p className="text-sm text-[#4A5568] mt-1">
                  Discover amazing events happening near you. Book tickets in just a few taps.
                </p>
              </div>
              <Link href="/events">
                <Button variant="outline" className="border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96] hover:text-white">
                  View all events
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-200 h-64 bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : events.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event, index) => {
                  const confirmedRsvpsCount = event.rsvps.filter(r => r.status === 'CONFIRMED').length;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                    >
                      <Link href={`/events/${event.id}`}>
                        <div className="group overflow-hidden rounded-2xl border border-[#E9F1F4] bg-white transition-all hover:shadow-xl hover:border-[#2E8C96] h-full flex flex-col">
                          {event.image ? (
                            <div className="relative h-44 w-full overflow-hidden">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[#2E8C96]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#30a46c]" />
                                  {event.category}
                                </div>
                                <div className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white">
                                  {confirmedRsvpsCount} going
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-[#2E8C96] to-[#2A7A84]">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Calendar className="h-12 w-12 text-white/30" />
                              </div>
                              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-[#2E8C96]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#30a46c]" />
                                  {event.category}
                                </div>
                                <div className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white">
                                  {confirmedRsvpsCount} going
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-4 flex flex-col flex-1 space-y-2">
                            <h3 className="font-semibold line-clamp-2 group-hover:text-[#2E8C96] transition-colors text-[#1F2D3A]">
                              {event.title}
                            </h3>
                            <p className="text-xs text-[#4A5568] line-clamp-2 flex-1">
                              {event.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#E9F1F4]">
                              {/* Price is stored in USD, convert to KES for display */}
                              <div className="text-sm font-semibold text-[#2E8C96]">
                                {sellingRate ? (
                                  <>
                                    KES{' '}
                                    {(event.price * sellingRate).toLocaleString('en-KE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                    <span className="text-xs text-gray-500 ml-1">
                                      (≈ {event.price.toFixed(2)} USD)
                                    </span>
                                  </>
                                ) : (
                                  <span>{event.price.toFixed(2)} USD</span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#4A5568]">
                                {confirmedRsvpsCount} attendees
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No events available yet</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* How It Works - Organizers */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-[#1F2D3A]">How it works for organizers</h2>
              <p className="text-sm sm:text-base text-[#4A5568]">
                Get started in three simple steps. Create, share, and get paid—all in one platform.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="h-64 lg:h-80">
                <HowItWorksOrganizerIllustration />
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E8C96]/10">
                      <Calendar className="h-6 w-6 text-[#2E8C96]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2D3A] mb-2">Create your event</h3>
                    <p className="text-sm text-[#4A5568]">
                      Set up your event details, pricing, capacity, and upload images. No technical knowledge required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2A7A84]/10">
                      <Users className="h-6 w-6 text-[#2A7A84]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2D3A] mb-2">Share with your audience</h3>
                    <p className="text-sm text-[#4A5568]">
                      Get a unique shareable link optimized for WhatsApp, Telegram, and social media. Spread the word easily.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#30a46c]/10">
                      <Wallet className="h-6 w-6 text-[#30a46c]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2D3A] mb-2">Collect payments & withdraw</h3>
                    <p className="text-sm text-[#4A5568]">
                      Accept M-Pesa and USDC payments. Withdraw funds directly to your wallet instantly—no waiting periods.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits for Attendees */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#F8F9FA]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-[#1F2D3A]">Why attendees love Rift</h2>
              <p className="text-sm sm:text-base text-[#4A5568]">
                A seamless experience from discovery to attendance. Pay how you want, get instant confirmation.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E8C96]/10">
                      <Search className="h-6 w-6 text-[#2E8C96]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2D3A] mb-2">Easy discovery</h3>
                    <p className="text-sm text-[#4A5568]">
                      Browse events by category, location, and date. Find exactly what you're looking for.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2A7A84]/10">
                      <Smartphone className="h-6 w-6 text-[#2A7A84]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2D3A] mb-2">Pay with M-Pesa or USDC</h3>
                    <p className="text-sm text-[#4A5568]">
                      Choose your preferred payment method. M-Pesa for local convenience, USDC for crypto users.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#30a46c]/10">
                      <CheckCircle className="h-6 w-6 text-[#30a46c]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#1F2D3A] mb-2">Instant confirmation</h3>
                    <p className="text-sm text-[#4A5568]">
                      Get your ticket confirmation immediately. Receive email tickets and manage your RSVPs in one place.
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-64 lg:h-80">
                <BenefitsAttendeeIllustration />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security & Trust */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-[#1F2D3A]">Secure & reliable</h2>
              <p className="text-sm sm:text-base text-[#4A5568]">
                Your events and payments are protected with industry-leading security.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="h-64 lg:h-80">
                <SecurityIllustration />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E8C96]/10 mb-4">
                    <Shield className="h-6 w-6 text-[#2E8C96]" />
                  </div>
                  <h3 className="font-semibold text-[#1F2D3A] mb-2">Secure payments</h3>
                  <p className="text-sm text-[#4A5568]">
                    All transactions are encrypted and processed securely through trusted payment providers.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2A7A84]/10 mb-4">
                    <Lock className="h-6 w-6 text-[#2A7A84]" />
                  </div>
                  <h3 className="font-semibold text-[#1F2D3A] mb-2">Data protection</h3>
                  <p className="text-sm text-[#4A5568]">
                    Your personal information and event data are protected with industry-standard security measures.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#30a46c]/10 mb-4">
                    <Clock className="h-6 w-6 text-[#30a46c]" />
                  </div>
                  <h3 className="font-semibold text-[#1F2D3A] mb-2">Instant settlement</h3>
                  <p className="text-sm text-[#4A5568]">
                    Get paid immediately. No waiting periods or holds—withdraw to your wallet as soon as payments come in.
                  </p>
                </div>
                <div className="rounded-xl border border-[#E9F1F4] bg-[#F8F9FA] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E8C96]/10 mb-4">
                    <Globe className="h-6 w-6 text-[#2E8C96]" />
                  </div>
                  <h3 className="font-semibold text-[#1F2D3A] mb-2">Global reach</h3>
                  <p className="text-sm text-[#4A5568]">
                    Accept payments from anywhere. M-Pesa for local markets, USDC for international attendees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#F8F9FA]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-[#1F2D3A]">Frequently asked questions</h2>
              <p className="text-sm sm:text-base text-[#4A5568]">
                Everything you need to know about using Rift for your events.
              </p>
            </div>
            <FAQSection />
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="relative px-4 py-20 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[#2E8C96] via-[#2A7A84] to-[#2E8C96]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Illustration */}
            <div className="relative h-[300px] sm:h-[350px] lg:h-[400px] order-2 lg:order-1 flex items-center justify-center">
              <div className="relative w-full h-full max-w-md">
                <CommunityIllustration />
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
        </motion.section>
        <Footer />
    </main>
    </>
  );
}
