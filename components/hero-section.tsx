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

      {/* Right Side - Dramatic visual with gradient background */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Background with dramatic gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E8C96]/20 via-[#E9F1F4] to-[#2A7A84]/10" />

        {/* Large decorative circle */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2"
        >
          <div className="w-96 h-96 rounded-full bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] opacity-90 blur-3xl" />
        </motion.div>

        {/* Center showcase element */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            {/* Bold graphic representation */}
            <div className="relative w-64 h-64 lg:w-80 lg:h-80">
              {/* Animated glow circle */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2E8C96" />
                      <stop offset="100%" stopColor="#2A7A84" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Center text/icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-center"
                >
                  <div className="text-8xl mb-4">🎪</div>
                  <p className="text-lg font-bold text-[#2E8C96]">Live Events</p>
                </motion.div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-8 -right-8"
              >
                <div className="w-20 h-20 bg-[#2E8C96]/30 rounded-full blur-xl" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-8 -left-8"
              >
                <div className="w-24 h-24 bg-[#2A7A84]/20 rounded-full blur-xl" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom accent text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-12 right-12 text-right"
        >
          <p className="text-sm font-light text-[#4A5568] mb-2">The Future of Events</p>
          <p className="text-3xl font-black text-[#2E8C96]">Rift</p>
        </motion.div>
      </div>
    </section>
  );
}
