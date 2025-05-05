'use client';

import { useState, useEffect } from 'react';
import ReservationForm from '../components/ReservationForm';
import { ReservationData } from '../components/ReservationForm';
import Link from 'next/link';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReservationForm, setShowReservationForm] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('/api/reservations');
      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }
      const data = await response.json();
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationSubmit = async (data: ReservationData) => {
    try {
      console.log('Submitting reservation:', data);
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          isHighTrafficDay: data.isHighTrafficDay || false,
          creditCard: data.isHighTrafficDay ? {
            number: data.creditCard?.number || '',
            expiryMonth: data.creditCard?.expiryMonth || '',
            expiryYear: data.creditCard?.expiryYear || '',
            cvv: data.creditCard?.cvv || '',
          } : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const reservation = await response.json();
      console.log('Reservation created:', reservation);
      
      // Show success message
      setSuccess('Reservation created successfully!');
      setError('');
      
      // Refresh the reservations list
      await fetchReservations();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error creating reservation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create reservation');
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reservations</h1>
          <Link 
            href="/"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Back to Home
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Make a Reservation</h2>
            <ReservationForm 
              isLoggedIn={false} 
              onSubmit={handleReservationSubmit} 
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Current Reservations</h2>
            {isLoading ? (
              <p>Loading reservations...</p>
            ) : reservations.length === 0 ? (
              <p>No reservations found.</p>
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div>
                        <p className="font-medium">{new Date(reservation.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        <p className="text-gray-700">{reservation.user?.name || reservation.name}&apos;s Table</p>
                        <p className="text-gray-700">Table {reservation.table?.tableNumber} ({reservation.table?.capacity} seats)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-700">{reservation.numberOfGuests} guests</p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{reservation.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 