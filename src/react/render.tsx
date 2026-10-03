import { createRequire } from 'node:module';

import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';

const require = createRequire(import.meta.url);

interface MountedRoot {
  root: Root;
  container: HTMLDivElement;
}

export interface RenderResult {
  container: HTMLDivElement;
  getByText(text: string): Element;
  getByTestId(testId: string): Element;
  unmount(): void;
}

const mountedRoots = new Set<MountedRoot>();

/**
 * Render a React tree into the JSDOM document using the client renderer.
 *
 * Testosterone deliberately keeps this helper small; it is not intended to
 * emulate the complete Testing Library query API.
 */
export function render(element: ReactNode): RenderResult {
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
        element =>
          !Array.from(element.children).some(child => child.textContent?.includes(text)),
      );

      if (!leaf) {
        throw new Error(`Unable to find element with text: "${text}"`);
      }

      return leaf;
    },

    getByTestId(testId: string): Element {
      const element = container.querySelector(`[data-testid="${escapeAttribute(testId)}"]`);

      if (!element) {
        throw new Error(`Unable to find element with data-testid="${testId}"`);
      }

      return element;
    },

    unmount(): void {
      unmount(mounted, React);
    },
  };
}

export function cleanup(): void {
  const { React } = loadReactRuntime();

  for (const mounted of [...mountedRoots]) {
    unmount(mounted, React);
  }
}

function unmount(
  mounted: MountedRoot,
  React: typeof import('react'),
): void {
  if (!mountedRoots.delete(mounted)) {
    return;
  }

  React.act(() => {
    mounted.root.unmount();
  });
  mounted.container.remove();
}

function loadReactRuntime(): {
  React: typeof import('react');
  createRoot: typeof import('react-dom/client').createRoot;
} {
  try {
    const React = require('react') as typeof import('react');
    const { createRoot } = require('react-dom/client') as typeof import('react-dom/client');

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
