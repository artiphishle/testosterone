import type React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';

type FindOpts = { timeout?: number; interval?: number };

/**
 * Simple React testing utilities
 */
export function render(element: React.ReactElement) {
  // Ensure JSDOM is set up
  if (!global.document) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    // expose window/document if missing
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  // Render the component to string and insert into container
  const html = renderToString(element);
  container.innerHTML = html;

  const getByText = (text: string) => {
    const elements = Array.from(container.querySelectorAll('*'));
    return elements.find(el => el.textContent?.includes(text));
  };

  const getByTestId = (testId: string) => {
    const el = container.querySelector(`[data-testid="${testId}"]`);
    if (!el) throw new Error(`Unable to find element with data-testid="${testId}"`);
    return el;
  };

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

  const findByText = async (text: string, opts: FindOpts = {}) => {
    const { timeout = 2000, interval = 50 } = opts;
    const end = Date.now() + timeout;

    while (Date.now() < end) {
      const el = getByText(text);
      if (el) return el;
      await sleep(interval);
    }
    throw new Error(`findByText("${text}") timed out after ${timeout}ms`);
  };

  const findByTestId = async (testId: string, opts: FindOpts = {}) => {
    const { timeout = 2000, interval = 50 } = opts;
    const end = Date.now() + timeout;

    while (Date.now() < end) {
      const el = container.querySelector(`[data-testid="${testId}"]`);
      if (el) return el;
      await sleep(interval);
    }
    throw new Error(`findByTestId("${testId}") timed out after ${timeout}ms`);
  };

  return {
    container,
    getByText,
    findByText,
    getByTestId,
    findByTestId,
    unmount: () => {
      document.body.removeChild(container);
    },
  };
}
