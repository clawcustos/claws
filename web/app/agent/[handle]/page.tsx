'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';
import { TradeModal } from '@/components/trade-modal';
import { getAgent, formatETH } from '@/lib/agents';
import { useMarket, useCurrentPrice, useClawBalance } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
const BASE_CHAIN_ID = 8453;

function formatUSD(eth: number, ethPriceUsd: number = 2500): string {
  const usd = eth * ethPriceUsd;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

function formatWei(wei: bigint): string {
  const eth = parseFloat(formatEther(wei));
  return formatETH(eth);
}

// Verified Agent Dashboard — shows fees, claim button, wallet info
function AgentDashboard({ handle, market }: { 
  handle: string; 
  market: { 
    pendingFees: bigint; 
    lifetimeFees: bigint; 
    lifetimeVolume: bigint; 
    verifiedWallet: `0x${string}`; 
    isVerified: boolean;
    supply: bigint;
  };
}) {
  const { address } = useAccount();
  const isOwner = address?.toLowerCase() === market.verifiedWallet.toLowerCase();
  const pendingFeesETH = parseFloat(formatEther(market.pendingFees));
  const lifetimeFeesETH = parseFloat(formatEther(market.lifetimeFees));
  const lifetimeVolumeETH = parseFloat(formatEther(market.lifetimeVolume));
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const handleClaimFees = () => {
    writeContract({
      address: getContractAddress(BASE_CHAIN_ID),
      abi: CLAWS_ABI,
      functionName: 'claimFees',
      args: [handle],
    });
  };

  return (
    <div style={{
      background: 'var(--black-surface)',
      border: `1px solid ${isOwner ? 'var(--red)' : 'var(--grey-800)'}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        marginBottom: '1rem',
        fontSize: '0.875rem',
        color: 'var(--red)',
        fontWeight: 600,
      }}>
        ✓ Verified Agent
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {formatETH(pendingFeesETH)} ETH
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)' }}>Pending Fees</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {formatETH(lifetimeFeesETH)} ETH
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)' }}>Lifetime Fees</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {formatETH(lifetimeVolumeETH)} ETH
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)' }}>Trade Volume</div>
        </div>
      </div>
      
      <div style={{ fontSize: '0.8125rem', color: 'var(--grey-500)', marginBottom: '1rem' }}>
        Wallet: <span className="mono" style={{ color: 'var(--grey-400)' }}>
          {market.verifiedWallet.slice(0, 6)}...{market.verifiedWallet.slice(-4)}
        </span>
      </div>
      
      {isOwner && pendingFeesETH > 0 && (
        <button
          onClick={handleClaimFees}
          disabled={isPending || isConfirming}
          className="btn btn-red"
          style={{ width: '100%' }}
        >
          {isPending || isConfirming 
            ? 'Claiming...' 
            : `Claim ${formatETH(pendingFeesETH)} ETH`
          }
        </button>
      )}
      
      {isOwner && pendingFeesETH === 0 && (
        <div style={{ 
          padding: '0.75rem', 
          background: 'var(--black)', 
          borderRadius: '8px', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--grey-500)',
        }}>
          No pending fees to claim
        </div>
      )}
      
      {isSuccess && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <a 
            href={`https://basescan.org/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#22c55e', fontSize: '0.875rem' }}
          >
            ✓ Fees claimed! View on Basescan →
          </a>
        </div>
      )}
      
      {!isOwner && (
        <div style={{ 
          fontSize: '0.8125rem', 
          color: 'var(--grey-600)', 
          fontStyle: 'italic',
        }}>
          Connect as the verified wallet to claim fees
        </div>
      )}
    </div>
  );
}

export default function AgentPage() {
  const params = useParams();
  const handle = (params.handle as string).toLowerCase();
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const { isConnected, address } = useAccount();
  
  const agent = getAgent(handle);
  const { ethPrice } = useETHPrice();
  
  // Fetch live market data from contract
  const { market, isLoading: marketLoading, refetch } = useMarket(handle);
  const { priceETH: livePriceETH } = useCurrentPrice(handle);
  const { balance: userBalance } = useClawBalance(handle, address);
  
  // Use live data
  const isVerified = market?.isVerified || false;
  const liveSupply = market ? Number(market.supply) : 0;
  const userClaws = userBalance !== undefined ? Number(userBalance) : 0;
  
  if (!agent) {
    return (
      <main className="main" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="section" style={{ textAlign: 'center', paddingTop: '6rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>Agent not found</h1>
          <p style={{ color: 'var(--grey-500)', marginBottom: '2rem' }}>
            This agent doesn&apos;t exist or hasn&apos;t been added yet.
          </p>
          <Link href="/" className="btn btn-red">Back to Home</Link>
        </section>
      </main>
    );
  }

  const priceETH = livePriceETH || agent.priceETH;
  const lifetimeVolumeETH = market ? parseFloat(formatEther(market.lifetimeVolume)) : 0;
  const lifetimeFeesETH = market ? parseFloat(formatEther(market.lifetimeFees)) : 0;

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
            <Link href="/explore" style={{ color: 'var(--grey-500)', textDecoration: 'none' }}>Explore</Link>
            <span style={{ color: 'var(--grey-700)', margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'var(--grey-400)' }}>{agent.name}</span>
          </div>
          
          {/* Profile Header */}
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            marginBottom: '2rem',
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
              {isConnected && userClaws > 0 && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--red)' }}>
                  You hold {userClaws} claw{userClaws !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          
          {/* Verified Agent Dashboard */}
          {isVerified && market && (
            <AgentDashboard handle={handle} market={market as any} />
          )}
          
          {/* Stats + Price */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
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
                {marketLoading ? '...' : liveSupply === 0 ? (
                  <span style={{ color: '#22c55e' }}>FREE</span>
                ) : (
                  `${formatETH(priceETH)} ETH`
                )}
              </div>
              <div style={{ color: 'var(--grey-500)' }}>
                {liveSupply === 0 ? 'First claw is free!' : formatUSD(priceETH, ethPrice)}
              </div>
            </div>
            
            {/* Stats Card — live from contract */}
            <div style={{
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {marketLoading ? '...' : liveSupply}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Supply</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {isVerified ? '✓' : '—'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Verified</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {marketLoading ? '...' : `${formatETH(lifetimeVolumeETH)} ETH`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Volume</div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {marketLoading ? '...' : `${formatETH(lifetimeFeesETH)} ETH`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-600)', textTransform: 'uppercase' }}>Agent Fees</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trade Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            maxWidth: '400px',
            paddingBottom: '1rem',
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
