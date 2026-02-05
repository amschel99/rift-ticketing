'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Twitter, Instagram, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#020617] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr,1.2fr,1.2fr] gap-10">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#2E8C96]/10 border border-[#2E8C96]/40">
                <Image
                  src="/logo.png"
                  alt="Rift"
                  width={32}
                  height={32}
                  className="h-6 w-6 rounded-md object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">Rift</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-md">
              On‑chain ticketing for the next generation of events. Sell out faster, eliminate fraud, and give your
              community an experience they actually want to brag about.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-[0.18em] text-slate-400">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-slate-300 hover:text-white transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events/create" className="text-slate-300 hover:text-white transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/my-rsvps" className="text-slate-300 hover:text-white transition-colors">
                  My RSVPs
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-slate-300 hover:text-white transition-colors">
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-[0.18em] text-slate-400">
              Stay in touch
            </h3>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:admin@riftfi.xyz"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                admin@riftfi.xyz
              </a>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/60 bg-slate-900/50 hover:border-[#2E8C96] hover:bg-[#2E8C96]/20 transition-colors"
                >
                  <Twitter className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/60 bg-slate-900/50 hover:border-[#2E8C96] hover:bg-[#2E8C96]/20 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/60 bg-slate-900/50 hover:border-[#2E8C96] hover:bg-[#2E8C96]/20 transition-colors"
                >
                  <Github className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Rift. All rights reserved.</p>
          <p className="text-slate-500">
            Built on{' '}
            <span className="font-medium text-slate-300">
              on‑chain payments • smart RSVPs • instant settlement
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
