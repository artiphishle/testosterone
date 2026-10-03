import { resolve } from 'node:path';

import { expect, test } from 'bun:test';

import { createRunnerPlan } from '../src/features/test-execution/createRunnerPlan.js';

test('creates one native Node invocation for the complete suite', () => {
  const files = Array.from({ length: 25 }, (_, index) => `/tmp/suite-${index}.test.ts`);
  const jsdomFiles = [files[3]!, files[17]!];
  const plan = createRunnerPlan(files, { concurrency: 4 }, jsdomFiles);

  expect(plan.command).toBe('node');
  expect(plan.args.filter((argument) => argument === '--test')).toHaveLength(1);
  expect(plan.args).toContain('--test-concurrency=4');
  expect(plan.files).toHaveLength(25);
  expect(JSON.parse(plan.env.TESTOSTERONE_JSDOM_FILES ?? '[]')).toEqual(
    jsdomFiles.map((file) => resolve(file)),
  );
});

test('wraps coverage once around the native Node suite', () => {
  const plan = createRunnerPlan(['/tmp/a.test.ts', '/tmp/b.test.ts'], { coverage: true });

  expect(plan.command).toBe('node');
  expect(plan.args[0]).toMatch(/c8[/\\]bin[/\\]c8\.js$/);
  expect(plan.args.filter((argument) => argument === 'node')).toHaveLength(1);
  expect(plan.args.filter((argument) => argument === '--test')).toHaveLength(1);
});

test('keeps watch mode at suite level', () => {
  const plan = createRunnerPlan(['/tmp/a.test.ts'], { watch: true });

  expect(plan.watch).toBe(true);
  expect(plan.args.filter((argument) => argument === '--watch')).toHaveLength(1);
});
