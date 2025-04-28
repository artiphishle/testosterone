import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

/**
 * Dynamically creates a temporary tsconfig for testing.
 * Extends the user's real tsconfig.json.
 * Adds correct JSX and paths.
 */
export function createTemporaryTsconfigForTests(): string {
  const projectRoot = process.cwd(); // User project root
  const cacheDir = resolve(projectRoot, '.cache/testosterone');

  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  const userTsconfigPath = resolve(projectRoot, 'tsconfig.json');
  const relativeUserTsconfig = relative(cacheDir, userTsconfigPath);

  const tempTsconfig = {
    extends: relativeUserTsconfig,
    compilerOptions: {
      jsx: 'react-jsx',
      module: 'ESNext',
      moduleResolution: 'bundler',
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      // You could add more overrides here if needed
    },
    include: ['src', 'test'],
  };

  const tempTsconfigPath = join(cacheDir, 'tsconfig.test.runtime.json');

  writeFileSync(tempTsconfigPath, JSON.stringify(tempTsconfig, null, 2));

  return tempTsconfigPath;
}
