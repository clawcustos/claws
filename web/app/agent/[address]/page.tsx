'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { TradeModal } from '@/components/trade-modal';
import { 
  useAgentStatus, 
  useClawsBalance, 
  useBuyPrice,
  formatPrice 
} from '@/lib/hooks';

// Mock agent data - will be replaced with DB lookup
const MOCK_AGENTS: Record<string, { name: string; xHandle: string; avatar?: string }> = {
  '0x1234567890123456789012345678901234567890': {
    name: 'Clawstr',
    xHandle: 'clawstr',
  },
  '0x2345678901234567890123456789012345678901': {
    name: 'KellyClaude',
    xHandle: 'kellyclaude',
  },
};

export default function AgentPage() {
  const params = useParams();
  const agentAddress = params.address as Address;
  const { address: userAddress } = useAccount();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');

  const { data: status } = useAgentStatus(agentAddress);
  const { data: userBalance } = useClawsBalance(agentAddress, userAddress);
  const { data: buyPrice } = useBuyPrice(agentAddress, 1n);

  const [sourceVerified, clawsVerified, reservedClawClaimed, pendingFees, supply] = status || [];

  // Get agent data from mock or use defaults
  const mockAgent = MOCK_AGENTS[agentAddress.toLowerCase()] || {
    name: `Agent ${agentAddress.slice(0, 6)}`,
    xHandle: agentAddress.slice(2, 10).toLowerCase(),
  };

  const openTrade = (mode: 'buy' | 'sell') => {
    setTradeMode(mode);
    setIsTradeModalOpen(true);
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content" style={{ paddingBottom: '80px' }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">→</span>
          <span>Agent</span>
        </nav>

        {/* Agent Profile Header */}
        <div className="agent-profile">
          <div className="agent-profile-header">
            <div className="agent-profile-avatar-section">
              {mockAgent.xHandle ? (
                <Image
                  src={`https://unavatar.io/twitter/${mockAgent.xHandle}`}
                  alt={mockAgent.name}
                  width={100}
                  height={100}
                  className="agent-profile-avatar"
                  unoptimized
                />
              ) : (
                <div className="agent-profile-avatar-placeholder">
                  {mockAgent.name[0]}
                </div>
              )}
              {clawsVerified && (
                <span className="verified-badge">✓ Verified</span>
              )}
            </div>
            
            <div className="agent-profile-info">
              <h1 className="agent-profile-name">{mockAgent.name}</h1>
              <div className="agent-profile-meta">
                <a 
                  href={`https://x.com/${mockAgent.xHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="agent-x-link"
                >
                  @{mockAgent.xHandle}
                </a>
                {sourceVerified && (
                  <span className="source-badge">Source Verified</span>
                )}
              </div>
              <p className="agent-address">
                {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="agent-stats-grid">
            <div className="stat-card">
              <span className="stat-value">{formatPrice(buyPrice)}</span>
              <span className="stat-label">Price (ETH)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{supply?.toString() || '0'}</span>
              <span className="stat-label">Supply</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">-</span>
              <span className="stat-label">Holders</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{formatPrice(pendingFees)}</span>
              <span className="stat-label">Fees (ETH)</span>
            </div>
          </div>

          {/* Trade Actions */}
          <div className="trade-actions">
            <button onClick={() => openTrade('buy')} className="trade-btn trade-btn-buy">
              Buy Claw
            </button>
            <button 
              onClick={() => openTrade('sell')} 
              className="trade-btn trade-btn-sell"
              disabled={!userBalance || userBalance === 0n}
            >
              Sell Claw
            </button>
          </div>

          {/* Your Position */}
          {userAddress && (
            <section className="agent-section">
              <h2>Your Position</h2>
              <div className="position-card">
                <div className="position-row">
                  <span className="position-label">Claws Held</span>
                  <span className="position-value">{userBalance?.toString() || '0'}</span>
                </div>
                <div className="position-row">
                  <span className="position-label">Value</span>
                  <span className="position-value">-</span>
                </div>
                {userBalance && userBalance > 0n && (
                  <div className="position-access">
                    <span className="access-badge">✓ XMTP Access Unlocked</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Price History */}
          <section className="agent-section">
            <h2>Price History</h2>
            <div className="chart-placeholder">
              <span>Chart coming soon</span>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="agent-section">
            <h2>Recent Activity</h2>
            <div className="activity-empty">
              <span>No trades yet</span>
            </div>
          </section>

          {/* Top Holders */}
          <section className="agent-section">
            <h2>Top Holders</h2>
            <div className="holders-empty">
              <span>No holders yet</span>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />

      <TradeModal
        agent={agentAddress}
        agentName={mockAgent.name}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
    </div>
  );
}
