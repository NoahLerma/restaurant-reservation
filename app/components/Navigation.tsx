'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

interface UserData {
  earnedPoints: number;
  isAdmin: boolean;
}

export default function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [session?.user?.email]);

  return (
    <nav className="bg-gradient-to-r from-amber-900 to-amber-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link href="/" className="flex items-center space-x-3">
            <img src="/Logo.png" alt="Fibonacci's Flame Grill and Tap Logo" className="h-10 w-10 rounded" style={{ objectFit: 'contain' }} />
            <span className="text-2xl font-bold whitespace-nowrap">Fibonacci's Flame Grill and Tap</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link
              href="/"
              className={`hover:text-amber-200 ${isActive('/') ? 'text-amber-200' : ''}`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`hover:text-amber-200 ${isActive('/menu') ? 'text-amber-200' : ''}`}
            >
              Menu
            </Link>
            <Link
              href="/reservations"
              className={`hover:text-amber-200 ${isActive('/reservations') ? 'text-amber-200' : ''}`}
            >
              Reservations
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="animate-pulse h-8 w-8 rounded-full bg-amber-700" />
          ) : session ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-amber-600 flex items-center justify-center">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="hidden md:inline">
                    {userData?.isAdmin ? 'Admin' : 'User'}
                  </span>
                  <div className="flex items-center space-x-1 bg-amber-700 px-2 py-1 rounded">
                    <span className="text-sm">Points:</span>
                    <span className="font-semibold">{userData?.earnedPoints || 0}</span>
                  </div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-amber-800 rounded-md shadow-lg py-1 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-amber-700"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Profile
                  </Link>
                  {userData?.isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm hover:bg-amber-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-amber-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 