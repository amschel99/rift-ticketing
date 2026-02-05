'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { AnimatedGraphics } from './animated-graphics';

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
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0A0E27] via-[#0F1429] to-[#0A0E27] min-h-screen flex items-center">
      <AnimatedGraphics />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32 relative z-10">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Side - Content */}
          <div className="text-center lg:text-left space-y-6">
            <motion.div variants={itemVariants} className="inline-block">
              <span className="text-sm font-semibold text-[#2E8C96] bg-[#2E8C96]/10 border border-[#2E8C96]/30 px-4 py-2 rounded-full backdrop-blur-sm">
                ✨ Discover Amazing Events
              </span>
            </motion.div>
            
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              Your Gateway to
              <span className="block text-[#2E8C96]">Unforgettable Experiences</span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto lg:mx-0"
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
                  🎫 Browse Events
                </Button>
              </Link>
              <Link href={user ? '/events/create' : '/auth/signup'}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96] hover:text-white transition-all"
                >
                  {user ? '✨ Create Event' : '🚀 Get Started'}
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Side - Animated Illustration */}
          <motion.div
            variants={itemVariants}
            className="relative h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center"
          >
            <motion.div
              className="relative w-full h-full max-w-md mx-auto"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Abstract animated ticket illustration */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Rotating circle */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute inset-12 border-2 border-transparent border-t-[#2E8C96] border-r-[#2E8C96] rounded-full opacity-30" />
                  </motion.div>

                  {/* Inner rotating circle */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="absolute inset-20 border-2 border-transparent border-b-[#2E8C96] border-l-[#2E8C96] rounded-full opacity-20" />
                  </motion.div>

                  {/* Central element */}
                  <motion.div
                    className="absolute inset-1/4 bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] rounded-lg opacity-10 blur-xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.1, 0.15, 0.1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Ticket icon representation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [0.9, 1.1, 0.9],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="text-6xl">🎫</div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
