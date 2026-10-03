import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'bun:test';

import { findTestFilesAsync } from '../src/features/test-execution/findTestFilesAsync.js';

test('discovers supported TypeScript tests and ignores generated paths', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ankh-test-discovery-'));

  try {
    await mkdir(join(root, 'src'), { recursive: true });
    await mkdir(join(root, 'node_modules', 'pkg'), { recursive: true });
    await mkdir(join(root, 'dist'), { recursive: true });

    await writeFile(join(root, 'src', 'alpha.spec.ts'), '');
    await writeFile(join(root, 'src', 'beta.test.tsx'), '');
    await writeFile(join(root, 'src', 'ignored.ts'), '');
    await writeFile(join(root, 'node_modules', 'pkg', 'hidden.test.ts'), '');
    await writeFile(join(root, 'dist', 'hidden.spec.ts'), '');

    const files = await findTestFilesAsync(root);
    expect(files.map((file) => file.slice(root.length + 1))).toEqual([
      'src/alpha.spec.ts',
      'src/beta.test.tsx',
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
