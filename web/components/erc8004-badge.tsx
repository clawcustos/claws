'use client';

import { useERC8004 } from '@/hooks/useERC8004';

interface ERC8004BadgeProps {
  walletAddress?: string;
}

/**
 * ERC-8004 Identity Badge Component
 * 
 * Shows a small "8004" badge next to verified agents who are also on the 8004 registry.
 * If registered: shows a small pill badge "8004 ✓" with a tooltip or link to 8004.org
 * If x402Support is true: also shows "x402" badge
 * If not registered or registry address is zero: renders nothing
 * Style: subtle, small pill, grey border, similar to existing verified badge but smaller
 */
export function ERC8004Badge({ walletAddress }: ERC8004BadgeProps) {
  const { registered, x402, isLoading } = useERC8004(walletAddress);

  // Don't render anything if not registered, loading, or no wallet address
  if (!walletAddress || isLoading || !registered) {
    return null;
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <a
        href="https://8004.org"
        target="_blank"
        rel="noopener noreferrer"
        title="ERC-8004 Registered Agent"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.125rem',
          padding: '0.125rem 0.375rem',
          fontSize: '0.625rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
          color: 'var(--grey-400)',
          background: 'var(--black-surface)',
          border: '1px solid var(--grey-700)',
          borderRadius: '9999px',
          textDecoration: 'none',
          lineHeight: 1,
        }}
      >
        8004
        <span style={{ color: 'var(--red)', fontSize: '0.5rem' }}>✓</span>
      </a>
      {x402 && (
        <span
          title="x402 Payment Support"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.125rem 0.375rem',
            fontSize: '0.625rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            color: 'var(--grey-400)',
            background: 'var(--black-surface)',
            border: '1px solid var(--grey-700)',
            borderRadius: '9999px',
            lineHeight: 1,
          }}
        >
          x402
        </span>
      )}
    </span>
  );
}
