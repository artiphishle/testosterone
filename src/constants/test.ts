import { createRequire } from 'node:module';

import type { AnkhCapabilityId, AnkhCommandCategory } from '@ankhorage/contracts/cli';

const require = createRequire(import.meta.url);
const packageJson = require('../../package.json') as {
  readonly name: string;
  readonly version: string;
};

export const TEST_PACKAGE_NAME = packageJson.name;
export const TEST_PACKAGE_VERSION = packageJson.version;
export const TEST_COMMAND_CATEGORY = 'test' as const satisfies AnkhCommandCategory;
export const TEST_RUN_CAPABILITY = 'test.run' as const satisfies AnkhCapabilityId;
export const TEST_RUN_SUMMARY =
  'Run the project TypeScript test suite through one native Node test-runner invocation.';
