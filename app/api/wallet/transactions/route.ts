import { NextRequest, NextResponse } from 'next/server';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user || !user.bearerToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    rift.setBearerToken(user.bearerToken);

    // Fetch offramp (withdrawal) and onramp (deposit) orders in parallel
    const [offrampResult, onrampResult] = await Promise.allSettled([
      rift.offramp.getOrders(),
      rift.onrampV2.getOnrampOrders(user.riftUserId || user.externalId),
    ]);

    const withdrawals = offrampResult.status === 'fulfilled'
      ? (offrampResult.value.orders || []).map((order: any) => ({
          id: order.id,
          type: 'withdraw' as const,
          status: order.status,
          amount: order.amount,
          transactionCode: order.transactionCode,
          receiptNumber: order.receipt_number || null,
          transactionHash: order.transaction_hash || null,
          currency: order.currency || 'KES',
          createdAt: order.createdAt,
        }))
      : [];

    const deposits = onrampResult.status === 'fulfilled'
      ? (Array.isArray(onrampResult.value) ? onrampResult.value : []).map((order: any) => ({
          id: order.id || order.transactionCode,
          type: 'deposit' as const,
          status: order.status,
          amount: order.amount,
          transactionCode: order.transactionCode,
          receiptNumber: order.receipt_number || null,
          transactionHash: order.transaction_hash || null,
          currency: order.currency || 'KES',
          createdAt: order.createdAt || null,
        }))
      : [];

    // Combine and sort by date (newest first)
    const transactions = [...withdrawals, ...deposits].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Transaction history error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch transactions',
    }, { status: 500 });
  }
}
