import { join, resolve } from 'node:path';

import { resolveBunExecutable, resolveJsdomPreload } from './resolve-runtime.js';
import type { ClassifiedTests, RunOptions, RunnerPlan, TestEnvironment } from './contracts.js';

export function createRunnerPlans(
  classified: ClassifiedTests,
  options: RunOptions,
  coverageDirectory: string | undefined,
): RunnerPlan[] {
  return (['node', 'jsdom'] as const)
    .map(environment => createRunnerPlan(classified[environment], options, environment, coverageDirectory))
    .filter((plan): plan is RunnerPlan => plan !== undefined);
}

function createRunnerPlan(
  testFiles: string[],
  options: RunOptions,
  environment: TestEnvironment,
  coverageDirectory: string | undefined,
): RunnerPlan | undefined {
  if (testFiles.length === 0) {
    return undefined;
  }

  const args = ['test', '--isolate'];

  if (environment === 'jsdom') {
    args.push('--preload', resolveJsdomPreload());
  }

  if (!options.verbose && !coverageDirectory) {
    args.push('--reporter=dots');
  }

  if (options.watch) {
    args.push('--watch');
  }

  if (options.concurrency !== undefined) {
    args.push(`--parallel=${options.concurrency}`);
  }

  if (coverageDirectory) {
    args.push(
      '--coverage',
      '--coverage-reporter=text',
      '--coverage-reporter=lcov',
      `--coverage-dir=${join(coverageDirectory, environment)}`,
    );
  }

  args.push(...testFiles);

  return {
    command: resolveBunExecutable(),
    args,
    env: {
      ...process.env,
    },
    files: [...testFiles],
    jsdomFiles: environment === 'jsdom' ? testFiles.map(file => resolve(file)) : [],
    watch: options.watch === true,
    environment,
  };
}
