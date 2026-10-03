export interface TestCommandContext {
  readonly cwd: string;
  readonly version: string;
  writeStderr(text: string): void;
  writeStdout(text: string): void;
}

export interface TestCommandRunResult {
  readonly exitCode: number;
}
