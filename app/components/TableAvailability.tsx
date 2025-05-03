'use client';

import { useState, useEffect } from 'react';
import { ReservationData } from './ReservationForm';

interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  isAvailable: boolean;
}

interface TableCombination {
  tables: Table[];
  totalCapacity: number;
}

interface TableAvailabilityProps {
  reservationData: ReservationData;
  onConfirm: (selectedTables: string[]) => void;
  isHighTrafficDay: boolean;
}

export default function TableAvailability({
  reservationData,
  onConfirm,
  isHighTrafficDay,
}: TableAvailabilityProps) {
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [tableCombinations, setTableCombinations] = useState<TableCombination[]>([]);
  const [selectedCombination, setSelectedCombination] = useState<TableCombination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableTables = async () => {
      try {
        console.log('Fetching tables for:', reservationData);
        const response = await fetch('/api/tables/available', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: reservationData.date,
            numberOfGuests: reservationData.numberOfGuests,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch available tables');
        }
        
        const data = await response.json();
        console.log('Received tables:', data);
        
        if (!data.tables || !Array.isArray(data.tables)) {
          throw new Error('Invalid response format');
        }

        setAvailableTables(data.tables);
        
        // Generate table combinations
        const combinations = findTableCombinations(
          data.tables,
          reservationData.numberOfGuests
        );
        console.log('Generated combinations:', combinations);
        setTableCombinations(combinations);
        
        if (combinations.length > 0) {
          // Select the combination with the smallest total capacity that fits the group
          const bestFit = combinations.reduce((prev, current) => 
            current.totalCapacity >= reservationData.numberOfGuests &&
            current.totalCapacity < prev.totalCapacity ? current : prev
          );
          setSelectedCombination(bestFit);
        }
      } catch (error) {
        console.error('Error fetching available tables:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTables();
  }, [reservationData]);

  const findTableCombinations = (tables: Table[], requiredCapacity: number): TableCombination[] => {
    const combinations: TableCombination[] = [];
    
    // Single tables that can accommodate the group
    tables.forEach(table => {
      if (table.capacity >= requiredCapacity) {
        combinations.push({
          tables: [table],
          totalCapacity: table.capacity,
        });
      }
    });

    // Combinations of two tables
    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const combinedCapacity = tables[i].capacity + tables[j].capacity;
        if (combinedCapacity >= requiredCapacity) {
          combinations.push({
            tables: [tables[i], tables[j]],
            totalCapacity: combinedCapacity,
          });
        }
      }
    }

    return combinations.sort((a, b) => a.totalCapacity - b.totalCapacity);
  };

  const handleConfirm = () => {
    if (selectedCombination) {
      onConfirm(selectedCombination.tables.map(table => table.id));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">
          Error: {error}
        </p>
      </div>
    );
  }

  if (tableCombinations.length === 0) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg">
        <p className="text-red-600">
          Sorry, we don't have any available tables for {reservationData.numberOfGuests} guests at the selected time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900">Available Tables</h3>
      
      <div className="space-y-4">
        {tableCombinations.map((combination, index) => (
          <div
            key={index}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedCombination === combination
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-300'
            }`}
            onClick={() => setSelectedCombination(combination)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {combination.tables.length === 1 ? 'Table' : 'Tables'}{' '}
                  {combination.tables.map(t => t.tableNumber).join(' + ')}
                </p>
                <p className="text-sm text-gray-500">
                  Capacity: {combination.totalCapacity} guests
                </p>
              </div>
              {selectedCombination === combination && (
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>

      {isHighTrafficDay && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            Note: This is a high-traffic day. A valid credit card will be required to hold your reservation.
            A $10 charge will apply for no-shows.
          </p>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!selectedCombination}
        className={`w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white
          ${
            selectedCombination
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-gray-400 cursor-not-allowed'
          }
        `}
      >
        Confirm Reservation
      </button>
    </div>
  );
} 