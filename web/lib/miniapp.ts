'use client';

import { sdk } from '@farcaster/miniapp-sdk';

export { sdk };

/** Check if running inside a Farcaster Mini App context */
export function isInMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window !== window.parent;
  } catch {
    return true; // cross-origin iframe = likely miniapp
  }
}
