import { createKnipConfig } from '@ankhorage/devtools/knip';

export default createKnipConfig({
  entry: ['src/index.ts', 'src/cli/index.ts', 'src/cli/standalone.ts', 'tests/**/*.ts'],
  ignoreFiles: ['.prettierrc.js', 'eslint.config.mjs', 'paradox.config.ts'],
});
