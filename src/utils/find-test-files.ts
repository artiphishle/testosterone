import { glob } from 'glob';

/**
 * Finds all TypeScript test files below the supplied project root.
 */
export async function findTestFiles(root: string = process.cwd()): Promise<string[]> {
  const files = await glob(['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'], {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.*/**'],
    cwd: root,
    absolute: true,
  });

  return files.sort();
}
