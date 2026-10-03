import type { AnkhPackageMetadata } from '@ankhorage/contracts/cli';
import { expect, test } from 'bun:test';

import packageJson from '../package.json';

test('publishes canonical @ankhorage/test package and Ankh metadata', () => {
  const expectedAnkhMetadata = {
    category: 'test',
    provider: './dist/cli/index.js',
    capabilities: ['test.run'],
  } as const satisfies AnkhPackageMetadata;

  expect(packageJson.name).toBe('@ankhorage/test');
  expect(packageJson.bin).toEqual({
    'ankhorage-test': './dist/cli/standalone.js',
  });
  expect(packageJson.bin).not.toHaveProperty('test');
  expect(packageJson.ankh).toEqual(expectedAnkhMetadata);
  expect(packageJson.repository.url).toBe('git+https://github.com/ankhorage/test.git');
});
