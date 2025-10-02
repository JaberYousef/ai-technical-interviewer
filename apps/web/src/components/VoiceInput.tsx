'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

type MicState = 'idle' | 'listening' | 'processing';

export default function VoiceInput({ onTranscription, disabled = false, className = '' }: VoiceInputProps) {
  const [micState, setMicState] = useState<MicState>('idle');
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [listeningTime, setListeningTime] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setMicState('listening');
        setTranscript('');
        setListeningTime(0);
        
        // Start 60-second timer
        listeningTimerRef.current = setInterval(() => {
          setListeningTime(prev => {
            if (prev >= 60) {
              // Auto-stop after 1 minute
              stopListening();
              return 60;
            }
            return prev + 1;
          });
        }, 1000);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          console.log('🎤 Final transcript:', finalTranscript);
          setMicState('processing');
          onTranscription(finalTranscript);
          setTranscript('');
          
          // Reset to idle after a short delay
          setTimeout(() => {
            setMicState('idle');
          }, 1000);
        }
      };

      recognition.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error);
        setMicState('idle');
        setTranscript('');
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          console.log('🎤 No speech detected, restarting...');
          // Don't show error for no speech, just restart
        } else {
          console.error('🎤 Speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        clearInterval(listeningTimerRef.current!);
        setListeningTime(0);
        if (micState === 'listening') {
          setMicState('idle');
        }
      };
    }
  }, [micState, onTranscription]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || disabled) return;
    
    setTranscript('');
    recognitionRef.current.start();
  }, [disabled]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    recognitionRef.current.stop();
  }, []);

  const handleMicClick = () => {
    if (micState === 'idle') {
      startListening();
    } else if (micState === 'listening') {
      stopListening();
    }
  };

  const getMicIcon = () => {
    switch (micState) {
      case 'idle':
        return '🎤';
      case 'listening':
        return '🔴';
      case 'processing':
        return '⏳';
      default:
        return '🎤';
    }
  };

  const getMicLabel = () => {
    switch (micState) {
      case 'idle':
        return 'Start Voice Input';
      case 'listening':
        return `Listening... (${listeningTime}s) Click to stop`;
      case 'processing':
        return 'Processing...';
      default:
        return 'Voice Input';
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
        <p className="text-yellow-800 text-sm">
          Voice input not supported in this browser. Please use Chrome or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {/* Microphone Button */}
      <button
        onClick={handleMicClick}
        disabled={disabled || micState === 'processing'}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl
          transition-all duration-200 transform hover:scale-105
          ${micState === 'listening' 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : micState === 'processing'
            ? 'bg-blue-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          shadow-lg
        `}
        title={getMicLabel()}
      >
        {getMicIcon()}
      </button>

      {/* Status Text */}
      <p className={`text-sm font-medium ${
        micState === 'listening' ? 'text-red-600' : 
        micState === 'processing' ? 'text-blue-600' : 
        'text-gray-600'
      }`}>
        {getMicLabel()}
      </p>

      {/* Live Transcript */}
      {transcript && (
        <div className="w-full max-w-md p-3 bg-gray-100 rounded-lg border">
          <p className="text-sm text-gray-700 italic">
            "{transcript}"
          </p>
        </div>
      )}
    </div>
  );
}
