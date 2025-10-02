/**
 * WebLLM Integration Service
 * Handles local LLM inference using WebLLM
 */

interface WebLLMModel {
  name: string;
  url: string;
  size: string;
}

interface WebLLMConfig {
  model: string;
  maxTokens?: number;
  temperature?: number;
}

class WebLLMService {
  private initialized = false;
  private model: any = null;
  private config: WebLLMConfig;

  constructor() {
    this.config = {
      model: 'mistral-7b-instruct',
      maxTokens: 500,
      temperature: 0.7
    };
  }

  /**
   * Check if WebLLM is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
           'navigator' in window && 
           'gpu' in navigator;
  }

  /**
   * Initialize WebLLM with the specified model
   * For demo purposes, we'll use a mock response instead of loading the heavy model
   */
  async initialize(modelName?: string): Promise<boolean> {
    console.log('🚀 Initializing Local AI (Demo Mode)...');
    
    // For demo purposes, we'll simulate successful initialization
    // In a real implementation, you would load WebLLM here
    this.initialized = true;
    console.log('✅ Local AI initialized successfully (Demo Mode)');
    
    return true;
  }

  /**
   * Generate response from the model
   * For demo purposes, we'll use a simple context-aware response generator
   */
  async generateResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.initialized) {
      throw new Error('Local AI not initialized');
    }

    try {
      console.log('🤖 Generating response with Local AI (Demo Mode)...');
      console.log('📝 Conversation history:', messages.map(m => `${m.role}: ${m.content.substring(0, 50)}...`));
      
      // Get the last user message and conversation context
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      const lastAIMessage = messages.filter(msg => msg.role === 'assistant').pop();
      const conversationLength = messages.filter(msg => msg.role === 'user').length;
      
      const userContent = lastUserMessage?.content.toLowerCase() || '';
      const aiContent = lastAIMessage?.content.toLowerCase() || '';
      
      // Generate context-aware responses based on conversation flow
      let response = '';
      
      // First response (greeting)
      if (conversationLength === 1) {
        response = "Hello! Welcome to your AI-powered technical interview. I'm excited to learn about your problem-solving skills. Let's start with a warm-up question: Can you tell me about a challenging technical problem you've solved recently?";
      }
      // Second response - analyze their problem
      else if (conversationLength === 2) {
        if (userContent.includes('sql') || userContent.includes('database') || userContent.includes('query')) {
          response = "That's interesting! SQL optimization is a crucial skill. What specific techniques did you use to improve the query performance? Did you use indexing, query restructuring, or other approaches?";
        } else if (userContent.includes('api') || userContent.includes('service') || userContent.includes('microservice')) {
          response = "Great! API and service optimization shows strong backend skills. What was the bottleneck you identified? How did you measure the performance improvement?";
        } else if (userContent.includes('frontend') || userContent.includes('ui') || userContent.includes('react') || userContent.includes('javascript')) {
          response = "Excellent! Frontend performance is often overlooked. What specific issue were you solving? Was it bundle size, rendering performance, or something else?";
        } else if (userContent.includes('algorithm') || userContent.includes('complexity') || userContent.includes('data structure')) {
          response = "That's a solid algorithmic challenge! What data structure or algorithm did you implement? How did you analyze the time and space complexity?";
        } else {
          response = "That sounds like a challenging problem! Can you walk me through your approach step by step? What was the most difficult part of the solution?";
        }
      }
      // Third response - dive deeper
      else if (conversationLength === 3) {
        if (userContent.includes('index') || userContent.includes('optimization') || userContent.includes('performance')) {
          response = "Good insights! You're thinking like a senior engineer. Now let's move to coding. I'd like you to implement a function that finds the two numbers in an array that add up to a target sum. Take your time and think out loud.";
        } else if (userContent.includes('complexity') || userContent.includes('time') || userContent.includes('space')) {
          response = "Excellent analysis! You're showing good understanding of algorithmic complexity. Now let's implement a solution. Can you write a function to reverse a linked list?";
        } else {
          response = "Nice approach! I can see you're thinking systematically. Let's move to some coding now. Can you implement a function that checks if a string is a palindrome?";
        }
      }
      // Fourth response - coding follow-up
      else if (conversationLength === 4) {
        if (userContent.includes('hash') || userContent.includes('map') || userContent.includes('dictionary')) {
          response = "Great choice of data structure! The hash map approach is efficient. What's the time and space complexity? Can you think of any edge cases we should consider?";
        } else if (userContent.includes('pointer') || userContent.includes('iteration') || userContent.includes('loop')) {
          response = "Good iterative approach! You're thinking about the algorithm step by step. How would you handle edge cases like an empty list or a single node?";
        } else {
          response = "Interesting solution! Can you explain the time and space complexity? How would you test this function to make sure it works correctly?";
        }
      }
      // Fifth response - system design
      else if (conversationLength === 5) {
        response = "Excellent! You're showing strong problem-solving skills. Let's move on to system design. How would you design a URL shortening service like bit.ly? Think about scalability, storage, and performance.";
      }
      // Sixth response - system design follow-up
      else if (conversationLength === 6) {
        if (userContent.includes('database') || userContent.includes('storage') || userContent.includes('redis') || userContent.includes('cache')) {
          response = "Good architectural thinking! You're considering the right components. What about data consistency? How would you handle the case where multiple users try to create the same short URL?";
        } else {
          response = "That's a solid approach! What about handling high traffic? How would you scale this system to handle millions of requests per day?";
        }
      }
      // Seventh response - behavioral
      else if (conversationLength === 7) {
        response = "Great system design thinking! Now let's wrap up with a behavioral question: Tell me about a time when you had to work with a difficult team member. How did you handle the situation?";
      }
      // Eighth response - wrap up
      else if (conversationLength === 8) {
        response = "That shows great emotional intelligence and problem-solving skills. You've demonstrated strong technical knowledge and good communication throughout our conversation. Do you have any questions for me about the role or the company?";
      }
      // Final response
      else {
        response = "Thank you for asking! That shows you're thinking about the role holistically. You've done really well in this interview - you've shown strong problem-solving skills, clear communication, and good technical depth. We'll be in touch soon!";
      }
      
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('✅ Local AI response generated (Demo Mode)');
      return response;
    } catch (error) {
      console.error('❌ Local AI generation failed:', error);
      throw new Error(`Local AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format messages for the model
   */
  private formatMessages(messages: Array<{ role: string; content: string }>): string {
    let prompt = '';
    
    messages.forEach((message) => {
      switch (message.role) {
        case 'system':
          prompt += `System: ${message.content}\n\n`;
          break;
        case 'user':
          prompt += `Human: ${message.content}\n\n`;
          break;
        case 'assistant':
          prompt += `Assistant: ${message.content}\n\n`;
          break;
      }
    });
    
    prompt += 'Assistant: ';
    return prompt;
  }

  /**
   * Get available models
   */
  getAvailableModels(): WebLLMModel[] {
    return [
      {
        name: 'mistral-7b-instruct',
        url: 'https://huggingface.co/mlc-ai/Mistral-7B-Instruct-v0.2-q4f16_1-MLC',
        size: '4.1GB'
      },
      {
        name: 'llama-2-7b-chat',
        url: 'https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f16_1-MLC',
        size: '3.8GB'
      },
      {
        name: 'codellama-7b-instruct',
        url: 'https://huggingface.co/mlc-ai/CodeLlama-7b-Instruct-hf-q4f16_1-MLC',
        size: '3.9GB'
      }
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WebLLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the service
   */
  reset(): void {
    this.initialized = false;
    this.model = null;
  }

  /**
   * Get memory usage info
   */
  async getMemoryInfo(): Promise<{ used: number; total: number }> {
    if (!this.initialized) {
      return { used: 0, total: 0 };
    }

    try {
      // This would be implemented based on WebLLM's memory API
      // For now, return placeholder values
      return {
        used: 0,
        total: 0
      };
    } catch (error) {
      console.error('Failed to get memory info:', error);
      return { used: 0, total: 0 };
    }
  }
}

// Export singleton instance
export const webLLMService = new WebLLMService();

// Export types
export type { WebLLMModel, WebLLMConfig };
