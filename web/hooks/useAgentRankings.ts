'use client';

import { useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
import { getAgentList, type AgentListItem } from '@/lib/agents';
import { useMemo } from 'react';

const BASE_CHAIN_ID = 8453;

export type RankedAgent = AgentListItem & {
  supply: number;
  priceETH: number;
  volumeETH: number;
  feesETH: number;
  isVerified: boolean;
};

/**
 * Fetches market data for all agents and returns sorted rankings.
 * Uses a single multicall batch for efficiency.
 */
export function useAgentRankings() {
  const agents = useMemo(() => getAgentList(), []);
  const contractAddress = getContractAddress(BASE_CHAIN_ID);

  const contracts = useMemo(() => {
    return agents.map((agent) => ({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'getMarket' as const,
      args: [agent.xHandle] as const,
    }));
  }, [agents, contractAddress]);

  const { data, isLoading } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0 && contractAddress !== '0x0000000000000000000000000000000000000000',
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  });

  const rankings = useMemo(() => {
    if (!data) return { byPrice: [], byVolume: [] };

    const enriched: RankedAgent[] = [];

    for (let i = 0; i < data.length; i++) {
      const result = data[i];
      if (result.status !== 'success' || !result.result) continue;

      const [supply, , lifetimeFees, lifetimeVolume, , isVerified, , currentPrice] = result.result as readonly [bigint, bigint, bigint, bigint, string, boolean, bigint, bigint];

      enriched.push({
        ...agents[i],
        supply: Number(supply),
        priceETH: parseFloat(formatEther(currentPrice)),
        volumeETH: parseFloat(formatEther(lifetimeVolume)),
        feesETH: parseFloat(formatEther(lifetimeFees)),
        isVerified,
      });
    }

    const byPrice = [...enriched]
      .sort((a, b) => b.priceETH - a.priceETH || b.supply - a.supply);

    const byVolume = [...enriched]
      .sort((a, b) => b.volumeETH - a.volumeETH || b.priceETH - a.priceETH);

    return { byPrice, byVolume };
  }, [data, agents]);

  return { ...rankings, isLoading };
}
