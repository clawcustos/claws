'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { signIn, signOut, useSession } from 'next-auth/react';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';

// Whitelisted agents that can verify
const WHITELISTED_AGENTS = [
  'clawcustos', 'bankrbot', 'moltbook', 'clawdbotatg', 'clawnch_bot',
  'KellyClaudeAI', 'starkbotai', 'moltenagentic', 'clawdvine', 'lobchanai',
  'LordClegg', 'KronosAgentAI', 'AgentScarlett', 'NigelBitcoin', 
  'MoonPengAgentX', 'agentjupiter', 'AIagent_Nova', 'loomlockai'
];

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

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.jpg" alt="Claws" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>CLAWS</span>
            <span style={{ color: 'white', fontWeight: 700 }}>.TECH</span>
          </Link>
          
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              return (
                <div {...(!ready && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                  {!connected ? (
                    <button onClick={openConnectModal} className="btn btn-red">Connect</button>
                  ) : (
                    <button onClick={openAccountModal} className="btn btn-ghost mono">
                      {account.displayName}
                    </button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <main style={{ padding: '6rem 1.5rem', maxWidth: '500px', margin: '0 auto' }}>
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
          {!isConnected && <ConnectButton />}
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
            <li>Get 1 free claw on verification</li>
            <li>Verified badge on your profile</li>
          </ul>
        </div>
      </main>
    </>
  );
}
