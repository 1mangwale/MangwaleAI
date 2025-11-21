'use client';

import { useState } from 'react';
import { Settings, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { adminBackendClient } from '@/lib/api/admin-backend';

export default function SettingsPage() {
  const [labelStudioUrl, setLabelStudioUrl] = useState('');
  const [labelStudioToken, setLabelStudioToken] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection...');
    
    try {
      const result = await adminBackendClient.testLabelStudioConnection();
      if (result.ok) {
        setTestStatus('success');
        setTestMessage(`✅ Connected successfully! Found ${result.projectsCount || 0} projects.`);
      } else {
        setTestStatus('error');
        setTestMessage('❌ Connection failed. Please check your URL and token.');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save settings to backend (you'll need to implement this endpoint)
      alert('Settings saved! (Note: Backend endpoint needed to persist settings)');
      setSaving(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#059211] to-[#047a0e] text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Settings size={32} />
            <h1 className="text-4xl font-bold">Settings</h1>
          </div>
          <p className="text-green-100 text-lg">
            Configure external integrations and system preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Label Studio Configuration */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Label Studio Integration</h2>
              <p className="text-sm text-gray-600">Configure Label Studio for dataset annotation</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-1">About Label Studio</p>
                  <p className="text-sm text-blue-800">
                    Label Studio is an open-source data labeling tool. Use it to annotate training data 
                    with intents, entities, and other labels, then sync back to Mangwale AI.
                  </p>
                  <a 
                    href="https://labelstud.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-flex items-center gap-1"
                  >
                    Learn more about Label Studio <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label Studio URL
              </label>
              <input
                type="url"
                value={labelStudioUrl}
                onChange={(e) => setLabelStudioUrl(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059211] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                The base URL of your Label Studio instance (e.g., http://localhost:8080)
              </p>
            </div>

            {/* Token Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Token
              </label>
              <input
                type="password"
                value={labelStudioToken}
                onChange={(e) => setLabelStudioToken(e.target.value)}
                placeholder="Enter your Label Studio API token"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#059211] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Find your API token in Label Studio: Account & Settings → Access Token
              </p>
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={!labelStudioUrl || !labelStudioToken || testStatus === 'testing'}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
              </button>
              
              {testStatus !== 'idle' && (
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  testStatus === 'success' ? 'text-green-600' :
                  testStatus === 'error' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {testStatus === 'success' && <CheckCircle size={18} />}
                  {testStatus === 'error' && <XCircle size={18} />}
                  {testMessage}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving || !labelStudioUrl || !labelStudioToken}
                className="px-6 py-2 bg-gradient-to-r from-[#059211] to-[#047a0e] hover:shadow-lg disabled:opacity-50 text-white rounded-lg transition-all text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use Label Studio</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#059211] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Create a Dataset</h4>
                <p className="text-sm text-gray-600">
                  Go to Training → Datasets and create a new dataset with training examples.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#059211] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Push to Label Studio</h4>
                <p className="text-sm text-gray-600">
                  Click &quot;Push to LS&quot; on any dataset to export it to Label Studio for annotation.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#059211] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Annotate in Label Studio</h4>
                <p className="text-sm text-gray-600">
                  Open Label Studio in your browser and annotate the examples with intents, entities, and labels.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#059211] text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Pull Annotations</h4>
                <p className="text-sm text-gray-600">
                  Click &quot;Pull from LS&quot; to import annotated data back to Mangwale AI.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#059211] text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Train Your Model</h4>
                <p className="text-sm text-gray-600">
                  Use the enriched dataset to train your AI models with high-quality annotations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
