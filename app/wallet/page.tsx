'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowDown, ArrowUp, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const { user, bearerToken, isLoading: authLoading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceInKES, setBalanceInKES] = useState<number | null>(null);
  const [buyingRate, setBuyingRate] = useState<number | null>(null);
  const [sellingRate, setSellingRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupPhone, setTopupPhone] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    console.log("Balance:", balance, "KES:", balanceInKES, "Buying Rate:", buyingRate, "Selling Rate:", sellingRate);
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && bearerToken) fetchWalletData();
  }, [user, bearerToken, authLoading, router]);

  const fetchWalletData = async () => {
    if (!bearerToken) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${bearerToken}` },
      });
      const data = await response.json();
      setBalance(data.balance);
      setBalanceInKES(data.balanceInKES);
      setBuyingRate(data.buyingRate || data.exchangeRate);
      setSellingRate(data.sellingRate);
      setWalletAddress(data.walletAddress);
    } catch (err: any) {
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!bearerToken || !topupAmount || !topupPhone) return;
    setIsToppingUp(true);
    try {
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
        body: JSON.stringify({ amount: parseFloat(topupAmount), phoneNumber: topupPhone }),
      });
      if (!response.ok) throw new Error('Top-up failed');
      setShowTopup(false);
      setTimeout(fetchWalletData, 3000);
    } catch (err: any) { setError(err.message); }
    finally { setIsToppingUp(false); }
  };

  const handleWithdraw = async () => {
    if (!bearerToken || !withdrawAmount || !withdrawPhone) return;
    setIsWithdrawing(true);
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bearerToken}` },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), phoneNumber: withdrawPhone }),
      });
      if (!response.ok) throw new Error('Withdrawal failed');
      setShowWithdraw(false);
      fetchWalletData();
    } catch (err: any) { setError(err.message); }
    finally { setIsWithdrawing(false); }
  };

  if (authLoading || isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-neutral-400 font-medium tracking-widest uppercase text-xs">
      Loading Assets...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] selection:bg-orange-100 flex flex-col">
      <Navigation />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-6 pt-32 pb-32">
        <header className="mb-12 space-y-2">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 dark:text-white leading-none">
            Wallet
          </h1>
          <p className="text-lg text-neutral-500 font-medium italic font-serif">Your digital treasury.</p>
        </header>

        <div className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Balance Hero Card */}
          <div className="bg-white dark:bg-[#0c0c0c] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-10 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Available Balance</div>
                <button onClick={fetchWalletData} className="p-2 rounded-full hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                  <RefreshCw className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
              
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-tighter text-neutral-900 dark:text-white">
                  KES {balanceInKES?.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xl text-neutral-500 font-medium">
                  ≈ {balance?.toFixed(2)} USDC
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-black/[0.05] dark:border-white/[0.05] flex flex-wrap gap-4">
                <Button onClick={() => { setShowTopup(true); setShowWithdraw(false); }} className="rounded-full bg-black dark:bg-white text-white dark:text-black font-bold px-8 h-12 shadow-xl hover:scale-105 transition-transform">
                  <ArrowUp className="w-4 h-4 mr-2 stroke-[3]" /> Top Up
                </Button>
                <Button onClick={() => { setShowWithdraw(true); setShowTopup(false); }} variant="outline" className="rounded-full border-black/[0.1] dark:border-white/[0.1] font-bold px-8 h-12 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                  <ArrowDown className="w-4 h-4 mr-2 stroke-[3]" /> Withdraw
                </Button>
              </div>
            </div>
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-orange-100/30 dark:bg-orange-900/5 blur-[100px] rounded-full pointer-events-none" />
          </div>

          {/* Form Sections */}
          <AnimatePresence mode="wait">
            {(showTopup || showWithdraw) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-[#0c0c0c] border border-black/[0.05] dark:border-white/[0.05] rounded-[32px] p-8 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                    {showTopup ? 'Top Up via M-Pesa' : 'Withdraw to M-Pesa'}
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Amount (KES)</label>
                    <Input 
                      type="number" value={showTopup ? topupAmount : withdrawAmount} 
                      onChange={(e) => showTopup ? setTopupAmount(e.target.value) : setWithdrawAmount(e.target.value)}
                      className="border-0 bg-transparent px-0 h-12 text-xl md:text-2xl font-semibold focus-visible:ring-0 shadow-none" placeholder="1,000"
                    />
                  </div>

                  <div className="group border-b border-black/[0.05] dark:border-white/[0.05] focus-within:border-black dark:focus-within:border-white transition-colors pb-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">M-Pesa Number</label>
                    <Input
                      type="tel" value={showTopup ? topupPhone : withdrawPhone}
                      onChange={(e) => showTopup ? setTopupPhone(e.target.value) : setWithdrawPhone(e.target.value)}
                      className="border-0 bg-transparent px-0 h-12 text-xl md:text-2xl font-semibold focus-visible:ring-0 shadow-none" placeholder="07..." 
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={showTopup ? handleTopup : handleWithdraw} 
                      disabled={isToppingUp || isWithdrawing} 
                      className="flex-1 rounded-2xl h-14 bg-black dark:bg-white text-white dark:text-black font-bold shadow-xl active:scale-95 transition-all"
                    >
                      {showTopup ? (isToppingUp ? 'Initiating...' : 'Confirm Top Up') : (isWithdrawing ? 'Processing...' : 'Confirm Withdrawal')}
                    </Button>
                    <Button onClick={() => { setShowTopup(false); setShowWithdraw(false); }} variant="ghost" className="rounded-2xl h-14 px-8 font-bold">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wallet Address / Security Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-3 text-neutral-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secured by Rift Custody</span>
            </div>
            {walletAddress && (
                <div className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-white/5 px-4 py-2 rounded-full truncate max-w-[260px] md:max-w-xs">
                    {walletAddress}
                </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}