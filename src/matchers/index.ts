import assert from "node:assert"

/**
 * Enhanced assertion library with Jest-like matchers
 */
export const expect = <T>(actual: T) => {
  return {
    toBe: (expected: T) => {
      assert.strictEqual(actual, expected);
    },

    toEqual: (expected: T) => {
      assert.deepStrictEqual(actual, expected);
    },

    toBeDefined: () => {
      assert.notStrictEqual(actual, undefined);
    },

    toBeUndefined: () => {
      assert.strictEqual(actual, undefined);
    },

    toBeNull: () => {
      assert.strictEqual(actual, null);
    },

    toBeTruthy: () => {
      assert.ok(actual);
    },

    toBeFalsy: () => {
      assert.ok(!actual);
    },

    toContain: (expected: any) => {
      if (typeof actual === 'string') {
        assert.ok(actual.includes(expected));
      } else if (Array.isArray(actual)) {
        assert.ok(actual.includes(expected));
      } else {
        throw new Error(`Expected ${actual} to be an array or string`);
      }
    },

    toHaveLength: (expected: number) => {
      assert.strictEqual((actual as any).length, expected);
    },

    toThrow: (expected?: string | Error) => {
      assert.throws(actual as () => void, expected);
    },

    toMatchSnapshot: () => {
      // Basic snapshot implementation
      // In a real implementation, this would save/compare snapshots
      console.warn('Snapshot testing is not fully implemented yet');
    },
  };
};
