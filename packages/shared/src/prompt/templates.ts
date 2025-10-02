/**
 * Message Template Engine
 * Handles dynamic message generation with variable substitution
 */

import type { MessageTemplates } from '../types/prompt.js';

interface TemplateVariables {
  diff_snippet?: string;
  minute?: number;
  problem_title?: string;
  elapsed_minutes?: number;
  code_language?: string;
  [key: string]: any;
}

/**
 * Substitute variables in a template string
 */
export const substituteTemplate = (template: string, variables: TemplateVariables): string => {
  let result = template;
  
  // Replace {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, String(value || ''));
  }
  
  return result;
};

/**
 * Generate message using templates from prompt config
 */
export class MessageTemplateEngine {
  private templates: MessageTemplates;

  constructor(templates: MessageTemplates) {
    this.templates = templates;
  }

  /**
   * Generate no context message
   */
  noContext(): string {
    return this.templates.no_context;
  }

  /**
   * Generate diff probe message
   */
  diffProbe(diffSnippet: string): string {
    return substituteTemplate(this.templates.diff_probe, {
      diff_snippet: diffSnippet
    });
  }

  /**
   * Generate time check message
   */
  timeCheck(minute: number): string {
    return substituteTemplate(this.templates.time_check, {
      minute: minute
    });
  }

  /**
   * Generate nudge focus message
   */
  nudgeFocus(): string {
    return this.templates.nudge_focus;
  }

  /**
   * Generate custom message with variables
   */
  custom(template: string, variables: TemplateVariables = {}): string {
    return substituteTemplate(template, variables);
  }
}

/**
 * Report Template Engine
 * Handles dynamic report generation
 */

interface ReportVariables {
  problem_title?: string;
  scores?: {
    problem_understanding?: number;
    approach_quality?: number;
    complexity?: number;
    edge_cases?: number;
    code_quality?: number;
    communication?: number;
  };
  strengths?: string;
  improvements?: string;
  summary?: string;
  approach?: string;
  diff_points?: string;
  next_steps?: string;
  [key: string]: any;
}

export class ReportTemplateEngine {
  /**
   * Generate markdown report using template
   */
  generateMarkdownReport(template: string, variables: ReportVariables): string {
    return substituteTemplate(template, variables);
  }

  /**
   * Generate summary using template
   */
  generateSummary(template: string, variables: ReportVariables): string {
    return substituteTemplate(template, variables);
  }

  /**
   * Format scores as markdown list
   */
  formatScores(scores: ReportVariables['scores']): string {
    if (!scores) return '';
    
    return Object.entries(scores)
      .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value}`)
      .join('\n');
  }

  /**
   * Format list items as markdown
   */
  formatList(items: string[]): string {
    return items.map(item => `- ${item}`).join('\n');
  }

  /**
   * Generate complete report with all sections
   */
  generateCompleteReport(
    markdownTemplate: string,
    summaryTemplate: string,
    variables: ReportVariables
  ): { markdown: string; summary: string } {
    const markdown = this.generateMarkdownReport(markdownTemplate, variables);
    const summary = this.generateSummary(summaryTemplate, variables);
    
    return { markdown, summary };
  }
}

/**
 * Session Context Builder
 * Builds context for AI prompts based on current state
 */

export interface SessionContext {
  problem?: {
    title: string;
    description: string;
  };
  code?: {
    language: string;
    text: string;
    last_diff?: string;
  };
  telemetry: {
    elapsed_sec: number;
    session_cap_sec: number;
  };
  capabilities: {
    stt: string;
    tts: string;
    screenshare: boolean;
    extension_payload: boolean;
  };
}

export class SessionContextBuilder {
  private context: SessionContext;

  constructor() {
    this.context = {
      telemetry: {
        elapsed_sec: 0,
        session_cap_sec: 1500 // 25 minutes default
      },
      capabilities: {
        stt: 'chrome_web_speech_api',
        tts: 'speechSynthesis',
        screenshare: true,
        extension_payload: true
      }
    };
  }

  setProblem(title: string, description: string): this {
    this.context.problem = { title, description };
    return this;
  }

  setCode(language: string, text: string, lastDiff?: string): this {
    this.context.code = { language, text, last_diff: lastDiff };
    return this;
  }

  setTelemetry(elapsedSec: number, sessionCapSec: number = 1500): this {
    this.context.telemetry = { elapsed_sec: elapsedSec, session_cap_sec: sessionCapSec };
    return this;
  }

  setCapabilities(capabilities: Partial<SessionContext['capabilities']>): this {
    this.context.capabilities = { ...this.context.capabilities, ...capabilities };
    return this;
  }

  build(): SessionContext {
    return { ...this.context };
  }

  /**
   * Check if context is complete for AI processing
   */
  hasCompleteContext(): boolean {
    return !!(this.context.problem && this.context.code);
  }

  /**
   * Get elapsed time in minutes
   */
  getElapsedMinutes(): number {
    return Math.floor(this.context.telemetry.elapsed_sec / 60);
  }
}
