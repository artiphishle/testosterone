import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/*** Resolve the installed TSX loader used by the native Node test process. */
export function resolveTsxLoader(): string {
  return require.resolve('tsx');
}
