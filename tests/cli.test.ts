import { expect, test } from 'bun:test';

import provider from '../src/cli/index.js';
import { runTestCommandAsync } from '../src/cli/commands/run.js';
import { runCliAsync } from '../src/cli/standalone.js';
import type { TestCommandContext } from '../src/types/cli.js';

function createCapturedContext() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const context: TestCommandContext = {
    cwd: '/workspace',
    version: '0.0.0-test',
    writeStdout(text: string) {
      stdout.push(text);
    },
    writeStderr(text: string) {
      stderr.push(text);
    },
  };

  return { context, stderr, stdout };
}

test('Ankh provider exposes the test.run command', () => {
  expect(provider.category).toBe('test');
  expect(provider.capabilities).toEqual(['test.run']);
  expect(provider.commands).toHaveLength(1);
  expect(provider.commands[0]?.path).toEqual(['run']);
  expect(provider.handlers?.[0]?.path).toEqual(['run']);
});

test('shared run command parses flags and delegates once', async () => {
  const capture = createCapturedContext();
  const calls: unknown[] = [];

  const result = await runTestCommandAsync(
    ['--coverage', '--react', '--concurrency', '4', '--verbose'],
    capture.context,
    {
      findTestFilesAsync: async () => ['/workspace/a.test.ts'],
      runTestSuiteAsync: async (files, options) => {
        calls.push({ files, options });
        return {
          durationMs: 25,
          exitCode: 0,
          fileCount: 1,
          jsdomFileCount: 1,
          signal: null,
          success: true,
        };
      },
    },
  );

  expect(result.exitCode).toBe(0);
  expect(calls).toEqual([
    {
      files: ['/workspace/a.test.ts'],
      options: {
        concurrency: 4,
        coverage: true,
        cwd: '/workspace',
        environment: 'jsdom',
        verbose: true,
      },
    },
  ]);
  expect(capture.stderr).toEqual([]);
  expect(capture.stdout.join('')).toContain('Suite passed');
});

test('standalone CLI routes run and reserves the root for help/version', async () => {
  const help = createCapturedContext();
  const version = createCapturedContext();
  const unknown = createCapturedContext();

  expect((await runCliAsync([], help.context)).exitCode).toBe(0);
  expect(help.stdout.join('')).toContain('ankhorage-test run');

  expect((await runCliAsync(['--version'], version.context)).exitCode).toBe(0);
  expect(version.stdout.join('')).toBe('0.0.0-test\n');

  expect((await runCliAsync(['wat'], unknown.context)).exitCode).toBe(1);
  expect(unknown.stderr.join('')).toContain('Unknown test command');
});
