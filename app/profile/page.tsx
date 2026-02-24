'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Shield, Mail, User as UserIcon, Phone, Plus, Pencil, Trash2, Loader2, Check, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RecoveryMethods {
  id: string;
  email: string | null;
  phoneNumber: string | null;
}

export default function ProfilePage() {
  const { user, bearerToken, isLoading } = useAuth();
  const router = useRouter();

  // Password gate for recovery section
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Recovery state
  const [recovery, setRecovery] = useState<RecoveryMethods | null>(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [noRecovery, setNoRecovery] = useState(false);

  // Setup form state
  const [showSetup, setShowSetup] = useState(false);
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Edit state
  const [editingMethod, setEditingMethod] = useState<'emailRecovery' | 'phoneRecovery' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchMethods = useCallback(async (pw: string) => {
    if (!bearerToken) return;
    setRecoveryLoading(true);
    setRecoveryError('');

    try {
      const res = await fetch('/api/recovery/setup/my-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();

      if (res.status === 404) {
        setNoRecovery(true);
        setRecovery(null);
      } else if (res.ok && data.recovery) {
        setRecovery(data.recovery);
        setNoRecovery(false);
      } else {
        throw new Error(data.message || 'Failed to load recovery methods');
      }
    } catch (err: any) {
      setRecoveryError(err.message || 'Failed to load recovery methods');
    } finally {
      setRecoveryLoading(false);
    }
  }, [bearerToken]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setAuthError('Password is required');
      return;
    }
    setAuthLoading(true);
    setAuthError('');

    try {
      // Verify password by trying to fetch methods
      const res = await fetch('/api/recovery/setup/my-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.status === 401 || (res.status === 400 && data.message?.toLowerCase().includes('password'))) {
        setAuthError('Incorrect password');
        return;
      }

      // Password accepted
      setAuthenticated(true);

      if (res.status === 404) {
        setNoRecovery(true);
        setRecovery(null);
      } else if (res.ok && data.recovery) {
        setRecovery(data.recovery);
        setNoRecovery(false);
      }
    } catch {
      setAuthError('Something went wrong');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupEmail && !setupPhone) {
      setRecoveryError('Please provide at least one recovery method');
      return;
    }
    setSetupLoading(true);
    setRecoveryError('');

    try {
      const res = await fetch('/api/recovery/setup/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          password,
          emailRecovery: setupEmail || undefined,
          phoneRecovery: setupPhone || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRecoveryError(data.message || 'Failed to create recovery methods');
        return;
      }

      setRecovery(data.recovery);
      setNoRecovery(false);
      setShowSetup(false);
      setSetupEmail('');
      setSetupPhone('');
    } catch {
      setRecoveryError('Something went wrong');
    } finally {
      setSetupLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingMethod || !editValue) return;
    setEditLoading(true);
    setRecoveryError('');

    try {
      const res = await fetch('/api/recovery/setup/update-method', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ password, method: editingMethod, value: editValue }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRecoveryError(data.message || 'Failed to update');
        return;
      }

      setRecovery(data.recovery);
      setEditingMethod(null);
      setEditValue('');
    } catch {
      setRecoveryError('Something went wrong');
    } finally {
      setEditLoading(false);
    }
  };

  const handleAdd = async (method: 'emailRecovery' | 'phoneRecovery', value: string) => {
    if (!value) return;
    setEditLoading(true);
    setRecoveryError('');

    try {
      const res = await fetch('/api/recovery/setup/add-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ password, method, value }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRecoveryError(data.message || 'Failed to add method');
        return;
      }

      setRecovery(data.recovery);
      setEditingMethod(null);
      setEditValue('');
    } catch {
      setRecoveryError('Something went wrong');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRemove = async (method: 'emailRecovery' | 'phoneRecovery') => {
    setRecoveryError('');

    try {
      const res = await fetch('/api/recovery/setup/remove-method', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({ password, method }),
      });
      const data = await res.json();

      if (!res.ok) {
        setRecoveryError(data.message || 'Failed to remove method');
        return;
      }

      if (data.recovery) {
        setRecovery(data.recovery);
      } else {
        setRecovery(null);
        setNoRecovery(true);
      }
    } catch {
      setRecoveryError('Something went wrong');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-neutral-400 font-medium uppercase tracking-widest text-xs">
        Syncing Profile...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 flex flex-col">
      <Navigation />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 pt-32 pb-32">

        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 space-y-2 text-center sm:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
            Profile Settings
          </h1>
          <p className="text-xl text-neutral-500 font-medium italic font-serif">Manage your personal presence.</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-12"
        >
          {/* Identity Section */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
              Account Identity
            </h2>

            <div className="flex items-center gap-6 py-4 group">
              <div className="h-20 w-20 rounded-[32px] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-black/[0.05] dark:border-white/[0.05] shadow-sm transition-transform group-hover:rotate-2">
                <span className="text-2xl font-bold text-neutral-400">
                  {(user.name || user.externalId || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                  <UserIcon className="w-3 h-3" /> Display Name
                </div>
                <div className="text-2xl font-semibold text-neutral-900 dark:text-white leading-tight tracking-tight">
                  {user.name || user.externalId || 'User'}
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="space-y-6 pt-6">
             <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
              Contact & Support
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Support Email
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">admin@riftfi.xyz</p>
              </div>
            </div>
          </section>

          {/* Security & Recovery Section */}
          <section className="space-y-6 pt-6">
             <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
              Security
            </h2>

            {!authenticated ? (
              /* Password gate — user must enter password to access recovery settings */
              <form onSubmit={handlePasswordAuth} className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Recovery Methods</h4>
                    <p className="text-xs text-neutral-500 font-medium">Enter your password to manage recovery settings.</p>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 text-sm font-medium">
                    {authError}
                  </div>
                )}

                <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={authLoading}
                    className="border-0 bg-transparent px-0 h-10 text-base font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={authLoading}
                  className="rounded-full h-10 bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {authLoading ? 'Verifying...' : 'Unlock'}
                </Button>
              </form>
            ) : (
              /* Authenticated — show recovery management */
              <>
                {recoveryError && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
                    {recoveryError}
                  </div>
                )}

                {recoveryLoading ? (
                  <div className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                  </div>
                ) : noRecovery && !showSetup ? (
                  <div className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Recovery Methods</h4>
                        <p className="text-xs text-neutral-500 font-medium">Set up a backup email or phone to recover your account.</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowSetup(true)}
                      className="rounded-full h-10 bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Set Up Recovery
                    </Button>
                  </div>
                ) : showSetup ? (
                  <form onSubmit={handleCreate} className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Set Up Recovery</h4>
                    </div>

                    <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Recovery Email</label>
                      <Input
                        type="email"
                        placeholder="backup@example.com"
                        value={setupEmail}
                        onChange={(e) => setSetupEmail(e.target.value)}
                        disabled={setupLoading}
                        className="border-0 bg-transparent px-0 h-10 text-base font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
                      />
                    </div>

                    <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Recovery Phone (optional)</label>
                      <Input
                        type="tel"
                        placeholder="+254700000000"
                        value={setupPhone}
                        onChange={(e) => setSetupPhone(e.target.value)}
                        disabled={setupLoading}
                        className="border-0 bg-transparent px-0 h-10 text-base font-medium placeholder:text-neutral-200 focus-visible:ring-0 shadow-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={setupLoading}
                        className="rounded-full h-10 bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        {setupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { setShowSetup(false); setSetupEmail(''); setSetupPhone(''); setRecoveryError(''); }}
                        className="rounded-full h-10 text-sm font-medium text-neutral-500"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : recovery ? (
                  <div className="bg-white dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Recovery Methods</h4>
                        <p className="text-xs text-neutral-500 font-medium">Used to reset your password if you forget it.</p>
                      </div>
                    </div>

                    {/* Email method */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Recovery Email
                      </div>
                      {editingMethod === 'emailRecovery' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="email"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="backup@example.com"
                            className="h-9 text-sm rounded-xl"
                            autoFocus
                          />
                          <button
                            onClick={() => recovery.email ? handleUpdate() : handleAdd('emailRecovery', editValue)}
                            disabled={editLoading}
                            className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {editLoading ? <Loader2 className="w-3 h-3 text-white dark:text-black animate-spin" /> : <Check className="w-3 h-3 text-white dark:text-black" />}
                          </button>
                          <button
                            onClick={() => { setEditingMethod(null); setEditValue(''); }}
                            className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            <X className="w-3 h-3 text-neutral-500" />
                          </button>
                        </div>
                      ) : recovery.email ? (
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{recovery.email}</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditingMethod('emailRecovery'); setEditValue(recovery.email || ''); }}
                              className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                            >
                              <Pencil className="w-3 h-3 text-neutral-400" />
                            </button>
                            <button
                              onClick={() => handleRemove('emailRecovery')}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-neutral-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingMethod('emailRecovery'); setEditValue(''); }}
                          className="text-sm font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add recovery email
                        </button>
                      )}
                    </div>

                    {/* Phone method */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> Recovery Phone
                      </div>
                      {editingMethod === 'phoneRecovery' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="tel"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="+254700000000"
                            className="h-9 text-sm rounded-xl"
                            autoFocus
                          />
                          <button
                            onClick={() => recovery.phoneNumber ? handleUpdate() : handleAdd('phoneRecovery', editValue)}
                            disabled={editLoading}
                            className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {editLoading ? <Loader2 className="w-3 h-3 text-white dark:text-black animate-spin" /> : <Check className="w-3 h-3 text-white dark:text-black" />}
                          </button>
                          <button
                            onClick={() => { setEditingMethod(null); setEditValue(''); }}
                            className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            <X className="w-3 h-3 text-neutral-500" />
                          </button>
                        </div>
                      ) : recovery.phoneNumber ? (
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">{recovery.phoneNumber}</p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditingMethod('phoneRecovery'); setEditValue(recovery.phoneNumber || ''); }}
                              className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
                            >
                              <Pencil className="w-3 h-3 text-neutral-400" />
                            </button>
                            <button
                              onClick={() => handleRemove('phoneRecovery')}
                              className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-neutral-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingMethod('phoneRecovery'); setEditValue(''); }}
                          className="text-sm font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add recovery phone
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
