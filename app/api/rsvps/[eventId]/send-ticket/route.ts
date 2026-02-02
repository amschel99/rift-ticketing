import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';
import { sendEmail, createTicketEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
) {
  try {
    const { eventId } = await Promise.resolve(params);
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Check if RSVP exists and is confirmed
    const rsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId: eventId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!rsvp) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    if (rsvp.status !== 'CONFIRMED') {
      return NextResponse.json({ error: 'RSVP is not confirmed' }, { status: 400 });
    }

    // Get invoice for this RSVP - find any invoice for this user/event
    // If RSVP is confirmed, there should be an invoice (even if status is PENDING with receipt)
    const invoice = await prisma.invoice.findFirst({
      where: {
        userId: user.id,
        eventId: eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!invoice) {
      // Log for debugging
      console.error(`Invoice not found for user ${user.id}, event ${eventId}, RSVP status: ${rsvp.status}`);
      return NextResponse.json({ 
        error: 'Invoice not found. Please ensure your payment was completed successfully.' 
      }, { status: 404 });
    }

    // If invoice exists but is not confirmed, check if it has a receipt number (payment successful)
    if (invoice.status !== 'CONFIRMED' && !invoice.receiptNumber && !invoice.transactionCode) {
      return NextResponse.json({ 
        error: 'Payment is still processing. Please wait for confirmation before requesting your ticket.' 
      }, { status: 400 });
    }

    // Check if ticket email was already sent (prevent abuse)
    if (invoice.ticketEmailSent) {
      return NextResponse.json({ 
        error: 'Ticket email has already been sent. Please check your inbox and spam folder.',
        alreadySent: true 
      }, { status: 400 });
    }

    // Format date nicely
    const eventDate = new Date(rsvp.event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Send ticket email
    const emailHtml = createTicketEmail({
      userName: user.name || user.externalId.split('@')[0],
      eventTitle: rsvp.event.title,
      eventDate: formattedDate,
      eventTime: formattedTime,
      eventLocation: rsvp.event.location,
      isOnline: rsvp.event.isOnline,
      orderId: invoice.orderId || undefined,
      receiptNumber: invoice.receiptNumber || undefined,
      transactionCode: invoice.transactionCode || undefined,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: `Your Event Ticket - ${rsvp.event.title}`,
        html: emailHtml,
      });

      // Mark ticket email as sent
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { ticketEmailSent: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Ticket email sent successfully',
      });
    } catch (emailError) {
      console.error('Error sending ticket email:', emailError);
      return NextResponse.json({ 
        error: 'Failed to send ticket email. Please try again later.' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Send ticket error:', error);
    return NextResponse.json({ error: 'Failed to send ticket' }, { status: 500 });
  }
}
