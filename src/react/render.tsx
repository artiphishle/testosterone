import * as React from 'react';
import type { ReactElement, ComponentType } from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';

type FindOpts = { timeout?: number; interval?: number };
type Wrapper = ComponentType<{ children: React.ReactNode }>;

type GlobalAugment = typeof globalThis & {
  window?: Window & typeof globalThis;
  self?: Window & typeof globalThis;
  document?: Document;
  navigator?: Navigator;
  HTMLElement?: typeof HTMLElement;
  Node?: typeof Node;
  getComputedStyle?: (elt: Element) => CSSStyleDeclaration;
  matchMedia?: (query: string) => MediaQueryList;
  requestAnimationFrame?: (cb: FrameRequestCallback) => number;
  cancelAnimationFrame?: (id: number) => void;
};

function ensureDom(): void {
  const g = globalThis as GlobalAugment;
  if (g.document) return;

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { url: 'http://localhost' });
  const win = dom.window as unknown as Window & typeof globalThis;

  const define = <K extends keyof GlobalAugment>(k: K, v: NonNullable<GlobalAugment[K]>) => {
    const d = Object.getOwnPropertyDescriptor(g, k);
    if (!d || d.configurable)
      Object.defineProperty(g, k, { value: v, configurable: true, writable: true });
  };

  define('window', win);
  define('self', win);
  define('document', win.document);
  define('navigator', win.navigator);
  define('HTMLElement', win.HTMLElement);
  define('Node', win.Node);
  define('getComputedStyle', win.getComputedStyle);

  if (!g.matchMedia) {
    const mm: (q: string) => MediaQueryList = q => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: () => void 0,
      removeEventListener: () => void 0,
      addListener: () => void 0,
      removeListener: () => void 0,
      dispatchEvent: () => false,
    });
    define('matchMedia', mm);
  }

  if (!g.requestAnimationFrame)
    define('requestAnimationFrame', (cb: FrameRequestCallback) =>
      win.setTimeout(() => cb(Date.now()), 16)
    );
  if (!g.cancelAnimationFrame) define('cancelAnimationFrame', (id: number) => win.clearTimeout(id));
}

const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

async function waitFor<T>(fn: () => T | null | undefined, opts: FindOpts = {}): Promise<T> {
  const { timeout = 3000, interval = 50 } = opts;
  const end = Date.now() + timeout;
  const first = fn();
  if (first) return first;
  while (Date.now() < end) {
    await sleep(interval);
    const v = fn();
    if (v) return v;
  }
  throw new Error(`waitFor timed out after ${timeout}ms`);
}

/**
 * Client rendering test util (supports effects & dynamic({ ssr:false }))
 */
export function render(element: ReactElement, options?: { wrapper?: Wrapper }) {
  ensureDom();

  const container = document.createElement('div');
  document.body.appendChild(container);

  const root: Root = createRoot(container);

  // compose wrapper without JSX
  const wrapped = options?.wrapper
    ? React.createElement(options.wrapper, null, element)
    : element;

  act(() => {
    // wrap in Suspense to support lazy/dynamic components
    root.render(React.createElement(React.Suspense, { fallback: null }, wrapped));
  });

  const getByText = (text: string) => {
    const els = Array.from(container.querySelectorAll('*'));
    return els.find(el => el.textContent?.includes(text));
  };

  const getByTestId = (testId: string) => {
    const el = container.querySelector(`[data-testid="${testId}"]`);
    if (!el) throw new Error(`Unable to find element with data-testid="${testId}"`);
    return el;
  };

  const findByText = (text: string, opts?: FindOpts) =>
    waitFor<Element | undefined>(() => getByText(text), opts);

  const findByTestId = (testId: string, opts?: FindOpts) =>
    waitFor<Element | null>(() => container.querySelector(`[data-testid="${testId}"]`), opts);

  const rerender = (ui: ReactElement) => {
    const next = options?.wrapper ? React.createElement(options.wrapper, null, ui) : ui;
    act(() => {
      root.render(React.createElement(React.Suspense, { fallback: null }, next));
    });
  };

  const unmount = () => {
    act(() => root.unmount());
    if (container.parentNode) container.parentNode.removeChild(container);
  };

  return { container, getByText, findByText, getByTestId, findByTestId, rerender, unmount };
}
