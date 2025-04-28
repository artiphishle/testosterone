import { spawnSync } from 'node:child_process';
import { logger } from '../utils/logger.js';
import { setupJsdom } from '../utils/setup-jsdom.js';
import { createTemporaryTsconfigForTests } from '../utils/create-tmp-tsconfig.js';

interface RunOptions {
  coverage?: boolean;
  watch?: boolean;
  verbose?: boolean;
}

/**
 * Runs tests for React components
 */
export async function runReactTests(testFiles: string[], options: RunOptions): Promise<void> {
  logger.info('Running tests with React testing environment');

  // Set up JSDOM globally
  setupJsdom();

  // Create temporary tsconfig pointing to user tsconfig
  const tempTsconfigPath = createTemporaryTsconfigForTests();
  const runner = 'tsx';

  for (const file of testFiles) {
    logger.info(`▶ Running test file: ${file}`);

    const args: string[] = ['--tsconfig-paths', '--tsconfig', tempTsconfigPath];

    if (options.watch) {
      args.push('--watch');
    }

    if (options.verbose) {
      args.push('--test-reporter=spec');
    } else {
      args.push('--test-reporter=tap');
    }

    args.push(file);

    const result = spawnSync('tsx', ['--tsconfig', tempTsconfigPath, file], {
      env: {
        ...process.env,
        NODE_OPTIONS: '--experimental-vm-modules',
      },
      stdio: 'inherit',
      shell: true,
      encoding: 'utf-8',
    });

    if (result.error) {
      throw new Error(`❌ Error running test: ${file}\n${result.error}`);
    }

    if (result.status !== 0) {
      throw new Error(`❌ Test failed in file: ${file}`);
    }
  }

  logger.success('✅ All React tests completed successfully!');
}
