import { describe, expect, it, resolve, render, assert, test } from './src/index';

describe('verify exports', () => {
  it('should import all the necessary functions', () => {
    expect(typeof describe).toBe('function');
    expect(typeof expect).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof resolve).toBe('function');
    expect(typeof render).toBe('function');
    expect(typeof assert).toBe('object');
    expect(typeof test).toBe('function');
  });
});
