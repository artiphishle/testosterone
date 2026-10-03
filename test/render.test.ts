import assert from 'node:assert/strict';
import React from 'react';
import { afterEach, describe, it } from 'node:test';

import { installJsdom } from '../src/environments/jsdom.js';
import { cleanup, render } from '../src/react/render.js';

installJsdom();

afterEach(() => cleanup());

describe('React rendering', () => {
  it('renders through React DOM client APIs and supports cleanup', () => {
    const result = render(
      React.createElement('button', { 'data-testid': 'save' }, 'Save changes'),
    );

    assert.equal(result.getByText('Save changes').tagName, 'BUTTON');
    assert.equal(result.getByTestId('save').textContent, 'Save changes');
    assert.equal(document.body.contains(result.container), true);

    result.unmount();

    assert.equal(document.body.contains(result.container), false);
  });
});
