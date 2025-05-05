import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function PUT(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { userId, points } = await request.json();

  // Get current user points
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { earnedPoints: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Update points (1 dollar = 1 point)
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      earnedPoints: user.earnedPoints + points,
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