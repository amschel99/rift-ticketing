import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_code, receipt_number, status } = body;

    if (!transaction_code) {
      return NextResponse.json({ error: 'transaction_code is required' }, { status: 400 });
    }

    // Find invoice by transaction code
    const invoice = await prisma.invoice.findUnique({
      where: {
        transactionCode: transaction_code,
      },
      include: {
        user: true,
        event: true,
      },
    });

    if (!invoice) {
      console.error(`Invoice not found for transaction_code: ${transaction_code}`);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if payment was successful
    const isSuccess = receipt_number && status === 'success';

    if (isSuccess) {
      // Update invoice with receipt number and status
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          receiptNumber: receipt_number,
          status: 'CONFIRMED',
        },
      });

      // Check if RSVP already exists
      const existingRsvp = await prisma.rSVP.findUnique({
        where: {
          userId_eventId: {
            userId: invoice.userId,
            eventId: invoice.eventId,
          },
        },
      });

      // Create RSVP if it doesn't exist
      if (!existingRsvp) {
        await prisma.rSVP.create({
          data: {
            userId: invoice.userId,
            eventId: invoice.eventId,
            status: 'CONFIRMED',
          },
        });
      } else if (existingRsvp.status !== 'CONFIRMED') {
        // Update existing RSVP to confirmed
        await prisma.rSVP.update({
          where: { id: existingRsvp.id },
          data: { status: 'CONFIRMED' },
        });
      }

      console.log(`Payment successful for transaction_code: ${transaction_code}, receipt: ${receipt_number}`);
    } else {
      // Payment failed - delete invoice and any pending RSVP
      await prisma.invoice.delete({
        where: { id: invoice.id },
      });

      // Delete any pending RSVP for this user/event
      const pendingRsvp = await prisma.rSVP.findUnique({
        where: {
          userId_eventId: {
            userId: invoice.userId,
            eventId: invoice.eventId,
          },
        },
      });

      if (pendingRsvp && pendingRsvp.status === 'PENDING') {
        await prisma.rSVP.delete({
          where: { id: pendingRsvp.id },
        });
      }

      console.log(`Payment failed for transaction_code: ${transaction_code}, status: ${status}`);
    }

    return NextResponse.json({
      success: true,
      message: isSuccess ? 'Payment confirmed and RSVP created' : 'Payment failed, invoice deleted',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
