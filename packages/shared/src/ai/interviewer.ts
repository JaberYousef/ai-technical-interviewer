/**
 * AI Interviewer Service
 * Integrates prompt configuration with runtime AI interactions
 */

import { loadAIPrompt, getSystemPrompt, getCurrentStage, getPolicies, getFewShotExamples } from '../prompt/loader';
import { MessageTemplateEngine, ReportTemplateEngine, SessionContextBuilder } from '../prompt/templates';
import type { AIIInterviewerPrompt, SessionStage } from '../types/prompt';
import type { SessionContext } from '../prompt/templates';

export interface InterviewerState {
  currentStage: SessionStage;
  sessionStartTime: Date;
  lastCodeDiff?: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  context: SessionContext;
}

export class AIIInterviewer {
  private prompt: AIIInterviewerPrompt;
  private messageEngine: MessageTemplateEngine;
  private reportEngine: ReportTemplateEngine;
  private state: InterviewerState;

  constructor() {
    // Load prompt configuration
    this.prompt = loadAIPrompt();
    this.messageEngine = new MessageTemplateEngine(this.prompt.message_templates);
    this.reportEngine = new ReportTemplateEngine();
    
    // Initialize state
    this.state = {
      currentStage: this.prompt.session_flow[0],
      sessionStartTime: new Date(),
      conversationHistory: [],
      context: new SessionContextBuilder().build()
    };
  }

  /**
   * Get system prompt for AI model
   */
  getSystemPrompt(): string {
    const basePrompt = getSystemPrompt(this.prompt);
    const safetyPrompt = this.prompt.roles.safety;
    
    return `${basePrompt}\n\nSafety Guidelines: ${safetyPrompt}`;
  }

  /**
   * Update session context
   */
  updateContext(updates: Partial<SessionContext>): void {
    this.state.context = { ...this.state.context, ...updates };
    
    // Update current stage based on new context
    const elapsedMinutes = this.getElapsedMinutes();
    const hasProblem = !!(this.state.context.problem?.title);
    const hasCode = !!(this.state.context.code?.text);
    
    this.state.currentStage = getCurrentStage(
      this.prompt,
      elapsedMinutes,
      hasCode,
      hasProblem
    );
  }

  /**
   * Generate next question based on current stage and context
   */
  generateNextQuestion(): string {
    const policies = getPolicies(this.prompt);
    const elapsedMinutes = this.getElapsedMinutes();

    // Check for time-based prompts
    if (policies.soft_time_checks_minutes.includes(elapsedMinutes)) {
      return this.messageEngine.timeCheck(elapsedMinutes);
    }

    // Check for wrap-up time
    if (elapsedMinutes >= policies.wrap_up_at_minutes) {
      return this.state.currentStage.prompt;
    }

    // Check for no context
    if (!this.state.context.problem || !this.state.context.code) {
      return this.messageEngine.noContext();
    }

    // Check for code diff follow-up
    if (this.state.lastCodeDiff && policies.follow_up_on_diffs) {
      return this.messageEngine.diffProbe(this.state.lastCodeDiff);
    }

    // Use current stage prompt
    return this.state.currentStage.prompt;
  }

  /**
   * Process user response and update state
   */
  processUserResponse(content: string, codeDiff?: string): void {
    // Add user message to history
    this.state.conversationHistory.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    // Update code diff if provided
    if (codeDiff) {
      this.state.lastCodeDiff = codeDiff;
    }

    // Update context with new code if available
    if (this.state.context.code && codeDiff) {
      this.updateContext({
        code: {
          ...this.state.context.code,
          last_diff: codeDiff
        }
      });
    }
  }

  /**
   * Generate AI response
   */
  generateAIResponse(userMessage: string, codeDiff?: string): string {
    // Process user response
    this.processUserResponse(userMessage, codeDiff);

    // Generate appropriate response based on context
    const elapsedMinutes = this.getElapsedMinutes();
    const policies = getPolicies(this.prompt);

    // Check if we should wrap up
    if (elapsedMinutes >= policies.wrap_up_at_minutes) {
      return this.generateWrapUpResponse();
    }

    // Check for edge cases discussion
    if (elapsedMinutes >= policies.edge_cases_after_minutes && 
        this.state.currentStage.stage === 'approach_probe') {
      return this.prompt.session_flow.find(s => s.stage === 'edge_cases')?.prompt || 
             this.generateNextQuestion();
    }

    // Generate follow-up question
    const response = this.generateNextQuestion();

    // Add AI response to history
    this.state.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    return response;
  }

  /**
   * Generate wrap-up response with rubric feedback
   */
  private generateWrapUpResponse(): string {
    const wrapUpStage = this.prompt.session_flow.find(s => s.stage === 'wrap');
    if (!wrapUpStage) {
      return "Let's wrap up this session. I'll provide feedback shortly.";
    }

    // Add wrap-up to history
    this.state.conversationHistory.push({
      role: 'assistant',
      content: wrapUpStage.prompt,
      timestamp: new Date()
    });

    return wrapUpStage.prompt;
  }

  /**
   * Generate final report using templates
   */
  generateFinalReport(): { markdown: string; summary: string } {
    const scores = this.generateRubricScores();
    const strengths = this.generateStrengths(scores);
    const improvements = this.generateImprovements(scores);
    const summary = this.generateSummary();

    const variables = {
      problem_title: this.state.context.problem?.title || 'Unknown Problem',
      scores: scores,
      strengths: this.reportEngine.formatList(strengths),
      improvements: this.reportEngine.formatList(improvements),
      summary: summary,
      approach: this.extractApproach(),
      diff_points: this.extractKeyChanges(),
      next_steps: this.generateNextSteps()
    };

    return this.reportEngine.generateCompleteReport(
      this.prompt.report_templates.markdown,
      this.prompt.report_templates.summary,
      variables
    );
  }

  /**
   * Generate rubric scores based on conversation
   */
  private generateRubricScores(): any {
    // This would be enhanced with actual AI scoring in a real implementation
    // For now, generate reasonable scores based on conversation analysis
    const rubric = this.prompt.rubric;
    const scores: any = {};

    rubric.dimensions.forEach(dimension => {
      const key = dimension.toLowerCase().replace(/\s+/g, '_');
      
      // Simple scoring logic based on conversation length and context
      if (this.state.conversationHistory.length > 10 && this.state.context.code?.text) {
        scores[key] = Math.floor(Math.random() * 2) + 4; // 4-5 range
      } else if (this.state.conversationHistory.length > 5) {
        scores[key] = Math.floor(Math.random() * 2) + 3; // 3-4 range
      } else {
        scores[key] = Math.floor(Math.random() * 2) + 2; // 2-3 range
      }
    });

    return scores;
  }

  /**
   * Generate strengths based on scores
   */
  private generateStrengths(scores: any): string[] {
    const strengths: string[] = [];
    
    Object.entries(scores).forEach(([dimension, score]) => {
      if (typeof score === 'number' && score >= 4) {
        strengths.push(`Strong ${dimension.replace(/_/g, ' ')}`);
      }
    });

    return strengths.length > 0 ? strengths : ['Good effort and engagement'];
  }

  /**
   * Generate improvements based on scores
   */
  private generateImprovements(scores: any): string[] {
    const improvements: string[] = [];
    
    Object.entries(scores).forEach(([dimension, score]) => {
      if (typeof score === 'number' && score <= 3) {
        improvements.push(`Focus on ${dimension.replace(/_/g, ' ')}`);
      }
    });

    return improvements.length > 0 ? improvements : ['Continue practicing similar problems'];
  }

  /**
   * Generate summary of the session
   */
  private generateSummary(): string {
    const problemTitle = this.state.context.problem?.title || 'the problem';
    const elapsedMinutes = this.getElapsedMinutes();
    const messageCount = this.state.conversationHistory.length;
    
    return `You worked on ${problemTitle} for ${elapsedMinutes} minutes with ${messageCount} exchanges. You demonstrated good problem-solving approach and engaged well with the interview process.`;
  }

  /**
   * Extract approach from conversation
   */
  private extractApproach(): string {
    // Look for approach-related messages in conversation
    const approachMessages = this.state.conversationHistory.filter(msg => 
      msg.role === 'user' && 
      (msg.content.includes('approach') || msg.content.includes('algorithm') || msg.content.includes('data structure'))
    );
    
    return approachMessages.length > 0 ? 
           approachMessages[0].content.substring(0, 100) + '...' : 
           'Standard algorithmic approach';
  }

  /**
   * Extract key changes from code diffs
   */
  private extractKeyChanges(): string {
    return this.state.lastCodeDiff ? 
           'Code improvements and optimizations' : 
           'No significant code changes tracked';
  }

  /**
   * Generate next steps recommendations
   */
  private generateNextSteps(): string {
    return 'Practice more problems in similar domains and focus on edge case handling';
  }

  /**
   * Get elapsed time in minutes
   */
  private getElapsedMinutes(): number {
    const elapsedMs = Date.now() - this.state.sessionStartTime.getTime();
    return Math.floor(elapsedMs / (1000 * 60));
  }

  /**
   * Get current session state
   */
  getState(): InterviewerState {
    return { ...this.state };
  }

  /**
   * Reset session state
   */
  resetSession(): void {
    this.state = {
      currentStage: this.prompt.session_flow[0],
      sessionStartTime: new Date(),
      conversationHistory: [],
      context: new SessionContextBuilder().build()
    };
  }
}
