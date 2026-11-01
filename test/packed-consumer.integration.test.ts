import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';

const repositoryRoot = resolve(import.meta.dirname, '..');

describe('packed consumer coverage', () => {
  it('covers aliased TypeScript and React tests and preserves failing exits', async () => {
    const root = await mkdtemp(join(tmpdir(), 'testosterone-consumer-'));

    try {
      const tarball = packPackage(root);
      await writeConsumerFixture(root, tarball);
      runBun(root, ['install']);

      const normalRun = runNode(root, ['node_modules/@artiphishle/testosterone/dist/cli.js']);
      assert.equal(normalRun.status, 0, normalRun.stderr);
      assert.equal(await pathExists(join(root, 'coverage')), false);

      const coverageRun = runNode(root, [
        'node_modules/@artiphishle/testosterone/dist/cli.js',
        '--coverage',
      ]);
      assert.equal(coverageRun.status, 0, coverageRun.stderr);
      assert.match(coverageRun.stdout, /Suite passed: 2 files/);
      assert.match(coverageRun.stdout, /File\s+\|\s+% Stmts\s+\|\s+% Branch\s+\|\s+% Funcs\s+\|\s+% Lines/);
      assert.match(coverageRun.stdout, /Greeting\.tsx\s+\|\s+100/);
      assert.match(coverageRun.stdout, /math\.ts\s+\|\s+100/);

      const lcov = await readFile(join(root, 'coverage', 'lcov.info'), 'utf8');
      assert.notEqual(lcov.trim(), '', coverageRun.stdout);
      assert.match(lcov, /SF:src\/math\.ts/);
      assert.match(lcov, /SF:src\/Greeting\.tsx/);
      assert.match(lcov, /SF:src\/math\.ts[\s\S]*?DA:\d+,[1-9]\d*/);
      assert.match(lcov, /SF:src\/Greeting\.tsx[\s\S]*?DA:\d+,[1-9]\d*/);

      const coverageRoot = join(root, 'coverage');
      const htmlIndex = await readFile(join(coverageRoot, 'index.html'), 'utf8');
      assert.match(htmlIndex, /href="Greeting\.tsx\.html"/);
      assert.match(htmlIndex, /href="math\.ts\.html"/);
      assert.match(await readFile(join(coverageRoot, 'Greeting.tsx.html'), 'utf8'), /Hello \{name\}/);
      assert.match(await readFile(join(coverageRoot, 'math.ts.html'), 'utf8'), /left \+ right/);

      const coverageData = await readdir(join(coverageRoot, 'tmp'));
      assert.ok(coverageData.some((entry) => /^coverage-.*\.json$/.test(entry)));

      await writeFile(
        join(root, 'test', 'failing.spec.ts'),
        "import test from 'node:test'; test('fails', () => { throw new Error('expected failure'); });\n",
      );

      const failingRun = runNode(root, ['node_modules/@artiphishle/testosterone/dist/cli.js', '--coverage']);
      assert.notEqual(failingRun.status, 0);
      assert.match(`${failingRun.stdout}${failingRun.stderr}`, /Suite failed/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

function packPackage(root: string): string {
  const result = spawnSync('npm', ['pack', '--json', '--pack-destination', root], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  const packed = JSON.parse(result.stdout) as Array<{ filename: string }>;
  const filename = packed[0]?.filename;
  assert.ok(filename);
  return join(root, filename);
}

async function writeConsumerFixture(root: string, tarball: string): Promise<void> {
  await Promise.all([mkdir(join(root, 'src')), mkdir(join(root, 'test'))]);

  await Promise.all([
    writeFile(
      join(root, 'package.json'),
      JSON.stringify({
        name: 'testosterone-coverage-consumer',
        private: true,
        type: 'module',
        devDependencies: {
          '@artiphishle/testosterone': `file:${tarball}`,
          '@types/node': '^24.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          typescript: '^5.0.0',
        },
      }),
    ),
    writeFile(
      join(root, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'NodeNext',
          moduleResolution: 'NodeNext',
          jsx: 'react-jsx',
          strict: true,
          sourceMap: true,
          baseUrl: '.',
          paths: { '@fixture/*': ['src/*'] },
        },
      }),
    ),
    writeFile(
      join(root, 'src', 'math.ts'),
      'export const sum = (left: number, right: number) => left + right;\n',
    ),
    writeFile(
      join(root, 'src', 'Greeting.tsx'),
      "export const Greeting = ({ name }: { name: string }) => <h1>Hello {name}</h1>;\n",
    ),
    writeFile(
      join(root, 'test', 'math.spec.ts'),
      "import assert from 'node:assert/strict';\nimport test from 'node:test';\n\nimport { sum } from '@fixture/math';\n\ntest('uses aliases', () => assert.equal(sum(20, 22), 42));\n",
    ),
    writeFile(
      join(root, 'test', 'Greeting.spec.tsx'),
      "import assert from 'node:assert/strict';\nimport test from 'node:test';\nimport { flushSync } from 'react-dom';\nimport { createRoot } from 'react-dom/client';\n\nimport { Greeting } from '@fixture/Greeting';\n\ntest('renders with JSDOM', () => {\n  const container = document.createElement('div');\n  flushSync(() => createRoot(container).render(<Greeting name=\"Testosterone\" />));\n  assert.match(container.textContent ?? '', /Hello Testosterone/);\n});\n",
    ),
  ]);
}

function runBun(root: string, args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync('bun', args, { cwd: root, encoding: 'utf8' });
}

function runNode(root: string, args: string[]): ReturnType<typeof spawnSync> {
  const { NODE_TEST_CONTEXT: _nodeTestContext, ...environment } = process.env;
  return spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', env: environment });
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
