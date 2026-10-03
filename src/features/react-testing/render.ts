import type { RenderResult } from '../../types/reactTesting.js';
import { loadReactRuntime } from './loadReactRuntime.js';
import { mountedRoots } from './mountedRoots.js';
import { unmountMountedRoot } from './unmountMountedRoot.js';

/*** Render one React tree into the current JSDOM document with the client renderer. */
export function render(element: unknown): RenderResult {
  if (globalThis.document?.body === undefined) {
    throw new Error(
      "[@ankhorage/test] render() requires JSDOM. Use a .tsx test, import render, or add '@test-environment jsdom'.",
    );
  }

  const { React, createRoot } = loadReactRuntime();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const mounted = { container, root };
  mountedRoots.add(mounted);

  React.act(() => {
    root.render(element);
  });

  return {
    container,
    getByTestId(testId: string): Element {
      const elementByTestId = container.querySelector(`[data-testid="${escapeAttribute(testId)}"]`);
      if (elementByTestId === null)
        throw new Error(`Unable to find element with data-testid="${testId}"`);
      return elementByTestId;
    },
    getByText(text: string): Element {
      const candidates = Array.from(container.querySelectorAll('*')).filter((candidate) =>
        candidate.textContent?.includes(text),
      );
      const leaf = candidates.find(
        (candidate) =>
          !Array.from(candidate.children).some((child) => child.textContent?.includes(text)),
      );
      if (leaf === undefined) throw new Error(`Unable to find element with text: "${text}"`);
      return leaf;
    },
    unmount(): void {
      unmountMountedRoot(mounted, React);
    },
  };
}

/*** Escape a value for use in a quoted CSS attribute selector. */
function escapeAttribute(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}
