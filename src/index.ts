/***
 * Suite-level TypeScript testing on top of Node's native test runner.
 *
 * `@ankhorage/test` keeps scheduling and file isolation in Node while adding TypeScript loading,
 * per-file Node/JSDOM classification, optional React helpers, coverage, and Ankh CLI integration.
 *
 * @readme
 * @title @ankhorage/test
 */
export { default as assert } from 'node:assert';
export { after, afterEach, before, beforeEach, describe, it, test } from 'node:test';
export { resolve } from 'node:path';

export { expect } from './features/assertions/expect.js';
export { cleanup } from './features/react-testing/cleanup.js';
export { render } from './features/react-testing/render.js';
