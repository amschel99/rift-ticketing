'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

export function HeroSection() {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="relative w-full overflow-hidden bg-white min-h-screen flex items-stretch">
      {/* Left Side - Bold Typography & Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-start p-8 lg:p-20 bg-white relative z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full"
        >
          {/* Dramatic title with letter spacing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <span className="text-xs font-black tracking-widest text-[#2E8C96] uppercase">
              Experience Events
            </span>
          </motion.div>

          {/* Massive bold heading */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl lg:text-8xl xl:text-9xl font-black leading-none text-[#1F2D3A] mb-8 tracking-tight"
          >
            Discover.
            <br />
            Connect.
            <br />
            <span className="text-[#2E8C96]">Celebrate</span>
          </motion.h1>

          {/* Descriptive subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base lg:text-lg text-[#4A5568] max-w-sm mb-12 leading-relaxed font-light"
          >
            Step into a world of unforgettable experiences. From concerts to conferences, every moment is waiting for you.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex gap-6 flex-col sm:flex-row"
          >
            <Link href="/events">
              <Button
                size="lg"
                className="bg-[#1F2D3A] hover:bg-[#2E8C96] text-white font-bold px-8 py-6 text-base rounded-none transition-all transform hover:scale-105"
              >
                Explore Now
              </Button>
            </Link>
            <Link href={user ? '/events/create' : '/auth/signup'}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#1F2D3A] text-[#1F2D3A] hover:bg-[#1F2D3A] hover:text-white font-bold px-8 py-6 text-base rounded-none transition-all"
              >
                Create Event
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Event Illustration */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#E9F1F4] via-white to-[#F0F4F7] justify-center items-center">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-20 w-48 h-48 bg-[#2E8C96]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-[#2A7A84]/5 rounded-full blur-3xl" />
        </div>

        {/* Main illustration - Concert/Event Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative z-10"
        >
          <div className="relative w-96 h-96">
            {/* Stage platform */}
            <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              {/* Stage base - geometric shapes */}
              <defs>
                <linearGradient id="stageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E8C96" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#2A7A84" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E8C96" stopOpacity="1" />
                  <stop offset="100%" stopColor="#2A7A84" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Main stage platform - trapezoid */}
              <path d="M 80 300 L 120 200 L 280 200 L 320 300 Z" fill="url(#stageGradient)" strokeWidth="2" stroke="#2E8C96"/>

              {/* Stage front */}
              <rect x="80" y="300" width="240" height="60" fill="#2A7A84" opacity="0.6" />

              {/* Center spotlight/podium */}
              <circle cx="200" cy="180" r="35" fill="url(#accentGradient)" />

              {/* Microphone pole */}
              <line x1="200" y1="145" x2="200" y2="85" stroke="#2E8C96" strokeWidth="4" />
              
              {/* Microphone head */}
              <circle cx="200" cy="75" r="12" fill="#2E8C96" />
              <ellipse cx="200" cy="75" rx="16" ry="8" fill="none" stroke="#E9F1F4" strokeWidth="2" />

              {/* Crowd silhouettes - left */}
              <circle cx="130" cy="240" r="8" fill="#2E8C96" opacity="0.6" />
              <circle cx="115" cy="255" r="6" fill="#2A7A84" opacity="0.5" />
              <circle cx="145" cy="250" r="7" fill="#2E8C96" opacity="0.5" />

              {/* Crowd silhouettes - right */}
              <circle cx="270" cy="240" r="8" fill="#2E8C96" opacity="0.6" />
              <circle cx="285" cy="255" r="6" fill="#2A7A84" opacity="0.5" />
              <circle cx="255" cy="250" r="7" fill="#2E8C96" opacity="0.5" />

              {/* Lights above stage */}
              <circle cx="150" cy="100" r="6" fill="#FFD700" opacity="0.8" />
              <line x1="150" y1="106" x2="150" y2="180" stroke="#FFD700" strokeWidth="1" opacity="0.4" />
              
              <circle cx="250" cy="100" r="6" fill="#FFD700" opacity="0.8" />
              <line x1="250" y1="106" x2="250" y2="180" stroke="#FFD700" strokeWidth="1" opacity="0.4" />

              {/* Decorative lines - speakers */}
              <rect x="60" y="180" width="20" height="100" fill="#2E8C96" opacity="0.6" rx="3" />
              <rect x="320" y="180" width="20" height="100" fill="#2E8C96" opacity="0.6" rx="3" />

              {/* Stage glow effect */}
              <circle cx="200" cy="250" r="80" fill="#2E8C96" opacity="0.1" />
            </svg>

            {/* Animated floating elements */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-12 left-20 text-5xl"
            >
              🎵
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
              className="absolute top-16 right-24 text-5xl"
            >
              ✨
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-20 left-32 text-4xl"
            >
              🎪
            </motion.div>
          </div>
        </motion.div>

        {/* Stats overlay */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-12 right-8 text-right z-20"
        >
          <div className="text-5xl font-black text-[#2E8C96] mb-2">50K+</div>
          <p className="text-sm font-light text-[#4A5568]">Events Worldwide</p>
        </motion.div>
      </div>
    </section>
  );
}
