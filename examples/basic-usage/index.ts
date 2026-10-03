/***
 * Basic Usage
 *
 * Install `@ankhorage/test` as a development dependency and use its lightweight assertions with
 * Node's native test primitives. Run the suite through `ankh test run` when the Ankh CLI is
 * available, or through `ankhorage-test run` as a standalone package command.
 *
 * React and React DOM remain optional peer dependencies and are loaded only when React testing
 * helpers are used.
 *
 * @usage
 * @readme
 * @title Basic Usage
 */
import { describe, expect, it } from '@ankhorage/test';

describe('calculator', () => {
  it('adds values', () => {
    expect(1 + 1).toBe(2);
  });
});
