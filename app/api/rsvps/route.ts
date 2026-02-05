import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const userRsvps = await prisma.rSVP.findMany({
      where: {
        userId: user.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            price: true, // Price is stored in USD
            isOnline: true,
            category: true,
            image: true, // Include image
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get invoices for these RSVPs to include payment info
    const eventIds = userRsvps.map(r => r.eventId);
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
        eventId: { in: eventIds },
      },
      select: {
        eventId: true,
        invoiceUrl: true,
        status: true,
        receiptNumber: true,
        transactionCode: true,
        ticketEmailSent: true,
        orderId: true,
      },
    });

    const invoiceMap = new Map(invoices.map(inv => [inv.eventId, inv]));

    // Get exchange rate for KES (buying_rate for display)
    let buyingRate = 1;
    try {
      if (user.bearerToken) {
        rift.setBearerToken(user.bearerToken);
        const exchangeResponse = await rift.offramp.previewExchangeRate({
          currency: 'KES' as OfframpCurrency,
        });
        buyingRate = exchangeResponse.buying_rate || exchangeResponse.rate || 1;
      }
    } catch (exchangeError) {
      console.warn('Could not fetch exchange rate for KES, defaulting to 1:', exchangeError);
    }

    const userRsvpList = userRsvps.map(rsvp => {
      const invoice = invoiceMap.get(rsvp.eventId);
      
      return {
        id: rsvp.id,
        userId: rsvp.userId,
        eventId: rsvp.eventId,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
        event: rsvp.event,
        paymentUrl: invoice?.invoiceUrl || null,
        invoiceStatus: invoice?.status || null,
        receiptNumber: invoice?.receiptNumber || null, // M-Pesa receipt
        transactionCode: invoice?.transactionCode || null, // Transaction hash/URL
        ticketEmailSent: invoice?.ticketEmailSent || false, // Track if ticket email was sent
        orderId: invoice?.orderId || null, // Order ID
        buyingRate, // Include exchange rate for frontend
      };
    });

    return NextResponse.json(userRsvpList);
  } catch (error: any) {
    console.error('Get RSVPs error:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}
