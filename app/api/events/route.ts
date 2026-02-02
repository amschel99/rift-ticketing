import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserByToken } from '@/app/actions/auth';
import rift from '@/lib/rift';
import { OfframpCurrency } from '@rift-finance/wallet';

export async function POST(request: NextRequest) {
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

    if (!user.bearerToken) {
      return NextResponse.json({ error: 'User not authenticated with Rift' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, location, date, time, price, capacity, category, isOnline, image } = body;

    if (!title || !description || !date || !price || !capacity || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Price is in KES, convert to USD using selling_rate (for invoice payments)
    rift.setBearerToken(user.bearerToken);
    const exchangeResponse = await rift.offramp.previewExchangeRate({
      currency: 'KES' as OfframpCurrency,
    });
    const sellingRate = exchangeResponse.selling_rate || exchangeResponse.rate || 1;
    const priceInKES = parseFloat(price);
    const priceInUSDC = Math.round((priceInKES / sellingRate) * 1e6) / 1e6;

    const eventDateTime = new Date(`${date}T${time || '00:00'}`);

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location: location || '',
        date: eventDateTime,
        price: priceInUSDC, // Store in USD
        capacity: parseInt(capacity),
        category: category as any,
        isOnline: isOnline || false,
        organizerId: user.id,
        image: image || null,
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
          },
        },
      },
    });

    return NextResponse.json(newEvent);
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
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
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
