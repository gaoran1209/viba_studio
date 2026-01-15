import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import { Key, Save, Trash2, User as UserIcon, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { apiKey, setApiKey, removeApiKey } = useApiKey();
  const { user, logout } = useAuth();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      setApiKey(inputKey);
      setMessage('API Key saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save API Key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = () => {
    removeApiKey();
    setInputKey('');
    setMessage('API Key cleared');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* User Info Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="text-gray-500" size={20} />
          <h2 className="text-lg font-semibold">Account Information</h2>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Member since:</strong>{' '}
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Key className="text-gray-500" size={20} />
          <h2 className="text-lg font-semibold">Gemini API Key</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Your API key is stored locally in your browser and never shared with our servers.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveApiKey}
            disabled={isSaving || !inputKey}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleClearApiKey}
            disabled={!apiKey}
            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        {/* Status Messages */}
        {message && (
          <p
            className={`text-sm ${
              message.includes('failed') || message.includes('cleared')
                ? 'text-orange-600'
                : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}

        {apiKey && !message && (
          <p className="text-sm text-green-600">✓ API Key is configured</p>
        )}

        {!apiKey && !message && (
          <p className="text-sm text-orange-600">⚠ API Key is not configured</p>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">How to get your API Key:</p>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Go to Google AI Studio</li>
            <li>Click on "Get API Key"</li>
            <li>Copy and paste your key above</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
