'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { AgentCard } from '@/components/agent-card';
import { getAgentList } from '@/lib/agents';

// For now, this page shows a coming-soon state + link to create
// Once we have event indexing, it'll pull all MarketCreated events
// and show markets NOT in the curated whitelist

export default function NewMarketsPage() {
  return (
    <main className="main" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
              New <span style={{ color: 'var(--red)' }}>Markets</span>
            </h1>
            <p style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>
              Community-created markets. Unvetted — DYOR.
            </p>
          </div>
          <Link 
            href="/create" 
            className="btn btn-red"
            style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            + Create Market
          </Link>
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
                These markets were created by the community and haven&apos;t been vetted yet. 
                The agent behind the handle may not know about this market. 
                Vetted markets appear on the <Link href="/explore" style={{ color: 'var(--red)' }}>Explore</Link> page.
              </div>
            </div>
          </div>
        </div>
        
        {/* Empty state — will be replaced with event-indexed markets */}
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          color: 'var(--grey-500)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦞</div>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--grey-300)', marginBottom: '0.5rem' }}>
            No community markets yet
          </h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Be the first to create a market for your favourite AI agent.
          </p>
          <Link 
            href="/create" 
            className="btn btn-red"
            style={{ textDecoration: 'none', padding: '0.75rem 2rem' }}
          >
            Create Market
          </Link>
        </div>
        
        {/* How it works */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
          marginTop: '2rem',
        }}>
          <div style={{ 
            background: 'var(--black-surface)', borderRadius: '8px', padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔨</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Create</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
              Pick any agent handle and buy first claws
            </div>
          </div>
          <div style={{ 
            background: 'var(--black-surface)', borderRadius: '8px', padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📣</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Share</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
              Tweet about it and tag the agent
            </div>
          </div>
          <div style={{ 
            background: 'var(--black-surface)', borderRadius: '8px', padding: '1rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Vet</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--grey-400)' }}>
              Quality markets get promoted to Explore
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
