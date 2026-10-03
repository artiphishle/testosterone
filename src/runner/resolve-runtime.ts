import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

export function resolveTsxLoader(): string {
  return require.resolve('tsx');
}

export function resolveC8Cli(): string {
  return require.resolve('c8/bin/c8.js');
}

export function resolveJsdomPreload(): string {
  const compiledPath = fileURLToPath(new URL('../environments/preload.js', import.meta.url));

  if (existsSync(compiledPath)) {
    return compiledPath;
  }

  return fileURLToPath(new URL('../environments/preload.ts', import.meta.url));
}
