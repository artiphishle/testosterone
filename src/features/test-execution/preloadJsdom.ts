import { resolve } from 'node:path';

const configuredFiles = parseConfiguredFiles(process.env.TESTOSTERONE_JSDOM_FILES);
const currentTestFile = process.argv[1] === undefined ? undefined : resolve(process.argv[1]);

if (currentTestFile !== undefined && configuredFiles.has(currentTestFile)) {
  const { installJsdom } = await import('./installJsdom.js');
  installJsdom();
}

/*** Parse the process-level list of files that require JSDOM. */
function parseConfiguredFiles(raw: string | undefined): ReadonlySet<string> {
  if (raw === undefined) return new Set();

  try {
    const files: unknown = JSON.parse(raw);
    return new Set(
      Array.isArray(files) ? files.filter((file): file is string => typeof file === 'string') : [],
    );
  } catch {
    return new Set();
  }
}
