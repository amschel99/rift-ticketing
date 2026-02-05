'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  price: number;
  image?: string;
  attendees: number;
}

interface EventShowcaseProps {
  events: Event[];
  isLoading: boolean;
  sellingRate?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export function EventShowcase({ events, isLoading, sellingRate }: EventShowcaseProps) {
  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#2E8C96]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#2E8C96]/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-bold tracking-widest text-[#2E8C96] uppercase">Featured</span>
          <h2 className="text-4xl lg:text-5xl font-bold text-[#1F2D3A] mt-3 mb-6">
            Discover Premium Events
          </h2>
          <p className="text-lg text-[#4A5568] max-w-2xl mx-auto">
            Handpicked experiences that inspire, entertain, and connect communities together.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : events.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <Link href={`/events/${event.id}`}>
                  <div className="group relative h-96 rounded-2xl overflow-hidden bg-white border border-[#E9F1F4] transition-all duration-300 hover:shadow-2xl hover:border-[#2E8C96] cursor-pointer flex flex-col">
                    {/* Image area */}
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#2E8C96]/20 to-[#2A7A84]/10">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl opacity-50">🎪</div>
                        </div>
                      )}
                      {/* Category badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-xs font-bold text-[#2E8C96] rounded-full">
                          {event.category}
                        </span>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-[#1F2D3A] mb-2 group-hover:text-[#2E8C96] transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-[#4A5568] line-clamp-2 mb-4">
                          {event.description}
                        </p>
                      </div>

                      {/* Event meta */}
                      <div className="space-y-2 text-sm text-[#4A5568] mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#2E8C96]" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#2E8C96]" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#2E8C96]" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#E9F1F4]">
                        <span className="font-bold text-lg text-[#2E8C96]">
                          KES {(event.price * (sellingRate || 100)).toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          className="bg-[#2E8C96] hover:bg-[#2A7A84] text-white rounded-lg"
                        >
                          Get Ticket
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <p className="text-lg text-[#4A5568]">No events available yet</p>
            <Link href="/events/create">
              <Button className="mt-4 bg-[#2E8C96] hover:bg-[#2A7A84] text-white">
                Be the first to create one
              </Button>
            </Link>
          </motion.div>
        )}

        {/* View all CTA */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mt-16"
          >
            <Link href="/events">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96]/5"
              >
                View All Events
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
