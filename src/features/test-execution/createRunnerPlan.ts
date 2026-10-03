import { resolve } from 'node:path';

import type { RunnerPlan, RunTestOptions } from '../../types/testExecution.js';
import { resolveC8Cli } from './resolveC8Cli.js';
import { resolveJsdomPreload } from './resolveJsdomPreload.js';
import { resolveTsxLoader } from './resolveTsxLoader.js';

const NODE_EXECUTABLE = 'node';

/*** Build one native Node test-runner invocation for the complete discovered suite. */
export function createRunnerPlan(
  testFiles: readonly string[],
  options: RunTestOptions,
  jsdomFiles: readonly string[] = [],
): RunnerPlan {
  const nodeArgs = ['--import', resolveTsxLoader()];

  if (jsdomFiles.length > 0) nodeArgs.push('--import', resolveJsdomPreload());

  nodeArgs.push('--test', `--test-reporter=${options.verbose === true ? 'spec' : 'dot'}`);

  if (options.watch === true) nodeArgs.push('--watch');
  if (options.concurrency !== undefined) nodeArgs.push(`--test-concurrency=${options.concurrency}`);

  nodeArgs.push(...testFiles);

  const args =
    options.coverage === true
      ? [
          resolveC8Cli(),
          '--reporter=text',
          '--reporter=lcov',
          '--reporter=html',
          NODE_EXECUTABLE,
          ...nodeArgs,
        ]
      : nodeArgs;

  return {
    args,
    command: NODE_EXECUTABLE,
    cwd: options.cwd ?? process.cwd(),
    env: {
      ...process.env,
      TESTOSTERONE_JSDOM_FILES: JSON.stringify(jsdomFiles.map((file) => resolve(file))),
    },
    files: [...testFiles],
    jsdomFiles: [...jsdomFiles],
    watch: options.watch === true,
  };
}
