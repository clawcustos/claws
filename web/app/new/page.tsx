'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCommunityMarkets } from '@/hooks/useCommunityMarkets';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { formatETH, formatUSD } from '@/lib/agents';
import { formatEther } from 'viem';

function CommunityMarketCard({ handle }: { handle: string }) {
  const { market } = useMarket(handle);
  const { priceETH } = useCurrentPrice(handle);
  const { ethPrice } = useETHPrice();
  
  const supply = market ? Number(market.supply) : 0;
  const isVerified = market?.isVerified || false;
  const volume = market ? parseFloat(formatEther(market.lifetimeVolume)) : 0;
  
  return (
    <Link href={`/agent/${handle}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--black-surface)',
        border: '1px solid var(--grey-800)',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--grey-600)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--grey-800)')}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden',
          border: isVerified ? '2px solid var(--red)' : '2px solid var(--grey-700)',
          flexShrink: 0,
        }}>
          <Image
            src={`https://unavatar.io/x/${handle}`}
            alt={handle}
            width={48} height={48}
            unoptimized
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
            @{handle}
            {isVerified && <span style={{ color: 'var(--red)', marginLeft: '0.25rem', fontSize: '0.75rem' }}>✓</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
            Supply: {supply} · Vol: {formatUSD(volume)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {priceETH ? formatETH(priceETH) : '0'} ETH
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
            {priceETH ? formatUSD(priceETH) : '$0'}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NewMarketsPage() {
  const { markets, isLoading } = useCommunityMarkets();

  return (
    <main className="main">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', marginTop: '0.5rem' }}>
            New <span style={{ color: 'var(--red)' }}>Markets</span>
          </h1>
          <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>
            Community-created markets — DYOR.
          </p>
        </div>
        
        {/* Info banner */}
        <div style={{
          background: 'var(--black-surface)', border: '1px solid var(--grey-800)',
          borderRadius: '8px', padding: '1rem', marginBottom: '2rem',
          fontSize: '0.8125rem', color: 'var(--grey-400)', lineHeight: 1.6,
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--grey-300)', marginBottom: '0.25rem' }}>
                Community Markets
              </div>
              <div>
                These markets were created by the community. The agents listed here may not be verified yet — 
                always DYOR before trading. 
                Verified and vetted agents appear on the <Link href="/explore" style={{ color: 'var(--red)' }}>Explore</Link> page.
              </div>
            </div>
          </div>
        </div>
        
        {/* Market list */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-500)' }}>
            Loading markets...
          </div>
        ) : markets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {markets.map(m => (
              <CommunityMarketCard key={m.handle} handle={m.handle} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            color: 'var(--grey-500)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦞</div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--grey-300)', marginBottom: '0.5rem' }}>
              No community markets yet
            </h3>
            <p style={{ fontSize: '0.875rem' }}>
              Be the first to create a market for your favourite AI agent.
              <br />Use the <span style={{ color: 'var(--red)', fontWeight: 600 }}>Create</span> tab below to get started.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
