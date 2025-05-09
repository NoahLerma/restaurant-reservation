'use client';

import { useState } from 'react';

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: 'appetizers' | 'main' | 'desserts';
}

const menuItems: MenuItem[] = [
  // Appetizers
  {
    name: 'Loaded Nachos',
    description: 'Tortilla chips topped with melted cheese, jalapeños, sour cream, and guacamole',
    price: 12.99,
    category: 'appetizers'
  },
  {
    name: 'Buffalo Wings',
    description: 'Crispy wings tossed in spicy buffalo sauce, served with blue cheese dressing',
    price: 14.99,
    category: 'appetizers'
  },
  {
    name: 'Onion Rings',
    description: 'Beer-battered onion rings served with chipotle mayo',
    price: 8.99,
    category: 'appetizers'
  },

  // Main Courses
  {
    name: 'Classic Cheeseburger',
    description: '8oz Angus beef patty with cheddar, lettuce, tomato, and special sauce',
    price: 16.99,
    category: 'main'
  },
  {
    name: 'Ribeye Steak',
    description: '12oz USDA Choice ribeye, served with garlic mashed potatoes and seasonal vegetables',
    price: 32.99,
    category: 'main'
  },
  {
    name: 'Chicken Fajitas',
    description: 'Grilled chicken with peppers and onions, served with warm tortillas and all the fixings',
    price: 19.99,
    category: 'main'
  },
  {
    name: 'BBQ Ribs',
    description: 'Full rack of baby back ribs, slow-cooked and glazed with our house BBQ sauce',
    price: 24.99,
    category: 'main'
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with lemon butter sauce, served with rice pilaf and asparagus',
    price: 26.99,
    category: 'main'
  },

  // Desserts
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
    price: 8.99,
    category: 'desserts'
  },
  {
    name: 'New York Cheesecake',
    description: 'Classic cheesecake with berry compote',
    price: 7.99,
    category: 'desserts'
  }
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<'appetizers' | 'main' | 'desserts'>('main');

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Menu</h1>
          
          {/* Category Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveCategory('appetizers')}
              className={`px-4 py-2 rounded-md ${
                activeCategory === 'appetizers'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Appetizers
            </button>
            <button
              onClick={() => setActiveCategory('main')}
              className={`px-4 py-2 rounded-md ${
                activeCategory === 'main'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Main Courses
            </button>
            <button
              onClick={() => setActiveCategory('desserts')}
              className={`px-4 py-2 rounded-md ${
                activeCategory === 'desserts'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Desserts
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-medium text-amber-600">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 