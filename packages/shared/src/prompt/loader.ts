/**
 * AI Interviewer Prompt Loader
 * Loads and manages the prompt configuration from docs/ai_interviewer_prompt.json
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AIIInterviewerPrompt } from '../types/prompt.js';

// Get the project root directory
const getProjectRoot = (): string => {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, '..', '..', '..', '..');
};

const PROJECT_ROOT = getProjectRoot();

/**
 * Load AI Interviewer Prompt configuration from docs/ai_interviewer_prompt.json
 */
export const loadAIPrompt = (): AIIInterviewerPrompt => {
  try {
    const promptPath = join(PROJECT_ROOT, 'docs', 'ai_interviewer_prompt.json');
    const promptContent = readFileSync(promptPath, 'utf-8');
    const prompt: AIIInterviewerPrompt = JSON.parse(promptContent);
    
    console.log('✅ AI Interviewer Prompt loaded successfully');
    return prompt;
  } catch (error) {
    console.error('❌ Failed to load AI Interviewer Prompt:', error);
    throw new Error(`AI Prompt loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get system prompt for AI interviewer
 */
export const getSystemPrompt = (prompt: AIIInterviewerPrompt): string => {
  return prompt.roles.system;
};

/**
 * Get safety guidelines
 */
export const getSafetyPrompt = (prompt: AIIInterviewerPrompt): string => {
  return prompt.roles.safety;
};

/**
 * Get privacy badge text
 */
export const getPrivacyBadge = (prompt: AIIInterviewerPrompt): string => {
  return prompt.roles.privacy_badge;
};

/**
 * Get session flow stages
 */
export const getSessionFlow = (prompt: AIIInterviewerPrompt) => {
  return prompt.session_flow;
};

/**
 * Get current session stage based on elapsed time and context
 */
export const getCurrentStage = (
  prompt: AIIInterviewerPrompt, 
  elapsedMinutes: number,
  hasCode: boolean,
  hasProblem: boolean
): SessionStage => {
  const flow = prompt.session_flow;
  
  // Determine stage based on time and context
  if (!hasProblem || !hasCode) {
    return flow.find(stage => stage.stage === 'intro') || flow[0];
  }
  
  if (elapsedMinutes >= prompt.policies.wrap_up_at_minutes) {
    return flow.find(stage => stage.stage === 'wrap') || flow[flow.length - 1];
  }
  
  if (elapsedMinutes >= prompt.policies.edge_cases_after_minutes) {
    return flow.find(stage => stage.stage === 'edge_cases') || flow[2];
  }
  
  if (elapsedMinutes >= 3) {
    return flow.find(stage => stage.stage === 'approach_probe') || flow[1];
  }
  
  return flow.find(stage => stage.stage === 'intro') || flow[0];
};

/**
 * Get rubric configuration
 */
export const getRubric = (prompt: AIIInterviewerPrompt) => {
  return prompt.rubric;
};

/**
 * Get LLM configuration
 */
export const getLLMConfig = (prompt: AIIInterviewerPrompt, mode: 'local' | 'cloud') => {
  return prompt.llm[mode];
};

/**
 * Get policies configuration
 */
export const getPolicies = (prompt: AIIInterviewerPrompt) => {
  return prompt.policies;
};

/**
 * Get few-shot examples for context
 */
export const getFewShotExamples = (prompt: AIIInterviewerPrompt) => {
  return prompt.few_shot;
};

// Import types for re-export
import type { SessionStage } from '../types/prompt.js';
