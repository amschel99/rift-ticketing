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

    // Step 1: Get exchange rate for onramp (use selling_rate for top-up)
    const exchangeResponse = await rift.offramp.previewExchangeRate({
      currency: 'KES' as OfframpCurrency,
    });

    const sellingRate = exchangeResponse.selling_rate || exchangeResponse.rate;
    if (!sellingRate) {
      return NextResponse.json({ error: 'Failed to get exchange rate' }, { status: 500 });
    }

    // Step 2: Calculate USD amount from local amount (KES)
    // amount is in KES, convert to USD using selling_rate
    const usdAmount = Math.round((amount / sellingRate) * 1e6) / 1e6;

    // Step 3: Format phone number for Kenya (07XXXXXXXX format)
    const formattedPhone = formatKenyaPhone(phoneNumber);

    // Step 4: Initiate onramp using onrampV2.buy()
    const onrampResponse = await rift.onrampV2.buy({
      shortcode: formattedPhone,
      amount: usdAmount, // USD amount
      chain: 'BASE' as RampChain,
      asset: 'USDC' as RampToken,
      mobile_network: 'Safaricom',
      country_code: 'KES',
    });

    // Handle response structure - BuyResponse may have different structure
    const response = onrampResponse as any;
    return NextResponse.json({
      success: true,
      orderId: response.order?.id || response.id || null,
      transactionCode: response.order?.transactionCode || response.transactionCode || null,
      status: response.order?.status || response.status || null,
      message: 'Top-up initiated. Check your phone for M-Pesa prompt.',
    });
  } catch (error: any) {
    console.error('Top-up error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to initiate top-up' 
    }, { status: 500 });
  }
}
