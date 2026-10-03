#!/usr/bin/env bun

import {
  TEST_COMMAND_CATEGORY,
  TEST_PACKAGE_NAME,
  TEST_PACKAGE_VERSION,
  TEST_RUN_SUMMARY,
} from '../constants/test.js';
import type { TestCommandContext, TestCommandRunResult } from '../types/cli.js';
import { runTestCommandAsync } from './commands/run.js';

/*** Run the standalone package CLI through the same command implementation used by Ankh. */
export async function runCliAsync(
  argv: readonly string[],
  context: TestCommandContext = createDefaultContext(),
): Promise<TestCommandRunResult> {
  const [firstToken, ...restTokens] = argv;

  if (firstToken === undefined || isHelpToken(firstToken)) {
    context.writeStdout(renderRootHelp());
    return { exitCode: 0 };
  }

  if (isVersionToken(firstToken)) {
    context.writeStdout(`${context.version}\n`);
    return { exitCode: 0 };
  }

  if (firstToken !== 'run') {
    context.writeStderr(`Unknown test command: ${firstToken}\n\nRun ankhorage-test --help\n`);
    return { exitCode: 1 };
  }

  return await runTestCommandAsync(restTokens, context);
}

/*** Create the process-backed context used by the standalone executable. */
function createDefaultContext(): TestCommandContext {
  return {
    cwd: process.cwd(),
    version: TEST_PACKAGE_VERSION,
    writeStdout(text: string) {
      process.stdout.write(text);
    },
    writeStderr(text: string) {
      process.stderr.write(text);
    },
  };
}

/*** Render root help for the standalone test executable. */
function renderRootHelp(): string {
  return [
    `${TEST_PACKAGE_NAME} v${TEST_PACKAGE_VERSION}`,
    '',
    TEST_RUN_SUMMARY,
    '',
    'Usage:',
    '  ankhorage-test run [options]',
    `  ankh ${TEST_COMMAND_CATEGORY} run [options]`,
    '',
    'Commands:',
    '  run  Run the project TypeScript test suite',
    '',
  ].join('\n');
}

/*** Detect standalone help tokens. */
function isHelpToken(value: string): boolean {
  return value === '--help' || value === '-h' || value === 'help';
}

/*** Detect standalone version tokens. */
function isVersionToken(value: string): boolean {
  return value === '--version' || value === '-v' || value === 'version';
}

if (import.meta.main) {
  const result = await runCliAsync(process.argv.slice(2));
  process.exit(result.exitCode);
}
