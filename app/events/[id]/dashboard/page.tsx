'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, ExternalLink, ReceiptText, Hash } from 'lucide-react';

interface RSVP {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    externalId: string;
    email: string | null;
    name: string | null;
  };
  payment: {
    status: string;
    amount: number;
    currency: string;
    receiptNumber: string | null;
    transactionCode: string | null;
    paidAt: string;
  } | null;
}

interface EventRSVPs {
  event: {
    id: string;
    title: string;
  };
  rsvps: RSVP[];
  total: number;
  confirmed: number;
}

export default function EventDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user, bearerToken } = useAuth();
  const eventId = params.id as string;

  const [data, setData] = useState<EventRSVPs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !bearerToken) {
      router.push('/auth/login');
      return;
    }
    fetchRSVPs();
  }, [eventId, user, bearerToken, router]);

  const fetchRSVPs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`/api/events/${eventId}/rsvps`, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('You are not authorized to view RSVPs for this event. Only the event organizer can access this page.');
        } else {
          setError(errorData.error || 'Failed to fetch RSVPs');
        }
        return;
      }

      const rsvpData = await response.json();
      setData(rsvpData);
    } catch (err: any) {
      console.error('Error fetching RSVPs:', err);
      setError(err.message || 'Failed to load RSVPs');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data) return;

    const headers = ['Name', 'Email', 'User ID', 'Status', 'Payment Status', 'Amount', 'Currency', 'M-Pesa Receipt', 'Transaction Hash', 'RSVP Date', 'Payment Date'];
    const rows = data.rsvps.map(rsvp => [
      rsvp.user.name || rsvp.user.externalId || 'N/A',
      rsvp.user.email || 'N/A',
      rsvp.user.externalId,
      rsvp.status,
      rsvp.payment?.status || 'N/A',
      rsvp.payment?.amount?.toFixed(2) || 'N/A',
      rsvp.payment?.currency || 'N/A',
      rsvp.payment?.receiptNumber || 'N/A',
      rsvp.payment?.transactionCode || 'N/A',
      new Date(rsvp.createdAt).toLocaleString(),
      rsvp.payment?.paidAt ? new Date(rsvp.payment.paidAt).toLocaleString() : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.event.title.replace(/[^a-z0-9]/gi, '_')}_rsvps.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-gray-500">Loading RSVPs...</p>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertDescription>{error || 'Failed to load RSVPs'}</AlertDescription>
              </Alert>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => router.back()} variant="outline">
                  Go Back
                </Button>
                <Button onClick={() => router.push(`/events/${eventId}`)}>
                  View Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/events/${eventId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">RSVP Dashboard</h1>
                <p className="text-gray-600 mt-1">{data.event.title}</p>
              </div>
            </div>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900">{data.total}</div>
                <p className="text-sm text-gray-600">Total RSVPs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">{data.confirmed}</div>
                <p className="text-sm text-gray-600">Confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">{data.total - data.confirmed}</div>
                <p className="text-sm text-gray-600">Pending</p>
              </CardContent>
            </Card>
          </div>

          {/* RSVP Table */}
          <Card>
            <CardHeader>
              <CardTitle>All RSVPs</CardTitle>
            </CardHeader>
            <CardContent>
              {data.rsvps.length === 0 ? (
                <Alert>
                  <AlertDescription>No RSVPs yet for this event.</AlertDescription>
                </Alert>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">RSVP Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Receipt/Hash</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">RSVP Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.rsvps.map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {rsvp.user.name || rsvp.user.externalId || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {rsvp.user.email || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                            {rsvp.user.externalId}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              rsvp.status === 'CONFIRMED' 
                                ? 'bg-green-100 text-green-800' 
                                : rsvp.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rsvp.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {rsvp.payment ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                rsvp.payment.status === 'CONFIRMED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : rsvp.payment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {rsvp.payment.status}
                              </span>
                            ) : (
                              <span className="text-gray-400">No payment</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {rsvp.payment ? `${rsvp.payment.amount.toFixed(2)} ${rsvp.payment.currency}` : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {rsvp.payment?.receiptNumber ? (
                              <div className="flex items-center gap-2">
                                <ReceiptText className="w-4 h-4 text-gray-500" />
                                <span className="font-mono text-xs">{rsvp.payment.receiptNumber}</span>
                              </div>
                            ) : rsvp.payment?.transactionCode ? (
                              <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-gray-500" />
                                {rsvp.payment.transactionCode.startsWith('http') || rsvp.payment.transactionCode.startsWith('https') ? (
                                  <a
                                    href={rsvp.payment.transactionCode}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-mono text-xs flex items-center gap-1"
                                  >
                                    {rsvp.payment.transactionCode.length > 30 
                                      ? `${rsvp.payment.transactionCode.substring(0, 30)}...` 
                                      : rsvp.payment.transactionCode}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="font-mono text-xs">{rsvp.payment.transactionCode}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(rsvp.createdAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {rsvp.payment?.paidAt ? new Date(rsvp.payment.paidAt).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
