import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createRunnerPlans } from '../src/runner/create-runner-plan.js';

describe('runner planning', () => {
  it('creates isolated Bun invocations for node and DOM test files', () => {
    const files = Array.from({ length: 25 }, (_, index) => `/tmp/suite-${index}.test.ts`);
    const jsdomFiles = [files[3], files[17]];
    const plans = createRunnerPlans(
      { node: files.filter(file => !jsdomFiles.includes(file)), jsdom: jsdomFiles },
      { concurrency: 4 },
      undefined,
    );
    const nodePlan = plans.find(plan => plan.environment === 'node');
    const jsdomPlan = plans.find(plan => plan.environment === 'jsdom');

    assert.equal(nodePlan?.command, process.execPath);
    assert.equal(nodePlan?.args.filter(argument => argument === 'test').length, 1);
    assert.ok(nodePlan?.args.includes('--isolate'));
    assert.ok(nodePlan?.args.includes('--parallel=4'));
    assert.equal(nodePlan?.files.length, 23);
    assert.ok(jsdomPlan?.args.includes('--preload'));
    assert.equal(jsdomPlan?.files.length, 2);

    for (const file of jsdomFiles) {
      assert.ok(jsdomPlan?.args.includes(file));
    }
  });

  it('uses Bun coverage reporters for each isolated environment', () => {
    const files = ['/tmp/a.test.ts', '/tmp/b.test.ts'];
    const plans = createRunnerPlans({ node: files, jsdom: [] }, { coverage: true }, '/tmp/coverage');
    const plan = plans[0];

    assert.ok(plan?.args.includes('--coverage'));
    assert.ok(plan?.args.includes('--coverage-reporter=text'));
    assert.ok(plan?.args.includes('--coverage-reporter=lcov'));
    assert.ok(plan?.args.includes('--coverage-dir=/tmp/coverage/node'));
  });

  it('uses a suite-level watch flag', () => {
    const plan = createRunnerPlans({ node: ['/tmp/a.test.ts'], jsdom: [] }, { watch: true }, undefined)[0];

    assert.equal(plan?.watch, true);
    assert.equal(plan?.args.filter(argument => argument === '--watch').length, 1);
  });
});
