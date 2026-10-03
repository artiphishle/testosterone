import { resolve } from 'node:path';

import { resolveJsdomPreload, resolveTsxLoader } from './resolve-runtime';
import type { RunOptions, RunnerPlan } from './contracts';

export function createRunnerPlan(
  testFiles: string[],
  options: RunOptions,
  jsdomFiles: string[] = [],
): RunnerPlan {
  const args = ['--import', resolveTsxLoader()];

  if (jsdomFiles.length > 0) {
    args.push('--import', resolveJsdomPreload());
  }

  args.push('--test', '--test-reporter=spec');

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
    env: {
      ...process.env,
      TESTOSTERONE_JSDOM_FILES: JSON.stringify(jsdomFiles.map(file => resolve(file))),
    },
    files: [...testFiles],
    jsdomFiles: [...jsdomFiles],
  };
}
