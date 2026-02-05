'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`sticky top-0 z-50 w-full border-b transition-all ${
        isScrolled
          ? 'border-[#E3EDF0] bg-[#FFFFFF]/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/70'
          : 'border-transparent bg-gradient-to-b from-[#E9F1F4]/90 via-[#F8F9FA]/70 to-transparent backdrop-blur-sm'
      }`}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#2E8C96]/10 border border-[#adddc0]">
                <Image
                  src="/logo.png"
                  alt="Rift"
                  width={32}
                  height={32}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-md object-contain"
                />
              </div>
              <span className="font-bold text-lg sm:text-xl text-[#1F2D3A] tracking-tight">
                Rift
              </span>
            </Link>

            <div className="hidden gap-6 md:flex">
              <Link
                href="/events"
                className="text-sm font-medium text-[#4A5568] transition-colors hover:text-[#2E8C96]"
              >
                Browse Events
              </Link>
              {user && (
                <Link
                  href="/my-rsvps"
                  className="text-sm font-medium text-[#4A5568] transition-colors hover:text-[#2E8C96]"
                >
                  My RSVPs
                </Link>
              )}
            </div>
          </div>

          <div className="hidden gap-4 md:flex items-center">
            {user ? (
              <>
                <Link href="/events/create">
                  <Button
                    size="sm"
                    className="hidden lg:inline-flex bg-[#2E8C96] hover:bg-[#2A7A84] text-white shadow-sm"
                  >
                    Create Event
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-[#E3EDF0] hover:border-[#2E8C96]"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline max-w-[120px] truncate">
                        {user.name || user.externalId}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wallet">Wallet</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-rsvps">My RSVPs</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/events/create">Create Event</Link>
                    </DropdownMenuItem>
                    {user?.role === 'ORGANIZER' && (
                      <DropdownMenuItem asChild>
                        <Link href="/organizer">Organizer Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                      }}
                      className="text-[#e54d2e]"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-[#1F2D3A] hover:bg-[#E9F1F4]">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-[#2E8C96] hover:bg-[#2A7A84] text-white shadow-sm"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg border border-transparent hover:border-[#E3EDF0] bg-white/60 backdrop-blur"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 pt-4 space-y-4 border-t border-[#E9F1F4]">
            <Link href="/events" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
              Browse Events
            </Link>
            {user && (
              <Link href="/my-rsvps" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                My RSVPs
              </Link>
            )}
            {user ? (
              <>
                <Link href="/profile" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                  Profile
                </Link>
                <Link href="/wallet" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                  Wallet
                </Link>
                <Link href="/events/create" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                  Create Event
                </Link>
                {user.role === 'ORGANIZER' && (
                  <Link href="/organizer" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                    Organizer Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-sm font-medium text-[#e54d2e]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                  Login
                </Link>
                <Link href="/auth/signup" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </motion.nav>
  );
}
