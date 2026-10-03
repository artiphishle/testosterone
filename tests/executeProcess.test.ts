import { expect, test } from 'bun:test';

import { executeProcessAsync } from '../src/features/test-execution/executeProcessAsync.js';
import type { RunnerPlan } from '../src/types/testExecution.js';

test('returns the native child exit status without TAP parsing', async () => {
  const createPlan = (code: number): RunnerPlan => ({
    args: ['-e', `process.exit(${code})`],
    command: 'node',
    cwd: process.cwd(),
    env: { ...process.env },
    files: [],
    jsdomFiles: [],
    watch: false,
  });

  const success = await executeProcessAsync(createPlan(0));
  const failure = await executeProcessAsync(createPlan(7));

  expect(success.exitCode).toBe(0);
  expect(failure.exitCode).toBe(7);
  expect(success.durationMs).toBeGreaterThanOrEqual(0);
});
