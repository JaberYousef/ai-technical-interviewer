/**
 * Speech Service - Uses only window.speechSynthesis for offline voice
 */

interface VoiceSettings {
  enabled: boolean;
  voiceName?: string;
  rate: number;
  pitch: number;
  volume: number;
}

class SpeechService {
  private settings: VoiceSettings = {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  };

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  /**
   * Get recommended voices (better quality)
   */
  getRecommendedVoices(): SpeechSynthesisVoice[] {
    const voices = this.getAvailableVoices();
    return voices.filter(voice => {
      const name = voice.name.toLowerCase();
      return (
        name.includes('google') ||
        name.includes('microsoft') ||
        name.includes('alex') ||
        name.includes('samantha') ||
        name.includes('daniel') ||
        name.includes('fiona')
      );
    });
  }

  /**
   * Set voice settings
   */
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  /**
   * Speak text using speechSynthesis
   */
  speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    if (!this.isSupported() || !this.settings.enabled || !text.trim()) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice
    if (this.settings.voiceName) {
      const voices = this.getAvailableVoices();
      const selectedVoice = voices.find(voice => voice.name === this.settings.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Set speech parameters
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    // Event handlers
    utterance.onstart = () => {
      console.log('🔊 Speech started:', text.substring(0, 50) + '...');
      onStart?.();
    };

    utterance.onend = () => {
      console.log('🔊 Speech ended');
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('🔊 Speech error:', event.error);
      onEnd?.();
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isSupported() && window.speechSynthesis.speaking;
  }

  /**
   * Auto-select best voice on load
   */
  initializeBestVoice(): void {
    if (!this.settings.voiceName) {
      const recommended = this.getRecommendedVoices();
      if (recommended.length > 0) {
        // Prefer male voices for interviewer
        const maleVoice = recommended.find(voice => 
          voice.name.toLowerCase().includes('male') || 
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('alex')
        );
        
        this.settings.voiceName = maleVoice?.name || recommended[0].name;
        console.log('🔊 Auto-selected voice:', this.settings.voiceName);
      }
    }
  }
}

// Export singleton instance
export const speechService = new SpeechService();

// Export types
export type { VoiceSettings };
