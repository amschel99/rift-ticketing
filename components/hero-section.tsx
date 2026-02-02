'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#E9F1F4] via-[#F8F9FA] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-block">
              <span className="text-sm font-semibold text-[#2E8C96] bg-[#adddc0] px-4 py-2 rounded-full">
                🎉 Discover Amazing Events
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2D3A] leading-tight">
              Your Gateway to
              <span className="block text-[#2E8C96]">Unforgettable Experiences</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#4A5568] max-w-xl mx-auto lg:mx-0">
              Find, book, and experience the best events. From tech conferences to concerts, workshops to festivals - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/events">
                <Button size="lg" className="w-full sm:w-auto bg-[#2E8C96] hover:bg-[#2A7A84] text-white shadow-lg hover:shadow-xl transition-all">
                  🎫 Browse Events
                </Button>
              </Link>
              <Link href={user ? '/events/create' : '/auth/signup'}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-[#2E8C96] text-[#2E8C96] hover:bg-[#2E8C96] hover:text-white transition-all">
                  {user ? '✨ Create Event' : '🚀 Get Started'}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto">
              <Image
                src="/event0.jpeg"
                alt="Event illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
