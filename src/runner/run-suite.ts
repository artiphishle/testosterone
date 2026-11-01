import { prepareCoverage, finalizeCoverage } from './coverage.js';
import { logger } from '../utils/logger.js';
import { classifyTestFiles } from './classify-test-files.js';
import type { RunOptions, SuiteResult } from './contracts.js';
import { createRunnerPlans } from './create-runner-plan.js';
import { executeProcess } from './execute-process.js';

export async function runSuite(testFiles: string[], options: RunOptions): Promise<SuiteResult> {
  const classified = await classifyTestFiles(testFiles, {
    environment: options.environment,
  });

  logger.info(
    `Test environments: ${classified.node.length} node, ${classified.jsdom.length} jsdom`,
  );

  const coverage = options.coverage ? await prepareCoverage(process.cwd()) : undefined;
  const plans = createRunnerPlans(classified, options, coverage?.temporaryDirectory);
  const executions = [];

  for (const plan of plans) {
    executions.push(await executeProcess(plan));
  }

  const coverageError = coverage ? await finalizeCoverage(coverage).then(() => undefined, error => error) : undefined;
  const execution = executions.reduce(
    (combined, current) => ({
      exitCode: combined.exitCode || current.exitCode,
      signal: combined.signal ?? current.signal,
      durationMs: combined.durationMs + current.durationMs,
    }),
    { exitCode: 0, signal: null, durationMs: 0 },
  );
  const result: SuiteResult = {
    ...execution,
    success: execution.exitCode === 0 && !coverageError,
    fileCount: testFiles.length,
    jsdomFileCount: classified.jsdom.length,
  };

  const seconds = (result.durationMs / 1000).toFixed(2);

  if (result.success) {
    logger.success(`Suite passed: ${result.fileCount} files in ${seconds}s`);
  } else {
    logger.error(
      `Suite failed: exit ${result.exitCode || 1}, ${result.fileCount} files in ${seconds}s${coverageError ? ` (${String(coverageError)})` : ''}`,
    );
  }

  return result;
}
