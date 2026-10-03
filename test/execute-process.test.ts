import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { RunnerPlan } from '../src/runner/contracts.js';
import { executeProcess } from '../src/runner/execute-process.js';

function planForExit(code: number): RunnerPlan {
  return {
    command: process.execPath,
    args: ['-e', `process.exit(${code})`],
    env: { ...process.env },
    files: [],
    jsdomFiles: [],
    watch: false,
  };
}

describe('process execution', () => {
  it('returns the child exit status without TAP parsing', async () => {
    const success = await executeProcess(planForExit(0));
    const failure = await executeProcess(planForExit(7));

    assert.equal(success.exitCode, 0);
    assert.equal(failure.exitCode, 7);
    assert.ok(success.durationMs >= 0);
  });
});
