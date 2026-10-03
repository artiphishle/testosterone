import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, it } from 'node:test';

import { findTestFiles } from '../src/utils/find-test-files.js';

const roots: string[] = [];

afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })));
});

describe('test discovery', () => {
  it('finds supported TypeScript tests and ignores generated/dependency directories', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-discovery-'));
    roots.push(root);

    await mkdir(join(root, 'src'), { recursive: true });
    await mkdir(join(root, 'node_modules', 'pkg'), { recursive: true });
    await mkdir(join(root, 'dist'), { recursive: true });

    await writeFile(join(root, 'src', 'alpha.spec.ts'), '');
    await writeFile(join(root, 'src', 'beta.test.tsx'), '');
    await writeFile(join(root, 'src', 'ignored.ts'), '');
    await writeFile(join(root, 'node_modules', 'pkg', 'hidden.test.ts'), '');
    await writeFile(join(root, 'dist', 'hidden.spec.ts'), '');

    const files = await findTestFiles(root);

    assert.deepEqual(
      files.map(file => file.slice(root.length + 1)),
      ['src/alpha.spec.ts', 'src/beta.test.tsx'],
    );
  });
});
