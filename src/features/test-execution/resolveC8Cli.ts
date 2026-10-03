import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/*** Resolve the installed c8 CLI without invoking a package manager shell. */
export function resolveC8Cli(): string {
  return require.resolve('c8/bin/c8.js');
}
