'use client';

import { useState, useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/session';
import { useAIStore } from '@/stores/ai';
import VoiceInput from '@/components/VoiceInput';
import VoiceOutput from '@/components/VoiceOutput';
import VoiceSettings from '@/components/VoiceSettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function InterviewPage() {
  const { 
    isActive: sessionActive, 
    startSession, 
    stopSession, 
    duration,
    updateDuration 
  } = useSessionStore();
  
  const { 
    isActive: aiActive,
    startSession: startAI,
    sendMessage: sendAIMessage,
    conversationHistory,
    isLoading: aiLoading,
    error: aiError,
    modelMode,
    setModelMode
  } = useAIStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [context, setContext] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (!sessionActive) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleStopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive]);

  // Reset timer when session starts
  useEffect(() => {
    if (sessionActive) {
      setTimeRemaining(duration * 60);
    }
  }, [sessionActive, duration]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when AI conversation changes
  useEffect(() => {
    console.log('🔄 Conversation history updated:', conversationHistory.length, 'messages');
    if (conversationHistory.length > 0) {
      const newMessages = conversationHistory.map((msg, index) => ({
        id: `msg-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      console.log('📝 Setting messages:', newMessages.length);
      setMessages(newMessages);
      
      // Auto-play the latest AI message if it's new
      const latestMessage = newMessages[newMessages.length - 1];
      if (latestMessage && latestMessage.role === 'assistant') {
        console.log('🔊 Auto-playing latest AI message');
        // Small delay to ensure the message is rendered
        setTimeout(() => {
          const speechEvent = new CustomEvent('playLatestMessage', { 
            detail: { text: latestMessage.content } 
          });
          window.dispatchEvent(speechEvent);
        }, 100);
      }
    }
  }, [conversationHistory]);

  const handleStartSession = async () => {
    startSession();
    
    // Start AI session with context
    await startAI(context || undefined);
  };

  const handleStopSession = () => {
    stopSession();
    setMessages([]);
    setUserInput('');
    setIsAISpeaking(false);
  };

  const handleVoiceTranscription = async (transcript: string) => {
    await handleSendMessage(transcript);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    console.log('💬 Sending message:', message);

    // Add user message to local state
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear input
    setUserInput('');

    try {
      console.log('🤖 Calling sendAIMessage...');
      // Send to AI
      await sendAIMessage(message);
      console.log('✅ sendAIMessage completed');
    } catch (error) {
      console.error('❌ sendAIMessage failed:', error);
    }
  };

  const handleAISpeechStart = () => {
    setIsAISpeaking(true);
  };

  const handleAISpeechEnd = () => {
    setIsAISpeaking(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                AI Interview Session
              </h1>
              <p className="text-lg text-gray-600">
                Phase 1: Conversational MVP
              </p>
            </div>
            
            {/* Settings */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Model:</label>
                <select
                  value={modelMode}
                  onChange={(e) => setModelMode(e.target.value as 'local' | 'cloud')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="local">Local (WebLLM)</option>
                  <option value="cloud">Cloud (OpenRouter)</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Duration:</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={duration}
                  onChange={(e) => updateDuration(parseInt(e.target.value) || 25)}
                  disabled={sessionActive}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <span className="text-sm text-gray-500">min</span>
              </div>
            </div>
          </div>
        </header>

        {/* Timer */}
        <div className="mb-8 text-center">
          <div className={`inline-block px-6 py-3 rounded-lg ${
            sessionActive ? 'bg-red-100 border-2 border-red-300' : 'bg-gray-100 border-2 border-gray-300'
          }`}>
            <div className={`text-4xl font-mono font-bold ${
              sessionActive ? 'text-red-600' : 'text-gray-500'
            }`}>
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {sessionActive ? 'Session Active' : 'Ready to Start'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md h-96 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Interview Conversation</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Start the session to begin your AI interview
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">
                          {message.role === 'user' ? 'You' : 'AI'} • {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.role === 'assistant' && (
                          <VoiceOutput
                            text={message.content}
                            autoPlay={false} // We'll handle auto-play via custom events
                            onPlayStart={handleAISpeechStart}
                            onPlayEnd={handleAISpeechEnd}
                            className="ml-2"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-2">
                  Debug: Loading={aiLoading ? 'true' : 'false'}, Messages={messages.length}, History={conversationHistory.length}
                </div>
                
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                {sessionActive ? (
                  <div className="space-y-4">
                    {/* Voice Input */}
                    <VoiceInput
                      onTranscription={handleVoiceTranscription}
                      disabled={aiLoading || isAISpeaking}
                      className="mb-4"
                    />
                    
                    {/* Text Input Fallback */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(userInput)}
                        placeholder="Or type your response..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={aiLoading || isAISpeaking}
                      />
                      <button
                        onClick={() => handleSendMessage(userInput)}
                        disabled={aiLoading || !userInput.trim() || isAISpeaking}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Start the session to begin the interview
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Session Controls */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Controls</h3>
              
              {!sessionActive ? (
                <button
                  onClick={handleStartSession}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
                >
                  Start Interview
                </button>
              ) : (
                <button
                  onClick={handleStopSession}
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  Stop Interview
                </button>
              )}
            </div>

            {/* Context Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Problem Context</h3>
              
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste your problem statement and code here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                disabled={sessionActive}
              />
              
              <p className="text-xs text-gray-500 mt-2">
                {sessionActive 
                  ? 'Context cannot be changed during active session'
                  : 'Include problem description and your initial code approach'
                }
              </p>
            </div>

            {/* Voice Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <VoiceSettings />
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session:</span>
                  <span className={sessionActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    {sessionActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">AI:</span>
                  <span className={aiActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
                    {aiActive ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Voice:</span>
                  <span className="text-green-600 font-medium">
                    Speech Synthesis
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="text-blue-600 font-medium">
                    {modelMode === 'local' ? 'WebLLM (Demo)' : 'OpenRouter'}
                  </span>
                </div>
              </div>
              
              {aiError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{aiError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
