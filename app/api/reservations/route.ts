import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        table: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      name,
      email,
      phone,
      date,
      numberOfGuests,
      isHighTrafficDay = false,
      creditCard,
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !date || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find an available table that can accommodate the party
    const availableTable = await prisma.table.findFirst({
      where: {
        capacity: {
          gte: numberOfGuests,
        },
        isAvailable: true,
        // Check if the table is not reserved for the same time
        NOT: {
          reservations: {
            some: {
              date: {
                gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
              },
            },
          },
        },
      },
      orderBy: {
        capacity: 'asc', // Get the smallest table that fits
      },
    });

    if (!availableTable) {
      return NextResponse.json(
        { error: 'No tables available for the selected time and party size' },
        { status: 400 }
      );
    }

    // Get the current session (if user is logged in)
    const session = await getServerSession(authOptions);

    // Create the reservation with proper user connection
    const reservation = await prisma.reservation.create({
      data: {
        date: new Date(date),
        numberOfGuests,
        status: 'PENDING',
        holdingFeeStatus: isHighTrafficDay ? 'REQUIRED' : 'NOT_REQUIRED',
        user: {
          connectOrCreate: {
            where: {
              email: session?.user?.email || email,
            },
            create: {
              email,
              name,
              phone,
              isGuest: !session,
              password: '', // Empty password for guest users
            },
          },
        },
        table: {
          connect: {
            id: availableTable.id,
          },
        },
        ...(isHighTrafficDay && creditCard
          ? {
              creditCard: {
                create: {
                  lastFourDigits: creditCard.lastFourDigits,
                  expiryMonth: creditCard.expiryMonth,
                  expiryYear: creditCard.expiryYear,
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        table: true,
        creditCard: true,
      },
    });

    // TODO: Send confirmation email
    // TODO: If high traffic day, process holding fee

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
} 