'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if dismissed recently (7 days)
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Detect iOS
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show after a short delay on first visit
    if (ios) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-[420px]"
      >
        <div className="bg-white dark:bg-neutral-900 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl shadow-2xl shadow-black/20 p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
              <span className="text-white dark:text-black font-bold text-lg">H</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
                Install Hafla
              </h3>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                {isIOS
                  ? 'Add to your home screen for the best experience.'
                  : 'Install the app for quick access and offline support.'}
              </p>

              {isIOS ? (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-neutral-400 font-medium">
                  <span>Tap</span>
                  <Share className="w-3.5 h-3.5 text-blue-500" />
                  <span>then &quot;Add to Home Screen&quot;</span>
                </div>
              ) : (
                <Button
                  onClick={handleInstall}
                  className="mt-3 rounded-full h-9 px-5 bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Install
                </Button>
              )}
            </div>

            <button
              onClick={handleDismiss}
              className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
