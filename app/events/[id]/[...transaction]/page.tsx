'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function TransactionHandlerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, bearerToken } = useAuth();
  const eventId = params.id as string;
  const transaction = params.transaction as string[];

  useEffect(() => {
    // Extract transaction code from the path
    // URL format: /events/[id]/[transaction_code]?orderId=xxx
    const transactionCode = Array.isArray(transaction) ? transaction[0] : transaction;
    const orderId = searchParams.get('orderId');

    if (!transactionCode || !orderId || !user || !bearerToken) {
      router.replace(`/events/${eventId}`);
      return;
    }

    const handleTransaction = async () => {
      try {
        // Save transaction code and verify orderId, then query Rift SDK
        const response = await fetch(`/api/events/${eventId}/transaction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({ transactionCode, orderId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to process transaction');
        }

        // Redirect to event page without transaction code
        router.replace(`/events/${eventId}`);
      } catch (err: any) {
        console.error('Error handling transaction code:', err);
        // Still redirect, but show error on event page
        router.replace(`/events/${eventId}?error=${encodeURIComponent(err.message)}`);
      }
    };

    handleTransaction();
  }, [eventId, transaction, searchParams, user, bearerToken, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-gray-500">Processing payment...</p>
    </div>
  );
}
