/**
 * Bootstrap configuration loader
 * Loads docs/prd.json and docs/techstack.json as source of truth
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { PRD } from '../types/prd.js';
import type { TechStack } from '../types/techstack.js';

// Get the project root directory
const getProjectRoot = (): string => {
  // This assumes the shared package is in packages/shared
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, '..', '..', '..');
};

const PROJECT_ROOT = getProjectRoot();

/**
 * Load and parse PRD configuration from docs/prd.json
 */
export const loadPRD = (): PRD => {
  try {
    const prdPath = join(PROJECT_ROOT, 'docs', 'prd.json');
    const prdContent = readFileSync(prdPath, 'utf-8');
    const prd: PRD = JSON.parse(prdContent);
    
    console.log('✅ PRD loaded successfully from docs/prd.json');
    return prd;
  } catch (error) {
    console.error('❌ Failed to load PRD from docs/prd.json:', error);
    throw new Error(`PRD loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Load and parse Tech Stack configuration from docs/techstack.json
 */
export const loadTechStack = (): TechStack => {
  try {
    const techstackPath = join(PROJECT_ROOT, 'docs', 'techstack.json');
    const techstackContent = readFileSync(techstackPath, 'utf-8');
    const techstack: TechStack = JSON.parse(techstackContent);
    
    console.log('✅ Tech Stack loaded successfully from docs/techstack.json');
    return techstack;
  } catch (error) {
    console.error('❌ Failed to load Tech Stack from docs/techstack.json:', error);
    throw new Error(`Tech Stack loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Load both PRD and Tech Stack configurations
 * This is the main bootstrap function that should be called at application startup
 */
export const bootstrapConfig = (): { prd: PRD; techstack: TechStack } => {
  console.log('🚀 Bootstrapping configuration from docs/...');
  
  const prd = loadPRD();
  const techstack = loadTechStack();
  
  console.log('✅ Configuration bootstrap completed');
  console.log(`📋 Project: ${prd.project}`);
  console.log(`🏗️  Monorepo: ${techstack.monorepo.enabled ? 'Enabled' : 'Disabled'} (${techstack.monorepo.package_manager})`);
  console.log(`📁 Structure: ${techstack.directories.web}, ${techstack.directories.backend}, ${techstack.directories.extension}`);
  
  return { prd, techstack };
};

/**
 * Get features from PRD (source of truth)
 */
export const getFeatures = (prd: PRD) => prd.features;

/**
 * Get roadmap from PRD (source of truth)
 */
export const getRoadmap = (prd: PRD) => prd.roadmap;

/**
 * Get tech stack configuration (source of truth)
 */
export const getTechStack = (techstack: TechStack) => techstack;

/**
 * Get development phases from tech stack
 */
export const getPhases = (techstack: TechStack) => techstack.phases;

/**
 * Get environment variables configuration
 */
export const getEnvConfig = (techstack: TechStack) => techstack.env;

/**
 * Get frontend configuration
 */
export const getFrontendConfig = (techstack: TechStack) => techstack.frontend;

/**
 * Get backend configuration
 */
export const getBackendConfig = (techstack: TechStack) => techstack.backend;

/**
 * Get extension configuration
 */
export const getExtensionConfig = (techstack: TechStack) => techstack.extension;

