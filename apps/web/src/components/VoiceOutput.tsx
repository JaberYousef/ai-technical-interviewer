'use client';

import { useState, useEffect } from 'react';
import { speechService } from '@/services/speech';

interface VoiceOutputProps {
  text: string;
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

export default function VoiceOutput({ 
  text, 
  autoPlay = false,
  onPlayStart, 
  onPlayEnd,
  className = '' 
}: VoiceOutputProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-play when component mounts
  useEffect(() => {
    if (autoPlay && text.trim()) {
      setTimeout(() => {
        handlePlay();
      }, 500); // Small delay to ensure component is ready
    }
  }, [autoPlay, text]);


  // Initialize speech service on mount
  useEffect(() => {
    speechService.initializeBestVoice();
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      // Stop current playback
      speechService.stop();
      setIsPlaying(false);
      onPlayEnd?.();
    } else {
      // Start playback using speech service
      setError(null);
      speechService.speak(text, () => {
        setIsPlaying(true);
        onPlayStart?.();
      }, () => {
        setIsPlaying(false);
        onPlayEnd?.();
      });
    }
  };

  const getButtonIcon = () => {
    if (isPlaying) return '⏸️';
    return '🔊';
  };

  const getButtonLabel = () => {
    if (isPlaying) return 'Stop speaking';
    return 'Play audio';
  };

  // Listen for custom events to auto-play the latest message
  useEffect(() => {
    const handlePlayLatestMessage = (event: CustomEvent) => {
      if (event.detail?.text === text) {
        console.log('🔊 VoiceOutput: Received playLatestMessage event for:', text.substring(0, 50) + '...');
        setTimeout(() => {
          handlePlay();
        }, 200); // Small delay to ensure the message is visible
      }
    };

    window.addEventListener('playLatestMessage', handlePlayLatestMessage as EventListener);
    
    return () => {
      window.removeEventListener('playLatestMessage', handlePlayLatestMessage as EventListener);
    };
  }, [text, handlePlay]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handlePlay}
        disabled={!text.trim()}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          transition-all duration-200 transform hover:scale-105
          ${isPlaying 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
          }
          cursor-pointer
          shadow-md
        `}
        title={getButtonLabel()}
      >
        <span className="text-lg">{getButtonIcon()}</span>
        <span className="text-sm font-medium">{getButtonLabel()}</span>
      </button>

      {/* Voice indicator */}
      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
        🔊 Speech Synthesis
      </span>

      {/* Error display */}
      {error && (
        <div className="text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
