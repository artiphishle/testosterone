![npm (scoped)](https://img.shields.io/npm/v/@artiphishle/testosterone?style=flat-square)
![license](https://img.shields.io/npm/l/@artiphishle/testosterone?style=flat-square)
![issues](https://img.shields.io/github/issues/artiphishle/testosterone?style=flat-square)
![PRs](https://img.shields.io/github/issues-pr/artiphishle/testosterone?style=flat-square)

# Testosterone

A small TypeScript-first test platform built on Bun's native test runner.

Testosterone does not implement its own scheduler. It discovers TypeScript tests, classifies the environment they need, starts isolated native Bun suites, and lets Bun handle test-file isolation and concurrency.

## Requirements

- Bun 1.4.2 or newer.
- React and React DOM are optional peer dependencies. Install them only when the project contains React tests.

## Installation

```bash
bun add -D @artiphishle/testosterone
```

For React projects:

```bash
bun add react react-dom
```

## Run tests

```bash
bunx testosterone
```

By default Testosterone discovers:

- `**/*.spec.ts`
- `**/*.spec.tsx`
- `**/*.test.ts`
- `**/*.test.tsx`

Generated output, dependencies, coverage directories, and hidden directories are ignored.

## Why the runner is fast

A test run is planned as at most two Bun invocations: one isolated Node-compatible suite and one isolated JSDOM suite. Files never cross the DOM boundary.

```text
testosterone
  -> discover + classify files
  -> bun test --isolate node-file-1 ... node-file-n
  -> bun test --isolate --preload jsdom-preload dom-file-1 ... dom-file-n
  -> Bun owns isolation and concurrency
```

There is no `tsx`, Node test-runner, or `c8` subprocess.

## Test environments

Tests are classified independently instead of treating an entire React or Next.js project as a DOM suite.

The default rules are:

1. `// @test-environment node` or `// @test-environment jsdom` wins.
2. `.tsx` tests use JSDOM.
3. Tests importing React, React DOM, Testing Library React, or Testosterone's DOM helpers use JSDOM.
4. Everything else uses Node.

JSDOM is installed by a Bun preload before each DOM suite imports its test modules. The preload provides browser globals, React's `act` environment, and automatic React cleanup. Node-only files run in a separate Bun invocation and do not receive browser globals.

You can force the complete run when necessary:

```bash
testosterone --node
testosterone --react
```

## Node tests

```ts
import { describe, expect, it } from '@artiphishle/testosterone';

describe('math', () => {
  it('adds values', () => {
    expect(1 + 1).toBe(2);
  });
});
```

`describe`, `it`, `test`, and `assert` come from `node:test` / `node:assert`. Testosterone's `expect` helper intentionally stays small.

## React tests

```tsx
import { afterEach, describe, expect, it } from '@artiphishle/testosterone';
import React from 'react';

import { cleanup, render } from '@artiphishle/testosterone';

afterEach(() => cleanup());

describe('Button', () => {
  it('renders its label', () => {
    const result = render(<button data-testid="save">Save</button>);

    expect(result.getByText('Save').tagName).toBe('BUTTON');
    expect(result.getByTestId('save').textContent).toBe('Save');
  });
});
```

`render()` uses React DOM's client `createRoot` API and React `act()`. It is deliberately a compact helper rather than a replacement for the full Testing Library API.

## CLI

| Option | Description |
| --- | --- |
| `-c, --coverage` | Use Bun coverage and emit text, LCOV, and HTML reports |
| `-w, --watch` | Run Bun watch mode for the complete suite |
| `--react` | Force every test into the JSDOM environment |
| `--node` | Force every test into the Node environment |
| `--concurrency <count>` | Set Bun test-worker concurrency |
| `-v, --verbose` | Use Bun's standard reporter instead of the compact `dots` reporter |

Examples:

```bash
testosterone --concurrency 8
testosterone --coverage
testosterone --watch --verbose
```

## Coverage

Coverage uses Bun's native instrumentation. Each required isolated environment is covered exactly once:

```text
bun test --coverage --coverage-reporter=text --coverage-reporter=lcov
```

`testosterone --coverage` writes the text report to the terminal, LCOV data to
`coverage/lcov.info`, and the navigable HTML report to `coverage/index.html`.

## Package API

The package is published from built `dist` output. The root entry point exposes the Node-compatible test primitives, assertions, matchers, path `resolve`, and the compact React helpers. Bun's `node:test` compatibility is exercised by the packed-consumer regression test; test files do not need to be rewritten to import `bun:test`.

React is loaded lazily, so importing Testosterone in a Node-only project does not require React at runtime.

## Design principles

- Use Bun's test runner instead of rebuilding scheduling and isolation.
- Keep test execution observable and deterministic.
- Avoid shell execution and package-manager subprocesses in the runner.
- Keep Node tests free of DOM globals unless they request them.
- Keep React support optional.
- Prefer small compatibility helpers over a second Jest/Vitest-sized framework.

## License

[MIT](./LICENSE)
