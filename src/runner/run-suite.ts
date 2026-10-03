import { classifyTestFiles } from './classify-test-files';
import { createRunnerPlan } from './create-runner-plan';
import { executeProcess } from './execute-process';
import type { RunOptions } from './contracts';
import { logger } from '../utils/logger';

export async function runSuite(testFiles: string[], options: RunOptions): Promise<void> {
  const classified = await classifyTestFiles(testFiles, {
    environment: options.environment,
  });

  logger.info(
    `Test environments: ${classified.node.length} node, ${classified.jsdom.length} jsdom`,
  );

  const plan = createRunnerPlan(testFiles, options, classified.jsdom);
  const result = await executeProcess(plan);

  if (result.exitCode !== 0) {
    throw new Error(`Test runner exited with code ${result.exitCode}`);
  }
}
