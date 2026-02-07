'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCommunityMarkets, CommunityMarket } from '@/hooks/useCommunityMarkets';
import { useETHPrice } from '@/hooks/useETHPrice';
import { formatETH, formatUSD } from '@/lib/agents';

type Filter = 'all' | 'verified' | 'trending' | 'new';
type Sort = 'newest' | 'price' | 'supply' | 'volume';

function MarketRow({ market, ethPrice }: { market: CommunityMarket; ethPrice: number }) {
  const usdPrice = market.priceETH * ethPrice;
  const usdVolume = market.volumeETH * ethPrice;
  
  return (
    <Link href={`/agent/${market.handle}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'var(--black-surface)',
        border: '1px solid var(--grey-800)',
        borderRadius: '12px',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--grey-600)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--grey-800)')}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden',
          border: market.isVerified ? '2px solid var(--red)' : '2px solid var(--grey-700)',
          flexShrink: 0,
        }}>
          <Image
            src={`https://unavatar.io/x/${market.handle}`}
            alt={market.handle}
            width={44} height={44}
            unoptimized
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            @{market.handle}
            {market.isVerified && (
              <span style={{ 
                background: 'var(--red)', color: 'white', fontSize: '0.625rem', 
                padding: '1px 5px', borderRadius: '3px', fontWeight: 700,
              }}>VERIFIED</span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)', marginTop: '2px' }}>
            Supply: {market.supply} · Vol: ${usdVolume < 1 ? usdVolume.toFixed(2) : usdVolume.toFixed(0)}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {market.priceETH > 0 ? formatETH(market.priceETH) : '0'} ETH
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
            ${usdPrice < 0.01 ? '<0.01' : usdPrice < 1 ? usdPrice.toFixed(2) : usdPrice.toFixed(0)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NewMarketsPage() {
  const { markets, isLoading } = useCommunityMarkets();
  const { ethPrice } = useETHPrice();
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('newest');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...markets];
    
    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.handle.toLowerCase().includes(q));
    }
    
    // Filter
    switch (filter) {
      case 'verified':
        result = result.filter(m => m.isVerified);
        break;
      case 'trending':
        result = result.filter(m => m.supply > 1);
        break;
      case 'new':
        // Already sorted by newest, just keep recent (last 50)
        break;
    }
    
    // Sort
    switch (sort) {
      case 'newest':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'price':
        result.sort((a, b) => b.priceETH - a.priceETH);
        break;
      case 'supply':
        result.sort((a, b) => b.supply - a.supply);
        break;
      case 'volume':
        result.sort((a, b) => b.volumeETH - a.volumeETH);
        break;
    }
    
    return result;
  }, [markets, filter, sort, search]);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'trending', label: 'Trending' },
    { key: 'verified', label: 'Verified' },
    { key: 'new', label: 'Newest' },
  ];

  const sorts: { key: Sort; label: string }[] = [
    { key: 'newest', label: 'Newest' },
    { key: 'price', label: 'Price' },
    { key: 'supply', label: 'Supply' },
    { key: 'volume', label: 'Volume' },
  ];

  return (
    <main className="main">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', marginTop: '0.5rem' }}>
            <img src="/claw-red-32.png" alt="" style={{ width: '22px', height: '22px', display: 'inline-block', verticalAlign: 'middle', marginRight: '0.25rem' }} />New <span style={{ color: 'var(--red)' }}>Markets</span>
          </h1>
          <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>
            Community-created markets — DYOR.
          </p>
        </div>
        
        {/* Search */}
        <div style={{ marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search by handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '8px',
              color: 'var(--grey-200)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter pills + sort */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1rem', gap: '0.75rem', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto' }}>
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '999px',
                  border: filter === f.key ? '1px solid var(--red)' : '1px solid var(--grey-700)',
                  background: filter === f.key ? 'var(--red)' : 'transparent',
                  color: filter === f.key ? 'white' : 'var(--grey-400)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            style={{
              padding: '0.375rem 0.5rem',
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-700)',
              borderRadius: '6px',
              color: 'var(--grey-300)',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {sorts.map(s => (
              <option key={s.key} value={s.key}>Sort: {s.label}</option>
            ))}
          </select>
        </div>

        {/* Info banner */}
        <div style={{
          background: 'var(--black-surface)', border: '1px solid var(--grey-800)',
          borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem',
          fontSize: '0.75rem', color: 'var(--grey-400)', lineHeight: 1.5,
          display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
        }}>
          <span>⚠️</span>
          <span>
            Community-created markets. May not be verified — DYOR.
            Vetted agents on <Link href="/explore" style={{ color: 'var(--red)' }}>Explore</Link>.
          </span>
        </div>
        
        {/* Market list */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-500)' }}>
            Loading markets...
          </div>
        ) : filtered.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filtered.map(m => (
              <MarketRow key={m.handle} market={m} ethPrice={ethPrice} />
            ))}
          </div>
        ) : markets.length > 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-500)' }}>
            No markets match your filters.
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
