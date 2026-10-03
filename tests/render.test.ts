import { afterEach, expect, test } from 'bun:test';
import React from 'react';

import { cleanup } from '../src/features/react-testing/cleanup.js';
import { render } from '../src/features/react-testing/render.js';
import { installJsdom } from '../src/features/test-execution/installJsdom.js';

installJsdom();

afterEach(() => cleanup());

test('renders through React DOM client APIs and cleans up', () => {
  const result = render(React.createElement('button', { 'data-testid': 'save' }, 'Save changes'));

  expect(result.getByText('Save changes').tagName).toBe('BUTTON');
  expect(result.getByTestId('save').textContent).toBe('Save changes');
  expect(document.body.contains(result.container)).toBe(true);

  result.unmount();

  expect(document.body.contains(result.container)).toBe(false);
});
