'use client';

import { TrendingUp, Clock, MapPin } from 'lucide-react';

export default function TrendingPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={32} />
          <h1 className="text-3xl font-bold">Trending Queries</h1>
        </div>
        <p className="text-pink-100">
          Real-time trending searches across all modules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Trending Now
          </h2>
          <div className="space-y-3">
            {[
              { query: 'pizza delivery', trend: '+245%', module: 'Food', color: 'text-orange-600' },
              { query: 'grocery home delivery', trend: '+189%', module: 'Ecom', color: 'text-blue-600' },
              { query: 'urgent parcel', trend: '+156%', module: 'Parcel', color: 'text-purple-600' },
              { query: 'airport taxi', trend: '+134%', module: 'Ride', color: 'text-green-600' },
              { query: 'covid test', trend: '+98%', module: 'Health', color: 'text-red-600' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium text-gray-900">{item.query}</div>
                    <div className="text-sm text-gray-600">{item.module}</div>
                  </div>
                </div>
                <div className={`font-bold ${item.color}`}>{item.trend}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Trending by Location
          </h2>
          <div className="space-y-3">
            {[
              { location: 'Mumbai', query: 'late night food', count: 567 },
              { location: 'Delhi', query: 'grocery delivery', count: 432 },
              { location: 'Bangalore', query: 'cab booking', count: 389 },
              { location: 'Pune', query: 'medicine delivery', count: 276 },
              { location: 'Hyderabad', query: 'movie tickets', count: 198 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.location}</div>
                  <div className="text-sm text-gray-600">{item.query}</div>
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
    </div>
  );
}
