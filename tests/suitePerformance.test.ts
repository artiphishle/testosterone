import { expect, test } from 'bun:test';

import { createRunnerPlan } from '../src/features/test-execution/createRunnerPlan.js';

test('keeps 1,000 test files inside one native runner invocation', () => {
  const files = Array.from(
    { length: 1_000 },
    (_, index) => `/workspace/tests/file-${index}.test.ts`,
  );

  const plan = createRunnerPlan(files, { concurrency: 8 });

  expect(plan.command).toBe('node');
  expect(plan.args.filter((argument) => argument === '--test')).toHaveLength(1);
  expect(plan.args.filter((argument) => argument === '--test-concurrency=8')).toHaveLength(1);
  expect(plan.files).toHaveLength(1_000);
  expect(plan.args.filter((argument) => argument.endsWith('.test.ts'))).toHaveLength(1_000);
});
