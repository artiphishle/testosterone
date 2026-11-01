import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function resolveJsdomPreload(): string {
  const compiledPath = fileURLToPath(new URL('../environments/preload.js', import.meta.url));

  if (existsSync(compiledPath)) {
    return compiledPath;
  }

  return fileURLToPath(new URL('../environments/preload.ts', import.meta.url));
}

export function resolveBunExecutable(): string {
  return process.versions.bun ? process.execPath : 'bun';
}
