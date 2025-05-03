'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import React from 'react';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
  reservations?: {
    id: string;
    date: string;
    status: string;
  }[];
}

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  isGuest: boolean;
  earnedPoints: number;
  isAdmin: boolean;
  reservations: {
    id: string;
    date: string;
    status: string;
  }[];
}

interface Reservation {
  id: string;
  date: string;
  status: string;
  numberOfGuests: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  table: {
    tableNumber: number;
    capacity: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reservations' | 'tables' | 'users'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarReservations, setCalendarReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedReservationIds, setSelectedReservationIds] = useState<{ [tableId: string]: string }>({});
  const [confirmingReservationIds, setConfirmingReservationIds] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is admin
    fetch('/api/admin/check')
      .then(res => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        setIsAuthorized(true);
        return res.json();
      })
      .catch(err => {
        console.error('Authorization check failed:', err);
        setError('You are not authorized to view this page. Please log in as an admin.');
        // Redirect to home after 3 seconds
        setTimeout(() => router.push('/'), 3000);
      });
  }, [router]);

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [activeTab, isAuthorized]);

  // Fetch all reservations for the current month
  useEffect(() => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError('');
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth() + 1;
    fetch(`/api/admin/reservations?month=${month}&year=${year}`)
      .then(res => res.json())
      .then(data => {
        setCalendarReservations(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch reservations for calendar');
        setIsLoading(false);
      });
  }, [calendarDate, isAuthorized]);

  // Filter reservations for selected date and status
  const selectedDateStr = calendarDate.toLocaleDateString('en-CA');
  const filteredReservations = calendarReservations.filter(r => {
    const resDate = new Date(r.date).toLocaleDateString('en-CA');
    return resDate === selectedDateStr && (statusFilter === 'ALL' || r.status === statusFilter);
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Always fetch reservations when needed for tables tab
      if (activeTab === 'tables') {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth() + 1;
        const resReservations = await fetch(`/api/admin/reservations?month=${month}&year=${year}`);
        if (!resReservations.ok) {
          throw new Error('Failed to fetch reservations');
        }
        const reservationsData = await resReservations.json();
        setCalendarReservations(reservationsData);
      }

      switch (activeTab) {
        case 'tables':
          const resTables = await fetch('/api/admin/tables');
          if (!resTables.ok) {
            const errorData = await resTables.json();
            throw new Error(errorData.error || 'Failed to fetch tables');
          }
          const tablesData = await resTables.json();
          setTables(tablesData);
          break;
        case 'users':
          const resUsers = await fetch('/api/admin/users');
          if (!resUsers.ok) {
            const errorData = await resUsers.json();
            throw new Error(errorData.error || 'Failed to fetch users');
          }
          const usersData = await resUsers.json();
          setUsers(usersData);
          break;
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReservationStatus = async (reservationId: string, status: string) => {
    setConfirmingReservationIds(ids => [...ids, reservationId]);
    try {
      const response = await fetch('/api/admin/reservations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservationId, status }),
      });

      if (!response.ok) throw new Error('Failed to update reservation');
      await fetchData();
      window.location.reload(); // Force a full page reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reservation');
    } finally {
      setConfirmingReservationIds(ids => ids.filter(id => id !== reservationId));
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      const response = await fetch(`/api/admin/reservations?id=${reservationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete reservation');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reservation');
    }
  };

  const handleUpdateTable = async (tableId: string, data: Partial<Table>) => {
    try {
      const response = await fetch('/api/admin/tables', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableId, ...data }),
      });

      if (!response.ok) throw new Error('Failed to update table');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update table');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      const response = await fetch(`/api/admin/tables?id=${tableId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete table');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete table');
    }
  };

  const handleCreateTable = async () => {
    try {
      // Find the next available table number
      const existingNumbers = tables.map(t => t.tableNumber);
      let nextNumber = 1;
      while (existingNumbers.includes(nextNumber)) {
        nextNumber++;
      }
      const response = await fetch('/api/admin/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableNumber: nextNumber, // Use the next available number
          capacity: 4, // Default capacity
          isAvailable: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create table');
      }
      await fetchData();
      window.location.reload(); // Force a full page reload
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create table');
    }
  };

  const handleUpdateUserAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isAdmin }),
      });

      if (!response.ok) throw new Error('Failed to update user');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  // Calendar tile content and highlight
  function tileContent({ date, view }: { date: Date; view: string }) {
    if (view !== 'month') return null;
    const dayStr = date.toLocaleDateString('en-CA');
    const dayReservations = calendarReservations.filter(r => new Date(r.date).toLocaleDateString('en-CA') === dayStr);
    if (dayReservations.length === 0) return null;
    const hasPending = dayReservations.some(r => r.status === 'PENDING');
    const allConfirmed = dayReservations.every(r => r.status === 'CONFIRMED');
    return (
      <div className={`w-2 h-2 mx-auto mt-1 rounded-full ${hasPending ? 'bg-orange-500' : allConfirmed ? 'bg-green-500' : 'bg-gray-400'}`}></div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col items-center">
        <Calendar
          value={calendarDate}
          onChange={date => setCalendarDate(date as Date)}
          tileContent={tileContent}
          className="border-none shadow-none"
        />
        <div className="flex gap-2 mt-4">
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded ${statusFilter === status ? 'bg-amber-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`${
                activeTab === 'reservations'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-700 hover:text-amber-700 hover:border-amber-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm bg-white`}
            >
              Reservations
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`${
                activeTab === 'tables'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-700 hover:text-amber-700 hover:border-amber-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm bg-white`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-gray-700 hover:text-amber-700 hover:border-amber-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm bg-white`}
            >
              Users
            </button>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-900">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'reservations' && (
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Reservations for {calendarDate.toLocaleDateString()}</h2>
                <span className="text-sm text-gray-500">{filteredReservations.length} found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                  <thead className="bg-amber-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reservation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Guests</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(reservation.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{reservation.user.name}&apos;s Table</div>
                          <div className="text-gray-500 text-sm">{reservation.user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Only show table info if reservation.table exists */}
                          {reservation.table ? (
                            <>Table {reservation.table.tableNumber} ({reservation.table.capacity} seats)</>
                          ) : (
                            <span className="text-gray-400 italic">No table linked</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{reservation.numberOfGuests}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${reservation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{reservation.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          {reservation.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(reservation.id, 'CONFIRMED')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center"
                              disabled={confirmingReservationIds.includes(reservation.id)}
                            >
                              {confirmingReservationIds.includes(reservation.id) ? (
                                <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                              ) : null}
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={confirmingReservationIds.includes(reservation.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tables' && (
            <div className="p-6">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleCreateTable}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Add Table
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                  <thead className="bg-amber-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Table Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Linked Reservation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Link Reservation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tables.map((table) => {
                      // Find confirmed reservations not already linked to a table
                      const availableReservations = calendarReservations.filter(
                        (r) => r.status === 'CONFIRMED' && (!r.table || r.table.tableNumber !== table.tableNumber)
                      );
                      const selectedReservationId = selectedReservationIds[table.id] || '';
                      // Find the linked reservation for this table (if any)
                      const linkedReservation = table.reservations?.find(r => r.status === 'CONFIRMED');
                      return (
                        <tr key={table.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={table.tableNumber}
                              onChange={(e) => handleUpdateTable(table.id, { tableNumber: parseInt(e.target.value) })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-white"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={table.capacity}
                              onChange={(e) => handleUpdateTable(table.id, { capacity: parseInt(e.target.value) })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-white"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={table.isAvailable ? 'true' : 'false'}
                              onChange={(e) => handleUpdateTable(table.id, { isAvailable: e.target.value === 'true' })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-white"
                            >
                              <option value="true">Available</option>
                              <option value="false">Unavailable</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {linkedReservation ? (
                              <div>
                                <div className="font-semibold">{linkedReservation.user.name}&apos;s Table</div>
                                <div className="text-gray-500 text-sm">{linkedReservation.user.phone}</div>
                                <div className="text-xs text-green-700">{new Date(linkedReservation.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">No confirmed reservation linked</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* Only show dropdown if no confirmed reservation is linked */}
                            {!linkedReservation && (
                              <>
                                <select
                                  value={selectedReservationId}
                                  onChange={(e) => setSelectedReservationIds(ids => ({ ...ids, [table.id]: e.target.value }))}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-white"
                                >
                                  <option value="">Select reservation</option>
                                  {availableReservations.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.user.name}&apos;s Table ({new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })})
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={async () => {
                                    if (!selectedReservationId) return;
                                    await fetch('/api/admin/tables', {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ tableId: table.id, reservationId: selectedReservationId }),
                                    });
                                    fetchData();
                                  }}
                                  className="ml-2 px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700"
                                  disabled={!selectedReservationId}
                                >
                                  Link
                                </button>
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteTable(table.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-gray-900">
                  <thead className="bg-amber-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.isAdmin ? 'true' : 'false'}
                            onChange={(e) => handleUpdateUserAdminStatus(user.id, e.target.value === 'true')}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-gray-900 bg-white"
                          >
                            <option value="true">Admin</option>
                            <option value="false">User</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.earnedPoints}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 