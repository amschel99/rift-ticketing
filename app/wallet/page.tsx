'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Wallet, ArrowDown, ArrowUp } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();
  const { user, bearerToken, isLoading: authLoading } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceInKES, setBalanceInKES] = useState<number | null>(null);
  const [buyingRate, setBuyingRate] = useState<number | null>(null); // buying_rate for balance display
  const [sellingRate, setSellingRate] = useState<number | null>(null); // selling_rate for top-up
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  
  // Withdraw state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Top-up state
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupPhone, setTopupPhone] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && bearerToken) {
      fetchWalletData();
    }
  }, [user, bearerToken, authLoading, router]);

  const fetchWalletData = async () => {
    if (!bearerToken) return;

    try {
      setIsLoading(true);
      setError('');

      // Fetch wallet balance and exchange rate
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch wallet data');
      }

      const data = await response.json();
      setBalance(data.balance);
      setBalanceInKES(data.balanceInKES);
      setBuyingRate(data.buyingRate || data.exchangeRate); // buying_rate for balance
      setSellingRate(data.sellingRate); // selling_rate for top-up
      setWalletAddress(data.walletAddress);
    } catch (err: any) {
      console.error('Error fetching wallet data:', err);
      setError(err.message || 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopup = async () => {
    if (!bearerToken || !topupAmount || !topupPhone) {
      setError('Please fill in all fields');
      return;
    }

    const amountKES = parseFloat(topupAmount);
    if (isNaN(amountKES) || amountKES <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsToppingUp(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          amount: amountKES, // Amount in KES - backend will convert using selling_rate
          phoneNumber: topupPhone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate top-up');
      }

      const data = await response.json();
      alert(`Top-up initiated! ${data.message || 'Check your phone for M-Pesa prompt.'}`);
      setShowTopup(false);
      setTopupAmount('');
      setTopupPhone('');
      // Refresh balance after a delay (to allow transaction to process)
      setTimeout(() => {
        fetchWalletData();
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to initiate top-up');
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bearerToken || !withdrawAmount || !withdrawPhone) {
      setError('Please fill in all fields');
      return;
    }

    const amountKES = parseFloat(withdrawAmount);
    if (isNaN(amountKES) || amountKES <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Convert KES to USD using buying_rate to check balance (for withdrawal)
    if (buyingRate && balance !== null) {
      const amountUSDC = amountKES / buyingRate;
      if (amountUSDC > balance) {
        setError('Insufficient balance');
        return;
      }
    }

    setIsWithdrawing(true);
    setError('');

    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: JSON.stringify({
          amount: amountKES, // Amount in KES - backend will convert using buying_rate
          phoneNumber: withdrawPhone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to withdraw');
      }

      const data = await response.json();
      alert(`Withdrawal initiated! Transaction code: ${data.transactionCode || 'Pending'}`);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawPhone('');
      // Refresh balance
      await fetchWalletData();
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E8C96] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading wallet...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#E9F1F4] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                My Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Balance Display */}
              <div className="bg-gradient-to-r from-[#E9F1F4] to-[#e2dffe] p-6 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Wallet Balance</div>
                {balanceInKES !== null && buyingRate !== null ? (
                  <>
                    <div className="text-4xl font-bold text-[#2E8C96] mb-1">
                      KES {balanceInKES.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      ≈ {balance !== null ? balance.toFixed(2) : '0.00'} USD
                      <span className="text-sm text-gray-500 ml-2">(Rate: {buyingRate.toFixed(2)})</span>
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-bold text-blue-600 mb-1">
                    {balance !== null ? balance.toFixed(2) : '0.00'} USD
                  </div>
                )}
                {walletAddress && (
                  <div className="text-xs text-gray-500 mt-3 font-mono break-all">
                    {walletAddress}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowTopup(!showTopup)}
                  className="flex-1"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Top Up
                </Button>
                <Button
                  onClick={() => setShowWithdraw(!showWithdraw)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
                <Button
                  onClick={fetchWalletData}
                  variant="outline"
                  size="sm"
                >
                  Refresh
                </Button>
              </div>

              {/* Top-up Form */}
              {showTopup && (
                <Card className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Up with M-Pesa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(e.target.value)}
                        step="1"
                        min="0"
                      />
                      {topupAmount && sellingRate && (
                        <p className="text-sm text-gray-600 mt-1">
                          ≈ {((parseFloat(topupAmount) / sellingRate)).toFixed(2)} USD (using selling rate)
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Enter amount in Kenyan Shillings (KES)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="0712345678 or 254712345678"
                        value={topupPhone}
                        onChange={(e) => setTopupPhone(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your Safaricom M-Pesa number
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleTopup}
                        disabled={isToppingUp || !topupAmount || !topupPhone}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isToppingUp ? 'Processing...' : 'Top Up'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowTopup(false);
                          setTopupAmount('');
                          setTopupPhone('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Withdraw Form */}
              {showWithdraw && (
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Withdraw to M-Pesa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        step="1"
                        min="0"
                      />
                      {withdrawAmount && buyingRate && (
                        <p className="text-sm text-gray-600 mt-1">
                          ≈ {((parseFloat(withdrawAmount) / buyingRate)).toFixed(2)} USD (using buying rate)
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Enter amount in Kenyan Shillings (KES)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">M-Pesa Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="0712345678 or 254712345678"
                        value={withdrawPhone}
                        onChange={(e) => setWithdrawPhone(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your Safaricom M-Pesa number
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || !withdrawAmount || !withdrawPhone}
                        className="flex-1"
                      >
                        {isWithdrawing ? 'Processing...' : 'Withdraw'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowWithdraw(false);
                          setWithdrawAmount('');
                          setWithdrawPhone('');
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
