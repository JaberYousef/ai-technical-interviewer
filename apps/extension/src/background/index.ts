/**
 * Background Service Worker (MV3)
 * Handles messaging bridge between content script and web app via SSE
 */

interface LeetCodeData {
  problemTitle: string;
  problemDescription: string;
  editorCode: string;
  difficulty: string;
  url: string;
  timestamp: string;
}

interface SessionMessage {
  type: 'LEETCODE_DATA' | 'SESSION_START' | 'SESSION_END';
  data: LeetCodeData | any;
  sessionId?: string;
}

class ExtensionBackground {
  private currentSessionId: string | null = null;
  private hubUrl: string;
  private messageQueue: SessionMessage[] = [];

  constructor() {
    // Get hub URL from environment or use default
    this.hubUrl = this.getHubUrl();
    this.setupMessageListener();
    this.setupInstallListener();
    console.log('🚀 AI Interview Coach Extension Background loaded');
  }

  private getHubUrl(): string {
    // In production, this would come from environment variables
    // For now, default to localhost development server
    return 'http://localhost:3000/api/hub/push';
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message: SessionMessage, sender, sendResponse) => {
      console.log('📨 Background received message:', message);

      switch (message.type) {
        case 'LEETCODE_DATA':
          this.handleLeetCodeData(message.data);
          break;
        
        case 'SESSION_START':
          this.handleSessionStart(message.data);
          break;
        
        case 'SESSION_END':
          this.handleSessionEnd(message.data);
          break;
        
        default:
          console.warn('Unknown message type:', message.type);
      }

      sendResponse({ success: true });
    });
  }

  private setupInstallListener(): void {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('🎉 AI Interview Coach Extension installed');
        
        // Set default settings
        chrome.storage.local.set({
          hubUrl: this.hubUrl,
          extractionInterval: 2000,
          enabled: true
        });
      }
    });
  }

  private handleLeetCodeData(data: LeetCodeData): void {
    if (!this.currentSessionId) {
      console.log('⚠️ No active session, queuing data');
      this.messageQueue.push({ type: 'LEETCODE_DATA', data });
      return;
    }

    this.sendToHub({
      type: 'code_update',
      sessionId: this.currentSessionId,
      data: data
    });
  }

  private handleSessionStart(data: any): void {
    this.currentSessionId = data.sessionId || this.generateSessionId();
    console.log('🎯 Session started:', this.currentSessionId);

    // Send queued messages
    this.flushMessageQueue();

    this.sendToHub({
      type: 'session_start',
      sessionId: this.currentSessionId,
      data: data
    });
  }

  private handleSessionEnd(data: any): void {
    console.log('🏁 Session ended:', this.currentSessionId);

    if (this.currentSessionId) {
      this.sendToHub({
        type: 'session_end',
        sessionId: this.currentSessionId,
        data: data
      });
    }

    this.currentSessionId = null;
    this.messageQueue = [];
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.currentSessionId) {
        this.sendToHub({
          type: 'code_update',
          sessionId: this.currentSessionId,
          data: message.data
        });
      }
    }
  }

  private async sendToHub(payload: any): Promise<void> {
    try {
      console.log('📤 Sending to hub:', payload);

      const response = await fetch(this.hubUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Hub request failed: ${response.status}`);
      }

      console.log('✅ Successfully sent to hub');
    } catch (error) {
      console.error('❌ Failed to send to hub:', error);
      
      // Retry logic could be added here
      // For now, just log the error
    }
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external access
  public getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  public isSessionActive(): boolean {
    return this.currentSessionId !== null;
  }
}

// Initialize the background service
const background = new ExtensionBackground();

// Make it globally available for debugging
(globalThis as any).extensionBackground = background;

export default background;
