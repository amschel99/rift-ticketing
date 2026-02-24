import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';
import { OfframpCurrency } from '@rift-finance/wallet';
import { resolveEventId } from '@/lib/resolve-event';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: idOrSlug } = await Promise.resolve(params);
    const eventId = await resolveEventId(idOrSlug);
    if (!eventId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: {
            id: true,
            externalId: true,
            name: true,
          },
        },
        rsvps: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
        invoices: {
          select: {
            userId: true,
            ticketEmailSent: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error: any) {
    console.error('Get event error:', error);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: idOrSlug } = await Promise.resolve(params);
    const eventId = await resolveEventId(idOrSlug);
    if (!eventId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id && user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id: idOrSlug } = await Promise.resolve(params);
    const eventId = await resolveEventId(idOrSlug);
    if (!eventId) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bearerToken = authHeader.slice(7);
    const user = await getUserByToken(bearerToken);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden - Only the organizer can edit this event' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, location, date, time, dateTime, price, capacity, category, isOnline } = body;

    // Use ISO dateTime from client (timezone-aware) if available, fallback to date+time
    const eventDateTime = dateTime ? new Date(dateTime) : date ? new Date(`${date}T${time || '00:00'}`) : null;

    // Price is in KES, convert to USD using selling_rate (same as create)
    let priceInUSDC = event.price;
    let priceInKES = event.priceKES;
    if (price !== undefined) {
      priceInKES = parseFloat(price);
      if (priceInKES > 0) {
        if (!user.bearerToken) {
          return NextResponse.json({ error: 'User not authenticated with Rift' }, { status: 401 });
        }
        rift.setBearerToken(user.bearerToken);
        const exchangeResponse = await rift.offramp.previewExchangeRate({
          currency: 'KES' as OfframpCurrency,
        });
        const sellingRate = exchangeResponse.selling_rate || exchangeResponse.rate || 1;
        priceInUSDC = Math.round((priceInKES / sellingRate) * 1e6) / 1e6;
      } else {
        priceInUSDC = 0;
      }
    }

    // Generate slug if title changed or event has no slug yet
    const newTitle = title || event.title;
    const slug = (title && title !== event.title) || !event.slug
      ? generateSlug(newTitle)
      : event.slug;

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: newTitle,
        slug,
        description: description || event.description,
        location: location !== undefined ? location : event.location,
        date: eventDateTime || event.date,
        price: priceInUSDC,
        priceKES: priceInKES,
        capacity: capacity !== undefined ? parseInt(capacity) : event.capacity,
        category: category ? (category as any) : event.category,
        isOnline: isOnline !== undefined ? isOnline : event.isOnline,
      },
      include: {
        organizer: {
          select: {
            id: true,
            externalId: true,
            name: true,
          },
        },
        rsvps: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}
