import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import type { ClassifiedTests, TestEnvironment } from '../../types/testExecution.js';

const ENVIRONMENT_PRAGMA = /@test-environment\s+(node|jsdom)\b/i;
const REACT_IMPORT = /from\s+['"](?:react(?:\/[^'"]*)?|react-dom(?:\/[^'"]*)?|@testing-library\/react)['"]/;
const TEST_DOM_IMPORT = /import\s*\{[^}]*\b(?:render|cleanup)\b[^}]*\}\s*from\s*['"]@ankhorage\/test['"]/s;

/*** Classify test files independently so mixed projects only pay for JSDOM where required. */
export async function classifyTestFilesAsync(
  testFiles: readonly string[],
  environment?: TestEnvironment,
): Promise<ClassifiedTests> {
  const entries = await Promise.all(
    testFiles.map(async (file) => ({
      environment: environment ?? (await inferEnvironmentAsync(file)),
      file,
    })),
  );

  return {
    jsdom: entries.filter((entry) => entry.environment === 'jsdom').map((entry) => entry.file).sort(),
    node: entries.filter((entry) => entry.environment === 'node').map((entry) => entry.file).sort(),
  };
}

/*** Infer the smallest environment required by one test file. */
async function inferEnvironmentAsync(file: string): Promise<TestEnvironment> {
  const source = await readFile(file, 'utf8');
  const pragma = source.match(ENVIRONMENT_PRAGMA)?.[1]?.toLowerCase();

  if (pragma === 'node' || pragma === 'jsdom') return pragma;
  if (extname(file) === '.tsx') return 'jsdom';
  if (REACT_IMPORT.test(source) || TEST_DOM_IMPORT.test(source)) return 'jsdom';
  return 'node';
}
