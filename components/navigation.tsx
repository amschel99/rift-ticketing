'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, Plus, User, Wallet, Calendar, LayoutDashboard, LogOut } from 'lucide-react';

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 z-[100] w-full flex justify-center pt-4 px-4 pointer-events-none">
      <motion.div
        className={`
          pointer-events-auto
          flex h-14 items-center justify-between w-full max-w-7xl
          px-4 rounded-2xl transition-all duration-300
          ${scrolled 
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.04)]' 
            : 'bg-transparent border border-transparent'
          }
        `}
      >
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
              <span className="text-white dark:text-black font-bold text-lg">H</span>
            </div>
            <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-white">
              Hafla
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/events" active={pathname === '/events'}>Explore</NavLink>
            {user && <NavLink href="/my-rsvps" active={pathname === '/my-rsvps'}>My Events</NavLink>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/events/create" className="hidden sm:block">
                <Button
                  size="sm"
                  className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-4 h-9 text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                  Create
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-black/[0.05] dark:border-white/[0.05] overflow-hidden focus:outline-none transition-transform active:scale-95">
                    <User className="w-4 h-4 text-neutral-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl mt-2 border-black/[0.08] dark:border-white/[0.08] shadow-2xl">
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Account</div>
                  
                  <Link href="/profile">
                    <DropdownMenuItem className="rounded-xl focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer py-2">
                      <User className="w-4 h-4 mr-2" /> Profile
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/wallet">
                    <DropdownMenuItem className="rounded-xl focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer py-2">
                      <Wallet className="w-4 h-4 mr-2" /> Wallet
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/my-rsvps">
                    <DropdownMenuItem className="rounded-xl focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer py-2">
                      <Calendar className="w-4 h-4 mr-2" /> My RSVPs
                    </DropdownMenuItem>
                  </Link>
                  
                  {user?.role === 'ORGANIZER' && (
                    <>
                      <DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />
                      <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Management</div>
                      <Link href="/organizer">
                        <DropdownMenuItem className="rounded-xl focus:bg-neutral-100 dark:focus:bg-neutral-800 cursor-pointer py-2">
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                        </DropdownMenuItem>
                      </Link>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="rounded-xl focus:bg-red-50 dark:focus:bg-red-950/30 text-red-500 focus:text-red-600 cursor-pointer py-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="rounded-full text-neutral-600 dark:text-neutral-400 font-medium px-4">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="rounded-full bg-black dark:bg-white text-white dark:text-black font-medium px-5 h-9 shadow-lg shadow-black/5">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-400"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-4 top-20 z-50 p-4 bg-white dark:bg-[#111] border border-black/[0.08] dark:border-white/[0.08] rounded-3xl shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              <Link href="/events" onClick={() => setIsOpen(false)} className="p-3 text-lg font-medium border-b border-neutral-50 dark:border-neutral-800">Explore</Link>
              {user && <Link href="/my-rsvps" onClick={() => setIsOpen(false)} className="p-3 text-lg font-medium border-b border-neutral-50 dark:border-neutral-800">My Events</Link>}
              <Link href="/auth/login" onClick={() => setIsOpen(false)} className="p-3 text-lg font-medium">Log in</Link>
              <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-2xl h-12 bg-black dark:bg-white mt-2">Sign up</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        px-4 py-2 text-sm font-medium rounded-full transition-colors
        ${active 
          ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-white/10' 
          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-white/5'
        }
      `}
    >
      {children}
    </Link>
  );
}