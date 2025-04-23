# Testosterone

A simple testing framework for TypeScript projects that supports Node.js, React, and Next.js.

## Features

- Zero-config setup - just run and go
- Automatic project type detection (Node.js, React, Next.js)
- Support for TypeScript and TSX files
- Component testing with JSDOM
- Coverage reporting with c8
- Jest-like matchers
- Simple CLI interface

## Installation

```bash
pnpm install -D testosterone
# or
npm install --save-dev testosterone
# or
yarn add --dev testosterone
```

## Usage

Simply run:

```bash
npx testosterone
```

This will:
1. Detect your project type
2. Find all test files (*.spec.ts, *.test.ts, *.spec.tsx, *.test.tsx)
3. Run the tests with the appropriate environment

### CLI Options

```
Options:
  -V, --version   output the version number
  -c, --coverage  Generate coverage report
  -w, --watch     Watch for changes
  --react         Force React testing mode
  --node          Force Node.js testing mode
  -v, --verbose   Verbose output
  -h, --help      display help for command
```

## Writing Tests

### Node.js Tests

```typescript
// sum.test.ts
import { test } from 'node:test';
import { expect } from 'testosterone/matchers';

function sum(a: number, b: number): number {
  return a + b;
}

test('sum adds two numbers correctly', () => {
  expect(sum(1, 2)).toBe(3);
});
```

### React Component Tests

```tsx
// Button.test.tsx
import React from 'react';
import { test } from 'node:test';
import { render } from 'testosterone/react';
import { expect } from 'testosterone/matchers';
import { Button } from './Button';

test('Button renders correctly', () => {
  const { getByText } = render(<Button>Click me</Button>);
  const button = getByText('Click me');
  expect(button).toBeDefined();
});
```

## License

MIT
