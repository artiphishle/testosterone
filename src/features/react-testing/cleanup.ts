import { loadReactRuntime } from './loadReactRuntime.js';
import { mountedRoots } from './mountedRoots.js';
import { unmountMountedRoot } from './unmountMountedRoot.js';

/*** Unmount every React root created by the compact test helper. */
export function cleanup(): void {
  if (mountedRoots.size === 0) return;
  const { React } = loadReactRuntime();

  for (const mounted of [...mountedRoots]) unmountMountedRoot(mounted, React);
}
