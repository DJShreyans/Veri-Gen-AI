export type Severity = "info" | "warning" | "error";
export type ValidationStatus = "passed" | "failed" | "skipped";
export type ActionMode = "debug" | "testbench" | "codex" | "waveform";

export interface ValidationResult {
  status: ValidationStatus;
  tool: string;
  logs: string;
  exit_code?: number | null;
  command?: string[];
}

export interface Issue {
  severity: Severity;
  category: string;
  message: string;
  line?: number | null;
  suggestion?: string | null;
}

export interface DebugRtlResponse {
  summary: string;
  issues: Issue[];
  corrected_code: string;
  best_practices: string[];
  input_validation: ValidationResult;
  validation: ValidationResult;
}

export interface TestbenchResponse {
  summary: string;
  testbench: string;
  coverage_notes: string[];
  validation: ValidationResult;
}

export interface CodexFixResponse {
  summary: string;
  fixed_code: string;
  changes: string[];
  rationale: string[];
  validation: ValidationResult;
}

export interface WaveformFinding {
  severity: Severity;
  signal?: string | null;
  message: string;
  evidence?: string | null;
}

export interface WaveformResponse {
  summary: string;
  findings: WaveformFinding[];
  timing_concerns: string[];
  confidence: "low" | "medium" | "high";
}

export type ResultPayload =
  | { mode: "debug"; data: DebugRtlResponse }
  | { mode: "testbench"; data: TestbenchResponse }
  | { mode: "codex"; data: CodexFixResponse }
  | { mode: "waveform"; data: WaveformResponse };
