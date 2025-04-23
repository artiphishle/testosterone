import { test } from "node:test"
import { render } from "../../src/react/render"
import { expect } from "../../src/matchers"
import { Button } from "./Button"

test("Button renders correctly", () => {
  const { getByText } = render(<Button>Click me</Button>)
  const button = getByText("Click me")
  expect(button).toBeDefined()
})

test("Button has correct test id", () => {
  const { getByTestId } = render(<Button>Click me</Button>)
  const button = getByTestId("button")
  expect(button).toBeDefined()
})
