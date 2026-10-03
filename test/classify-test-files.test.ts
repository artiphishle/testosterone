import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { classifyTestFiles } from '../src/runner/classify-test-files.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe('test environment classification', () => {
  it('keeps plain tests in Node and routes React tests to JSDOM', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-classify-'));
    roots.push(root);

    const nodeFile = join(root, 'node.test.ts');
    const tsxFile = join(root, 'component.test.tsx');
    const reactImportFile = join(root, 'hook.test.ts');
    const forcedNodeFile = join(root, 'forced.test.tsx');

    await writeFile(nodeFile, "import test from 'node:test';");
    await writeFile(tsxFile, "export const element = <div />;");
    await writeFile(reactImportFile, "import React from 'react';");
    await writeFile(forcedNodeFile, '// @test-environment node\nexport {};');

    const result = await classifyTestFiles([
      nodeFile,
      tsxFile,
      reactImportFile,
      forcedNodeFile,
    ]);

    assert.deepEqual(result.node, [forcedNodeFile, nodeFile].sort());
    assert.deepEqual(result.jsdom, [reactImportFile, tsxFile].sort());
  });

  it('supports a CLI-level forced environment', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-force-'));
    roots.push(root);
    const file = join(root, 'component.test.tsx');
    await writeFile(file, 'export {};');

    const result = await classifyTestFiles([file], { environment: 'node' });

    assert.deepEqual(result, { node: [file], jsdom: [] });
  });
});
