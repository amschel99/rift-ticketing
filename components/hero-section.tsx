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
    <section className="relative w-full overflow-hidden bg-white min-h-screen flex items-center pt-20">
      {/* Left Side - Full height solid color with content */}
      <div className="hidden lg:flex absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-[#E9F1F4] to-[#F0F4F7] flex-col items-center justify-center p-8 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <span className="text-xs font-bold tracking-widest text-[#2E8C96] uppercase mb-4 inline-block">
              Next Generation Events
            </span>
            <h1 className="text-6xl lg:text-7xl font-bold text-[#1F2D3A] leading-tight">
              Rift
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-[#4A5568] mb-12 leading-relaxed"
          >
            Experience the future of event discovery and ticketing. Seamless, secure, and unforgettable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-4 flex-col sm:flex-row"
          >
            <Link href="/events" className="flex-1 sm:flex-none">
              <Button
                size="lg"
                className="w-full bg-[#2E8C96] hover:bg-[#2A7A84] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                Browse Events
              </Button>
            </Link>
            <Link href={user ? '/events/create' : '/auth/signup'} className="flex-1 sm:flex-none">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96]/5 font-semibold rounded-lg transition-all"
              >
                {user ? 'Create Event' : 'Explore'}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - 3D Illustration with gradient */}
      <div className="w-full lg:w-1/2 lg:ml-auto h-screen lg:h-auto lg:min-h-screen flex items-center justify-center relative bg-gradient-to-br from-white via-[#F8FAFB] to-[#E9F1F4]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Large 3D sphere/bubble */}
          <motion.div
            animate={{
              rotateX: [0, 20, 0],
              rotateY: [0, 20, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="relative w-64 h-64 lg:w-96 lg:h-96">
              {/* Gradient bubble - 3D effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] rounded-full shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-white/20 rounded-full" />
                <div className="absolute inset-4 bg-gradient-to-t from-transparent to-white/10 rounded-full" />
                
                {/* Center 3D icon */}
                <motion.div
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-8xl lg:text-9xl z-10"
                >
                  🎭
                </motion.div>
              </div>

              {/* Orbiting rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 border-2 border-transparent border-t-[#2E8C96] border-r-[#2E8C96] rounded-full opacity-30" />
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-12"
              >
                <div className="absolute inset-0 border border-dashed border-[#2E8C96]/20 rounded-full" />
              </motion.div>

              {/* Floating accent elements */}
              <motion.div
                animate={{
                  y: [0, -25, 0],
                  x: [0, 15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-12 -right-8 w-16 h-20 bg-gradient-to-br from-[#2E8C96]/30 to-[#2A7A84]/10 rounded-2xl shadow-xl"
              />

              <motion.div
                animate={{
                  y: [0, 25, 0],
                  x: [0, -15, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute -bottom-16 -left-12 w-20 h-16 bg-gradient-to-br from-[#2E8C96]/20 to-transparent rounded-2xl shadow-lg"
              />
            </div>
          </motion.div>

          {/* Mobile CTA - Show on mobile only */}
          <div className="absolute bottom-8 left-0 right-0 lg:hidden px-4 text-center space-y-4">
            <h2 className="text-3xl font-bold text-[#1F2D3A]">Rift Events</h2>
            <p className="text-[#4A5568]">Experience the future of event ticketing</p>
            <div className="flex gap-3 flex-col">
              <Link href="/events" className="w-full">
                <Button size="lg" className="w-full bg-[#2E8C96] hover:bg-[#2A7A84] text-white">
                  Browse Events
                </Button>
              </Link>
              <Link href={user ? '/events/create' : '/auth/signup'} className="w-full">
                <Button size="lg" variant="outline" className="w-full border-2 border-[#2E8C96] text-[#2E8C96]">
                  {user ? 'Create Event' : 'Get Started'}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
