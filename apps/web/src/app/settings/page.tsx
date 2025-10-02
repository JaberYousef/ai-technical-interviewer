'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/stores/session';

export default function SettingsPage() {
  const { duration, updateDuration } = useSessionStore();
  const [settings, setSettings] = useState({
    mode: 'Local',
    openrouterApiKey: '',
    privacyMode: true,
    sessionCap: 30,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('ai-interview-coach-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('ai-interview-coach-settings', JSON.stringify(newSettings));
  };

  const handleModeChange = (mode: 'Local' | 'Cloud') => {
    saveSettings({ ...settings, mode });
  };

  const handleApiKeyChange = (apiKey: string) => {
    saveSettings({ ...settings, openrouterApiKey: apiKey });
  };

  const handlePrivacyToggle = () => {
    saveSettings({ ...settings, privacyMode: !settings.privacyMode });
  };

  const handleSessionCapChange = (cap: number) => {
    saveSettings({ ...settings, sessionCap: cap });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Settings
              </h1>
              <p className="text-lg text-gray-600">
                Configure your AI Interview Coach experience
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Home
            </Link>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mode Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Mode Configuration
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Mode
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value="Local"
                        checked={settings.mode === 'Local'}
                        onChange={() => handleModeChange('Local')}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">Local Mode</div>
                        <div className="text-sm text-gray-500">
                          Uses WebLLM (Mistral 7B/8B) - nothing leaves your machine
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="mode"
                        value="Cloud"
                        checked={settings.mode === 'Cloud'}
                        onChange={() => handleModeChange('Cloud')}
                        className="mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">Cloud Mode</div>
                        <div className="text-sm text-gray-500">
                          Uses OpenRouter API - requires API key
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Privacy Badge */}
                {settings.mode === 'Local' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-green-800 font-medium">
                        Local Mode — nothing leaves your machine
                      </span>
                    </div>
                  </div>
                )}

                {/* API Key Input */}
                {settings.mode === 'Cloud' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      value={settings.openrouterApiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="Enter your OpenRouter API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your API key is stored locally and never sent to our servers
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Session Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Session Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => updateDuration(parseInt(e.target.value) || 25)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Cap (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={settings.sessionCap}
                    onChange={(e) => handleSessionCapChange(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum session length before auto-wrap-up
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.privacyMode}
                      onChange={handlePrivacyToggle}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium">Enhanced Privacy Mode</div>
                      <div className="text-sm text-gray-500">
                        Disable telemetry and analytics (recommended)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Tech Stack Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Technology Stack
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frontend Framework:</span>
                  <span className="font-medium">Next.js (App Router)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">TypeScript</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Styling:</span>
                  <span className="font-medium">TailwindCSS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State Management:</span>
                  <span className="font-medium">Zustand</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Local LLM:</span>
                  <span className="font-medium">WebLLM (Mistral 7B/8B)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cloud LLM:</span>
                  <span className="font-medium">OpenRouter</span>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Privacy & Security
              </h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-800 text-sm">
                      Local-first approach
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-800 text-sm">
                      No server-side persistence
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-800 text-sm">
                      BYO API key (Cloud mode)
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-green-800 text-sm">
                      Rate limiting on API endpoints
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Status */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-800 text-sm">
                Settings are automatically saved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
