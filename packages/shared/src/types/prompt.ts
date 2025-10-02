/**
 * TypeScript types for AI Interviewer Prompt configuration
 * Generated from docs/ai_interviewer_prompt.json
 */

export interface PromptRoles {
  system: string;
  safety: string;
  privacy_badge: string;
}

export interface PromptPolicies {
  one_question_at_a_time: boolean;
  follow_up_on_diffs: boolean;
  edge_cases_after_minutes: number;
  soft_time_checks_minutes: number[];
  wrap_up_at_minutes: number;
  allow_typed_fallback: boolean;
}

export interface LLMConfig {
  local: {
    provider: string;
    model: string;
  };
  cloud: {
    provider: string;
    model: string;
    api_key_env: string;
  };
}

export interface ProblemContext {
  title: string;
  description: string;
}

export interface CodeContext {
  language: string;
  text: string;
  last_diff: string;
}

export interface TelemetryContext {
  elapsed_sec: number;
  session_cap_sec: number;
}

export interface ContextInputs {
  context: {
    problem: ProblemContext;
    code: CodeContext;
    telemetry: TelemetryContext;
  };
  capabilities: {
    stt: string;
    tts: string;
    screenshare: boolean;
    extension_payload: boolean;
  };
}

export interface SessionStage {
  stage: string;
  goal: string;
  prompt: string;
}

export interface MessageTemplates {
  no_context: string;
  diff_probe: string;
  time_check: string;
  nudge_focus: string;
}

export interface RubricGuidance {
  "1": string;
  "3": string;
  "5": string;
}

export interface Rubric {
  scale: number[];
  dimensions: string[];
  guidance: RubricGuidance;
}

export interface ReportTemplates {
  markdown: string;
  summary: string;
}

export interface ScreenShareTool {
  api: string;
  fields: string[];
}

export interface ExtensionPayloadTool {
  fields: string[];
  interval_ms: number;
}

export interface ToolsContract {
  screen_share: ScreenShareTool;
  extension_payload: ExtensionPayloadTool;
}

export interface FewShotExample {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIIInterviewerPrompt {
  name: string;
  mode: string;
  roles: PromptRoles;
  policies: PromptPolicies;
  llm: LLMConfig;
  inputs: ContextInputs;
  session_flow: SessionStage[];
  message_templates: MessageTemplates;
  rubric: Rubric;
  report_templates: ReportTemplates;
  tools_contract: ToolsContract;
  few_shot: FewShotExample[];
}
