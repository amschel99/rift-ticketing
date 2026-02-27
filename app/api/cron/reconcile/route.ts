import { NextRequest, NextResponse } from 'next/server';
import { reconcilePendingPayments } from '@/lib/reconcile-payments';

export async function GET(request: NextRequest) {
  // Simple auth: check for secret in query param or authorization header
  const secret = request.nextUrl.searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const expected = process.env.CRON_SECRET;

  const isAuthorized =
    (expected && secret === expected) ||
    (expected && authHeader === `Bearer ${expected}`) ||
    !expected; // If no CRON_SECRET set, allow (for testing)

  if (!isAuthorized) {
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
