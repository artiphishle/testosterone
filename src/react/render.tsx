import type React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';

type FindOpts = { timeout?: number; interval?: number };

type GlobalAugment = typeof globalThis & {
  window?: Window & typeof globalThis;
  self?: Window & typeof globalThis;
  document?: Document;
  navigator?: Navigator;
  HTMLElement?: typeof HTMLElement;
  Node?: typeof Node;
  getComputedStyle?: (elt: Element) => CSSStyleDeclaration;
  requestAnimationFrame?: (cb: FrameRequestCallback) => number;
  cancelAnimationFrame?: (id: number) => void;
};

function ensureDom(): void {
  const g = globalThis as GlobalAugment;
  if (g.document) return;

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  const win = dom.window as unknown as Window & typeof globalThis;

  const defineProp = <K extends keyof GlobalAugment>(
    key: K,
    value: NonNullable<GlobalAugment[K]>
  ): void => {
    const desc = Object.getOwnPropertyDescriptor(g, key);
    if (!desc || desc.configurable) {
      Object.defineProperty(g, key, { value, configurable: true, writable: true });
    }
  };

  defineProp('window', win);
  defineProp('self', win);
  defineProp('document', win.document);
  defineProp('navigator', win.navigator);
  defineProp('HTMLElement', win.HTMLElement);
  defineProp('Node', win.Node);
  defineProp('getComputedStyle', win.getComputedStyle);

  if (!g.requestAnimationFrame) {
    const raf: (cb: FrameRequestCallback) => number = cb =>
      win.setTimeout(() => cb(Date.now()), 16);
    defineProp('requestAnimationFrame', raf);
  }
  if (!g.cancelAnimationFrame) {
    const caf: (id: number) => void = id => win.clearTimeout(id);
    defineProp('cancelAnimationFrame', caf);
  }
}

/**
 * Simple React testing utilities (SSR-style rendering)
 */
export function render(element: React.ReactElement) {
  ensureDom();

  const container = document.createElement('div');
  document.body.appendChild(container);

  // SSR render into the container (static markup)
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

  const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

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
