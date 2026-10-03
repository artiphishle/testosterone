export type TestEnvironment = 'node' | 'jsdom';

export interface RunTestOptions {
  readonly concurrency?: number;
  readonly coverage?: boolean;
  readonly cwd?: string;
  readonly environment?: TestEnvironment;
  readonly verbose?: boolean;
  readonly watch?: boolean;
}

export interface ClassifiedTests {
  readonly jsdom: readonly string[];
  readonly node: readonly string[];
}

export interface RunnerPlan {
  readonly args: readonly string[];
  readonly command: string;
  readonly cwd: string;
  readonly env: NodeJS.ProcessEnv;
  readonly files: readonly string[];
  readonly jsdomFiles: readonly string[];
  readonly watch: boolean;
}

export interface ProcessExecutionResult {
  readonly durationMs: number;
  readonly exitCode: number;
  readonly signal: NodeJS.Signals | null;
}

export interface TestSuiteResult extends ProcessExecutionResult {
  readonly fileCount: number;
  readonly jsdomFileCount: number;
  readonly success: boolean;
}
