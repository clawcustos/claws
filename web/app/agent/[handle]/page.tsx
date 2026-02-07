'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, keccak256, toBytes } from 'viem';
import { TradeModal } from '@/components/trade-modal';
import { getAgent, formatETH } from '@/lib/agents';
import { useMarket, useCurrentPrice, useClawBalance } from '@/hooks/useClaws';
import { useHolders } from '@/hooks/useHolders';
import { HoldersTable } from '@/components/holders-table';
import { useETHPrice } from '@/hooks/useETHPrice';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
import { ERC8004Badge } from '@/components/erc8004-badge';
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
      padding: '1.25rem',
      marginBottom: '1.5rem',
      maxWidth: '480px',
    }}>
      <div style={{ 
        fontSize: '0.75rem',
        color: 'var(--red)',
        fontWeight: 600,
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        ✓ Verified Agent
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div className="mono" style={{ fontSize: '1rem', fontWeight: 700 }}>
            {formatETH(pendingFeesETH)} ETH
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--grey-500)' }}>Pending Fees</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '1rem', fontWeight: 700 }}>
            {formatETH(lifetimeFeesETH)} ETH
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--grey-500)' }}>Lifetime Fees</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '1rem', fontWeight: 700 }}>
            {formatETH(lifetimeVolumeETH)} ETH
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--grey-500)' }}>Trade Volume</div>
        </div>
      </div>
      
      <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', marginBottom: '0.75rem' }}>
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
  const { holders, isLoading: holdersLoading } = useHolders(handle);
  
  // Read on-chain metadata
  const handleHash = keccak256(toBytes(handle));
  const { data: metadata } = useReadContract({
    address: getContractAddress(BASE_CHAIN_ID),
    abi: CLAWS_ABI,
    functionName: 'agentMetadata',
    args: [handleHash],
    query: { staleTime: 60_000 },
  }) as { data: readonly [string, string, `0x${string}`] | undefined };
  
  const onChainBio = metadata?.[0] || '';
  const onChainWebsite = metadata?.[1] || '';
  const onChainToken = metadata?.[2] && metadata[2] !== '0x0000000000000000000000000000000000000000' ? metadata[2] : '';

  // Use live data
  const isVerified = market?.isVerified || false;
  const liveSupply = market ? Number(market.supply) : 0;
  const userClaws = userBalance !== undefined ? Number(userBalance) : 0;
  
  // Check if market exists on-chain (for community-created markets not in curated list)
  const marketExists = market && market.supply > 0n;
  
  if (!agent && !marketExists && !marketLoading) {
    return (
      <main className="main">
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
  
  // For community markets: use on-chain data + X avatar fallback
  const displayName = agent?.name || handle;
  const displayImage = agent?.xProfileImage || `https://unavatar.io/x/${handle}`;
  const displayBio = onChainBio || agent?.description || '';

  const priceETH = livePriceETH || agent?.priceETH || 0;
  const lifetimeVolumeETH = market ? parseFloat(formatEther(market.lifetimeVolume)) : 0;
  const lifetimeFeesETH = market ? parseFloat(formatEther(market.lifetimeFees)) : 0;

  const openTrade = (mode: 'buy' | 'sell') => {
    setTradeMode(mode);
    setIsTradeModalOpen(true);
  };

  return (
    <>
      <main className="main">
        <section className="section">
          {/* Breadcrumb */}
          <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
            <Link href="/explore" style={{ color: 'var(--grey-500)', textDecoration: 'none' }}>Explore</Link>
            <span style={{ color: 'var(--grey-700)', margin: '0 0.5rem' }}>›</span>
            <span style={{ color: 'var(--grey-400)' }}>{displayName}</span>
          </div>
          
          {/* Profile Header */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: isVerified ? '3px solid var(--red)' : '3px solid var(--grey-700)',
              boxShadow: isVerified ? '0 0 40px var(--red-glow)' : 'none',
              flexShrink: 0,
            }}>
              <Image 
                src={displayImage} 
                alt={displayName}
                width={100}
                height={100}
                unoptimized
              />
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{ 
                fontSize: '1.75rem', 
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                {displayName}
                {isVerified && (
                  <span style={{
                    width: '22px',
                    height: '22px',
                    background: 'var(--red)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                  }}>
                    ✓
                  </span>
                )}
                {isVerified && <ERC8004Badge walletAddress={market?.verifiedWallet} />}
              </h1>
              <a 
                href={`https://x.com/${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--grey-500)', textDecoration: 'none', fontSize: '1rem' }}
              >
                @{handle}
              </a>
              <p style={{ color: 'var(--grey-400)', marginTop: '0.75rem', fontSize: '0.9375rem' }}>
                {displayBio}
              </p>
              {(onChainWebsite || onChainToken) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {onChainWebsite && (
                    <a 
                      href={onChainWebsite.startsWith('http') ? onChainWebsite : `https://${onChainWebsite}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--red)', fontSize: '0.8125rem', textDecoration: 'none' }}
                    >
                      🌐 {onChainWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}
                  {onChainToken && (
                    <a 
                      href={`https://basescan.org/token/${onChainToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--grey-500)', fontSize: '0.8125rem', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
                    >
                      🪙 {onChainToken.slice(0, 6)}...{onChainToken.slice(-4)}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price + Trade Buttons — right below bio */}
          <div style={{
            background: 'var(--black-surface)',
            border: '1px solid var(--grey-800)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            maxWidth: '480px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Price
                </div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  {marketLoading ? '...' : liveSupply === 0 ? (
                    <span style={{ color: 'var(--red)' }}>FREE</span>
                  ) : (
                    `${formatETH(priceETH)} ETH`
                  )}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--grey-500)' }}>
                  {liveSupply === 0 ? 'First claw is free!' : formatUSD(priceETH, ethPrice)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--grey-400)' }}>
                <div style={{ textAlign: 'center', padding: '0 0.75rem' }}>
                  <div className="mono" style={{ fontWeight: 700, color: 'var(--white)' }}>{marketLoading ? '...' : liveSupply}</div>
                  <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--grey-600)' }}>Supply</div>
                </div>
                {isConnected && userClaws > 0 && (
                  <div style={{ textAlign: 'center', padding: '0 0.75rem' }}>
                    <div className="mono" style={{ fontWeight: 700, color: 'var(--red)' }}>{userClaws}</div>
                    <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--grey-600)' }}>Yours</div>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isConnected ? (
              <>
                <button 
                  className="btn btn-buy" 
                  style={{ flex: 1, padding: '0.875rem', fontSize: '1rem' }}
                  onClick={() => openTrade('buy')}
                >
                  BUY
                </button>
                <button 
                  className="btn btn-sell" 
                  style={{ flex: 1, padding: '0.875rem', fontSize: '1rem' }}
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
                    style={{ flex: 1, padding: '0.875rem', fontSize: '1rem' }}
                    onClick={openConnectModal}
                  >
                    Connect to Trade
                  </button>
                )}
              </ConnectButton.Custom>
            )}
            </div>
          </div>

          {/* Verified Agent Dashboard */}
          {isVerified && market && (
            <AgentDashboard handle={handle} market={market as any} />
          )}

          {/* Market Stats — only show when dashboard is NOT visible (avoids duplication) */}
          {!isVerified && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              maxWidth: '480px',
            }}>
              <div style={{ background: 'var(--black-surface)', border: '1px solid var(--grey-800)', borderRadius: '12px', padding: '1rem' }}>
                <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {marketLoading ? '...' : formatUSD(lifetimeVolumeETH, ethPrice)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', marginTop: '0.125rem' }}>
                  {!marketLoading && `${formatETH(lifetimeVolumeETH)} ETH`}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Volume</div>
              </div>
              <div style={{ background: 'var(--black-surface)', border: '1px solid var(--grey-800)', borderRadius: '12px', padding: '1rem' }}>
                <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                  {marketLoading ? '...' : formatUSD(lifetimeFeesETH, ethPrice)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', marginTop: '0.125rem' }}>
                  {!marketLoading && `${formatETH(lifetimeFeesETH)} ETH`}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--grey-600)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Lifetime Fees</div>
              </div>
            </div>
          )}

          {/* Holders Table */}
          {holders.length > 0 && (
            <HoldersTable
              handle={handle}
              holders={holders}
              isLoading={holdersLoading}
            />
          )}
        </section>
      </main>
      
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        agentName={displayName}
        agentHandle={handle}
        agentImage={displayImage}
        initialMode={tradeMode}
      />
    </>
  );
}
