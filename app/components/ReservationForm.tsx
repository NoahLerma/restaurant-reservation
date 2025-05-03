'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { setHours, setMinutes } from 'date-fns';

interface ReservationFormProps {
  isLoggedIn: boolean;
  onSubmit: (data: ReservationData) => void;
}

export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: Date;
  numberOfGuests: number;
}

export default function ReservationForm({ isLoggedIn, onSubmit }: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: setHours(setMinutes(new Date(), 0), 17), // Default to 5 PM
    numberOfGuests: 2,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const minTime = setHours(setMinutes(new Date(), 0), 11); // 11 AM
  const maxTime = setHours(setMinutes(new Date(), 0), 22); // 10 PM

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.numberOfGuests < 1 || formData.numberOfGuests > 16) {
        throw new Error('Number of guests must be between 1 and 16');
      }

      // Call the onSubmit handler
      await onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: setHours(setMinutes(new Date(), 0), 17),
        numberOfGuests: 2,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, date });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Reservation</h2>
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-900">
          Date and Time
        </label>
        <DatePicker
          selected={formData.date}
          onChange={handleDateChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="MMMM d, yyyy h:mm aa"
          minTime={minTime}
          maxTime={maxTime}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="guests" className="block text-sm font-medium text-gray-900">
          Number of Guests
        </label>
        <input
          type="number"
          id="guests"
          min="1"
          max="16"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
          value={formData.numberOfGuests}
          onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
          disabled={isSubmitting}
        />
      </div>

      {!isLoggedIn && (
        <p className="text-sm text-gray-700">
          Not registered? You can still make a reservation, but creating an account will help you manage your reservations
          and earn points!
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Reservation...' : 'Find Available Tables'}
      </button>
    </form>
  );
}