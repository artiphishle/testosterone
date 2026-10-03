import { expect, test } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { findTestFilesAsync } from '../src/features/test-execution/findTestFilesAsync.js';
import { runTestSuiteAsync } from '../src/features/test-execution/runTestSuiteAsync.js';

test('runs against an independently created consumer without sibling source state', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ankh-test-standalone-'));

  try {
    const testFile = join(root, 'external.test.ts');
    await writeFile(
      testFile,
      "import assert from 'node:assert/strict'; import test from 'node:test'; test('external', () => assert.equal(2 * 3, 6));",
    );

    const files = await findTestFilesAsync(root);
    const result = await runTestSuiteAsync(files, { cwd: root, environment: 'node' });

    expect(files).toEqual([testFile]);
    expect(result.success).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
