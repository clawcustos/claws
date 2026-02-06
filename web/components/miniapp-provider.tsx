'use client';

import { useEffect } from 'react';
import { sdk, isInMiniApp } from '@/lib/miniapp';

/**
 * Farcaster Mini App provider.
 * Calls sdk.actions.ready() when running inside a Farcaster client
 * to dismiss the splash screen. No-op in normal browser context.
 */
export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isInMiniApp()) return;
    
    // Small delay to let the app render first, then dismiss splash
    const timer = setTimeout(() => {
      sdk.actions.ready().catch(() => {
        // Silently fail if not in a real miniapp context
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
