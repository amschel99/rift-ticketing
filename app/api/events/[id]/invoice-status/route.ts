import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: eventId } = await Promise.resolve(params);
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find invoice for this user and event
    const invoice = await prisma.invoice.findFirst({
      where: {
        userId: user.id,
        eventId: eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        status: true,
        receiptNumber: true,
        transactionCode: true,
        invoiceUrl: true,
        createdAt: true,
        ticketEmailSent: true,
        orderId: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({
        hasInvoice: false,
        status: null,
        receiptNumber: null,
        transactionCode: null,
      });
    }

    // Check if invoice has a transaction code and is older than 1 minute
    // If so, delete it and return cleaned up flag
    if (invoice.transactionCode && invoice.status === 'PENDING' && !invoice.receiptNumber) {
      const invoiceAge = Date.now() - new Date(invoice.createdAt).getTime();
      const oneMinuteInMs = 1 * 60 * 1000; // 1 minute in milliseconds
      
      if (invoiceAge >= oneMinuteInMs) {
        // Delete the old invoice
        await prisma.invoice.delete({
          where: { id: invoice.id },
        });
        
        return NextResponse.json({
          hasInvoice: false,
          cleanedUp: true,
          status: null,
          receiptNumber: null,
          transactionCode: null,
        });
      }
    }

    return NextResponse.json({
      hasInvoice: true,
      status: invoice.status,
      receiptNumber: invoice.receiptNumber,
      transactionCode: invoice.transactionCode,
      invoiceUrl: invoice.invoiceUrl,
      ticketEmailSent: invoice.ticketEmailSent || false,
      orderId: invoice.orderId,
    });
  } catch (error: any) {
    console.error('Invoice status error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice status' }, { status: 500 });
  }
}
