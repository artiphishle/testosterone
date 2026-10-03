import type { AnkhRuntimeCommandProvider } from '@ankhorage/ankh';

import {
  TEST_COMMAND_CATEGORY,
  TEST_PACKAGE_NAME,
  TEST_PACKAGE_VERSION,
  TEST_RUN_CAPABILITY,
  TEST_RUN_SUMMARY,
} from '../constants/test.js';
import { runTestCommandAsync } from './commands/run.js';

const provider = {
  id: TEST_PACKAGE_NAME,
  category: TEST_COMMAND_CATEGORY,
  version: TEST_PACKAGE_VERSION,
  capabilities: [TEST_RUN_CAPABILITY],
  commands: [
    {
      path: ['run'],
      capability: TEST_RUN_CAPABILITY,
      summary: TEST_RUN_SUMMARY,
      examples: [
        'ankh test run',
        'ankh test run --coverage',
        'ankh test run --watch --concurrency 8',
      ],
    },
  ],
  handlers: [
    {
      path: ['run'],
      handler: async (request) => await runTestCommandAsync(request.argv, request.context),
    },
  ],
} as const satisfies AnkhRuntimeCommandProvider;

export default provider;
