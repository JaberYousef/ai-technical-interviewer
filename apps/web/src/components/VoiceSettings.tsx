'use client';

import { useState, useEffect } from 'react';
import { speechService, type VoiceSettings } from '@/services/speech';

interface VoiceSettingsProps {
  className?: string;
}

export default function VoiceSettings({ className = '' }: VoiceSettingsProps) {
  const [settings, setSettings] = useState<VoiceSettings>(speechService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recommendedVoices, setRecommendedVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Load voices when component mounts
    const loadVoices = () => {
      const availableVoices = speechService.getAvailableVoices();
      const recommended = speechService.getRecommendedVoices();
      
      setVoices(availableVoices);
      setRecommendedVoices(recommended);
      
      // If no voice is selected, auto-select the best one
      if (!settings.voiceName && recommended.length > 0) {
        const maleVoice = recommended.find(voice => 
          voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('alex')
        );
        const bestVoice = maleVoice?.name || recommended[0].name;
        updateSetting('voiceName', bestVoice);
      }
    };

    // Load voices immediately
    loadVoices();

    // Also load voices when they become available (some browsers load them async)
    const timer = setTimeout(loadVoices, 1000);
    
    return () => clearTimeout(timer);
  }, [settings.voiceName]);

  const updateSetting = (key: keyof VoiceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    speechService.updateSettings({ [key]: value });
  };

  const testVoice = () => {
    speechService.speak("Hello! This is how I will sound during the interview.", undefined, undefined);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800">Voice Settings</h3>
      
      {/* Enable/Disable Voice */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Enable Voice Output
        </label>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => updateSetting('enabled', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      {/* Voice Selection */}
      {settings.enabled && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Voice
            </label>
            <select
              value={settings.voiceName || ''}
              onChange={(e) => updateSetting('voiceName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Auto-select best voice</option>
              {recommendedVoices.length > 0 && (
                <optgroup label="Recommended Voices">
                  {recommendedVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} {voice.lang}
                    </option>
                  ))}
                </optgroup>
              )}
              {voices.length > 0 && (
                <optgroup label="All Available Voices">
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} {voice.lang}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Voice Controls */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Speed
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={(e) => updateSetting('rate', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{settings.rate.toFixed(1)}x</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Pitch
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => updateSetting('pitch', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{settings.pitch.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Volume
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{Math.round(settings.volume * 100)}%</span>
            </div>
          </div>

          {/* Test Button */}
          <button
            onClick={testVoice}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            🔊 Test Voice
          </button>
        </>
      )}
    </div>
  );
}
