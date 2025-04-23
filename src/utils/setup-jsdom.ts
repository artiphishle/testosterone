import { JSDOM } from "jsdom"

/**
 * Sets up JSDOM for React component testing
 */
export function setupJsdom(): void {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost/",
    pretendToBeVisual: true,
    runScripts: "dangerously",
  })

  const { window } = dom
  global.window = window as unknown as Window & typeof globalThis
  global.document = dom.window.document

  Object.defineProperty(global, "navigator", {
    value: window.navigator,
    configurable: true,
  })

  // Add other DOM properties to global
  Object.defineProperties(global, {
    ...Object.getOwnPropertyDescriptors(dom.window),
    ...Object.getOwnPropertyDescriptors(global),
  })

  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 0)
  }

  // Mock cancelAnimationFrame
  global.cancelAnimationFrame = (id) => {
    clearTimeout(id)
  }
}
