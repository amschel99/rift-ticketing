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

    // Check if event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        organizerId: true,
        title: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the event organizer can view RSVPs' }, { status: 403 });
    }

    // Get all RSVPs for this event with user and invoice information
    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId: eventId,
      },
      include: {
        user: {
          select: {
            id: true,
            externalId: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get invoices for these RSVPs
    const userIds = rsvps.map(r => r.userId);
    const invoices = await prisma.invoice.findMany({
      where: {
        eventId: eventId,
        userId: { in: userIds },
      },
      select: {
        userId: true,
        status: true,
        amount: true,
        currency: true,
        receiptNumber: true,
        transactionCode: true,
        createdAt: true,
      },
    });

    const invoiceMap = new Map(invoices.map(inv => [inv.userId, inv]));

    // Combine RSVP data with invoice data
    const rsvpList = rsvps.map(rsvp => {
      const invoice = invoiceMap.get(rsvp.userId);
      return {
        id: rsvp.id,
        status: rsvp.status,
        createdAt: rsvp.createdAt,
        updatedAt: rsvp.updatedAt,
        user: {
          id: rsvp.user.id,
          externalId: rsvp.user.externalId,
          email: rsvp.user.email,
          name: rsvp.user.name,
        },
        payment: invoice ? {
          status: invoice.status,
          amount: invoice.amount,
          currency: invoice.currency,
          receiptNumber: invoice.receiptNumber,
          transactionCode: invoice.transactionCode,
          paidAt: invoice.createdAt,
        } : null,
      };
    });

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
      },
      rsvps: rsvpList,
      total: rsvpList.length,
      confirmed: rsvpList.filter(r => r.status === 'CONFIRMED').length,
    });
  } catch (error: any) {
    console.error('Get event RSVPs error:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
}
