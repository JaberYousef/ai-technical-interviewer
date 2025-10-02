/**
 * TypeScript types for PRD (Product Requirements Document)
 * Generated from docs/prd.schema.json
 */

export interface Persona {
  name: string;
  description: string;
}

export interface RepoStructure {
  path: string;
  description: string;
}

export interface Repo {
  root: string;
  structure: RepoStructure[];
}

export interface FeatureConfig {
  [key: string]: any;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  config?: FeatureConfig;
  dependencies?: string[];
  acceptance_criteria: string[];
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  deliverables: string[];
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface SettingsDefaults {
  [key: string]: any;
}

export interface Settings {
  defaults?: SettingsDefaults;
  privacy?: string;
}

export interface Metadata {
  version?: string;
  last_updated?: string;
}

export interface PRD {
  project: string;
  owner: string;
  goals: string[];
  non_goals: string[];
  personas: Persona[];
  repo: Repo;
  features: Feature[];
  roadmap: RoadmapPhase[];
  user_stories: string[];
  risks: Risk[];
  future_ideas: string[];
  settings?: Settings;
  metadata?: Metadata;
}

