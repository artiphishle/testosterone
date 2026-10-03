import type { MountedRoot } from '../../types/reactTesting.js';

/*** Track client roots mounted by the compact React test helper. */
export const mountedRoots = new Set<MountedRoot>();
