import assert from 'node:assert';

export const expect = <T>(actual: T) => ({
  toBe(expected: T) {
    assert.strictEqual(actual, expected);
  },

  toEqual(expected: T) {
    assert.deepStrictEqual(actual, expected);
  },

  toBeDefined() {
    assert.notStrictEqual(actual, undefined);
  },

  toBeUndefined() {
    assert.strictEqual(actual, undefined);
  },

  toBeNull() {
    assert.strictEqual(actual, null);
  },

  toBeTruthy() {
    assert.ok(actual);
  },

  toBeFalsy() {
    assert.ok(!actual);
  },

  toContain(expected: unknown) {
    if (typeof actual === 'string') {
      if (typeof expected !== 'string') {
        throw new Error('String containment expects a string value');
      }

      assert.ok(actual.includes(expected));
      return;
    }

    if (Array.isArray(actual)) {
      assert.ok(actual.includes(expected));
      return;
    }

    throw new Error(`Expected ${String(actual)} to be an array or string`);
  },

  toHaveLength(expected: number) {
    if (actual === null || actual === undefined || !('length' in Object(actual))) {
      throw new Error(`Expected ${String(actual)} to have a length property`);
    }

    const valueWithLength = actual as unknown as { length: number };
    assert.strictEqual(valueWithLength.length, expected);
  },

  toThrow(expected?: string | RegExp | Error | ((error: unknown) => boolean)) {
    assert.throws(actual as () => unknown, expected as Parameters<typeof assert.throws>[1]);
  },
});
