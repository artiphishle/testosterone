import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'bun:test';

import { classifyTestFilesAsync } from '../src/features/test-execution/classifyTestFilesAsync.js';

test('classifies Node and JSDOM files independently', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ankh-test-classify-'));

  try {
    const nodeFile = join(root, 'node.test.ts');
    const tsxFile = join(root, 'component.test.tsx');
    const reactFile = join(root, 'hook.test.ts');
    const forcedNode = join(root, 'forced.test.tsx');

    await writeFile(nodeFile, "import test from 'node:test';");
    await writeFile(tsxFile, 'export const element = <div />;');
    await writeFile(reactFile, "import React from 'react';");
    await writeFile(forcedNode, '// @test-environment node\nexport {};');

    const result = await classifyTestFilesAsync([nodeFile, tsxFile, reactFile, forcedNode]);

    expect(result.node).toEqual([forcedNode, nodeFile].sort());
    expect(result.jsdom).toEqual([reactFile, tsxFile].sort());
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('supports a forced environment', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ankh-test-force-'));

  try {
    const file = join(root, 'component.test.tsx');
    await writeFile(file, 'export {};');

    expect(await classifyTestFilesAsync([file], 'node')).toEqual({ node: [file], jsdom: [] });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
