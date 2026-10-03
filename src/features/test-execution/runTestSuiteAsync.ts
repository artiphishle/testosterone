import type { RunTestOptions, TestSuiteResult } from '../../types/testExecution.js';
import { classifyTestFilesAsync } from './classifyTestFilesAsync.js';
import { createRunnerPlan } from './createRunnerPlan.js';
import { executeProcessAsync } from './executeProcessAsync.js';

/*** Execute all test files through one native Node test suite. */
export async function runTestSuiteAsync(
  testFiles: readonly string[],
  options: RunTestOptions = {},
): Promise<TestSuiteResult> {
  const classified = await classifyTestFilesAsync(testFiles, options.environment);
  const execution = await executeProcessAsync(
    createRunnerPlan(testFiles, options, classified.jsdom),
  );

  return {
    ...execution,
    fileCount: testFiles.length,
    jsdomFileCount: classified.jsdom.length,
    success: execution.exitCode === 0,
  };
}
