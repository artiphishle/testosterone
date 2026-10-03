import { createRunnerPlan } from '../runner/create-runner-plan';
import { executeProcess } from '../runner/execute-process';
import type { RunOptions } from '../runner/contracts';
import { logger } from '../utils/logger';

/**
 * Runs the complete suite through Node's native test runner.
 *
 * Node owns test-file scheduling and concurrency. Testosterone starts a single
 * suite process instead of paying a TypeScript-loader startup per test file.
 */
export async function runNodeTests(testFiles: string[], options: RunOptions): Promise<void> {
  logger.info(`Running ${testFiles.length} test files with Node.js test runner`);

  const result = await executeProcess(createRunnerPlan(testFiles, options));

  if (result.exitCode !== 0) {
    throw new Error(`Test runner exited with code ${result.exitCode}`);
  }
}
