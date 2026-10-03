import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

interface ReactRuntime {
  act(callback: () => void): unknown;
}

interface ReactRoot {
  render(element: unknown): void;
  unmount(): void;
}

interface MountedRoot {
  root: ReactRoot;
  container: HTMLDivElement;
}

export interface RenderResult {
  container: HTMLDivElement;
  getByText(text: string): Element;
  getByTestId(testId: string): Element;
  unmount(): void;
}

const mountedRoots = new Set<MountedRoot>();

export function render(element: unknown): RenderResult {
  if (!globalThis.document?.body) {
    throw new Error(
      "[@artiphishle/testosterone] render() requires the JSDOM test environment. " +
        "Use a .tsx test, import render from Testosterone, or add '@test-environment jsdom'.",
    );
  }

  const { React, createRoot } = loadReactRuntime();
  const container = document.createElement('div');
  document.body.appendChild(container);

  const root = createRoot(container);
  const mounted = { root, container };
  mountedRoots.add(mounted);

  React.act(() => {
    root.render(element);
  });

  return {
    container,
    getByText(text: string): Element {
      const candidates = Array.from(container.querySelectorAll('*')).filter(element =>
        element.textContent?.includes(text),
      );
      const leaf = candidates.find(
        element => !Array.from(element.children).some(child => child.textContent?.includes(text)),
      );
      if (!leaf) throw new Error(`Unable to find element with text: "${text}"`);
      return leaf;
    },
    getByTestId(testId: string): Element {
      const element = container.querySelector(`[data-testid="${escapeAttribute(testId)}"]`);
      if (!element) throw new Error(`Unable to find element with data-testid="${testId}"`);
      return element;
    },
    unmount(): void {
      unmount(mounted, React);
    },
  };
}

export function cleanup(): void {
  if (mountedRoots.size === 0) return;
  const { React } = loadReactRuntime();
  for (const mounted of [...mountedRoots]) unmount(mounted, React);
}

function unmount(mounted: MountedRoot, React: ReactRuntime): void {
  if (!mountedRoots.delete(mounted)) return;
  React.act(() => {
    mounted.root.unmount();
  });
  mounted.container.remove();
}

function loadReactRuntime(): {
  React: ReactRuntime;
  createRoot(container: Element | DocumentFragment): ReactRoot;
} {
  try {
    const React = require('react') as ReactRuntime;
    const { createRoot } = require('react-dom/client') as {
      createRoot(container: Element | DocumentFragment): ReactRoot;
    };
    return { React, createRoot };
  } catch {
    throw new Error(
      "[@artiphishle/testosterone] React rendering requires 'react' and 'react-dom'. " +
        "Install them in the project that owns the tests.",
    );
  }
}

function escapeAttribute(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
