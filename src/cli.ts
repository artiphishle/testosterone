#!/usr/bin/env node
import { createRequire } from 'node:module';

import { Command } from 'commander';

import { runSuite } from './runner/run-suite.js';
import { findTestFiles } from './utils/find-test-files.js';
import { logger } from './utils/logger.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };
const program = new Command();

program
  .name('testosterone')
  .description('A suite-level TypeScript test runner built on node:test')
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
