import { NextResponse } from 'next/server';
import { loginUser } from '@/app/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    const { user, token } = await loginUser(email, password);

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      isGuest: user.isGuest,
      earnedPoints: user.earnedPoints,
      isAdmin: user.isAdmin,
    });

    // Set the JWT token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/', // Make cookie available across all paths
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }
} 