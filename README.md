![npm (scoped)](https://img.shields.io/npm/v/@artiphishle/testosterone?style=flat-square)
![license](https://img.shields.io/npm/l/@artiphishle/testosterone?style=flat-square)
![issues](https://img.shields.io/github/issues/artiphishle/testosterone?style=flat-square)
![PRs](https://img.shields.io/github/issues-pr/artiphishle/testosterone?style=flat-square)

# Testosterone

> A lightweight, blazing-fast testing framework for TypeScript projects, built with simplicity and power in mind.

## ✨ Features

- 🚀 **Super fast** test runner using `tsx`
- ⚡ **Zero config** for Node.js and React/Next.js projects
- 🛠️ **TypeScript-first** (full type safety)
- 🧪 Supports **unit, integration, and React component tests**
- 🌟 **Automatic JSX support** for React tests without touching your tsconfig
- 🔍 **Automatic project detection** (Node / React / Next.js)
- 📚 **Simple CLI** (`npx testosterone`) — no bloated configuration needed
- ✅ Works **inside monorepos** (workspace-ready)

## 📦 Installation

If you don't use PNPM please remove the `packageManager` property from the `package.json` to allow another package manager.

```bash
pnpm add -D @artiphishle/testosterone
```

_or_

```bash
npm install --save-dev @artiphishle/testosterone
```

_or_

```bash
yarn add --dev @artiphishle/testosterone
```

---

## 🚀 Usage

Run tests simply with:

```bash
npx testosterone
```

By default, it finds test files matching:

- `**/*.spec.ts`
- `**/*.spec.tsx`
- `**/*.test.ts`
- `**/*.test.tsx`

## ⚙️ CLI Options

| Option           | Description                              |
| ---------------- | ---------------------------------------- |
| `-c, --coverage` | Generate a coverage report using `c8`    |
| `-w, --watch`    | Watch mode: rerun tests on file changes  |
| `--react`        | Force React testing mode                 |
| `--node`         | Force Node.js testing mode               |
| `-v, --verbose`  | Verbose output (detailed test reporting) |

Example:

```bash
npx testosterone --coverage
```

## 🧐 How it works

- **Detects** if you're using React/Next.js or Node.js automatically.
- **Sets up JSDOM** for React tests.
- **Generates a temporary `tsconfig`** with safe settings for JSX (no need to touch your own tsconfig!).
- **Runs tests with `tsx`** — super fast without build steps.
- **Handles path aliases** (`@/` etc.) automatically.

## 🔠 Test Example

### Node test (`.spec.ts`)

```ts
import React from 'react'; // Important
import { describe, it, assert } from 'testosterone/src/node';

describe('Math', () => {
  it('should add numbers', () => {
    assert.strictEqual(1 + 1, 2);
  });
});
```

### React test (`.spec.tsx`)

```tsx
import React from 'react'; // Important
import { describe, it } from 'testosterone/src/node';
import { expect, render } from 'testosterone/src/react';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button />);
    expect(screen.getByText('Click me')).toBeDefined();
  });
});
```

## 🔮 Why Testosterone?

- **Tiny**: Minimalistic by design.
- **Powerful**: Supports real-world projects.
- **Modern**: Full ESM, TypeScript, React 19 compatible.
- **No magic**: Understandable, hackable, no vendor lock-in.

## 📄 License

[MIT](./LICENSE)
