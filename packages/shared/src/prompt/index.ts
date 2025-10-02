/**
 * Prompt module exports
 */

export { 
  loadAIPrompt, 
  getSystemPrompt, 
  getCurrentStage, 
  getPolicies, 
  getFewShotExamples,
  getRubric,
  getLLMConfig
} from './loader.js';

export { 
  MessageTemplateEngine, 
  ReportTemplateEngine, 
  SessionContextBuilder,
  substituteTemplate
} from './templates.js';

export type { AIIInterviewerPrompt } from '../types/prompt.js';
export type { SessionContext } from './templates.js';
