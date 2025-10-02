import { NextRequest, NextResponse } from 'next/server';
import { AIIInterviewer } from '@shared/ai/interviewer';

// Global interviewer instance (in production, this would be managed differently)
let interviewer: AIIInterviewer | null = null;

function getInterviewer(): AIIInterviewer {
  if (!interviewer) {
    interviewer = new AIIInterviewer();
  }
  return interviewer;
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    const ai = getInterviewer();

    switch (type) {
      case 'start_session':
        ai.resetSession();
        ai.updateContext({
          problem: data.problem,
          code: data.code,
          telemetry: { elapsed_sec: 0, session_cap_sec: data.sessionCapSec || 1500 }
        });
        
        const welcomeMessage = ai.generateNextQuestion();
        
        return NextResponse.json({
          success: true,
          message: welcomeMessage,
          stage: ai.getState().currentStage.stage
        });

      case 'user_message':
        const response = ai.generateAIResponse(data.message, data.codeDiff);
        
        return NextResponse.json({
          success: true,
          message: response,
          stage: ai.getState().currentStage.stage,
          elapsedMinutes: Math.floor((Date.now() - ai.getState().sessionStartTime.getTime()) / (1000 * 60))
        });

      case 'update_context':
        ai.updateContext(data);
        
        return NextResponse.json({
          success: true,
          context: ai.getState().context
        });

      case 'get_system_prompt':
        return NextResponse.json({
          success: true,
          systemPrompt: ai.getSystemPrompt()
        });

      case 'generate_report':
        const report = ai.generateFinalReport();
        
        return NextResponse.json({
          success: true,
          report: report
        });

      case 'get_state':
        return NextResponse.json({
          success: true,
          state: ai.getState()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ai = getInterviewer();
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'system_prompt':
        return NextResponse.json({
          success: true,
          systemPrompt: ai.getSystemPrompt()
        });

      case 'state':
        return NextResponse.json({
          success: true,
          state: ai.getState()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
