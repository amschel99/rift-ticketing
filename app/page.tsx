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
      question: 'How do I create and publish an event?',
      answer: 'Navigate to "Create Event" from the main menu, complete the event information form including title, description, date, venue, pricing, and capacity. Upload a high-quality image and publish. Your event will be live within seconds.',
      icon: Calendar,
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support M-Pesa for local mobile money transactions and USDC for cryptocurrency payments. Both payment methods are processed securely and provide instant confirmation.',
      icon: DollarSign,
    },
    {
      question: 'How do I access my event revenue?',
      answer: 'All ticket sales are automatically deposited into your Rift wallet. You can withdraw funds at any time to your connected wallet address with no waiting periods or minimum thresholds.',
      icon: Wallet,
    },
    {
      question: 'What are the platform fees?',
      answer: 'Event creation and discovery are completely free. Standard payment processing fees apply based on the payment method selected by attendees, with transparent pricing displayed at checkout.',
      icon: HelpCircle,
    },
    {
      question: 'How can I promote my event?',
      answer: 'Each event includes a unique, shareable link optimized for all major social platforms including WhatsApp, Telegram, Twitter/X, Facebook, and LinkedIn. Share directly from your event management dashboard.',
      icon: Globe,
    },
    {
      question: 'How are tickets delivered to attendees?',
      answer: 'Attendees receive an automated email confirmation immediately after successful payment, containing their ticket details and event information. Tickets can be re-sent on-demand from the event page.',
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
            className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-6 flex items-center justify-between gap-4 text-left hover:bg-[#242424] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35]/10">
                    <Icon className="h-5 w-5 text-[#FF6B35]" />
                  </div>
                </div>
                <h3 className="font-semibold text-white flex-1">{faq.question}</h3>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-[#B4B4B4] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
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
                  <p className="text-sm text-[#B4B4B4] leading-relaxed">{faq.answer}</p>
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
    <div className="relative min-h-screen">
      <Navigation />
      {/* Hero - extends behind navbar */}
      <div className="absolute inset-0 z-0">
        <HeroSection />
      </div>
      <main className="relative z-10 flex flex-col pt-[90vh]">

        {/* Why Hafla */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#0F0F0F]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-white">Why choose Rift</h2>
              <p className="text-sm sm:text-base text-[#B4B4B4]">
                A comprehensive platform designed to connect you with events that enrich your life and expand your community.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div
                className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src="/africa0.jpeg"
                    alt="Discover events"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-white">Curated event discovery</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    Explore a diverse range of events filtered by category, location, and date. Find experiences tailored to your interests.
                  </p>
                </div>
              </motion.div>
              <motion.div
                className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src="/africa4.jpeg"
                    alt="Instant booking"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-white">Seamless booking experience</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    Reserve your spot in seconds. Receive immediate confirmation and digital tickets via email.
                  </p>
                </div>
              </motion.div>
              <motion.div
                className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all"
                whileHover={{ y: -6 }}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src="/africaimage1.jpeg"
                    alt="Secure payments"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold mb-2 text-white">Enterprise-grade security</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    Your data is protected with industry-leading security measures. Your information remains secure and private at all times.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Featured Events Section */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#0F0F0F]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Featured events</h2>
                <p className="text-sm text-[#B4B4B4] mt-1">
                  Handpicked events from our community. Reserve your spot with a single tap.
                </p>
              </div>
              <Link href="/events">
                <Button variant="outline" className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white bg-transparent">
                  View all events
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#2E2E2E] h-64 bg-[#1A1A1A] animate-pulse"
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
                        <div className="group overflow-hidden rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] transition-all hover:shadow-2xl hover:border-[#FF6B35] h-full flex flex-col">
                          {event.image ? (
                            <div className="relative h-44 w-full overflow-hidden">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#FF6B35]/90 px-3 py-1 text-[11px] font-medium text-white">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7931E]" />
                                  {event.category}
                                </div>
                                <div className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white">
                                  {confirmedRsvpsCount} going
                                </div>
                              </div>
                            </div>
                          ) : (
                              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Calendar className="h-12 w-12 text-white/30" />
                              </div>
                              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#FF6B35]/90 px-3 py-1 text-[11px] font-medium text-white">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#F7931E]" />
                                  {event.category}
                                </div>
                                <div className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white">
                                  {confirmedRsvpsCount} going
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-4 flex flex-col flex-1 space-y-2">
                            <h3 className="font-semibold line-clamp-2 group-hover:text-[#FF6B35] transition-colors text-white">
                              {event.title}
                            </h3>
                            <p className="text-xs text-[#B4B4B4] line-clamp-2 flex-1">
                              {event.description}
                            </p>
                            <div className="mt-3 flex items-center justify-between pt-3 border-t border-[#2E2E2E]">
                              {/* Price is stored in USD, convert to KES for display */}
                              <div className="text-sm font-semibold text-[#FF6B35]">
                                {sellingRate ? (
                                  <>
                                    KES{' '}
                                    {(event.price * sellingRate).toLocaleString('en-KE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                    <span className="text-xs text-[#3A3A3A] ml-1">
                                      (≈ {event.price.toFixed(2)} USD)
                                    </span>
                                  </>
                                ) : (
                                  <span>{event.price.toFixed(2)} USD</span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#B4B4B4]">
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
                <p className="text-[#B4B4B4]">No events available yet</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#0F0F0F]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-white">How it works</h2>
              <p className="text-sm sm:text-base text-[#B4B4B4]">
                Find and book events in three simple steps. Browse, book, and attend—it's that easy.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden">
                <Image
                  src="/africa0.jpeg"
                  alt="Browse events"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                      <Search className="h-6 w-6 text-[#FF6B35]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Browse events</h3>
                    <p className="text-sm text-[#B4B4B4]">
                      Explore events by category, location, and date. Find exactly what you're looking for.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7931E]/10">
                      <Calendar className="h-6 w-6 text-[#F7931E]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Book your ticket</h3>
                    <p className="text-sm text-[#B4B4B4]">
                      Pay with M-Pesa or USDC. Get instant confirmation and email tickets delivered to your inbox.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                      <CheckCircle className="h-6 w-6 text-[#FF6B35]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Attend & enjoy</h3>
                    <p className="text-sm text-[#B4B4B4]">
                      Show up and have an amazing time. Your ticket is stored securely and accessible anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits for Attendees */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#0F0F0F]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-white">Why attendees love Rift</h2>
              <p className="text-sm sm:text-base text-[#B4B4B4]">
                A seamless experience from discovery to attendance. Pay how you want, get instant confirmation.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                      <Search className="h-6 w-6 text-[#FF6B35]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Easy discovery</h3>
                    <p className="text-sm text-[#B4B4B4]">
                      Browse events by category, location, and date. Find exactly what you're looking for.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7931E]/10">
                      <Smartphone className="h-6 w-6 text-[#F7931E]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Pay with M-Pesa or USDC</h3>
                    <p className="text-sm text-[#B4B4B4]">
                      Choose your preferred payment method. M-Pesa for local convenience, USDC for crypto users.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                      <CheckCircle className="h-6 w-6 text-[#FF6B35]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Instant confirmation</h3>
                    <p className="text-sm text-[#B4B4B4]">
                      Get your ticket confirmation immediately. Receive email tickets and manage your RSVPs in one place.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden">
                <Image
                  src="/africa4.jpeg"
                  alt="Event experience"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Security & Trust */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#0F0F0F]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-white">Secure & reliable</h2>
              <p className="text-sm sm:text-base text-[#B4B4B4]">
                Your events and payments are protected with industry-leading security.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden">
                <Image
                  src="/africaimage1.jpeg"
                  alt="Secure platform"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF6B35]/10 mb-4">
                    <Shield className="h-6 w-6 text-[#FF6B35]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Secure payments</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    All transactions are encrypted and processed securely through trusted payment providers.
                  </p>
                </div>
                <div className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F7931E]/10 mb-4">
                    <Lock className="h-6 w-6 text-[#F7931E]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Data protection</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    Your personal information and event data are protected with industry-standard security measures.
                  </p>
                </div>
                <div className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FF6B35]/10 mb-4">
                    <Clock className="h-6 w-6 text-[#FF6B35]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Instant settlement</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    Get paid immediately. No waiting periods or holds—withdraw to your wallet as soon as payments come in.
                  </p>
                </div>
                <div className="rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F7931E]/10 mb-4">
                    <Globe className="h-6 w-6 text-[#F7931E]" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Global reach</h3>
                  <p className="text-sm text-[#B4B4B4]">
                    Accept payments from anywhere. M-Pesa for local markets, USDC for international attendees.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="px-4 py-20 sm:px-6 lg:px-8 bg-[#0F0F0F]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl font-bold text-white">Frequently asked questions</h2>
              <p className="text-sm sm:text-base text-[#B4B4B4]">
                Everything you need to know about using Rift for your events.
              </p>
            </div>
            <FAQSection />
          </div>
        </motion.section>

        <Footer />
      </main>
    </div>
  );
}
