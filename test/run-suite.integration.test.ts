import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { runSuite } from '../src/runner/run-suite.js';

describe('suite runner integration', () => {
  it('executes multiple TypeScript files through one native suite', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-suite-'));

    try {
      const first = join(root, 'first.test.ts');
      const second = join(root, 'second.test.ts');
      const source = "import assert from 'node:assert/strict'; import test from 'node:test'; test('passes', () => assert.equal(1 + 1, 2));";
      await writeFile(first, source);
      await writeFile(second, source);

      const result = await runSuite([first, second], {
        environment: 'node',
        concurrency: 2,
      });

      assert.equal(result.success, true);
      assert.equal(result.fileCount, 2);
      assert.equal(result.jsdomFileCount, 0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
