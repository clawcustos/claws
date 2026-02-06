'use client';

import { useState, useEffect, useRef } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';

const CONTRACT = getContractAddress(8453);

interface TradeEvent {
  id: string;
  trader: string;
  handle: string;
  isBuy: boolean;
  amount: number;
  priceETH: string;
  timestamp: number;
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ActivityTicker() {
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Watch for new Trade events in real-time
  useWatchContractEvent({
    address: CONTRACT,
    abi: CLAWS_ABI,
    eventName: 'Trade',
    onLogs(logs) {
      const newTrades = logs.map((log) => {
        const args = log.args as {
          handleHash: `0x${string}`;
          trader: `0x${string}`;
          isBuy: boolean;
          amount: bigint;
          price: bigint;
          protocolFee: bigint;
          agentFee: bigint;
          newSupply: bigint;
        };
        
        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          trader: args.trader || '0x',
          handle: '', // We don't have handle string from event (only hash)
          isBuy: args.isBuy ?? true,
          amount: Number(args.amount || 0n),
          priceETH: args.price ? parseFloat(formatEther(args.price)).toFixed(4) : '0',
          timestamp: Date.now(),
        };
      });
      
      setTrades(prev => [...newTrades, ...prev].slice(0, 20));
    },
  });

  const tickerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 'var(--header-height, 60px)',
    left: 0,
    right: 0,
    zIndex: 40,
    overflow: 'hidden',
    borderBottom: '1px solid var(--grey-800)',
    background: 'var(--black-elevated, #0a0a0a)',
  };

  // If no live trades yet, show placeholder
  if (trades.length === 0) {
    return (
      <div style={tickerStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--grey-500)',
          padding: '0.5rem 0',
        }}>
          <span style={{ 
            width: '6px', height: '6px', borderRadius: '50%', 
            background: 'var(--red)', display: 'inline-block',
            animation: 'pulse 2s infinite',
          }} />
          Watching for trades...
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  // Duplicate trades for seamless loop
  const displayTrades = [...trades, ...trades];

  return (
    <div style={tickerStyle}>
      <div 
        ref={tickerRef}
        style={{
          display: 'flex',
          gap: '2rem',
          padding: '0.5rem 1rem',
          animation: 'scroll-left 30s linear infinite',
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {displayTrades.map((trade, i) => (
          <div 
            key={`${trade.id}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            <span style={{ 
              color: trade.isBuy ? 'var(--green, #22c55e)' : 'var(--red)',
              fontWeight: 700,
            }}>
              {trade.isBuy ? '▲ BUY' : '▼ SELL'}
            </span>
            <span style={{ color: 'var(--grey-400)' }}>
              {shortenAddress(trade.trader)}
            </span>
            <span style={{ color: 'var(--grey-300)', fontFamily: 'var(--font-mono)' }}>
              {trade.amount} claw{trade.amount !== 1 ? 's' : ''}
            </span>
            <span style={{ color: 'var(--grey-500)' }}>
              {trade.priceETH} ETH
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
