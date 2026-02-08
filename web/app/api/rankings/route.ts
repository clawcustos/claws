import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';
import { CLAWS_ABI, CONTRACTS } from '@/lib/contracts';
import { getAgentList, type AgentListItem } from '@/lib/agents';
import { type NextRequest } from 'next/server';

// Cache configuration
interface CachedData {
  data: {
    byPrice: RankedAgent[];
    byVolume: RankedAgent[];
  };
  timestamp: number;
}

let cache: CachedData | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds

export type RankedAgent = AgentListItem & {
  supply: number;
  priceETH: number;
  volumeETH: number;
  feesETH: number;
  isVerified: boolean;
};

// Edge runtime for speed
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const now = Date.now();

  // Return cached data if still valid
  if (cache && now - cache.timestamp < CACHE_TTL_MS) {
    return new Response(JSON.stringify(cache.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    const agents = getAgentList();
    const contractAddress = CONTRACTS.base.claws;

    // Create viem client
    const client = createPublicClient({
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://mainnet.base.org'
      ),
    });

    // Build multicall contracts
    const contracts = agents.map((agent) => ({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'getMarket' as const,
      args: [agent.xHandle] as const,
    }));

    // Execute multicall
    const results = await client.multicall({ contracts });

    // Process results
    const enriched: RankedAgent[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status !== 'success' || !result.result) continue;

      const [
        supply,
        ,
        lifetimeFees,
        lifetimeVolume,
        ,
        isVerified,
        ,
        currentPrice,
      ] = result.result as readonly [
        bigint,
        bigint,
        bigint,
        bigint,
        string,
        boolean,
        bigint,
        bigint
      ];

      enriched.push({
        ...agents[i],
        supply: Number(supply),
        priceETH: parseFloat(formatEther(currentPrice)),
        volumeETH: parseFloat(formatEther(lifetimeVolume)),
        feesETH: parseFloat(formatEther(lifetimeFees)),
        isVerified,
      });
    }

    const byPrice = [...enriched].sort(
      (a, b) => b.priceETH - a.priceETH || b.supply - a.supply
    );

    const byVolume = [...enriched].sort(
      (a, b) => b.volumeETH - a.volumeETH || b.priceETH - a.priceETH
    );

    const responseData = { byPrice, byVolume };

    // Update cache
    cache = {
      data: responseData,
      timestamp: now,
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Rankings API error:', error);

    // Return stale cache if available (graceful degradation)
    if (cache) {
      return new Response(JSON.stringify(cache.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'STALE',
        },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Failed to fetch rankings' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
