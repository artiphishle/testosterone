import { createRequire } from 'node:module';

import type { ReactRoot, ReactRuntime } from '../../types/reactTesting.js';

const require = createRequire(import.meta.url);

/*** Load optional React peers only when a consumer invokes React testing helpers. */
export function loadReactRuntime(): {
  readonly React: ReactRuntime;
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
      "[@ankhorage/test] React rendering requires 'react' and 'react-dom'. Install them in the project that owns the tests.",
    );
  }
}
