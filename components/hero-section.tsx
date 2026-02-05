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
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#E9F1F4] via-white to-[#F8F9FA] min-h-[600px] flex items-center">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2E8C96] opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#2E8C96] opacity-3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Side - Content */}
          <div className="text-center lg:text-left space-y-6">
            <motion.div variants={itemVariants} className="inline-block">
              <span className="text-sm font-semibold text-[#2E8C96] bg-blue-100/50 border border-[#2E8C96]/30 px-4 py-2 rounded-full">
                Discover Amazing Events
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1F2D3A] leading-tight"
            >
              Your Gateway to
              <span className="block text-[#2E8C96]">Unforgettable Experiences</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-[#4A5568] max-w-xl mx-auto lg:mx-0"
            >
              Find, book, and experience the best events. From tech conferences to concerts, workshops to festivals - all in one place.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Link href="/events">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#2E8C96] hover:bg-[#2A7A84] text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Browse Events
                </Button>
              </Link>
              <Link href={user ? '/events/create' : '/auth/signup'}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96] hover:text-white transition-all"
                >
                  {user ? 'Create Event' : 'Get Started'}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Side - 3D Illustration */}
          <motion.div
            variants={itemVariants}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* 3D rotating ticket box */}
              <motion.div
                className="relative w-48 h-48 sm:w-64 sm:h-64"
                animate={{
                  rotateX: [0, 10, 0],
                  rotateY: [0, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                {/* Main ticket gradient box */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-white opacity-10" />
                  <div className="relative text-6xl sm:text-8xl">🎫</div>
                </div>

                {/* Orbiting dot 1 */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#2E8C96] rounded-full shadow-lg" />
                </motion.div>

                {/* Orbiting dot 2 */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute bottom-1/4 -right-8 w-3 h-3 bg-[#2E8C96]/60 rounded-full shadow-lg" />
                </motion.div>
              </motion.div>

              {/* Floating accent card top-right */}
              <motion.div
                className="absolute -top-12 -right-12 w-20 h-24 bg-gradient-to-br from-[#2E8C96]/20 to-[#2A7A84]/10 rounded-lg"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Floating accent card bottom-left */}
              <motion.div
                className="absolute -bottom-16 -left-12 w-24 h-16 bg-gradient-to-br from-[#2E8C96]/15 to-[#2A7A84]/5 rounded-lg"
                animate={{
                  y: [0, 20, 0],
                  rotate: [0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
