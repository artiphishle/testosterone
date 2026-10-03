#!/usr/bin/env tsx
import { Command } from 'commander';

import { runSuite } from './runner/run-suite';
import { findTestFiles } from './utils/find-test-files';
import { logger } from './utils/logger';

const version = '0.3.9';
const program = new Command();

program
  .name('testosterone')
  .description('A simple testing framework for TypeScript projects')
  .version(version);

program
  .option('-c, --coverage', 'Generate coverage report')
  .option('-w, --watch', 'Watch for changes')
  .option('--react', 'Force JSDOM testing mode')
  .option('--node', 'Force Node.js testing mode')
  .option('--concurrency <count>', 'Set Node test-runner concurrency', Number)
  .option('-v, --verbose', 'Verbose test reporter output')
  .action(async options => {
    try {
      logger.info('🧪 Testosterone - TypeScript Testing Framework');

      if (options.react && options.node) {
        throw new Error('--react and --node cannot be used together');
      }

      if (
        options.concurrency !== undefined &&
        (!Number.isInteger(options.concurrency) || options.concurrency < 1)
      ) {
        throw new Error('--concurrency must be a positive integer');
      }

      const testFiles = await findTestFiles();
      logger.info(`Found ${testFiles.length} test files`);

      if (testFiles.length === 0) {
        throw new Error('No test files found. Tests should match *.spec.ts(x) or *.test.ts(x)');
      }

      const result = await runSuite(testFiles, {
        coverage: options.coverage,
        watch: options.watch,
        verbose: options.verbose,
        concurrency: options.concurrency,
        environment: options.react ? 'jsdom' : options.node ? 'node' : undefined,
      });

      if (!result.success) {
        process.exitCode = result.exitCode || 1;
      }
    } catch (error) {
      logger.error('Tests failed:', error);
      process.exitCode = 1;
    }
  });

program.parse();
