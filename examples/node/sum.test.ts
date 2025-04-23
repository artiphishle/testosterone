import { test } from "node:test"
import { expect } from "../../src/matchers"

function sum(a: number, b: number): number {
  return a + b
}

test("sum adds two numbers correctly", () => {
  expect(sum(1, 2)).toBe(3)
  expect(sum(-1, 1)).toBe(0)
  expect(sum(0, 0)).toBe(0)
})

test("sum handles large numbers", () => {
  expect(sum(1000000, 2000000)).toBe(3000000)
})
