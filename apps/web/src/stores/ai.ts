import { create } from 'zustand';
import { webLLMService } from '@/services/webllm';

interface AIState {
  isActive: boolean;
  currentStage: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  lastMessage: string;
  isLoading: boolean;
  error: string | null;
  modelMode: 'local' | 'cloud';
  systemPrompt: string;
  
  // Actions
  startSession: (problem?: string, code?: string) => Promise<void>;
  sendMessage: (message: string, codeDiff?: string) => Promise<void>;
  updateContext: (context: any) => Promise<void>;
  generateReport: () => Promise<any>;
  resetSession: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setModelMode: (mode: 'local' | 'cloud') => void;
  initializeLocalModel: () => Promise<boolean>;
}

export const useAIStore = create<AIState>((set, get) => ({
  isActive: false,
  currentStage: 'intro',
  conversationHistory: [],
  lastMessage: '',
  isLoading: false,
  error: null,
  modelMode: 'local',
  systemPrompt: '',

  startSession: async (problem, code) => {
    set({ isLoading: true, error: null });
    
    try {
      // Load system prompt from PRD
      const prdResponse = await fetch('/api/prd');
      const prd = await prdResponse.json();
      
      // Get AI prompt configuration
      const promptResponse = await fetch('/api/ai?action=system_prompt');
      const promptResult = await promptResponse.json();
      
      const systemPrompt = promptResult.success ? promptResult.systemPrompt : 
        'You are a Senior Software Engineer interviewer conducting a realistic technical interview. Keep a professional, warm, and conversational tone. Be thoughtful and human-like in your responses. When a candidate shares their experience, ask follow-up questions to understand their thought process, challenges faced, and lessons learned. Show genuine interest in their problem-solving approach. Only move to algorithmic problems after having a meaningful conversation about their past experiences. Ask one question at a time and wait for their response before proceeding.';
      
      set({ systemPrompt });
      
      // Initialize local model if needed
      if (get().modelMode === 'local') {
        const initialized = await get().initializeLocalModel();
        if (!initialized) {
          throw new Error('Failed to initialize local model');
        }
      }
      
      // Start with initial AI message
      const initialMessage = problem && code ? 
        `Let's start the interview! I can see you're working on: ${problem}. Please explain your approach.` :
        'Hello! Welcome to your AI-powered technical interview. I\'m excited to learn about your problem-solving skills. Let\'s start with a warm-up question: Can you tell me about a challenging technical problem you\'ve solved recently?';
      
      set({
        isActive: true,
        currentStage: 'intro',
        lastMessage: initialMessage,
        conversationHistory: [{
          role: 'assistant',
          content: initialMessage,
          timestamp: new Date()
        }]
      });
      
    } catch (error) {
      set({ error: `Failed to start AI session: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (message, codeDiff) => {
    const state = get();
    console.log('🚀 AI Store: Starting sendMessage with:', { message, codeDiff, conversationLength: state.conversationHistory.length });
    set({ isLoading: true, error: null });

    try {
      let aiResponse: string;

      if (state.modelMode === 'local') {
        // Use WebLLM for local inference
        if (!webLLMService.isInitialized()) {
          await webLLMService.initialize();
        }
        
        const messages = [
          { role: 'system', content: state.systemPrompt || 'You are a Senior Software Engineer interviewer.' },
          ...state.conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message }
        ];
        
        console.log('📝 Messages being sent to AI:', messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' })));
        
        aiResponse = await webLLMService.generateResponse(messages);
      } else {
        // Use OpenRouter API for cloud inference
        const cloudMessages = [
          { role: 'system', content: state.systemPrompt || 'You are a Senior Software Engineer interviewer.' },
          ...state.conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
          { role: 'user', content: message }
        ];
        
        console.log('📝 Cloud messages being sent to AI:', cloudMessages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' })));
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: cloudMessages,
            model: 'openai/gpt-4o-mini'
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to get AI response');
        }
        
        aiResponse = result.message;
      }

      // Update conversation history
      const newConversationHistory = [
        ...state.conversationHistory,
        {
          role: 'user' as const,
          content: message,
          timestamp: new Date()
        },
        {
          role: 'assistant' as const,
          content: aiResponse,
          timestamp: new Date()
        }
      ];
      
      console.log('💾 AI Store: Updating conversation history:', newConversationHistory.length, 'total messages');
      
      set({
        lastMessage: aiResponse,
        conversationHistory: newConversationHistory
      });

    } catch (error) {
      set({ error: `Failed to send message to AI: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      set({ isLoading: false });
    }
  },

  updateContext: async (context) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update_context',
          data: context
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        set({ error: result.error });
      }
    } catch (error) {
      set({ error: 'Failed to update context' });
    } finally {
      set({ isLoading: false });
    }
  },

  generateReport: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate_report'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.report;
      } else {
        set({ error: result.error });
        return null;
      }
    } catch (error) {
      set({ error: 'Failed to generate report' });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  resetSession: () => {
    set({
      isActive: false,
      currentStage: 'intro',
      conversationHistory: [],
      lastMessage: '',
      error: null
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  setModelMode: (mode) => {
    set({ modelMode: mode });
    // Reset session when switching modes
    if (get().isActive) {
      get().resetSession();
    }
  },
  
  initializeLocalModel: async () => {
    if (!webLLMService.isSupported()) {
      set({ error: 'WebLLM not supported in this browser' });
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      await webLLMService.initialize();
      return true;
    } catch (error) {
      set({ error: `Failed to initialize WebLLM: ${error instanceof Error ? error.message : 'Unknown error'}` });
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
