import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import type { ClassifiedTests, TestEnvironment } from './contracts.js';

const ENVIRONMENT_PRAGMA = /@test-environment\s+(node|jsdom)\b/i;
const REACT_IMPORT =
  /from\s+['"](?:react(?:\/[^'"]*)?|react-dom(?:\/[^'"]*)?|@testing-library\/react)['"]/;
const TESTOSTERONE_DOM_IMPORT =
  /import\s*\{[^}]*\b(?:render|cleanup)\b[^}]*\}\s*from\s*['"]@artiphishle\/testosterone['"]/s;

interface ClassifyOptions {
  environment?: TestEnvironment;
}

export async function classifyTestFiles(
  testFiles: string[],
  options: ClassifyOptions = {},
): Promise<ClassifiedTests> {
  const classified: ClassifiedTests = { node: [], jsdom: [] };

  await Promise.all(
    testFiles.map(async file => {
      const environment = options.environment ?? (await inferEnvironment(file));
      classified[environment].push(file);
    }),
  );

  classified.node.sort();
  classified.jsdom.sort();

  return classified;
}

async function inferEnvironment(file: string): Promise<TestEnvironment> {
  const source = await readFile(file, 'utf8');
  const pragma = source.match(ENVIRONMENT_PRAGMA)?.[1]?.toLowerCase();

  if (pragma === 'node' || pragma === 'jsdom') {
    return pragma;
  }

  if (extname(file) === '.tsx') {
    return 'jsdom';
  }

  if (REACT_IMPORT.test(source) || TESTOSTERONE_DOM_IMPORT.test(source)) {
    return 'jsdom';
  }

  return 'node';
}
