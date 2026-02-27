import { NextRequest, NextResponse } from 'next/server';
import { reconcilePendingPayments } from '@/lib/reconcile-payments';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (or has the correct secret)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await reconcilePendingPayments();
    return NextResponse.json({ success: true, message: 'Reconciliation complete' });
  } catch (error: any) {
    console.error('[Cron] Reconciliation failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
