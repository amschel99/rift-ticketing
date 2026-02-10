'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative w-full py-32 md:py-40 flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#090909] px-6">
      {/* Luma-style subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 dark:bg-orange-950/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-100 dark:bg-blue-950/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center space-y-10"
        >
          {/* Subtle Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/[0.02] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Happening Now
            </span>
          </div>

          {/* Typography: The Luma Special (Tight tracking, heavy weight) */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Events <span className="text-neutral-400 dark:text-neutral-500 italic font-serif">refined.</span>
            </h1>
            <p className="max-w-[500px] mx-auto text-lg md:text-xl text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed">
              The professional way to host and discover events in Africa. Clean, simple, and delightful.
            </p>
          </div>

          {/* Action Area */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
            <Button
              onClick={() => router.push('/events/create')}
              className="w-full sm:flex-1 h-14 rounded-2xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-all text-base font-medium shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Event
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/events')}
              className="w-full sm:flex-1 h-14 rounded-2xl border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-all text-base font-medium"
            >
              <Search className="w-5 h-5 mr-2 text-neutral-400" />
              Explore
            </Button>
          </div>

        </motion.div>
      </div>
    </section>
  );
}