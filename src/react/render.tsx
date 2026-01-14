import { JSDOM } from 'jsdom';

/**
 * Simple React testing utilities
 * Refactored to handle optional peer dependencies gracefully.
 */
export async function render(element: any) {
  // 1. Check for dependencies at runtime
  let React;
  let renderToString;

  try {
    // Dynamic imports prevent crashes during module resolution
    const reactModule = await import('react');
    const reactDomServer = await import('react-dom/server');
    
    React = reactModule.default || reactModule;
    renderToString = reactDomServer.renderToString;
  } catch (e) {
    throw new Error(
      "[@artiphishle/testosterone] The 'render' utility requires 'react' and 'react-dom' to be installed. " +
      "Please run 'bun add react react-dom' in your project."
    );
  }

  // 2. Ensure JSDOM is set up
  if (!global.document) {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    // Assigning to global for Node environments
    (global as any).window = dom.window;
    (global as any).document = dom.window.document;
    (global as any).navigator = dom.window.navigator;
  }

  const container = document.createElement('div');
  document.body.appendChild(container);

  // 3. Render the component
  const html = renderToString(element);
  container.innerHTML = html;

  return {
    container,
    getByText: (text: string) => {
      const elements = Array.from(container.querySelectorAll('*'));
      return elements.find(el => el.textContent?.includes(text));
    },
    getByTestId: (testId: string) => {
      const el = container.querySelector(`[data-testid="${testId}"]`);
      if (!el) {
        throw new Error(`Unable to find element with data-testid="${testId}"`);
      }
      return el;
    },
    unmount: () => {
      document.body.removeChild(container);
    },
  };
}
