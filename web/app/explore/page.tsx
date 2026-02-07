'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS } from '@/lib/agents';
import { AgentCard } from '@/components/agent-card';
import { TradeModal } from '@/components/trade-modal';

type Filter = 'all' | 'verified' | 'unverified' | 'trending';
type Sort = 'name' | 'tier' | 'supply';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('tier');
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });
  
  const allAgents = useMemo(() => getAgentList(), []);
  
  const filteredAgents = useMemo(() => {
    let result = [...allAgents];
    
    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.xHandle.toLowerCase().includes(q)
      );
    }
    
    // Sort
    switch (sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'tier':
        result.sort((a, b) => a.tier - b.tier);
        break;
      case 'supply':
        result.sort((a, b) => b.supply - a.supply);
        break;
    }
    
    return result;
  }, [allAgents, search, sort]);

  const selectedAgent = AGENTS[tradeModal.handle];

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
    { key: 'tier', label: 'Tier' },
    { key: 'name', label: 'Name' },
    { key: 'supply', label: 'Supply' },
  ];

  return (
    <>
      <main className="main">
        <section className="section">
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--red)' }}>Explore</span> Agents
            </h1>
            <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>
              {allAgents.length} curated agents. All data live from the contract.
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
            marginBottom: '1.5rem', gap: '0.75rem', flexWrap: 'wrap',
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
          
          {/* Agent Grid */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <div className="agents-grid">
                {filteredAgents.map((agent) => (
                  <AgentCard 
                    key={agent.xHandle} 
                    agent={agent} 
                    onTrade={openTrade}
                    onConnect={openConnectModal}
                    verifiedFilter={filter}
                  />
                ))}
              </div>
            )}
          </ConnectButton.Custom>
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
