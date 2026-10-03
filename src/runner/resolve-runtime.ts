import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function resolveTsxLoader(): string {
  return require.resolve('tsx');
}
