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
  isHighTrafficDay?: boolean;
  creditCard?: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
  };
}

export default function ReservationForm({ isLoggedIn, onSubmit }: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    email: '',
    phone: '',
    date: setHours(setMinutes(new Date(), 0), 17), // Default to 5 PM
    numberOfGuests: 2,
    isHighTrafficDay: false,
    creditCard: {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showHighTrafficWarning, setShowHighTrafficWarning] = useState(false);

  const minTime = setHours(setMinutes(new Date(), 0), 11); // 11 AM
  const maxTime = setHours(setMinutes(new Date(), 0), 22); // 10 PM

  const isHighTrafficDay = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
    const isFourthOfJuly = date.getMonth() === 6 && date.getDate() === 4; // July 4th
    return isWeekend || isFourthOfJuly;
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const isHighTraffic = isHighTrafficDay(date);
      setFormData({ ...formData, date, isHighTrafficDay: isHighTraffic });
      if (isHighTraffic) {
        setShowHighTrafficWarning(true);
      }
    }
  };

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

      // Validate credit card if it's a high-traffic day
      if (formData.isHighTrafficDay) {
        if (!formData.creditCard?.number || !formData.creditCard?.expiryMonth || 
            !formData.creditCard?.expiryYear || !formData.creditCard?.cvv) {
          throw new Error('Please fill in all credit card fields for high-traffic day reservations');
        }
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
        isHighTrafficDay: false,
        creditCard: {
          number: '',
          expiryMonth: '',
          expiryYear: '',
          cvv: '',
        },
      });
      setShowHighTrafficWarning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
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

      {showHighTrafficWarning && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">High-Traffic Day Notice</h3>
          <p className="text-yellow-700">
            This is a high-traffic day (weekend or holiday). A $10 holding fee will be charged to your credit card.
            This fee will be refunded when you arrive for your reservation or applied to your bill.
          </p>
          <button
            type="button"
            onClick={() => setShowHighTrafficWarning(false)}
            className="mt-2 text-sm text-yellow-700 hover:text-yellow-800"
          >
            I understand
          </button>
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

      {formData.isHighTrafficDay && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Credit Card Information</h3>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-900">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              required
              placeholder="1234 5678 9012 3456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
              value={formData.creditCard?.number}
              onChange={(e) => setFormData({
                ...formData,
                creditCard: { ...formData.creditCard, number: e.target.value }
              })}
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-900">
                Expiry Month
              </label>
              <input
                type="text"
                id="expiryMonth"
                required
                placeholder="MM"
                maxLength={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                value={formData.creditCard?.expiryMonth}
                onChange={(e) => setFormData({
                  ...formData,
                  creditCard: { ...formData.creditCard, expiryMonth: e.target.value }
                })}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-900">
                Expiry Year
              </label>
              <input
                type="text"
                id="expiryYear"
                required
                placeholder="YY"
                maxLength={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
                value={formData.creditCard?.expiryYear}
                onChange={(e) => setFormData({
                  ...formData,
                  creditCard: { ...formData.creditCard, expiryYear: e.target.value }
                })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-900">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              required
              placeholder="123"
              maxLength={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 bg-white"
              value={formData.creditCard?.cvv}
              onChange={(e) => setFormData({
                ...formData,
                creditCard: { ...formData.creditCard, cvv: e.target.value }
              })}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

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