'use client';

import { useState } from 'react';
import ReservationForm from './components/ReservationForm';
import TableAvailability from './components/TableAvailability';
import { ReservationData } from './components/ReservationForm';
import Link from 'next/link';

export default function Home() {
  const [step, setStep] = useState<'form' | 'tables' | 'confirmation'>('form');
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [isHighTrafficDay, setIsHighTrafficDay] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const handleReservationSubmit = async (data: ReservationData) => {
    setReservationData(data);
    setStep('tables');
  };

  const handleTableConfirm = async (tableIds: string[]) => {
    setSelectedTables(tableIds);
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reservationData,
          tableIds,
          isHighTrafficDay,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create reservation');
      }

      setStep('confirmation');
    } catch (error) {
      console.error('Error creating reservation:', error);
      // Handle error (show error message to user)
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Restaurant Reservation System</h1>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/login" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Login</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </Link>

            <Link href="/register" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Register</h2>
              <p className="text-gray-600">Create a new account</p>
            </Link>

            <Link href="/profile" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">My Profile</h2>
              <p className="text-gray-600">View and edit your profile</p>
            </Link>

            <Link href="/admin" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Dashboard</h2>
              <p className="text-gray-600">Manage reservations and users</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
