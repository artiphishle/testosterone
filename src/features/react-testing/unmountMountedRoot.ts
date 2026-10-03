import type { MountedRoot, ReactRuntime } from '../../types/reactTesting.js';
import { mountedRoots } from './mountedRoots.js';

/*** Unmount one tracked React root and remove its DOM container. */
export function unmountMountedRoot(mounted: MountedRoot, React: ReactRuntime): void {
  if (!mountedRoots.delete(mounted)) return;

  React.act(() => {
    mounted.root.unmount();
  });
  mounted.container.remove();
}
