import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';
import { OfframpCurrency } from '@rift-finance/wallet';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.bearerToken) {
      return NextResponse.json({ error: 'User not authenticated with Rift' }, { status: 401 });
    }

    // Set bearer token for Rift SDK
    rift.setBearerToken(user.bearerToken);

    // Get BASE USD balance
    const balanceResponse = await rift.wallet.getTokenBalance({
      token: 'USDC',
      chain: 'BASE',
    });

    const balances = balanceResponse.data || [];
    // Balance has both 'chain' and 'chainName' - check both for BASE
    const usdcBalance = balances.find((b: any) => 
      b.token === 'USDC' && (b.chain === 'BASE' || b.chainName === 'BASE')
    );
    const balance = usdcBalance?.amount || 0;

    // Get exchange rate for KES - use buying_rate for balance display
    const exchangeRateResponse = await rift.offramp.previewExchangeRate({
      currency: 'KES' as OfframpCurrency,
    });

    const buyingRate = exchangeRateResponse.buying_rate || exchangeRateResponse.rate || 0;
    const sellingRate = exchangeRateResponse.selling_rate || exchangeRateResponse.rate || 0;
    const balanceInKES = balance * buyingRate; // Use buying_rate for balance

    return NextResponse.json({
      balance,
      balanceInKES,
      buyingRate, // For balance and wallet payments
      sellingRate, // For invoice RSVPs
      exchangeRate: buyingRate, // Keep for backward compatibility
      walletAddress: user.walletAddress || null,
    });
  } catch (error: any) {
    console.error('Get wallet balance error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch wallet balance' 
    }, { status: 500 });
  }
}
