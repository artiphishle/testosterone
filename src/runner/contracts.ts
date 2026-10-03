export type TestEnvironment = 'node' | 'jsdom';

export interface RunOptions {
  coverage?: boolean;
  watch?: boolean;
  verbose?: boolean;
  environment?: TestEnvironment;
  concurrency?: number;
}

export interface ClassifiedTests {
  node: string[];
  jsdom: string[];
}

export interface RunnerPlan {
  command: string;
  args: string[];
  env: NodeJS.ProcessEnv;
  files: string[];
  jsdomFiles: string[];
  watch: boolean;
}

export interface ProcessExecutionResult {
  exitCode: number;
  signal: NodeJS.Signals | null;
  durationMs: number;
}

export interface SuiteResult extends ProcessExecutionResult {
  success: boolean;
  fileCount: number;
  jsdomFileCount: number;
}
