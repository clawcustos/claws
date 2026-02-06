'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther, formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
import { useMarket, useBuyPrice } from '@/hooks/useClaws';
import { useETHPrice } from '@/hooks/useETHPrice';
import { formatETH, AGENTS } from '@/lib/agents';

const CONTRACT = getContractAddress(8453);

// Validate X handle format
function isValidHandle(handle: string): boolean {
  return /^[a-zA-Z0-9_]{1,15}$/.test(handle);
}

export default function CreateMarketPage() {
  const { address, isConnected } = useAccount();
  const [handle, setHandle] = useState('');
  const [amount, setAmount] = useState('2');
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [error, setError] = useState('');
  const { ethPrice } = useETHPrice();
  
  const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();
  const buyAmount = Math.max(2, parseInt(amount) || 2);
  
  // Check if market already exists
  const { market, isLoading: marketLoading } = useMarket(cleanHandle || 'placeholder');
  const marketExists = cleanHandle ? (market?.createdAt !== undefined && Number(market.createdAt) > 0) : false;
  
  // Check if it's in the curated list
  const isCurated = cleanHandle ? Object.keys(AGENTS).some(h => h.toLowerCase() === cleanHandle) : false;
  
  // Get buy price for the amount
  const { price, totalCost, totalCostETH, isLoading: priceLoading } = useBuyPrice(cleanHandle || 'placeholder', buyAmount);
  
  // Price in ETH (before fees) and total cost (with fees)
  const priceETH = price ? parseFloat(formatEther(price)) : 0;
  const feesETH = totalCostETH - priceETH;
  const estimatedUSD = totalCostETH * ethPrice;
  
  // Write contract
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  
  // Handle success
  useEffect(() => {
    if (isSuccess) {
      setStep('success');
    }
  }, [isSuccess]);
  
  const handleValidate = useCallback(() => {
    setError('');
    
    if (!cleanHandle) {
      setError('Enter an X handle');
      return false;
    }
    
    if (!isValidHandle(cleanHandle)) {
      setError('Invalid handle format. Use letters, numbers, and underscores only (max 15 chars)');
      return false;
    }
    
    if (marketExists) {
      setError('Market already exists for @' + cleanHandle + '. Go to their profile to trade.');
      return false;
    }
    
    if (buyAmount < 2) {
      setError('Minimum 2 claws to create a market');
      return false;
    }
    
    return true;
  }, [cleanHandle, marketExists, buyAmount]);
  
  const handleCreateMarket = useCallback(() => {
    if (!handleValidate()) return;
    if (!totalCost) return;
    
    // Add 5% buffer for gas estimation variance
    const buffered = (totalCost * 105n) / 100n;
    
    writeContract({
      address: CONTRACT,
      abi: CLAWS_ABI,
      functionName: 'buyClaws',
      args: [cleanHandle, BigInt(buyAmount)],
      value: buffered,
    });
  }, [handleValidate, cleanHandle, buyAmount, totalCost, writeContract]);
  
  const tweetText = encodeURIComponent(
    `just created a @claws_tech market for @${cleanHandle} 🦞\n\ntrade their claws → claws.tech/agent/${cleanHandle}`
  );
  const tweetUrl = `https://x.com/intent/tweet?text=${tweetText}`;
  
  // Input step
  if (step === 'success') {
    return (
      <main className="main" style={{ paddingTop: 'calc(var(--header-height) + env(safe-area-inset-top, 0px))' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦞</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Market Created!</h1>
          <p style={{ color: 'var(--grey-400)', marginBottom: '2rem' }}>
            @{cleanHandle} now has a claw market. You own the first {buyAmount} claws.
          </p>
          
          {/* Share Tweet CTA */}
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-red"
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '1rem 2rem', fontSize: '1rem', marginBottom: '1rem', textDecoration: 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Share on X
          </a>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link 
              href={`/agent/${cleanHandle}`} 
              className="btn btn-ghost"
              style={{ textDecoration: 'none' }}
            >
              View Market
            </Link>
            <button 
              onClick={() => { setStep('input'); setHandle(''); setAmount('2'); }}
              className="btn btn-ghost"
            >
              Create Another
            </button>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="main" style={{ paddingTop: 'calc(var(--header-height) + env(safe-area-inset-top, 0px))' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', marginTop: '0.5rem' }}>
          Create a <span style={{ color: 'var(--red)' }}>Market</span>
        </h1>
        <p style={{ color: 'var(--grey-400)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Start a claw market for any AI agent. Buy their first claws to create it.
        </p>
        
        {/* Handle Input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--grey-300)' }}>
            Agent X Handle
          </label>
          <div style={{ 
            display: 'flex', alignItems: 'center',
            background: 'var(--black-surface)', border: '1px solid var(--grey-800)',
            borderRadius: '8px', padding: '0 1rem',
          }}>
            <span style={{ color: 'var(--grey-500)', fontSize: '1rem' }}>@</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => { setHandle(e.target.value.replace(/^@/, '')); setError(''); }}
              placeholder="agent_handle"
              maxLength={15}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'white', fontSize: '1rem', padding: '0.875rem 0.5rem',
                fontFamily: 'inherit',
              }}
            />
            {cleanHandle && !marketLoading && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: marketExists ? '#ef4444' : isCurated ? 'var(--red)' : '#22c55e',
                whiteSpace: 'nowrap',
              }}>
                {marketExists ? 'Exists' : isCurated ? 'Curated ✓' : 'Available'}
              </span>
            )}
          </div>
          {cleanHandle && marketExists && (
            <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)', marginTop: '0.25rem' }}>
              <Link href={`/agent/${cleanHandle}`} style={{ color: 'var(--red)' }}>
                Go to existing market →
              </Link>
            </div>
          )}
        </div>
        
        {/* Amount Input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--grey-300)' }}>
            Claws to Buy <span style={{ color: 'var(--grey-600)' }}>(min 2)</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[2, 5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => setAmount(String(n))}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '8px',
                  background: parseInt(amount) === n ? 'var(--red)' : 'var(--black-surface)',
                  border: `1px solid ${parseInt(amount) === n ? 'var(--red)' : 'var(--grey-800)'}`,
                  color: 'white', fontWeight: 600, cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {n}
              </button>
            ))}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/^0+/, '') || '')}
              min={2}
              style={{
                width: '4rem', padding: '0.75rem', borderRadius: '8px',
                background: 'var(--black-surface)', border: '1px solid var(--grey-800)',
                color: 'white', textAlign: 'center', fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
        
        {/* Cost Estimate */}
        {cleanHandle && !marketExists && buyAmount >= 2 && (
          <div style={{ 
            background: 'var(--black-surface)', border: '1px solid var(--grey-800)',
            borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>Claws</span>
              <span style={{ fontSize: '0.875rem' }}>{buyAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>Curve Price</span>
              <span style={{ fontSize: '0.875rem' }}>
                {priceLoading ? '...' : `${formatETH(priceETH)} ETH`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--grey-400)', fontSize: '0.875rem' }}>Fees (10%)</span>
              <span style={{ fontSize: '0.875rem' }}>
                {priceLoading ? '...' : `${formatETH(feesETH)} ETH`}
              </span>
            </div>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              borderTop: '1px solid var(--grey-800)', paddingTop: '0.5rem', marginTop: '0.25rem',
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Total</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {priceLoading ? '...' : `~${formatETH(totalCostETH)} ETH`}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--grey-500)' }}>
                  {priceLoading ? '' : `~$${estimatedUSD.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error */}
        {(error || writeError) && (
          <div style={{ 
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.875rem', color: '#ef4444',
          }}>
            {error || (writeError as Error)?.message?.slice(0, 200) || 'Transaction failed'}
          </div>
        )}
        
        {/* Action Button */}
        {!isConnected ? (
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="btn btn-red"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        ) : (
          <button
            onClick={handleCreateMarket}
            disabled={!cleanHandle || marketExists || buyAmount < 2 || isPending || isConfirming || priceLoading}
            className="btn btn-red"
            style={{ 
              width: '100%', padding: '1rem', fontSize: '1rem',
              opacity: (!cleanHandle || marketExists || buyAmount < 2 || isPending || isConfirming) ? 0.5 : 1,
            }}
          >
            {isPending ? 'Confirm in wallet...' : isConfirming ? 'Creating market...' : `Create Market — Buy ${buyAmount} Claws`}
          </button>
        )}
        
        {/* Info */}
        <div style={{ 
          marginTop: '2rem', padding: '1rem',
          background: 'var(--black-surface)', borderRadius: '8px',
          fontSize: '0.8125rem', color: 'var(--grey-400)', lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 600, color: 'var(--grey-300)', marginBottom: '0.5rem' }}>How it works</div>
          <div>• Anyone can create a market for any AI agent by their X handle</div>
          <div>• Minimum 2 claws to create — puts skin in the game</div>
          <div>• Market goes live instantly on the bonding curve</div>
          <div>• The agent can verify later to claim 5% of all trade fees</div>
          <div>• New markets appear on the <Link href="/new" style={{ color: 'var(--red)' }}>New Markets</Link> page</div>
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--grey-800)' }}>
            🦞 <strong>Agent?</strong> Give your agent <a href="/skills.md" target="_blank" style={{ color: 'var(--red)' }}>claws.tech/skills.md</a> and it'll handle everything.
          </div>
        </div>
      </div>
    </main>
  );
}
