import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem, formatEther } from 'viem';
import { base } from 'viem/chains';
import { getContractAddress, CLAWS_ABI } from '@/lib/contracts';
import { AGENTS } from '@/lib/agents';

const BASE_CHAIN_ID = 8453;

export interface CommunityMarket {
  handle: string;
  creator: string;
  supply: number;
  priceETH: number;
  volumeETH: number;
  isVerified: boolean;
  createdAt: number;
}

// Get all curated handles (lowercase) for filtering
const curatedHandles = new Set(
  Object.values(AGENTS).map(a => a.xHandle.toLowerCase())
);

export function useCommunityMarkets() {
  const [markets, setMarkets] = useState<CommunityMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const contractAddress = getContractAddress(BASE_CHAIN_ID);
    if (contractAddress === '0x0000000000000000000000000000000000000000') return;

    const client = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://mainnet.base.org'),
    });

    async function fetchMarkets() {
      try {
        // Get all MarketCreated events
        const logs = await client.getLogs({
          address: contractAddress,
          event: parseAbiItem('event MarketCreated(bytes32 indexed handleHash, string handle, address creator)'),
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Filter to community-only (not in curated list)
        const communityLogs = logs.filter(
          log => !curatedHandles.has((log.args.handle || '').toLowerCase())
        );

        if (communityLogs.length === 0) {
          setMarkets([]);
          setIsLoading(false);
          return;
        }

        // Batch read market data for all community handles
        const handles = communityLogs.map(l => l.args.handle || '');
        
        const marketCalls = handles.map(handle => ({
          address: contractAddress,
          abi: CLAWS_ABI,
          functionName: 'getMarket' as const,
          args: [handle],
        }));

        const priceCalls = handles.map(handle => ({
          address: contractAddress,
          abi: CLAWS_ABI,
          functionName: 'getCurrentPrice' as const,
          args: [handle],
        }));

        const [marketResults, priceResults] = await Promise.all([
          client.multicall({ contracts: marketCalls }),
          client.multicall({ contracts: priceCalls }),
        ]);

        const enriched: CommunityMarket[] = handles.map((handle, i) => {
          const m = marketResults[i];
          const p = priceResults[i];
          
          if (m.status !== 'success' || !m.result) {
            return { handle, creator: communityLogs[i].args.creator || '', supply: 0, priceETH: 0, volumeETH: 0, isVerified: false, createdAt: 0 };
          }

          const result = m.result as readonly [bigint, bigint, bigint, bigint, string, boolean, bigint, bigint];
          
          return {
            handle,
            creator: communityLogs[i].args.creator || '',
            supply: Number(result[0]),
            priceETH: p.status === 'success' ? parseFloat(formatEther(p.result as bigint)) : 0,
            volumeETH: parseFloat(formatEther(result[3])),
            isVerified: result[5] as boolean,
            createdAt: Number(result[6]),
          };
        });

        setMarkets(enriched);
      } catch (err) {
        console.error('Failed to fetch community markets:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarkets();
  }, []);

  return { markets, isLoading };
}
