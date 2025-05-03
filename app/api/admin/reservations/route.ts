import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(date && { date: new Date(date) }),
      ...(status && { status }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      table: {
        select: {
          tableNumber: true,
          capacity: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return NextResponse.json(reservations);
}

export async function PUT(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { reservationId, status } = await request.json();

  const updatedReservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      table: {
        select: {
          tableNumber: true,
          capacity: true,
        },
      },
    },
  });

  return NextResponse.json(updatedReservation);
}

export async function DELETE(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const reservationId = searchParams.get('id');

  if (!reservationId) {
    return NextResponse.json(
      { error: 'Reservation ID is required' },
      { status: 400 }
    );
  }

  await prisma.reservation.delete({
    where: { id: reservationId },
  });

  return NextResponse.json({ message: 'Reservation deleted successfully' });
} 