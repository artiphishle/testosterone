import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/*** Resolve the built JSDOM preload, falling back to source during package self-tests. */
export function resolveJsdomPreload(): string {
  const compiledPath = fileURLToPath(new URL('./preloadJsdom.js', import.meta.url));
  if (existsSync(compiledPath)) return compiledPath;
  return fileURLToPath(new URL('./preloadJsdom.ts', import.meta.url));
}
