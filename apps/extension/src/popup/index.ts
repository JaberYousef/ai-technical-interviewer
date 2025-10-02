/**
 * Popup Script for AI Interview Coach Extension
 */

interface LeetCodeData {
  problemTitle: string;
  problemDescription: string;
  editorCode: string;
  difficulty: string;
  url: string;
  timestamp: string;
}

class PopupController {
  private statusDot: HTMLElement;
  private statusText: HTMLElement;
  private currentData: HTMLElement;
  private extractBtn: HTMLElement;
  private openWebBtn: HTMLElement;
  private settingsBtn: HTMLElement;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.checkStatus();
  }

  private initializeElements(): void {
    this.statusDot = document.getElementById('statusDot')!;
    this.statusText = document.getElementById('statusText')!;
    this.currentData = document.getElementById('currentData')!;
    this.extractBtn = document.getElementById('extractBtn')!;
    this.openWebBtn = document.getElementById('openWebBtn')!;
    this.settingsBtn = document.getElementById('settingsBtn')!;
  }

  private setupEventListeners(): void {
    this.extractBtn.addEventListener('click', () => this.extractCurrentData());
    this.openWebBtn.addEventListener('click', () => this.openWebApp());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
  }

  private async checkStatus(): Promise<void> {
    try {
      // Check if we're on a LeetCode page
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        this.setStatus('error', 'No active tab');
        return;
      }

      if (tab.url?.includes('leetcode.com')) {
        this.setStatus('active', 'On LeetCode');
        await this.loadCurrentData();
      } else {
        this.setStatus('inactive', 'Not on LeetCode');
        this.currentData.textContent = 'Navigate to LeetCode to extract data';
      }
    } catch (error) {
      console.error('Error checking status:', error);
      this.setStatus('error', 'Error checking status');
    }
  }

  private async loadCurrentData(): Promise<void> {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) return;

      // Send message to content script to get current data
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_LEETCODE_DATA' });
      
      if (response) {
        this.displayCurrentData(response);
      } else {
        this.currentData.textContent = 'No data extracted yet';
      }
    } catch (error) {
      console.error('Error loading current data:', error);
      this.currentData.textContent = 'Error loading data';
    }
  }

  private displayCurrentData(data: LeetCodeData): void {
    const title = data.problemTitle || 'Unknown Problem';
    const difficulty = data.difficulty ? ` (${data.difficulty})` : '';
    const hasCode = data.editorCode ? ' + Code' : '';
    
    this.currentData.textContent = `${title}${difficulty}${hasCode}`;
  }

  private async extractCurrentData(): Promise<void> {
    try {
      this.extractBtn.textContent = 'Extracting...';
      this.extractBtn.setAttribute('disabled', 'true');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.id) {
        throw new Error('No active tab');
      }

      // Send message to content script to extract data immediately
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_NOW' });
      
      if (response) {
        this.displayCurrentData(response);
        this.setStatus('active', 'Data extracted');
        
        // Show success feedback
        setTimeout(() => {
          this.extractBtn.textContent = 'Extract Current Data';
          this.extractBtn.removeAttribute('disabled');
        }, 1000);
      } else {
        throw new Error('No data extracted');
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      this.setStatus('error', 'Extraction failed');
      this.extractBtn.textContent = 'Extract Current Data';
      this.extractBtn.removeAttribute('disabled');
    }
  }

  private openWebApp(): void {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }

  private openSettings(): void {
    chrome.tabs.create({ url: 'http://localhost:3000/settings' });
  }

  private setStatus(status: 'active' | 'inactive' | 'error', text: string): void {
    this.statusDot.className = `status-dot ${status}`;
    this.statusText.textContent = text;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

export default PopupController;
