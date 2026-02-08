'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS, formatETH } from '@/lib/agents';
import { TradeModal } from '@/components/trade-modal';
import { useAgentRankings, type RankedAgent } from '@/hooks/useAgentRankings';
import { useETHPrice } from '@/hooks/useETHPrice';
import { ERC8004Badge } from '@/components/erc8004-badge';

type Filter = 'all' | 'verified' | 'unverified' | 'trending';
type Sort = 'price' | 'supply' | 'volume' | 'name';

function getInitialsAvatar(name: string): string {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['991b1b', 'b91c1c', 'dc2626', 'ef4444', '7f1d1d'];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#${colors[idx]}" width="100" height="100"/><text x="50" y="62" text-anchor="middle" fill="#fff" font-family="system-ui" font-weight="600" font-size="36">${initials}</text></svg>`)}`;
}

function AgentRow({ agent, onTrade, ethPrice }: { agent: RankedAgent; onTrade: (h: string, m: 'buy' | 'sell') => void; ethPrice: number }) {
  const [imgErr, setImgErr] = useState(false);
  const usdPrice = agent.priceETH * ethPrice;
  const usdVolume = agent.volumeETH * ethPrice;

  return (
    <div
      onClick={() => onTrade(agent.xHandle, 'buy')}
      style={{
        background: 'var(--black-surface)',
        border: agent.isVerified ? '1px solid var(--red-subtle, rgba(220,38,38,0.3))' : '1px solid var(--grey-800)',
        borderRadius: '12px',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--red)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = agent.isVerified ? 'rgba(220,38,38,0.3)' : 'var(--grey-800)')}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden',
        border: agent.isVerified ? '2px solid var(--red)' : '2px solid var(--grey-700)',
        flexShrink: 0,
      }}>
        <img
          src={imgErr ? getInitialsAvatar(agent.name) : agent.xProfileImage}
          alt={agent.name}
          width={44} height={44}
          onError={() => setImgErr(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {agent.name}
          {agent.isVerified && (
            <span style={{
              background: 'var(--red)', color: 'white', fontSize: '0.625rem',
              padding: '1px 5px', borderRadius: '3px', fontWeight: 700,
            }}>VERIFIED</span>
          )}
          {agent.isVerified && <ERC8004Badge walletAddress={undefined} />}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)', marginTop: '2px' }}>
          @{agent.xHandle} · {agent.supply} claws
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          {agent.supply === 0 ? (
            <span style={{ color: '#22c55e' }}>FREE</span>
          ) : (
            `${formatETH(agent.priceETH)} ETH`
          )}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
          {agent.supply === 0 ? 'First claw free' : `$${usdPrice < 0.01 ? '<0.01' : usdPrice < 1 ? usdPrice.toFixed(2) : usdPrice.toFixed(0)}`}
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('price');
  const { ethPrice } = useETHPrice();

  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });

  // Fetch ALL agent data in a single multicall batch
  const { byPrice, byVolume, isLoading } = useAgentRankings();
  const allAgents = byPrice; // full enriched list

  const filtered = useMemo(() => {
    let result = [...allAgents];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.xHandle.toLowerCase().includes(q)
      );
    }

    // Filter
    switch (filter) {
      case 'verified':
        result = result.filter(a => a.isVerified);
        break;
      case 'unverified':
        result = result.filter(a => !a.isVerified);
        break;
      case 'trending':
        result = result.filter(a => a.supply > 1);
        break;
    }

    // Sort — using LIVE contract data
    switch (sort) {
      case 'price':
        result.sort((a, b) => b.priceETH - a.priceETH || b.supply - a.supply);
        break;
      case 'supply':
        result.sort((a, b) => b.supply - a.supply || b.priceETH - a.priceETH);
        break;
      case 'volume':
        result.sort((a, b) => b.volumeETH - a.volumeETH || b.priceETH - a.priceETH);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [allAgents, search, filter, sort]);

  const selectedAgent = AGENTS[tradeModal.handle] ||
    Object.values(AGENTS).find(a => a.xHandle.toLowerCase() === tradeModal.handle.toLowerCase());

  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'trending', label: 'Trending' },
    { key: 'verified', label: 'Verified' },
    { key: 'unverified', label: 'New' },
  ];

  const sorts: { key: Sort; label: string }[] = [
    { key: 'price', label: 'Price' },
    { key: 'supply', label: 'Supply' },
    { key: 'volume', label: 'Volume' },
    { key: 'name', label: 'Name' },
  ];

  return (
    <>
      <main className="main">
        <section className="section">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--red)' }}>Explore</span> Agents
              </h1>
              <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>
                {allAgents.length || '37'} curated agents. All data live from the contract.
                {' '}<Link href="/new" style={{ color: 'var(--red)' }}>View community markets →</Link>
              </p>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                placeholder="Search agents..."
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
              <div style={{
                display: 'flex', gap: '0.375rem', overflowX: 'auto',
                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
              }}>
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

            {/* Agent list */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-500)' }}>
                Loading agents...
              </div>
            ) : filtered.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filtered.map((agent) => (
                  <AgentRow
                    key={agent.xHandle}
                    agent={agent}
                    onTrade={openTrade}
                    ethPrice={ethPrice}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--grey-500)' }}>
                No agents match your filters.
              </div>
            )}
          </div>
        </section>
      </main>

      {tradeModal.isOpen && selectedAgent && (
        <TradeModal
          isOpen={tradeModal.isOpen}
          onClose={() => setTradeModal({ ...tradeModal, isOpen: false })}
          agentName={selectedAgent.name}
          agentHandle={selectedAgent.xHandle}
          agentImage={selectedAgent.xProfileImage}
          initialMode={tradeModal.mode}
        />
      )}
    </>
  );
}
