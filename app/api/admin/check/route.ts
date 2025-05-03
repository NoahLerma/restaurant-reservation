import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request) {
  const token = await getToken({ req: request });
  if (!token || token.isAdmin !== true) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ isAdmin: true });
} 