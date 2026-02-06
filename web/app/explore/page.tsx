'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS } from '@/lib/agents';
import { AgentCard } from '@/components/agent-card';
import { TradeModal } from '@/components/trade-modal';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified' | 'trending'>('all');
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });
  
  const allAgents = useMemo(() => getAgentList(), []);
  
  // Only filter by search text — verified filter is handled by AgentCard using live contract data
  const filteredAgents = useMemo(() => {
    if (!search) return allAgents;
    const q = search.toLowerCase();
    return allAgents.filter(a => 
      a.name.toLowerCase().includes(q) || 
      a.xHandle.toLowerCase().includes(q)
    );
  }, [allAgents, search]);

  const selectedAgent = AGENTS[tradeModal.handle];

  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };

  return (
    <>
      <main className="main">
        <section className="section">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--red)' }}>Explore</span> Agents
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            {allAgents.length} curated agents. All data live from the contract.
            {' '}<Link href="/new" style={{ color: 'var(--red)' }}>View community markets →</Link>
          </p>
          
          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--black-surface)',
                  border: '1px solid var(--grey-800)',
                  borderRadius: '8px',
                  padding: '0.875rem 1rem 0.875rem 2.75rem',
                  color: 'var(--white)',
                  fontSize: '1rem',
                }}
              />
              <span style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--grey-600)',
                fontSize: '1.125rem',
              }}>
                🔍
              </span>
            </div>
            
            {/* Verified Filter — uses live contract data via AgentCard */}
            <div style={{ 
              display: 'flex', 
              gap: '0.375rem', 
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              flexShrink: 0,
            }}>
              {(['all', 'trending', 'verified', 'unverified'] as const).map((f) => {
                const labels: Record<string, string> = { all: 'All', trending: '🔥 Hot', verified: '✓ Verified', unverified: 'New' };
                return (
                  <button
                    key={f}
                    onClick={() => setVerifiedFilter(f)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: verifiedFilter === f ? 'var(--red)' : 'var(--black-surface)',
                      border: '1px solid',
                      borderColor: verifiedFilter === f ? 'var(--red)' : 'var(--grey-800)',
                      borderRadius: '20px',
                      color: verifiedFilter === f ? 'white' : 'var(--grey-400)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Agent Grid */}
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <div className="agents-grid">
                {filteredAgents.map((agent) => (
                  <AgentCard 
                    key={agent.address} 
                    agent={agent} 
                    onTrade={openTrade}
                    onConnect={openConnectModal}
                    verifiedFilter={verifiedFilter}
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
