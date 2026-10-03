import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import { createRunnerPlan } from '../src/runner/create-runner-plan.js';

describe('runner planning', () => {
  it('creates one native test-runner invocation for every test file', () => {
    const files = Array.from({ length: 25 }, (_, index) => `/tmp/suite-${index}.test.ts`);
    const jsdomFiles = [files[3], files[17]];
    const plan = createRunnerPlan(files, { concurrency: 4 }, jsdomFiles);

    assert.equal(plan.command, process.execPath);
    assert.equal(plan.args.filter(argument => argument === '--test').length, 1);
    assert.ok(plan.args.includes('--test-concurrency=4'));
    assert.equal(plan.files.length, 25);
    assert.deepEqual(
      JSON.parse(plan.env.TESTOSTERONE_JSDOM_FILES ?? '[]'),
      jsdomFiles.map(file => resolve(file)),
    );

    for (const file of files) {
      assert.ok(plan.args.includes(file));
    }
  });

  it('wraps coverage around the single Node suite instead of each test file', () => {
    const files = ['/tmp/a.test.ts', '/tmp/b.test.ts'];
    const plan = createRunnerPlan(files, { coverage: true });

    assert.match(plan.args[0] ?? '', /c8[/\\]bin[/\\]c8\.js$/);
    assert.equal(plan.args.filter(argument => argument === process.execPath).length, 1);
    assert.equal(plan.args.filter(argument => argument === '--test').length, 1);
  });

  it('uses a suite-level watch flag', () => {
    const plan = createRunnerPlan(['/tmp/a.test.ts'], { watch: true });

    assert.equal(plan.watch, true);
    assert.equal(plan.args.filter(argument => argument === '--watch').length, 1);
  });
});
