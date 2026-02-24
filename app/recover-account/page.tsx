'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type Step = 'validating' | 'identifier' | 'otp' | 'success' | 'error';

function RecoverAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [step, setStep] = useState<Step>('validating');
  const [newIdentifier, setNewIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      setTokenError('No recovery token provided');
      setStep('error');
      return;
    }

    const validate = async () => {
      try {
        const res = await fetch(`/api/recovery/validate-token/${encodeURIComponent(token)}`);
        const data = await res.json();

        if (data.valid && data.type === 'ACCOUNT_RECOVERY') {
          setStep('identifier');
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newIdentifier) {
      setError(identifierType === 'email' ? 'Please enter your new email' : 'Please enter your new phone number');
      return;
    }

    setIsLoading(true);
    try {
      const payload = identifierType === 'email'
        ? { email: newIdentifier }
        : { phone: newIdentifier };

      const res = await fetch('/api/recovery/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to send verification code');
        return;
      }

      setStep('otp');
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/recovery/recover-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newIdentifier, identifierType, otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Recovery failed');
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
            Recover account.
          </h1>
          <p className="text-neutral-500 font-medium italic font-serif text-lg">
            Update your login credentials.
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
              href="/auth/recover-account"
              className="inline-block text-sm font-bold text-black dark:text-white hover:underline"
            >
              Request a new link
            </Link>
          </motion.div>
        )}

        {step === 'identifier' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSendOtp}
            className="space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <p className="text-sm text-neutral-500 font-medium text-center">
              Enter your new email or phone number. We&apos;ll send a verification code to confirm it.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIdentifierType('email')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  identifierType === 'email'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setIdentifierType('phone')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all ${
                  identifierType === 'phone'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                }`}
              >
                Phone
              </button>
            </div>

            <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                {identifierType === 'email' ? 'New Email Address' : 'New Phone Number'}
              </label>
              <Input
                type={identifierType === 'email' ? 'email' : 'tel'}
                placeholder={identifierType === 'email' ? 'new@example.com' : '+254700000000'}
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                disabled={isLoading}
                className="border-0 bg-transparent px-0 h-10 text-lg font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              {isLoading ? 'Sending code...' : 'Send Verification Code'}
            </Button>
          </motion.form>
        )}

        {step === 'otp' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleRecover}
            className="space-y-6"
          >
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            <p className="text-sm text-neutral-500 font-medium text-center">
              Enter the verification code sent to <span className="font-semibold text-neutral-900 dark:text-white">{newIdentifier}</span>
            </p>

            <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Verification Code</label>
              <Input
                ref={otpRef}
                type="text"
                placeholder={identifierType === 'phone' ? '123456' : 'K7NP'}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                disabled={isLoading}
                className="border-0 bg-transparent px-0 h-10 text-lg font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none tracking-widest text-center"
                autoComplete="one-time-code"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
            >
              {isLoading ? 'Recovering...' : 'Recover Account'}
            </Button>

            <button
              type="button"
              onClick={async () => {
                const payload = identifierType === 'email' ? { email: newIdentifier } : { phone: newIdentifier };
                await fetch('/api/recovery/send-otp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
              }}
              className="block mx-auto text-sm font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Resend code
            </button>
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
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">Account recovered!</h2>
              <p className="text-sm text-neutral-500 font-medium">
                You can now log in with your new {identifierType}. Redirecting...
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

export default function RecoverAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]">
          <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
        </div>
      }
    >
      <RecoverAccountContent />
    </Suspense>
  );
}
