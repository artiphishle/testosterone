import { JSDOM } from 'jsdom';

let activeDom: JSDOM | undefined;

/*** Install one process-local JSDOM environment for a DOM-classified test worker. */
export function installJsdom(): JSDOM {
  if (activeDom !== undefined) return activeDom;

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/',
  });

  activeDom = dom;
  defineGlobal('window', dom.window);
  defineGlobal('document', dom.window.document);
  defineGlobal('navigator', dom.window.navigator);

  for (const key of Reflect.ownKeys(dom.window)) {
    if (key in globalThis) continue;
    const descriptor = Object.getOwnPropertyDescriptor(dom.window, key);
    if (descriptor === undefined) continue;
    try {
      Object.defineProperty(globalThis, key, descriptor);
    } catch {
      // Host globals that cannot be redefined remain owned by Node.
    }
  }

  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    configurable: true,
    value: true,
    writable: true,
  });

  return dom;
}

/*** Define one writable process global owned by the JSDOM environment. */
function defineGlobal(name: PropertyKey, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value,
    writable: true,
  });
}
