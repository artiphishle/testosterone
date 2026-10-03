import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createRunnerPlan } from '../src/runner/create-runner-plan.js';

describe('suite performance architecture', () => {
  it('keeps 1,000 test files inside one native runner invocation', () => {
    const files = Array.from(
      { length: 1_000 },
      (_, index) => `/workspace/test/file-${index}.test.ts`,
    );

    const plan = createRunnerPlan(files, { concurrency: 8 });

    assert.equal(plan.command, process.execPath);
    assert.equal(plan.args.filter(argument => argument === '--test').length, 1);
    assert.equal(plan.args.filter(argument => argument === '--test-concurrency=8').length, 1);
    assert.equal(plan.files.length, 1_000);

    const fileArguments = plan.args.filter(argument => argument.endsWith('.test.ts'));
    assert.equal(fileArguments.length, 1_000);
  });
});
