/**
 * TypeScript types for Tech Stack configuration
 * Generated from docs/techstack.schema.json
 */

export interface Monorepo {
  enabled: boolean;
  package_manager: 'pnpm' | 'npm' | 'yarn';
  workspace_tool?: 'none' | 'turbo' | 'nx';
}

export interface Node {
  version_range: string;
}

export interface Directories {
  root: string;
  web: string;
  backend: string;
  extension: string;
  shared: string;
  docs: string;
  scripts: string;
}

export interface Speech {
  stt: string;
  tts: string;
}

export interface LLM {
  local: string;
  cloud: string;
}

export interface Frontend {
  framework: string;
  language: string;
  styling: string[];
  ui: string[];
  state: string[];
  speech: Speech;
  llm: LLM;
  bundler: string;
  testing?: string[];
}

export interface Backend {
  pattern: 'none' | 'next_api_routes' | 'express';
  runtime: string;
  endpoints: string[];
  messaging: string[];
  storage: string[];
  security: string[];
}

export interface Extension {
  manifest_version: 3;
  build: string;
  permissions: string[];
  content_scripts: string[];
  background: string;
  transport: 'poll' | 'websocket' | 'sse';
  targets: string[];
}

export interface Tooling {
  lint: string;
  format: string;
  tests: string[];
  hooks: string[];
}

export interface CICD {
  provider: string;
  workflows: string[];
}

export interface EnvVariable {
  name: string;
  scope: 'frontend' | 'backend' | 'extension';
  required: boolean;
  description?: string;
}

export interface Permissions {
  browser_apis: string[];
  extension: string[];
}

export interface Phase {
  phase: number;
  scope: string[];
  notes: string;
}

export interface TechStack {
  project: string;
  monorepo: Monorepo;
  node: Node;
  directories: Directories;
  frontend: Frontend;
  backend: Backend;
  extension: Extension;
  tooling: Tooling;
  ci_cd: CICD;
  env: EnvVariable[];
  permissions: Permissions;
  phases: Phase[];
}

