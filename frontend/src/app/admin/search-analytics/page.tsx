'use client';

import { BarChart3, TrendingUp, Clock, Search } from 'lucide-react';

export default function SearchAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={32} />
          <h1 className="text-3xl font-bold">Search Analytics</h1>
        </div>
        <p className="text-blue-100">
          Monitor search performance and user behavior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Search className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Total Searches</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">3,892</div>
          <div className="text-sm text-green-600 mt-1">+15% from yesterday</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">45ms</div>
          <div className="text-sm text-green-600 mt-1">-5ms improvement</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Click-through Rate</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">68%</div>
          <div className="text-sm text-green-600 mt-1">+3% this week</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Search className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-gray-500">Zero Results</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">2.3%</div>
          <div className="text-sm text-red-600 mt-1">+0.5% increase</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Search Queries</h2>
        <div className="space-y-3">
          {[
            { query: 'pizza near me', count: 245, module: 'Food' },
            { query: 'milk delivery', count: 189, module: 'Ecom' },
            { query: 'track parcel', count: 156, module: 'Parcel' },
            { query: 'book cab', count: 134, module: 'Ride' },
            { query: 'doctor appointment', count: 98, module: 'Health' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.query}</div>
                <div className="text-sm text-gray-600">{item.module}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{item.count}</div>
                <div className="text-xs text-gray-500">searches</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
