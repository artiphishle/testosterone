import { resolve } from 'node:path';

import { resolveC8Cli, resolveJsdomPreload, resolveTsxLoader } from './resolve-runtime';
import type { RunOptions, RunnerPlan } from './contracts';

export function createRunnerPlan(
  testFiles: string[],
  options: RunOptions,
  jsdomFiles: string[] = [],
): RunnerPlan {
  const nodeArgs = ['--import', resolveTsxLoader()];

  if (jsdomFiles.length > 0) {
    nodeArgs.push('--import', resolveJsdomPreload());
  }

  nodeArgs.push('--test', `--test-reporter=${options.verbose ? 'spec' : 'dot'}`);

  if (options.watch) {
    nodeArgs.push('--watch');
  }

  if (options.concurrency !== undefined) {
    nodeArgs.push(`--test-concurrency=${options.concurrency}`);
  }

  nodeArgs.push(...testFiles);

  const args = options.coverage
    ? [
        resolveC8Cli(),
        '--reporter=text',
        '--reporter=lcov',
        '--reporter=html',
        process.execPath,
        ...nodeArgs,
      ]
    : nodeArgs;

  return {
    command: process.execPath,
    args,
    env: {
      ...process.env,
      TESTOSTERONE_JSDOM_FILES: JSON.stringify(jsdomFiles.map(file => resolve(file))),
    },
    files: [...testFiles],
    jsdomFiles: [...jsdomFiles],
    watch: options.watch === true,
  };
}
