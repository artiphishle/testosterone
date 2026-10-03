import { expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { runTestSuiteAsync } from '../src/features/test-execution/runTestSuiteAsync.js';

test('executes multiple TypeScript files through one native suite', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ankh-test-suite-'));

  try {
    const first = join(root, 'first.test.ts');
    const second = join(root, 'second.test.ts');
    const source =
      "import assert from 'node:assert/strict'; import test from 'node:test'; test('passes', () => assert.equal(1 + 1, 2));";

    await writeFile(first, source);
    await writeFile(second, source);

    const result = await runTestSuiteAsync([first, second], {
      concurrency: 2,
      cwd: root,
      environment: 'node',
    });

    expect(result.success).toBe(true);
    expect(result.fileCount).toBe(2);
    expect(result.jsdomFileCount).toBe(0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
