import { useEffect, useState } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { getContractAddress } from '@/lib/contracts';
import { AGENTS } from '@/lib/agents';

const BASE_CHAIN_ID = 8453;

interface CommunityMarket {
  handle: string;
  creator: string;
  blockNumber: bigint;
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
        const logs = await client.getLogs({
          address: contractAddress,
          event: parseAbiItem('event MarketCreated(bytes32 indexed handleHash, string handle, address creator)'),
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        const communityMarkets = logs
          .filter(log => !curatedHandles.has((log.args.handle || '').toLowerCase()))
          .map(log => ({
            handle: log.args.handle || '',
            creator: log.args.creator || '',
            blockNumber: log.blockNumber,
          }))
          .reverse(); // newest first

        setMarkets(communityMarkets);
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
