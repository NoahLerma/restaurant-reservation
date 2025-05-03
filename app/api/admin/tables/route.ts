import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
      include: {
        reservations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { tableNumber, capacity } = await request.json();
    const newTable = await prisma.table.create({
      data: {
        tableNumber,
        capacity,
        isAvailable: true,
      },
    });
    return NextResponse.json(newTable);
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create table' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { tableId, tableNumber, capacity, isAvailable, reservationId } = await request.json();

    // If reservationId is provided, link the reservation to the table
    if (reservationId) {
      const updatedReservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: { tableId },
      });
      return NextResponse.json(updatedReservation);
    }

    // Otherwise, just update the table fields
    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        tableNumber,
        capacity,
        isAvailable,
      },
    });
    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('id');
    if (!tableId) {
      return NextResponse.json(
        { error: 'Table ID is required' },
        { status: 400 }
      );
    }
    await prisma.table.delete({
      where: { id: tableId },
    });
    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
} 