'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { AgentCard } from '@/components/agent-card';
import { getAgentList, type AgentListItem } from '@/lib/agents';

type SortOption = 'price' | 'supply' | 'volume' | 'change';
type FilterOption = 'all' | 'verified' | 'unverified';

export default function ExplorePage() {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [filter, setFilter] = useState<FilterOption>('all');
  
  const allAgents = useMemo(() => getAgentList(), []);
  
  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    return allAgents
      .filter((agent) => {
        // Search filter
        if (search) {
          const q = search.toLowerCase();
          return agent.name.toLowerCase().includes(q) || agent.xHandle.toLowerCase().includes(q);
        }
        return true;
      })
      .filter((agent) => {
        // Verification filter
        if (filter === 'verified') return agent.clawsVerified;
        if (filter === 'unverified') return !agent.clawsVerified;
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return b.priceETH - a.priceETH;
          case 'supply':
            return b.supply - a.supply;
          case 'volume':
            return parseFloat(b.volume24h?.replace(/[$K]/g, '') || '0') - parseFloat(a.volume24h?.replace(/[$K]/g, '') || '0');
          case 'change':
            return b.priceChange24h - a.priceChange24h;
          default:
            return 0;
        }
      });
  }, [allAgents, search, sortBy, filter]);

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Explore Agents
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Discover and trade claws in {allAgents.length} AI agents from the Claw ecosystem.
          </p>
        </div>
        
        {/* Filters */}
        <div 
          style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '0.75rem', 
            marginBottom: '1.5rem',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <div 
            style={{ 
              flex: '1',
              minWidth: '200px',
              maxWidth: '400px',
            }}
          >
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--brand)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          
          {/* Filter */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
            {(['all', 'verified', 'unverified'] as FilterOption[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  background: filter === f ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f === 'all' ? 'All' : f === 'verified' ? '✓ Verified' : '○ Unverified'}
              </button>
            ))}
          </div>
          
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{
              padding: '0.625rem 1rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="price">Sort by Price</option>
            <option value="supply">Sort by Supply</option>
            <option value="volume">Sort by Volume</option>
            <option value="change">Sort by 24h Change</option>
          </select>
        </div>
        
        {/* Results count */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Showing {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </div>
        
        {/* Agent Grid */}
        {filteredAgents.length > 0 ? (
          <div className="agent-grid">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.address} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: '2rem' }}>
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No agents found</h3>
            <p className="empty-state-desc">Try adjusting your search or filters</p>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
