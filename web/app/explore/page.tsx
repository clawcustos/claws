'use client';

import { useState, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAgentList, AGENTS } from '@/lib/agents';
import { AgentCard } from '@/components/agent-card';
import { TradeModal } from '@/components/trade-modal';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  
  const [tradeModal, setTradeModal] = useState<{
    isOpen: boolean;
    handle: string;
    mode: 'buy' | 'sell';
  }>({ isOpen: false, handle: '', mode: 'buy' });
  
  // Get agent list (handles + metadata for rendering cards)
  const allAgents = useMemo(() => getAgentList(), []);
  
  const filteredAgents = useMemo(() => {
    let result = allAgents;
    
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.xHandle.toLowerCase().includes(q)
      );
    }
    
    if (verifiedFilter === 'verified') {
      result = result.filter(a => a.clawsVerified);
    } else if (verifiedFilter === 'unverified') {
      result = result.filter(a => !a.clawsVerified);
    }
    
    return result;
  }, [allAgents, search, verifiedFilter]);

  const selectedAgent = AGENTS[tradeModal.handle];

  const openTrade = (handle: string, mode: 'buy' | 'sell') => {
    setTradeModal({ isOpen: true, handle, mode });
  };

  return (
    <>
      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--red)' }}>Explore</span> Agents
          </h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            {allAgents.length} agents available for trading. All data live from the contract.
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
            
            {/* Verified Filter */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['all', 'verified', 'unverified'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setVerifiedFilter(f)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: verifiedFilter === f ? (f === 'verified' ? '#16a34a' : f === 'unverified' ? 'var(--grey-700)' : 'var(--red)') : 'var(--black-surface)',
                    border: '1px solid',
                    borderColor: verifiedFilter === f ? (f === 'verified' ? '#16a34a' : f === 'unverified' ? 'var(--grey-600)' : 'var(--red)') : 'var(--grey-800)',
                    borderRadius: '8px',
                    color: verifiedFilter === f ? 'white' : 'var(--grey-400)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  {f === 'verified' && '✓'}
                  {f}
                </button>
              ))}
            </div>
            
            <div style={{ color: 'var(--grey-600)', fontSize: '0.875rem' }}>
              {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Agent Grid — uses AgentCard which pulls live contract data */}
          {filteredAgents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'var(--black-surface)',
              borderRadius: '12px',
              border: '1px solid var(--grey-800)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
              <div style={{ color: 'var(--grey-400)' }}>No agents found for &ldquo;{search}&rdquo;</div>
            </div>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <div className="agents-grid">
                  {filteredAgents.map((agent) => (
                    <AgentCard 
                      key={agent.address} 
                      agent={agent} 
                      onTrade={openTrade}
                      onConnect={openConnectModal}
                    />
                  ))}
                </div>
              )}
            </ConnectButton.Custom>
          )}
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
