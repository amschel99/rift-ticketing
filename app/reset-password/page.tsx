'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type Step = 'validating' | 'form' | 'success' | 'error';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<Step>('validating');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError('No reset token provided');
      setStep('error');
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`/api/recovery/validate-token/${encodeURIComponent(token)}`);
        const data = await res.json();

        if (data.valid && data.type === 'PASSWORD_RESET') {
          setStep('form');
        } else {
          setTokenError(data.message || 'This link is invalid or has expired');
          setStep('error');
        }
      } catch {
        setTokenError('Failed to validate token');
        setStep('error');
      }
    };

    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/recovery/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to reset password');
        return;
      }

      setStep('success');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505] p-6 selection:bg-orange-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] space-y-10"
      >
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block mb-6">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-2xl transition-transform hover:rotate-6">
              <span className="text-white dark:text-black font-bold text-2xl">H</span>
            </div>
          </Link>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
            New password.
          </h1>
          <p className="text-neutral-500 font-medium italic font-serif text-lg">
            Choose a strong password.
          </p>
        </div>

        {step === 'validating' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
            <p className="text-sm text-neutral-500 font-medium">Validating your link...</p>
          </div>
        )}

        {step === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">Link expired</h2>
              <p className="text-sm text-neutral-500 font-medium">{tokenError}</p>
            </div>
            <Link
              href="/auth/forgot-password"
              className="inline-block text-sm font-bold text-black dark:text-white hover:underline"
            >
              Request a new link
            </Link>
          </motion.div>
        )}

        {step === 'form' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <p className="text-xs text-neutral-400 font-medium">Minimum 8 characters</p>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </motion.form>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">Password reset!</h2>
              <p className="text-sm text-neutral-500 font-medium">
                Redirecting you to login...
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50/50 dark:bg-orange-950/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
          <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
