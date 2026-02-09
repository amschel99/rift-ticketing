'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full border-b border-[#2E2E2E] bg-[#0F0F0F]/95 backdrop-blur-md transition-all"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Rift Ticketing"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-bold text-lg text-white tracking-tight">
                Rift
              </span>
            </Link>

            <div className="hidden gap-8 md:flex">
              <Link
                href="/events"
                className="text-sm font-medium text-[#B4B4B4] hover:text-white transition-colors"
              >
                Events
              </Link>
              {user && (
                <Link
                  href="/my-rsvps"
                  className="text-sm font-medium text-[#B4B4B4] hover:text-white transition-colors"
                >
                  My Tickets
                </Link>
              )}
              {user?.role === 'ORGANIZER' && (
                <Link
                  href="/organizer"
                  className="text-sm font-medium text-[#B4B4B4] hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="hidden gap-3 md:flex items-center">
            {user ? (
              <>
                <Link href="/events/create">
                  <Button
                    size="sm"
                    className="bg-[#FF6B35] hover:bg-[#E85A24] text-white border-0 shadow-lg"
                  >
                    Create Event
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-[#2E2E2E] bg-[#1A1A1A] hover:bg-[#242424] text-white"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline max-w-[100px] truncate text-xs">
                        {user.name || user.externalId}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-[#2E2E2E]">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="text-white hover:bg-[#2E2E2E]">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wallet" className="text-white hover:bg-[#2E2E2E]">Wallet</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2E2E2E]" />
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                      }}
                      className="text-[#FF6B35] hover:bg-[#2E2E2E]"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#B4B4B4] hover:text-white hover:bg-[#1A1A1A]"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-[#FF6B35] hover:bg-[#E85A24] text-white border-0"
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
            className="md:hidden p-2 rounded-lg border border-[#2E2E2E] bg-[#1A1A1A] hover:bg-[#242424] text-white"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 pt-4 space-y-4 border-t border-[#2E2E2E] bg-[#0F0F0F]">
            <Link 
              href="/events" 
              className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
            >
              Events
            </Link>
            {user && (
              <Link 
                href="/my-rsvps" 
                className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
              >
                My Tickets
              </Link>
            )}
            {user?.role === 'ORGANIZER' && (
              <Link 
                href="/organizer" 
                className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
                >
                  Profile
                </Link>
                <Link 
                  href="/wallet" 
                  className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
                >
                  Wallet
                </Link>
                <Link 
                  href="/events/create" 
                  className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
                >
                  Create Event
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left text-sm font-medium text-[#FF6B35] hover:text-[#F7931E]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="block text-sm font-medium text-[#B4B4B4] hover:text-white"
                >
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
