'use client';

import { useState } from 'react';
import { FileText, Filter, Download, Search } from 'lucide-react';
import { useToast } from '@/components/shared';

interface AuditLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  status: 'success' | 'failure';
}

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: new Date('2025-11-12T10:00:00.000Z'),
      user: 'admin@mangwale.ai',
      action: 'CREATE',
      resource: 'Training Job',
      details: 'Started training for food_nlu_v2',
      ip: '192.168.1.1',
      status: 'success'
    },
    {
      id: '2',
      timestamp: new Date('2025-11-12T09:55:00.000Z'),
      user: 'admin@mangwale.ai',
      action: 'UPDATE',
      resource: 'Agent',
      details: 'Updated Food Agent configuration',
      ip: '192.168.1.1',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date('2025-11-12T09:50:00.000Z'),
      user: 'system',
      action: 'DELETE',
      resource: 'Dataset',
      details: 'Deleted old dataset: temp_dataset_123',
      ip: '127.0.0.1',
      status: 'success'
    }
  ]);
  const toast = useToast();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileText size={32} />
              <h1 className="text-3xl font-bold">Audit Logs</h1>
            </div>
            <p className="text-slate-100">
              Track all system activities and changes
            </p>
          </div>
          <button
            onClick={() => toast.info('Export feature coming soon')}
            className="flex items-center gap-2 bg-white text-slate-600 px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Export Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={20} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Resource</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Details</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {log.timestamp.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.user}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.resource}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.details}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'success' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
