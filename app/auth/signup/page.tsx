'use client';

import React, { useState } from "react"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [externalId, setExternalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!externalId || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!validateEmail(externalId)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup(externalId, password);
      router.push('/events');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] p-6 selection:bg-orange-100 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] space-y-10 z-10"
      >
        {/* Luma-style Auth Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block mb-6">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-2xl transition-transform hover:rotate-6">
              <span className="text-white dark:text-black font-bold text-2xl">H</span>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
            Create Account.
          </h1>
          <p className="text-neutral-500 font-medium italic font-serif text-lg">Join the community.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Email Address</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                disabled={isLoading}
                className="border-0 bg-transparent px-0 h-10 text-lg font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="border-0 bg-transparent px-0 h-10 text-lg font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
              />
            </div>

            <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="border-0 bg-transparent px-0 h-10 text-lg font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-sm font-medium text-neutral-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-black dark:text-white font-bold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>

      {/* Background decorative orbs for consistency with other Auth pages */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50/50 dark:bg-orange-950/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}