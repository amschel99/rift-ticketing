'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

type Step = 'identifier' | 'method' | 'sent';

export default function RecoverAccountEntryPage() {
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryOptions, setRecoveryOptions] = useState<{ email: string | null; phone: string | null }>({ email: null, phone: null });
  const [selectedMethod, setSelectedMethod] = useState<'emailRecovery' | 'phoneRecovery' | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      setError('Please enter your email or phone');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/recovery/options-by-identifier?identifier=${encodeURIComponent(identifier)}&identifierType=${identifierType}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Could not find recovery options');
        return;
      }

      const options = data.recoveryOptions;
      if (!options?.email && !options?.phone) {
        setError('No recovery options found for this account. Contact support for help.');
        return;
      }

      setRecoveryOptions(options);
      setStep('method');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRecovery = async () => {
    if (!selectedMethod) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/recovery/request-account-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, identifierType, method: selectedMethod }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || 'Failed to send recovery link');
        return;
      }

      setStep('sent');
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
            Lost access? We&apos;ll help you recover.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'identifier' && (
            <motion.form
              key="identifier"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLookup}
              className="space-y-6"
            >
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

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
                  {identifierType === 'email' ? 'Your Old Email' : 'Your Old Phone Number'}
                </label>
                <Input
                  type={identifierType === 'email' ? 'email' : 'tel'}
                  placeholder={identifierType === 'email' ? 'old@example.com' : '+254700000000'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  className="border-0 bg-transparent px-0 h-10 text-lg font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              >
                {isLoading ? 'Looking up...' : 'Continue'}
              </Button>
            </motion.form>
          )}

          {step === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <p className="text-sm text-neutral-500 font-medium text-center">
                Send a recovery link to:
              </p>

              <div className="space-y-3">
                {recoveryOptions.email && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('emailRecovery')}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      selectedMethod === 'emailRecovery'
                        ? 'border-black dark:border-white bg-neutral-50 dark:bg-white/5'
                        : 'border-black/[0.05] dark:border-white/[0.05] hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Email</div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white">{recoveryOptions.email}</div>
                    </div>
                  </button>
                )}

                {recoveryOptions.phone && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('phoneRecovery')}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      selectedMethod === 'phoneRecovery'
                        ? 'border-black dark:border-white bg-neutral-50 dark:bg-white/5'
                        : 'border-black/[0.05] dark:border-white/[0.05] hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Phone</div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white">{recoveryOptions.phone}</div>
                    </div>
                  </button>
                )}
              </div>

              <Button
                onClick={handleSendRecovery}
                disabled={!selectedMethod || isLoading}
                className="w-full rounded-full h-14 bg-black dark:bg-white text-white dark:text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
              </Button>

              <button
                type="button"
                onClick={() => { setStep('identifier'); setError(''); setSelectedMethod(null); }}
                className="flex items-center gap-2 mx-auto text-sm font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
            </motion.div>
          )}

          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white tracking-tight">Check your recovery contact</h2>
                <p className="text-sm text-neutral-500 font-medium">
                  If an account exists with recovery methods, a recovery link has been sent.
                  The link expires in 15 minutes.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-block text-sm font-bold text-black dark:text-white hover:underline"
              >
                Back to login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'sent' && (
          <p className="text-center text-sm font-medium text-neutral-500">
            Remember your password?{' '}
            <Link href="/auth/login" className="text-black dark:text-white font-bold hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </motion.div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-50/50 dark:bg-orange-950/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
