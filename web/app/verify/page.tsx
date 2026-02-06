'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { signIn, signOut, useSession } from 'next-auth/react';
import { formatEther } from 'viem';
// Header + BottomNav provided by layout
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
import { useMarket } from '@/hooks/useClaws';
import { formatETH } from '@/lib/agents';

// Whitelisted agents that can verify
const WHITELISTED_AGENTS = [
  // Original whitelist
  'clawcustos', 'bankrbot', 'moltbook', 'clawdbotatg', 'clawnch_bot',
  'KellyClaudeAI', 'starkbotai', 'moltenagentic', 'clawdvine', 'lobchanai',
  'LordClegg', 'KronosAgentAI', 'AgentScarlett', 'NigelBitcoin', 
  'MoonPengAgentX', 'agentjupiter', 'AIagent_Nova', 'loomlockai',
  // Display list agents
  'CLAWD_Token', 'clawcaster', '0_x_coral', 'Clawdia772541',
  'agentrierxyz', 'clawditor', 'moltipedia_ai', 'solvrbot',
  // Vetted 2026-02-06
  'ClawdMarket', 'clawbrawl2026', 'ConwayResearch', 'moltxio',
  'moltlaunch', 'clawmartxyz', 'moltverse_space',
];

// Agent Management Dashboard — shown when already verified
function AgentDashboard({ handle, market }: { 
  handle: string; 
  market: {
    supply: bigint;
    pendingFees: bigint;
    lifetimeFees: bigint;
    lifetimeVolume: bigint;
    verifiedWallet: `0x${string}`;
    isVerified: boolean;
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
      address: getContractAddress(8453),
      abi: CLAWS_ABI,
      functionName: 'claimFees',
      args: [handle],
    });
  };

  return (
    <div>
      {/* Status Banner */}
      <div style={{
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
        }}>
          ✓
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#22c55e' }}>@{handle} is verified</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--grey-400)' }}>
            Earning 5% on all trades
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          background: 'var(--black-surface)',
          border: '1px solid var(--grey-800)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Pending Fees</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatETH(pendingFeesETH)} ETH</div>
        </div>
        <div style={{
          background: 'var(--black-surface)',
          border: '1px solid var(--grey-800)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Lifetime Fees</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatETH(lifetimeFeesETH)} ETH</div>
        </div>
        <div style={{
          background: 'var(--black-surface)',
          border: '1px solid var(--grey-800)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Trade Volume</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatETH(lifetimeVolumeETH)} ETH</div>
        </div>
        <div style={{
          background: 'var(--black-surface)',
          border: '1px solid var(--grey-800)',
          borderRadius: '12px',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Supply</div>
          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{Number(market.supply)}</div>
        </div>
      </div>

      {/* Wallet Info */}
      <div style={{
        background: 'var(--black-surface)',
        border: '1px solid var(--grey-800)',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Fee Wallet</div>
        <div className="mono" style={{ fontSize: '0.875rem', color: 'var(--grey-300)', wordBreak: 'break-all' }}>
          {market.verifiedWallet}
        </div>
        {!isOwner && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--grey-600)', marginTop: '0.75rem', fontStyle: 'italic' }}>
            Connect as {market.verifiedWallet.slice(0, 6)}...{market.verifiedWallet.slice(-4)} to claim fees
          </div>
        )}
      </div>

      {/* Claim Button */}
      {isOwner && pendingFeesETH > 0 && (
        <button
          onClick={handleClaimFees}
          disabled={isPending || isConfirming}
          className="btn btn-red"
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {isPending || isConfirming 
            ? 'Claiming...' 
            : `Claim ${formatETH(pendingFeesETH)} ETH`
          }
        </button>
      )}
      
      {isOwner && pendingFeesETH === 0 && (
        <div style={{ 
          padding: '1rem', 
          background: 'var(--black-surface)', 
          border: '1px solid var(--grey-800)',
          borderRadius: '12px', 
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--grey-500)',
        }}>
          No pending fees to claim — fees accumulate as people trade your claws
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

      {/* View Profile Link */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link 
          href={`/agent/${handle}`}
          style={{ color: 'var(--red)', fontSize: '0.875rem', textDecoration: 'none' }}
        >
          View your agent profile →
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const xHandle = session?.twitterUsername;
  const isWhitelisted = xHandle ? WHITELISTED_AGENTS.some(h => h.toLowerCase() === xHandle.toLowerCase()) : false;

  // Check on-chain verification status
  const { market, isLoading: marketLoading } = useMarket(xHandle || '');
  const isAlreadyVerified = market?.isVerified || false;

  const handleVerify = async () => {
    if (!isConnected || !address || !xHandle) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      // Get signed verification data from backend
      const res = await fetch('/api/verify/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          handle: xHandle,
          walletAddress: address 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to generate verification');
        setVerifying(false);
        return;
      }
      
      if (data.alreadyVerified) {
        setSuccess(true);
        setVerifying(false);
        return;
      }
      
      // Call contract with signed data
      const { handle, wallet, timestamp, nonce, signature } = data.verificationData;
      
      writeContract({
        address: getContractAddress(8453),
        abi: CLAWS_ABI,
        functionName: 'verifyAndClaim',
        args: [handle, wallet, BigInt(timestamp), BigInt(nonce), signature],
      });
      
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  // Track success
  if (isSuccess && !success) {
    setSuccess(true);
  }

  // If user is signed in with X and already verified on-chain, show management dashboard
  const showDashboard = xHandle && isAlreadyVerified && !marketLoading;

  return (
    <>
      <main className="main" style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
        {showDashboard ? (
          <>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--red)' }}>Manage</span> Your Agent
            </h1>
            <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>
              Your agent dashboard — track fees, volume, and manage your listing.
            </p>
            <AgentDashboard handle={xHandle} market={market as any} />
          </>
        ) : (
          <>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--red)' }}>Verify</span> Your Agent
            </h1>
            <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>
              Prove you own the X account to claim your agent and earn 5% of all trades.
            </p>

            {/* Step 1: Connect Wallet */}
            <div style={{
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isConnected ? '#22c55e' : 'var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}>
                  {isConnected ? '✓' : '1'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Connect Wallet</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--grey-500)' }}>
                    {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect to receive fees'}
                  </div>
                </div>
              </div>
              {!isConnected && (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button 
                      onClick={openConnectModal}
                      className="btn btn-red"
                      style={{ width: '100%' }}
                    >
                      Connect Wallet
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
            </div>

            {/* Step 2: Sign in with X */}
            <div style={{
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              opacity: isConnected ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: xHandle ? '#22c55e' : 'var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}>
                  {xHandle ? '✓' : '2'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Sign in with X</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--grey-500)' }}>
                    {xHandle ? `@${xHandle}` : 'Prove you own the account'}
                  </div>
                </div>
              </div>
              {isConnected && !xHandle && (
                <button 
                  onClick={() => signIn('twitter')}
                  className="btn btn-red"
                  style={{ width: '100%' }}
                >
                  Sign in with X
                </button>
              )}
              {xHandle && (
                <button 
                  onClick={() => signOut()}
                  className="btn btn-ghost"
                  style={{ width: '100%' }}
                >
                  Sign out @{xHandle}
                </button>
              )}
            </div>

            {/* Step 3: Verify */}
            <div style={{
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              opacity: xHandle ? 1 : 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: success ? '#22c55e' : 'var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}>
                  {success ? '✓' : '3'}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>Complete Verification</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--grey-500)' }}>
                    {success ? 'Verified!' : !isWhitelisted && xHandle ? 'Not on whitelist' : 'Claim your agent on-chain'}
                  </div>
                </div>
              </div>
              
              {xHandle && !isWhitelisted && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                }}>
                  @{xHandle} is not on the whitelist. Contact @claws_tech to get listed.
                </div>
              )}
              
              {xHandle && isWhitelisted && !success && (
                <button 
                  onClick={handleVerify}
                  disabled={verifying || isPending || isConfirming}
                  className="btn btn-red"
                  style={{ width: '100%' }}
                >
                  {isPending || isConfirming ? 'Confirming...' : verifying ? 'Preparing...' : `Verify @${xHandle}`}
                </button>
              )}
              
              {error && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                }}>
                  {error}
                </div>
              )}
              
              {success && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  borderRadius: '8px',
                  color: '#22c55e',
                  fontSize: '0.875rem',
                  marginTop: '1rem',
                }}>
                  @{xHandle} verified! You now earn 5% on all trades.
                  {hash && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <a 
                        href={`https://basescan.org/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#22c55e', textDecoration: 'underline' }}
                      >
                        View transaction →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Why verify */}
            <div style={{ 
              marginTop: '2rem', 
              padding: '1.5rem',
              background: 'var(--black-surface)',
              border: '1px solid var(--grey-800)',
              borderRadius: '12px',
            }}>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Why verify?</div>
              <ul style={{ 
                fontSize: '0.875rem', 
                color: 'var(--grey-400)',
                paddingLeft: '1.25rem',
                margin: 0,
                lineHeight: 1.8,
              }}>
                <li>Earn 5% of all trades on your agent</li>
                <li>Verified badge on your profile</li>
                <li>Agent dashboard to track fees and volume</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </>
  );
}
