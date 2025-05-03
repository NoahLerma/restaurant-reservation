'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  isGuest: boolean;
  earnedPoints: number;
  isAdmin: boolean;
  reservations?: {
    id: string;
    date: string;
    numberOfGuests: number;
    status: string;
    table: {
      tableNumber: number;
      capacity: number;
    };
  }[];
}

export default function UserProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserProfile();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }
      const data = await response.json();
      setUser(data);
      setFormData({
        name: data.name,
        phone: data.phone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false);
      // Refetch the profile to ensure we have all data
      await fetchUserProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="text-center text-gray-900">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-900">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            Back to Home
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email</h3>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Name</h3>
              <p className="mt-1 text-gray-900">{user.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Phone</h3>
              <p className="mt-1 text-gray-900">{user.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Earned Points</h3>
              <p className="mt-1 text-gray-900">{user.earnedPoints}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Account Type</h3>
              <p className="mt-1 text-gray-900">{user.isAdmin ? 'Admin' : 'Regular User'}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
            >
              Edit Profile
            </button>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation History</h3>
          {(!user.reservations || user.reservations.length === 0) ? (
            <p className="text-gray-900">No reservations yet</p>
          ) : (
            <div className="space-y-4">
              {user.reservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">Table {reservation.table.tableNumber}</p>
                      <p className="text-sm text-gray-900">
                        {new Date(reservation.date).toLocaleDateString()} at{' '}
                        {new Date(reservation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-900">
                    <p>{reservation.numberOfGuests} guests</p>
                    <p>Table capacity: {reservation.table.capacity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 