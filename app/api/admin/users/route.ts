import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      isGuest: true,
      earnedPoints: true,
      isAdmin: true,
      reservations: {
        select: {
          id: true,
          date: true,
          status: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return NextResponse.json(users);
}

export async function PUT(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId, isAdmin: newAdminStatus } = await request.json();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isAdmin: newAdminStatus,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      isGuest: true,
      earnedPoints: true,
      isAdmin: true,
    },
  });

  return NextResponse.json(updatedUser);
}

export async function DELETE(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({ message: 'User deleted successfully' });
} 