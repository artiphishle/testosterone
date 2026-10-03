import { glob } from 'glob';

/*** Discover supported TypeScript test files below one project root. */
export async function findTestFilesAsync(root: string = process.cwd()): Promise<string[]> {
  const files = await glob(['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'], {
    absolute: true,
    cwd: root,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.*/**'],
  });

  return files.sort();
}
