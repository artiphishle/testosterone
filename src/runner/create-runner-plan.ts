import { resolveTsxLoader } from './resolve-runtime';
import type { RunOptions, RunnerPlan } from './contracts';

export function createRunnerPlan(
  testFiles: string[],
  options: RunOptions,
  jsdomFiles: string[] = [],
): RunnerPlan {
  const args = ['--import', resolveTsxLoader(), '--test', '--test-reporter=spec'];

  if (options.watch) {
    args.push('--watch');
  }

  if (options.concurrency !== undefined) {
    args.push(`--test-concurrency=${options.concurrency}`);
  }

  args.push(...testFiles);

  return {
    command: process.execPath,
    args,
    env: { ...process.env },
    files: [...testFiles],
    jsdomFiles: [...jsdomFiles],
  };
}
