'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1F2D3A] text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image 
                src="/logo.png" 
                alt="Rift" 
                width={32} 
                height={32}
                className="h-8 w-8"
              />
              <span className="font-bold text-xl">Rift</span>
            </Link>
            <p className="text-[#4A5568] text-sm">
              Your gateway to amazing events. Book tickets, discover experiences, and create memories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-[#4A5568] hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="text-[#4A5568] hover:text-white transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/my-rsvps" className="text-[#4A5568] hover:text-white transition-colors">
                  My RSVPs
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-[#4A5568] hover:text-white transition-colors">
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <a
              href="mailto:admin@riftfi.xyz"
              className="flex items-center gap-2 text-[#4A5568] hover:text-white transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              admin@riftfi.xyz
            </a>
          </div>
        </div>

        <div className="border-t border-[#4A5568] mt-8 pt-8 text-center text-sm text-[#4A5568]">
          <p>&copy; {new Date().getFullYear()} Rift. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
