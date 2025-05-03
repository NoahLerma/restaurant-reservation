import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { date, numberOfGuests } = await request.json();
    const searchDate = new Date(date);

    // Get all tables
    const allTables = await prisma.table.findMany();

    // Get reservations for the given date
    const reservations = await prisma.reservation.findMany({
      where: {
        date: {
          gte: startOfDay(searchDate),
          lte: endOfDay(searchDate),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        tables: true,
      },
    });

    // Create a set of reserved table IDs
    const reservedTableIds = new Set(
      reservations.flatMap(reservation => 
        reservation.tables.map(table => table.id)
      )
    );

    // Filter available tables
    const availableTables = allTables.filter(table => 
      !reservedTableIds.has(table.id)
    );

    // Check if it's a high traffic day
    const isHighTrafficDay = await prisma.highTrafficDate.findFirst({
      where: {
        date: {
          gte: startOfDay(searchDate),
          lte: endOfDay(searchDate),
        },
      },
    });

    return NextResponse.json({
      tables: availableTables,
      isHighTrafficDay: !!isHighTrafficDay,
    });
  } catch (error) {
    console.error('Error fetching available tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available tables' },
      { status: 500 }
    );
  }
} 