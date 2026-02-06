'use client';

import { useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
import { getAgentList } from '@/lib/agents';
import { useMemo } from 'react';

const BASE_CHAIN_ID = 8453;

/**
 * Aggregates protocol-wide stats from all known markets.
 * Reads getMarket for each agent in a single multicall batch.
 */
export function useProtocolStats() {
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
      staleTime: 60_000, // 60s cache - protocol stats don't need to be real-time
      refetchInterval: 120_000, // refresh every 120s
    },
  });

  const stats = useMemo(() => {
    if (!data) return null;

    let totalClaws = 0;
    let totalVolumeWei = 0n;
    let totalFeesWei = 0n;
    let totalValueWei = 0n;
    let activeMarkets = 0;

    for (const result of data) {
      if (result.status !== 'success' || !result.result) continue;

      const [supply, , lifetimeFees, lifetimeVolume, , , createdAt, currentPrice] = result.result as readonly [bigint, bigint, bigint, bigint, string, boolean, bigint, bigint];
      
      const supplyNum = Number(supply);
      if (supplyNum > 0 || Number(createdAt) > 0) {
        activeMarkets++;
      }
      
      totalClaws += supplyNum;
      totalVolumeWei += lifetimeVolume;
      totalFeesWei += lifetimeFees;
      
      // Estimated market value = supply * current price (rough)
      totalValueWei += supply * currentPrice;
    }

    return {
      totalAgents: agents.length,
      activeMarkets,
      totalClaws,
      totalVolumeETH: parseFloat(formatEther(totalVolumeWei)),
      totalFeesETH: parseFloat(formatEther(totalFeesWei)),
      totalValueETH: parseFloat(formatEther(totalValueWei)),
    };
  }, [data, agents]);

  return { stats, isLoading };
}
