import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Fetching reservations...');
    const reservations = await prisma.reservation.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
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
      },
      orderBy: {
        date: 'asc',
      },
    });

    console.log('Found reservations:', reservations);
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

    console.log('Received reservation data:', {
      name,
      email,
      phone,
      date,
      numberOfGuests,
      isHighTrafficDay,
      creditCard,
    });

    // Validate required fields
    if (!name || !email || !phone || !date || !numberOfGuests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If it's a high-traffic day, require credit card information
    if (isHighTrafficDay && (!creditCard || !creditCard.number || !creditCard.expiryMonth || !creditCard.expiryYear || !creditCard.cvv)) {
      return NextResponse.json(
        { error: 'Credit card information is required for high-traffic day reservations' },
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
    let userId;

    if (session?.user?.email) {
      // User is logged in, find their ID
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) {
        userId = user.id;
      }
    }

    // If no user is logged in or found, create a guest user
    if (!userId) {
      // First check if a user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const guestUser = await prisma.user.create({
          data: {
            email,
            name,
            phone,
            password: 'guest', // This is just a placeholder
            isGuest: true,
          },
        });
        userId = guestUser.id;
      }
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        date: new Date(date),
        numberOfGuests,
        status: 'PENDING',
        tableId: availableTable.id,
        userId,
        holdingFeeStatus: isHighTrafficDay ? 'REQUIRED' : 'NOT_REQUIRED',
        creditCard: isHighTrafficDay ? {
          create: {
            lastFourDigits: creditCard.number.slice(-4),
            expiryMonth: parseInt(creditCard.expiryMonth),
            expiryYear: parseInt(creditCard.expiryYear),
          }
        } : undefined,
      },
      include: {
        table: true,
        user: true,
        creditCard: true,
      },
    });

    // If it's a high-traffic day, process the holding fee
    if (isHighTrafficDay) {
      // Here you would integrate with your payment processor
      // For now, we'll just log it
      console.log(`Processing $10 holding fee for reservation ${reservation.id}`);
      // TODO: Integrate with payment processor
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
} 