/**
 * Configuration validation utilities
 * Validates that loaded configs match their expected schemas
 */

import type { PRD } from '../types/prd.js';
import type { TechStack } from '../types/techstack.js';

/**
 * Validate PRD configuration structure
 */
export const validatePRD = (prd: any): prd is PRD => {
  const requiredFields = [
    'project', 'owner', 'goals', 'non_goals', 'personas', 
    'repo', 'features', 'roadmap', 'user_stories', 'risks', 'future_ideas'
  ];

  // Check required top-level fields
  for (const field of requiredFields) {
    if (!(field in prd)) {
      console.error(`❌ PRD validation failed: Missing required field '${field}'`);
      return false;
    }
  }

  // Validate basic types
  if (typeof prd.project !== 'string' || prd.project.length === 0) {
    console.error('❌ PRD validation failed: project must be a non-empty string');
    return false;
  }

  if (!Array.isArray(prd.features) || prd.features.length === 0) {
    console.error('❌ PRD validation failed: features must be a non-empty array');
    return false;
  }

  // Validate features structure
  for (const feature of prd.features) {
    const requiredFeatureFields = ['id', 'name', 'description', 'acceptance_criteria'];
    for (const field of requiredFeatureFields) {
      if (!(field in feature)) {
        console.error(`❌ PRD validation failed: Feature missing required field '${field}'`);
        return false;
      }
    }
    
    if (!Array.isArray(feature.acceptance_criteria) || feature.acceptance_criteria.length === 0) {
      console.error(`❌ PRD validation failed: Feature ${feature.id} acceptance_criteria must be non-empty array`);
      return false;
    }
  }

  // Validate roadmap structure
  if (!Array.isArray(prd.roadmap) || prd.roadmap.length === 0) {
    console.error('❌ PRD validation failed: roadmap must be a non-empty array');
    return false;
  }

  for (const phase of prd.roadmap) {
    const requiredPhaseFields = ['phase', 'title', 'deliverables'];
    for (const field of requiredPhaseFields) {
      if (!(field in phase)) {
        console.error(`❌ PRD validation failed: Roadmap phase missing required field '${field}'`);
        return false;
      }
    }
    
    if (typeof phase.phase !== 'number' || phase.phase < 1) {
      console.error(`❌ PRD validation failed: Roadmap phase must be a positive integer`);
      return false;
    }
  }

  console.log('✅ PRD validation passed');
  return true;
};

/**
 * Validate Tech Stack configuration structure
 */
export const validateTechStack = (techstack: any): techstack is TechStack => {
  const requiredFields = [
    'project', 'monorepo', 'node', 'directories', 'frontend', 
    'backend', 'extension', 'tooling', 'ci_cd', 'env', 'permissions', 'phases'
  ];

  // Check required top-level fields
  for (const field of requiredFields) {
    if (!(field in techstack)) {
      console.error(`❌ Tech Stack validation failed: Missing required field '${field}'`);
      return false;
    }
  }

  // Validate monorepo structure
  const monorepo = techstack.monorepo;
  if (typeof monorepo.enabled !== 'boolean') {
    console.error('❌ Tech Stack validation failed: monorepo.enabled must be boolean');
    return false;
  }

  const validPackageManagers = ['pnpm', 'npm', 'yarn'];
  if (!validPackageManagers.includes(monorepo.package_manager)) {
    console.error(`❌ Tech Stack validation failed: monorepo.package_manager must be one of ${validPackageManagers.join(', ')}`);
    return false;
  }

  // Validate frontend structure
  const frontend = techstack.frontend;
  const requiredFrontendFields = ['framework', 'language', 'styling', 'ui', 'state', 'speech', 'llm', 'bundler'];
  for (const field of requiredFrontendFields) {
    if (!(field in frontend)) {
      console.error(`❌ Tech Stack validation failed: frontend missing required field '${field}'`);
      return false;
    }
  }

  // Validate speech configuration
  if (!frontend.speech.stt || !frontend.speech.tts) {
    console.error('❌ Tech Stack validation failed: frontend.speech must have stt and tts');
    return false;
  }

  // Validate LLM configuration
  if (!frontend.llm.local || !frontend.llm.cloud) {
    console.error('❌ Tech Stack validation failed: frontend.llm must have local and cloud');
    return false;
  }

  // Validate extension structure
  const extension = techstack.extension;
  if (extension.manifest_version !== 3) {
    console.error('❌ Tech Stack validation failed: extension.manifest_version must be 3');
    return false;
  }

  const validTransports = ['poll', 'websocket', 'sse'];
  if (!validTransports.includes(extension.transport)) {
    console.error(`❌ Tech Stack validation failed: extension.transport must be one of ${validTransports.join(', ')}`);
    return false;
  }

  // Validate phases structure
  if (!Array.isArray(techstack.phases) || techstack.phases.length === 0) {
    console.error('❌ Tech Stack validation failed: phases must be a non-empty array');
    return false;
  }

  for (const phase of techstack.phases) {
    const requiredPhaseFields = ['phase', 'scope', 'notes'];
    for (const field of requiredPhaseFields) {
      if (!(field in phase)) {
        console.error(`❌ Tech Stack validation failed: Phase missing required field '${field}'`);
        return false;
      }
    }
    
    if (typeof phase.phase !== 'number' || phase.phase < 1) {
      console.error(`❌ Tech Stack validation failed: Phase must be a positive integer`);
      return false;
    }
  }

  console.log('✅ Tech Stack validation passed');
  return true;
};

/**
 * Validate both configurations
 */
export const validateConfigs = (prd: any, techstack: any): { prd: PRD; techstack: TechStack } | null => {
  if (!validatePRD(prd)) {
    return null;
  }
  
  if (!validateTechStack(techstack)) {
    return null;
  }
  
  return { prd, techstack };
};

