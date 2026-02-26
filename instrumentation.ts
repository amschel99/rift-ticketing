export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const { reconcilePendingPayments } = await import('@/lib/reconcile-payments');

    // Run every 30 seconds
    cron.default.schedule('*/30 * * * * *', () => {
      reconcilePendingPayments().catch((err) => {
        console.error('[Reconciler] Unhandled error:', err);
      });
    });

    console.log('[Reconciler] Payment reconciliation cron started (every 30s)');
  }
}
