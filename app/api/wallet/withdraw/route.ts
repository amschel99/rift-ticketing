import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';
import { OfframpCurrency, RampChain, RampToken } from '@rift-finance/wallet';

/**
 * Format Kenya phone number to 07XXXXXXXX format
 */
function formatKenyaPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 254, remove country code
  if (cleaned.startsWith('254')) {
    return '0' + cleaned.substring(3);
  }
  
  // If starts with 7 and is 9 digits, add 0 prefix
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '07' + cleaned.substring(1);
  }
  
  // If already starts with 0, return as is
  if (cleaned.startsWith('0')) {
    return cleaned;
  }
  
  // Default: assume it's already in correct format
  return cleaned;
}

export async function POST(request: NextRequest) {
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

    const { amount, phoneNumber } = await request.json();

    if (!amount || !phoneNumber) {
      return NextResponse.json({ error: 'Amount and phone number are required' }, { status: 400 });
    }

    // Set bearer token for Rift SDK
    rift.setBearerToken(user.bearerToken);

    // Step 1: Get exchange rate for KES - use buying_rate for withdrawals
    const exchangeResponse = await rift.offramp.previewExchangeRate({
      currency: 'KES' as OfframpCurrency,
    });

    const buyingRate = exchangeResponse.buying_rate || exchangeResponse.rate;
    if (!buyingRate) {
      return NextResponse.json({ error: 'Failed to get exchange rate' }, { status: 500 });
    }

    // Step 2: Calculate USD amount from KES amount
    // Amount is in KES, convert to USD using buying_rate
    const amountKES = typeof amount === 'number' ? amount : parseFloat(amount);
    const usdAmount = Math.round((amountKES / buyingRate) * 1e6) / 1e6;

    // Step 3: Format phone number for Kenya (07XXXXXXXX format)
    const formattedPhone = formatKenyaPhone(phoneNumber);

    // Step 4: Create recipient object (must be JSON stringified)
    const recipient = {
      accountIdentifier: formattedPhone,
      currency: 'KES',
      type: 'MOBILE',
      institution: 'Safaricom',
    };

    // Step 5: Create offramp order to withdraw to M-Pesa
    const withdrawResponse = await rift.offramp.createOrder({
      token: 'USDC' as RampToken,
      amount: usdAmount, // USD amount
      currency: 'KES' as OfframpCurrency,
      chain: 'BASE' as RampChain,
      recipient: JSON.stringify(recipient), // Must be JSON stringified
    });

    return NextResponse.json({
      success: true,
      orderId: withdrawResponse.order.id,
      transactionCode: withdrawResponse.order.transactionCode,
      status: withdrawResponse.order.status,
      message: 'Withdrawal initiated successfully',
    });
  } catch (error: any) {
    console.error('Withdraw error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to initiate withdrawal' 
    }, { status: 500 });
  }
}
