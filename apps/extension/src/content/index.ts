/**
 * LeetCode Content Script
 * Extracts problem title, description, and editor code for AI Interview Coach
 */

interface LeetCodeData {
  problemTitle: string;
  problemDescription: string;
  editorCode: string;
  difficulty: string;
  url: string;
  timestamp: string;
}

class LeetCodeExtractor {
  private lastExtractedData: LeetCodeData | null = null;
  private extractionInterval: number = 2000; // 2 seconds as per techstack.json

  constructor() {
    this.startExtraction();
    this.setupMessageListener();
  }

  private startExtraction(): void {
    // Initial extraction
    this.extractData();
    
    // Set up interval for continuous extraction
    setInterval(() => {
      this.extractData();
    }, this.extractionInterval);
  }

  private extractData(): void {
    try {
      const data = this.extractLeetCodeData();
      
      // Only send if data has changed
      if (data && this.hasDataChanged(data)) {
        this.lastExtractedData = data;
        this.sendDataToBackground(data);
        console.log('📊 LeetCode data extracted:', data);
      }
    } catch (error) {
      console.error('❌ Error extracting LeetCode data:', error);
    }
  }

  private extractLeetCodeData(): LeetCodeData | null {
    const problemTitle = this.extractProblemTitle();
    const problemDescription = this.extractProblemDescription();
    const editorCode = this.extractEditorCode();
    const difficulty = this.extractDifficulty();

    // Only return data if we have at least the problem title
    if (!problemTitle) {
      return null;
    }

    return {
      problemTitle,
      problemDescription,
      editorCode,
      difficulty,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  private extractProblemTitle(): string {
    // Try multiple selectors for problem title
    const selectors = [
      'h1[data-cy="question-title"]',
      '.css-v3d350',
      '[data-cy="question-title"]',
      'h1',
      '.question-title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent?.trim()) {
        return element.textContent.trim();
      }
    }

    return '';
  }

  private extractProblemDescription(): string {
    // Try multiple selectors for problem description
    const selectors = [
      '[data-cy="question-detail-main-tabs"] .content__u3I1',
      '.question-content',
      '[data-cy="question-detail-main-tabs"]',
      '.content__u3I1',
      '.question-description'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // Clean up the description text
        let description = element.textContent || '';
        description = description.replace(/\s+/g, ' ').trim();
        
        if (description.length > 50) { // Ensure we have substantial content
          return description;
        }
      }
    }

    return '';
  }

  private extractEditorCode(): string {
    // Try multiple selectors for code editor
    const selectors = [
      '.monaco-editor .view-lines',
      '.CodeMirror-code',
      '[data-cy="code-editor"]',
      '.monaco-editor',
      'textarea[data-cy="code-editor"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        // For Monaco editor, try to get the actual code
        if (element.classList.contains('monaco-editor')) {
          // Try to access Monaco editor instance
          const editorElement = element as any;
          if (editorElement._editor && editorElement._editor.getValue) {
            return editorElement._editor.getValue();
          }
        }
        
        // Fallback to text content
        const code = element.textContent || '';
        if (code.trim().length > 10) {
          return code.trim();
        }
      }
    }

    // Try to find code in textarea
    const textarea = document.querySelector('textarea[data-cy="code-editor"]') as HTMLTextAreaElement;
    if (textarea && textarea.value) {
      return textarea.value;
    }

    return '';
  }

  private extractDifficulty(): string {
    const selectors = [
      '[data-cy="question-detail-main-tabs"] .css-10o4wqw',
      '.difficulty-badge',
      '.css-t42afm',
      '[data-difficulty]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const difficulty = element.textContent?.toLowerCase().trim();
        if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
          return difficulty;
        }
      }
    }

    return '';
  }

  private hasDataChanged(newData: LeetCodeData): boolean {
    if (!this.lastExtractedData) {
      return true;
    }

    return (
      newData.problemTitle !== this.lastExtractedData.problemTitle ||
      newData.editorCode !== this.lastExtractedData.editorCode ||
      newData.difficulty !== this.lastExtractedData.difficulty
    );
  }

  private sendDataToBackground(data: LeetCodeData): void {
    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'LEETCODE_DATA',
      data: data
    }).catch(error => {
      console.error('Failed to send data to background:', error);
    });
  }

  private setupMessageListener(): void {
    // Listen for messages from popup or background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'GET_LEETCODE_DATA') {
        const currentData = this.extractLeetCodeData();
        sendResponse(currentData);
      }
      
      if (request.type === 'EXTRACT_NOW') {
        this.extractData();
        const currentData = this.extractLeetCodeData();
        sendResponse(currentData);
      }
    });
  }
}

// Initialize the extractor when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new LeetCodeExtractor();
  });
} else {
  new LeetCodeExtractor();
}

// Export for testing
export { LeetCodeExtractor };
