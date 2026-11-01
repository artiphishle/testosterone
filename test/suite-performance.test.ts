import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createRunnerPlans } from '../src/runner/create-runner-plan.js';

describe('suite performance architecture', () => {
  it('keeps 1,000 node test files inside one Bun invocation', () => {
    const files = Array.from(
      { length: 1_000 },
      (_, index) => `/workspace/test/file-${index}.test.ts`,
    );

    const plans = createRunnerPlans({ node: files, jsdom: [] }, { concurrency: 8 }, undefined);
    const plan = plans[0];

    assert.equal(plan?.command, process.execPath);
    assert.equal(plan?.args.filter(argument => argument === 'test').length, 1);
    assert.equal(plan?.args.filter(argument => argument === '--parallel=8').length, 1);
    assert.equal(plan?.files.length, 1_000);

    const fileArguments = plan?.args.filter(argument => argument.endsWith('.test.ts')) ?? [];
    assert.equal(fileArguments.length, 1_000);
  });
});
