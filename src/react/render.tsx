import { JSDOM } from 'jsdom';
import reactDomServer from 'react-dom/server';
import React from 'react';

/**
 * Simple React testing utilities
 * Refactored to handle optional peer dependencies gracefully.
 */
export async function render(element: any) {
  // 1. Check for dependencies at runtime
  let renderToString;

  try {
    renderToString = reactDomServer.renderToString;
  } catch {
    throw new Error(
      "[@artiphishle/testosterone] The 'render' utility requires 'react' and 'react-dom' to be installed. " +
      "Please run 'bun add react react-dom' in your project."
    );
  }

  // 2. Ensure JSDOM is set up (SAFE)
  if (!globalThis.document) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

    Object.defineProperty(globalThis, 'window', {
      value: dom.window,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'document', {
      value: dom.window.document,
      configurable: true,
    });

    // 🔑 critical fix: navigator may be read-only
    if (!globalThis.navigator) {
      Object.defineProperty(globalThis, 'navigator', {
        value: dom.window.navigator,
        configurable: true,
      });
    }
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  // 3. Render the component
  const html = renderToString(element);
  container.innerHTML = html;

  return {
    container,

    getByText: (text: string) => {
      const elements = Array.from(container.querySelectorAll('*'));
      const el = elements.find(e => e.textContent?.includes(text));
      if (!el) {
        throw new Error(`Unable to find element with text: "${text}"`);
      }
      return el;
    },

    getByTestId: (testId: string) => {
      const el = container.querySelector(`[data-testid="${testId}"]`);
      if (!el) {
        throw new Error(`Unable to find element with data-testid="${testId}"`);
      }
      return el;
    },

    unmount: () => {
      document.body.removeChild(container);
    },
  };
}

