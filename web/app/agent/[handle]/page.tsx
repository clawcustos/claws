'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { TradeModal } from '@/components/trade-modal';
import { getAgent, formatETH, calculateCurrentPrice, AGENTS } from '@/lib/agents';
import { useMarket, useCurrentPrice } from '@/hooks/useClaws';

const ETH_PRICE_USD = 3000;

function formatUSD(eth: number): string {
  const usd = eth * ETH_PRICE_USD;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

export default function AgentPage() {
  const params = useParams();
  const handle = (params.handle as string).toLowerCase();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const { isConnected } = useAccount();
  
  const agent = getAgent(handle);
  
  // Fetch live market data from contract
  const { market, isLoading: marketLoading } = useMarket(handle);
  const { priceETH: livePriceETH } = useCurrentPrice(handle);
  
  // Use live data for verification status
  const isVerified = market?.isVerified || false;
  const liveSupply = market ? Number(market.supply) : agent?.supply || 0;
  
  if (!agent) {
    return (
      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section" style={{ textAlign: 'center', paddingTop: '6rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Agent not found</h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            This agent doesn't exist or hasn't been added yet.
          </p>
          <Link href="/" className="btn btn-red">Back to Home</Link>
        </section>
      </main>
    );
  }

  const priceETH = livePriceETH || agent.priceETH;

  const openTrade = (mode: 'buy' | 'sell') => {
    setTradeMode(mode);
    setIsTradeModalOpen(true);
  };

  return (
    <>
      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section">
          {/* Breadcrumb */}
          <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
            <Link href="/" style={{ color: 'var(--grey-500)', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'var(--grey-700)', margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'var(--grey-400)' }}>{agent.name}</span>
          </div>
          
          {/* Profile Header */}
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: isVerified ? '3px solid var(--red)' : '3px solid var(--grey-700)',
              boxShadow: isVerified ? '0 0 40px var(--red-glow)' : 'none',
              flexShrink: 0,
            }}>
              <Image 
                src={agent.xProfileImage} 
                alt={agent.name}
                width={120}
                height={120}
                unoptimized
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ 
                fontSize: '2rem', 
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                {agent.name}
                {isVerified && (
                  <span style={{
                    width: '24px',
                    height: '24px',
                    background: 'var(--red)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                  }}>
                    ✓
                  </span>
                )}
              </h1>
              <a 
                href={`https://x.com/${agent.xHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--grey-500)', textDecoration: 'none', fontSize: '1.125rem' }}
              >
                @{agent.xHandle}
              </a>
              <p style={{ color: 'var(--grey-400)', marginTop: '1rem', maxWidth: '500px' }}>
                {agent.description}
              </p>
            </div>
          </div>
          
          {/* Stats + Trade */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}>
            {/* Price Card */}
            <div style={{
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                Current Price
              </div>
              <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {formatETH(priceETH)} ETH
              </div>
              <div style={{ color: 'var(--grey-500)' }}>
                {formatUSD(priceETH)}
              </div>
            </div>
            
            {/* Stats Card */}
            <div style={{
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{marketLoading ? '...' : liveSupply}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Supply</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{agent.holders}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Holders</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatETH(agent.lifetimeVolumeETH)} ETH</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Volume</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatETH(agent.lifetimeFeesETH)} ETH</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Fees Earned</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trade Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            maxWidth: '400px',
          }}>
            {isConnected ? (
              <>
                <button 
                  className="btn btn-buy" 
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                  onClick={() => openTrade('buy')}
                >
                  BUY
                </button>
                <button 
                  className="btn btn-sell" 
                  style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                  onClick={() => openTrade('sell')}
                >
                  SELL
                </button>
              </>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button 
                    className="btn btn-red" 
                    style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
                    onClick={openConnectModal}
                  >
                    Connect to Trade
                  </button>
                )}
              </ConnectButton.Custom>
            )}
          </div>
        </section>
      </main>
      
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        agentName={agent.name}
        agentHandle={agent.xHandle}
        agentImage={agent.xProfileImage}
        initialMode={tradeMode}
      />
    </>
  );
}
