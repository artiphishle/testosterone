import { resolve } from 'node:path';

const configuredFiles = parseConfiguredFiles(process.env.TESTOSTERONE_JSDOM_FILES);
const currentTestFile = process.argv[1] ? resolve(process.argv[1]) : undefined;

if (currentTestFile && configuredFiles.has(currentTestFile)) {
  const { installJsdom } = await import('./jsdom.js');
  installJsdom();
}

function parseConfiguredFiles(raw: string | undefined): Set<string> {
  if (!raw) {
    return new Set();
  }

  try {
    const files = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(files) ? files.filter((file): file is string => typeof file === 'string') : []);
  } catch {
    return new Set();
  }
}
