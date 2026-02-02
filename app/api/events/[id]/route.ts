import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const event = await prisma.event.findUnique({
      where: { id },
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
    const { id } = await Promise.resolve(params);
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
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id && user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.event.delete({
      where: { id },
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
    const { id } = await Promise.resolve(params);
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
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden - Only the organizer can edit this event' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, location, date, time, price, capacity, category, isOnline } = body;

    const eventDateTime = new Date(`${date}T${time || '00:00'}`);

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title || event.title,
        description: description || event.description,
        location: location !== undefined ? location : event.location,
        date: date ? eventDateTime : event.date,
        price: price !== undefined ? parseFloat(price) : event.price,
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
