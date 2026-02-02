'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { useState } from 'react';

export function Navigation() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E9F1F4] bg-[#FFFFFF]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Rift" 
                width={32} 
                height={32}
                className="h-6 w-6 sm:h-8 sm:w-8"
              />
              <span className="font-bold text-lg sm:text-xl text-[#1F2D3A]">Rift</span>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.externalId}</span>
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
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-[#2E8C96] hover:bg-[#2A7A84] text-white">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
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
                <Link href="/my-rsvps" className="block text-sm font-medium text-[#4A5568] hover:text-[#2E8C96]">
                  My RSVPs
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
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
