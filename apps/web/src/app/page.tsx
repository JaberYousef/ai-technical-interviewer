'use client';

import { useSessionStore } from '@/stores/session';
import { useState, useEffect } from 'react';
import AIInterviewer from '@/components/AIInterviewer';

export default function HomePage() {
  const { 
    isActive, 
    duration, 
    startSession, 
    stopSession, 
    updateDuration,
    currentPhase 
  } = useSessionStore();
  
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [prd, setPrd] = useState<any>(null);

  // Load PRD on component mount
  useEffect(() => {
    fetch('/api/prd')
      .then(res => res.json())
      .then(data => setPrd(data))
      .catch(err => console.error('Failed to load PRD:', err));
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, stopSession]);

  // Reset timer when session starts
  useEffect(() => {
    if (isActive) {
      setTimeRemaining(duration * 60);
    }
  }, [isActive, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    startSession();
  };

  const handleStopSession = () => {
    stopSession();
    setTimeRemaining(duration * 60);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Interview Coach
          </h1>
          {prd && (
            <p className="text-lg text-gray-600">
              {prd.project} - {prd.owner}
            </p>
          )}
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Interviewer */}
          <AIInterviewer />
          
          {/* Session Control Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Interview Session
            </h2>
            
            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className={`text-6xl font-mono font-bold ${
                isActive ? 'text-red-600' : 'text-gray-400'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {isActive ? 'Session Active' : 'Ready to Start'}
              </p>
            </div>

            {/* Session Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => updateDuration(parseInt(e.target.value) || 25)}
                  disabled={isActive}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div className="flex space-x-4">
                {!isActive ? (
                  <button
                    onClick={handleStartSession}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    Start Session
                  </button>
                ) : (
                  <button
                    onClick={handleStopSession}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  >
                    Stop Session
                  </button>
                )}
              </div>
            </div>

            {/* Current Phase */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-700 mb-2">Current Phase</h3>
              <p className="text-gray-600 capitalize">{currentPhase}</p>
            </div>
          </div>

          {/* PRD Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Project Overview
            </h2>
            
            {prd ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Goals</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {prd.goals.slice(0, 3).map((goal: string, index: number) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Features</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {prd.features.slice(0, 4).map((feature: any) => (
                      <div key={feature.id} className="p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{feature.id}:</span> {feature.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Roadmap</h3>
                  <div className="space-y-2">
                    {prd.roadmap.slice(0, 3).map((phase: any) => (
                      <div key={phase.phase} className="p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">Phase {phase.phase}:</span> {phase.title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading project data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <a
            href="/interview"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            Start Interview (Phase 1)
          </a>
          <a
            href="/settings"
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Settings
          </a>
          <a
            href="/api/prd"
            target="_blank"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            View PRD JSON
          </a>
          <button
            onClick={async () => {
              const sampleSession = {
                sessionId: `session-${Date.now()}`,
                duration: 25,
                startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
                endTime: new Date().toISOString(),
                problemStatement: "Two Sum Problem",
                codeAttempts: ["function twoSum(nums, target) { ... }"],
                conversationHistory: [
                  { role: 'assistant', content: 'How would you approach this problem?', timestamp: new Date().toISOString() },
                  { role: 'user', content: 'I would use a hash map to store complements', timestamp: new Date().toISOString() }
                ]
              };
              
              const response = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sampleSession)
              });
              
              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `interview-feedback-${sampleSession.sessionId}.md`;
                a.click();
                window.URL.revokeObjectURL(url);
              }
            }}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Test Report API
          </button>
        </div>
      </div>
    </div>
  );
}