import { JSDOM } from 'jsdom';

let activeDom: JSDOM | undefined;

export function installJsdom(): JSDOM {
  if (activeDom) {
    return activeDom;
  }

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });

  activeDom = dom;

  defineGlobal('window', dom.window);
  defineGlobal('document', dom.window.document);
  defineGlobal('navigator', dom.window.navigator);

  for (const key of Reflect.ownKeys(dom.window)) {
    if (key in globalThis) {
      continue;
    }

    const descriptor = Object.getOwnPropertyDescriptor(dom.window, key);

    if (descriptor) {
      try {
        Object.defineProperty(globalThis, key, descriptor);
      } catch {
        // Some host globals cannot be redefined. They are safe to leave alone.
      }
    }
  }

  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    value: true,
    configurable: true,
    writable: true,
  });

  return dom;
}

function defineGlobal(name: PropertyKey, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  });
}
