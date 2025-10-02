import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  context?: {
    problem?: string;
    code?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { messages, model = 'openai/gpt-4o-mini', context }: ChatRequest = await request.json();
    
    // Validate API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('🔑 API Key check:', apiKey ? `Present (${apiKey.substring(0, 10)}...)` : 'Missing');
    
    if (!apiKey) {
      console.error('❌ OpenRouter API key not configured');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Prepare messages with context
    const enhancedMessages = [...messages];
    
    // Add context to system message if available
    if (context?.problem || context?.code) {
      const systemMessageIndex = enhancedMessages.findIndex(msg => msg.role === 'system');
      if (systemMessageIndex !== -1) {
        let contextInfo = '';
        if (context.problem) {
          contextInfo += `\n\nProblem Context: ${context.problem}`;
        }
        if (context.code) {
          contextInfo += `\n\nCode Context: ${context.code}`;
        }
        enhancedMessages[systemMessageIndex].content += contextInfo;
      }
    }

    console.log('📤 Sending request to OpenRouter:', {
      model,
      messageCount: enhancedMessages.length,
      hasContext: !!(context?.problem || context?.code),
      messages: enhancedMessages.map(m => ({ role: m.role, content: m.content.substring(0, 100) + '...' }))
    });

    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Optional: for OpenRouter analytics
        'X-Title': 'AI Interview Coach', // Optional: for OpenRouter analytics
      },
      body: JSON.stringify({
        model,
        messages: enhancedMessages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to get response from AI model',
          details: response.status === 401 ? 'Invalid API key' : errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log('✅ OpenRouter response received:', {
      model,
      responseLength: aiResponse.length,
      usage: data.usage
    });

    return NextResponse.json({
      success: true,
      message: aiResponse,
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    console.error('❌ Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log('🔍 Environment check:', {
    hasKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyStart: apiKey ? apiKey.substring(0, 10) + '...' : 'none',
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('OPEN'))
  });
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    hasKey: !!apiKey,
    keyInfo: {
      present: !!apiKey,
      length: apiKey ? apiKey.length : 0,
      startsWith: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    },
    features: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      models: ['openai/gpt-4o-mini', 'openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku']
    }
  });
}
