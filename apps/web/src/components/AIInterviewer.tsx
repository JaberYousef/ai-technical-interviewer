'use client';

import { useState, useEffect } from 'react';
import { useAIStore } from '@/stores/ai';
import { useSessionStore } from '@/stores/session';

interface AIInterviewerProps {
  className?: string;
}

export default function AIInterviewer({ className = '' }: AIInterviewerProps) {
  const [userMessage, setUserMessage] = useState('');
  const [currentProblem, setCurrentProblem] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  
  const { 
    isActive, 
    currentStage, 
    conversationHistory, 
    lastMessage, 
    isLoading, 
    error,
    startSession,
    sendMessage,
    generateReport,
    resetSession
  } = useAIStore();

  const { isActive: sessionActive, startSession: startTimer, stopSession: stopTimer } = useSessionStore();

  const handleStartSession = async () => {
    await startSession(currentProblem || undefined, currentCode || undefined);
    startTimer();
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    
    await sendMessage(userMessage);
    setUserMessage('');
  };

  const handleGenerateReport = async () => {
    const report = await generateReport();
    if (report) {
      // Download the report
      const blob = new Blob([report.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-report-${Date.now()}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleStopSession = () => {
    resetSession();
    stopTimer();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          AI Interviewer
        </h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isActive ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm text-gray-600">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Session Setup */}
      {!isActive && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem Statement (optional)
            </label>
            <textarea
              value={currentProblem}
              onChange={(e) => setCurrentProblem(e.target.value)}
              placeholder="e.g., Two Sum - Find two numbers that add up to target"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Code (optional)
            </label>
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder="function twoSum(nums, target) { ... }"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={4}
            />
          </div>

          <button
            onClick={handleStartSession}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50"
          >
            {isLoading ? 'Starting...' : 'Start AI Interview'}
          </button>
        </div>
      )}

      {/* Active Session */}
      {isActive && (
        <div className="space-y-4">
          {/* Current Stage */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Current Stage: {currentStage.replace('_', ' ').toUpperCase()}
              </span>
              <button
                onClick={handleStopSession}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Stop Session
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
            <div className="space-y-3">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your response..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={handleGenerateReport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>AI Interviewer Features:</strong> Dynamic prompts based on session stage, 
          code-aware questioning, rubric-based feedback, and structured report generation.
        </p>
      </div>
    </div>
  );
}
