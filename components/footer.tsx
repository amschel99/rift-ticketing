'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  const links = [
    { label: 'Browse Events', href: '/events' },
    { label: 'Create Event', href: '/events/create' },
    { label: 'My RSVPs', href: '/my-rsvps' },
    { label: 'Wallet', href: '/wallet' },
  ];

  const social = [
    { icon: Twitter, href: '#' },
    { icon: Github, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-gradient-to-br from-[#F8FAFB] to-[#E9F1F4] border-t border-[#E9F1F4] mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#2E8C96] to-[#2A7A84] rounded-lg flex items-center justify-center text-white font-bold group-hover:shadow-lg transition-shadow">
                R
              </div>
              <span className="font-bold text-xl text-[#1F2D3A]">Rift</span>
            </Link>
            <p className="text-[#4A5568] text-sm leading-relaxed">
              Your gateway to extraordinary experiences. Discover, book, and celebrate life's most memorable moments.
            </p>
          </motion.div>

          {/* Platform Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-semibold text-[#1F2D3A] mb-6 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-[#4A5568] hover:text-[#2E8C96] transition-colors text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold text-[#1F2D3A] mb-6 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <a 
                    href="#"
                    className="text-[#4A5568] hover:text-[#2E8C96] transition-colors text-sm font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold text-[#1F2D3A] mb-6 text-sm uppercase tracking-wider">Connect</h3>
            <a
              href="mailto:admin@riftfi.xyz"
              className="flex items-center gap-2 text-[#4A5568] hover:text-[#2E8C96] transition-colors text-sm font-medium mb-6"
            >
              <Mail className="w-4 h-4" />
              admin@riftfi.xyz
            </a>
            <div className="flex gap-3">
              {social.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    className="w-10 h-10 rounded-lg bg-white border border-[#E9F1F4] flex items-center justify-center text-[#4A5568] hover:text-[#2E8C96] hover:border-[#2E8C96] transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-[#E9F1F4] pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#4A5568]">
            <p>&copy; {new Date().getFullYear()} Rift. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#2E8C96] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#2E8C96] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
