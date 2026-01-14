import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';

/**
 * Simple React testing utilities
 */
export function render(element: React.ReactElement) {
  // Ensure JSDOM is set up
  if (!global.document) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  // Render the component to string and insert into container
  const html = renderToString(element);
  container.innerHTML = html;

  return {
    container,
    getByText: (text: string) => {
      const elements = Array.from(container.querySelectorAll('*'));
      return elements.find(el => el.textContent?.includes(text));
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
