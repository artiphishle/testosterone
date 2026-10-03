import { logger } from '../utils/logger.js';
import { classifyTestFiles } from './classify-test-files.js';
import type { RunOptions, SuiteResult } from './contracts.js';
import { createRunnerPlan } from './create-runner-plan.js';
import { executeProcess } from './execute-process.js';

export async function runSuite(testFiles: string[], options: RunOptions): Promise<SuiteResult> {
  const classified = await classifyTestFiles(testFiles, {
    environment: options.environment,
  });

  logger.info(
    `Test environments: ${classified.node.length} node, ${classified.jsdom.length} jsdom`,
  );

  const plan = createRunnerPlan(testFiles, options, classified.jsdom);
  const execution = await executeProcess(plan);
  const result: SuiteResult = {
    ...execution,
    success: execution.exitCode === 0,
    fileCount: testFiles.length,
    jsdomFileCount: classified.jsdom.length,
  };

  const seconds = (result.durationMs / 1000).toFixed(2);

  if (result.success) {
    logger.success(`Suite passed: ${result.fileCount} files in ${seconds}s`);
  } else {
    logger.error(
      `Suite failed: exit ${result.exitCode}, ${result.fileCount} files in ${seconds}s`,
    );
  }

  return result;
}
