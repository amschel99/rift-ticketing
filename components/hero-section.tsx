'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Calendar, Zap, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative w-full overflow-hidden min-h-[85vh] flex items-center bg-gradient-to-br from-[#E9F1F4] via-[#F8F9FA] to-white">
      {/* Animated gradient orbs */}
      <motion.div
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#2E8C96]/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#2A7A84]/20 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Content */}
          <motion.div
            className="text-center lg:text-left space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-[#adddc0]/50 bg-white/60 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-[#2E8C96] shadow-lg"
              variants={itemVariants}
            >
              <Calendar className="w-4 h-4" />
              <span>Create and discover amazing events</span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#1F2D3A] leading-tight tracking-tight"
              variants={itemVariants}
            >
              The easiest way to
              <span className="block bg-gradient-to-r from-[#2E8C96] via-[#2A7A84] to-[#30a46c] bg-clip-text text-transparent mt-2">
                host and attend events
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-[#4A5568] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light"
              variants={itemVariants}
            >
              Create events, collect payments, and withdraw directly to your wallet. Attendees pay with
              <span className="font-semibold text-[#2E8C96]"> M-Pesa</span> or
              <span className="font-semibold text-[#2A7A84]"> USDC</span>—simple, fast, and secure.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
              variants={itemVariants}
            >
              <Link href="/events">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#2E8C96] hover:bg-[#2A7A84] text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-base font-semibold group"
                >
                  <Calendar className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Browse Events
                </Button>
              </Link>
              <Link href={user ? '/events/create' : '/auth/signup'}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96] hover:text-white transition-all bg-white/80 backdrop-blur-md shadow-lg px-8 py-6 text-base font-semibold"
                >
                  {user ? 'Create Event' : 'Get Started'}
                </Button>
              </Link>
            </motion.div>

            {/* Payment methods highlight */}
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3 max-w-2xl mx-auto lg:mx-0"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2 shadow-md border border-[#E9F1F4]/50">
                <Zap className="w-4 h-4 text-[#2E8C96]" />
                <span className="text-sm font-medium text-[#1F2D3A]">M-Pesa & USDC payments</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-md px-4 py-2 shadow-md border border-[#E9F1F4]/50">
                <Wallet className="w-4 h-4 text-[#30a46c]" />
                <span className="text-sm font-medium text-[#1F2D3A]">Direct wallet withdrawal</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - External Illustration */}
          <motion.div
            className="relative h-[500px] sm:h-[600px] lg:h-[700px] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          >
            <div className="relative w-full h-full max-w-2xl flex items-center justify-center">
              {/* Event Illustration SVG */}
              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <svg
                  viewBox="0 0 800 600"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Stage/Platform */}
                  <rect x="100" y="400" width="600" height="30" rx="15" fill="#2A7A84" opacity="0.3" />
                  
                  {/* Microphone */}
                  <g transform="translate(350, 350)">
                    <rect x="0" y="0" width="8" height="60" rx="4" fill="#2E8C96" />
                    <circle cx="4" cy="0" r="20" fill="#1F2D3A" />
                    <circle cx="4" cy="0" r="12" fill="#4A5568" />
                  </g>
                  
                  {/* People/Attendees */}
                  <g transform="translate(200, 380)">
                    <circle cx="0" cy="0" r="25" fill="#2E8C96" opacity="0.6" />
                    <rect x="-15" y="25" width="30" height="50" rx="15" fill="#2E8C96" opacity="0.6" />
                  </g>
                  
                  <g transform="translate(600, 380)">
                    <circle cx="0" cy="0" r="25" fill="#2A7A84" opacity="0.6" />
                    <rect x="-15" y="25" width="30" height="50" rx="15" fill="#2A7A84" opacity="0.6" />
                  </g>
                  
                  <g transform="translate(400, 380)">
                    <circle cx="0" cy="0" r="25" fill="#30a46c" opacity="0.6" />
                    <rect x="-15" y="25" width="30" height="50" rx="15" fill="#30a46c" opacity="0.6" />
                  </g>
                  
                  {/* Sound waves */}
                  <g transform="translate(354, 350)">
                    <path
                      d="M 0,0 Q 30,-20 60,0 T 120,0"
                      stroke="#2E8C96"
                      strokeWidth="3"
                      fill="none"
                      opacity="0.4"
                    />
                    <path
                      d="M 0,0 Q 50,-30 100,0 T 200,0"
                      stroke="#2E8C96"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.3"
                    />
                  </g>
                  
                  {/* Event banner/text */}
                  <rect x="250" y="100" width="300" height="80" rx="10" fill="#2E8C96" opacity="0.1" />
                  <text
                    x="400"
                    y="140"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#2E8C96"
                  >
                    Live Event
                  </text>
                  <text
                    x="400"
                    y="165"
                    textAnchor="middle"
                    fontSize="16"
                    fill="#4A5568"
                  >
                    Join the experience
                  </text>
                  
                  {/* Decorative elements */}
                  <circle cx="150" cy="150" r="8" fill="#2E8C96" opacity="0.3" />
                  <circle cx="650" cy="200" r="12" fill="#2A7A84" opacity="0.3" />
                  <circle cx="700" cy="300" r="6" fill="#30a46c" opacity="0.3" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
