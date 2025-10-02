/**
 * Bootstrap configuration module
 * Exports the main bootstrap function and utilities
 */

import { loadPRD, loadTechStack } from './loader';
import { validateConfigs } from './validator';

export { bootstrapConfig, loadPRD, loadTechStack } from './loader';
export { validateConfigs, validatePRD, validateTechStack } from './validator';
export { getFeatures, getRoadmap, getTechStack, getPhases, getEnvConfig, getFrontendConfig, getBackendConfig, getExtensionConfig } from './loader';

// Re-export prompt and AI modules
export * from '../prompt/index';
export * from '../ai/index';

export type { PRD } from '../types/prd';
export type { TechStack } from '../types/techstack';

/**
 * Main bootstrap function with validation
 * Use this at application startup to load and validate all configurations
 */
export const bootstrap = () => {
  console.log('🚀 Starting AI Interview Coach bootstrap...');
  
  try {
    const prd = loadPRD();
    const techstack = loadTechStack();
    
    // Validate configurations
    const validated = validateConfigs(prd, techstack);
    if (!validated) {
      throw new Error('Configuration validation failed');
    }
    
    console.log('✅ Bootstrap completed successfully');
    return validated;
  } catch (error) {
    console.error('❌ Bootstrap failed:', error);
    throw error;
  }
};

/**
 * Singleton instance for global access
 * Call bootstrap() first to initialize this
 */
let configInstance: { prd: PRD; techstack: TechStack } | null = null;

export const getConfig = () => {
  if (!configInstance) {
    throw new Error('Configuration not bootstrapped. Call bootstrap() first.');
  }
  return configInstance;
};

export const setConfig = (config: { prd: PRD; techstack: TechStack }) => {
  configInstance = config;
};

// Import types for re-export
import type { PRD } from '../types/prd.js';
import type { TechStack } from '../types/techstack.js';

