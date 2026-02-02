import { NextResponse } from 'next/server';
import rift from '@/lib/rift';
import { OfframpCurrency } from '@rift-finance/wallet';

export async function GET() {
  try {
    // Use the Rift API key directly (no user auth needed for exchange rates)
    // The Rift SDK should be initialized with the API key in lib/rift.ts
    const exchangeResponse = await rift.offramp.previewExchangeRate({
      currency: 'KES' as OfframpCurrency,
    });

    const buyingRate = exchangeResponse.buying_rate || exchangeResponse.rate || 0;
    const sellingRate = exchangeResponse.selling_rate || exchangeResponse.rate || 0;

    return NextResponse.json({
      buyingRate,
      sellingRate,
      rate: buyingRate, // For backward compatibility
    });
  } catch (error: any) {
    console.error('Get exchange rate error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch exchange rate' 
    }, { status: 500 });
  }
}
