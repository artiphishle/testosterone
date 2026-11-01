import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { finalizeCoverage, prepareCoverage } from '../src/runner/coverage.js';

describe('coverage aggregation', () => {
  it('merges shared Node and JSDOM sources without discarding function or branch data', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-coverage-'));
    const source = join(root, 'shared.ts');

    try {
      await writeFile(source, 'export const shared = (value: number) => value;\n');
      const workspace = await prepareCoverage(root);
      await Promise.all(['node', 'jsdom'].map(environment => mkdir(join(workspace.temporaryDirectory, environment))));
      await writeFile(
        join(workspace.temporaryDirectory, 'node', 'lcov.info'),
        `TN:\nSF:${source}\nFN:1,shared\nFNDA:1,shared\nBRDA:1,0,0,1\nDA:1,1\nend_of_record\n`,
      );
      await writeFile(
        join(workspace.temporaryDirectory, 'jsdom', 'lcov.info'),
        `TN:\nSF:${source}\nFN:1,shared\nFNDA:2,shared\nBRDA:1,0,0,2\nBRDA:1,0,1,0\nDA:1,2\nend_of_record\n`,
      );

      await finalizeCoverage(workspace, ['node', 'jsdom']);

      const lcov = await readFile(join(workspace.reportDirectory, 'lcov.info'), 'utf8');
      assert.equal((lcov.match(new RegExp(`SF:${source}`, 'g')) ?? []).length, 1);
      assert.match(lcov, /FNDA:3,shared/);
      assert.match(lcov, /FNF:1/);
      assert.match(lcov, /FNH:1/);
      assert.match(lcov, /BRDA:1,0,0,3/);
      assert.match(lcov, /BRDA:1,0,1,0/);
      assert.match(lcov, /BRF:2/);
      assert.match(lcov, /BRH:1/);
      assert.match(lcov, /DA:1,3/);
      assert.match(await readFile(join(workspace.reportDirectory, 'index.html'), 'utf8'), /shared\.ts/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails closed when an executed environment has no usable LCOV', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-coverage-'));

    try {
      const workspace = await prepareCoverage(root);
      await assert.rejects(
        finalizeCoverage(workspace, ['node']),
        /usable LCOV coverage data for node/,
      );
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
