'use client';

import { usePublicClient, useReadContracts } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { keccak256, toHex, parseEventLogs, formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';
import { base } from 'viem/chains';

const BASE_CHAIN_ID = 8453;

// Trade event signature for filtering
const TRADE_EVENT_SIGNATURE = keccak256(
  toHex('Trade(bytes32,address,bool,uint256,uint256,uint256,uint256,uint256)')
);

export interface Holder {
  address: `0x${string}`;
  balance: bigint;
  balanceNumber: number;
}

/**
 * Hook to fetch all holders for a given agent handle
 * Uses getLogs to find unique trader addresses from Trade events,
 * then batch-reads their current balances
 */
export function useHolders(handle: string) {
  const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  const handleHash = keccak256(toHex(handle));

  const { data: holders, isLoading, error } = useQuery({
    queryKey: ['holders', handle, contractAddress],
    queryFn: async (): Promise<Holder[]> => {
      if (!publicClient || !handle || contractAddress === '0x0000000000000000000000000000000000000000') {
        return [];
      }

      // Fetch all Trade events for this handle
      // Since trader is indexed, we can't filter by handleHash directly in the topic
      // We need to fetch all Trade events and filter by handleHash
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: {
          type: 'event',
          name: 'Trade',
          inputs: [
            { indexed: true, name: 'handleHash', type: 'bytes32' },
            { indexed: true, name: 'trader', type: 'address' },
            { indexed: false, name: 'isBuy', type: 'bool' },
            { indexed: false, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'price', type: 'uint256' },
            { indexed: false, name: 'protocolFee', type: 'uint256' },
            { indexed: false, name: 'agentFee', type: 'uint256' },
            { indexed: false, name: 'newSupply', type: 'uint256' },
          ],
        },
        args: {
          handleHash,
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Extract unique trader addresses
      const uniqueTraders = new Set<`0x${string}`>();
      for (const log of logs) {
        if (log.args.trader) {
          uniqueTraders.add(log.args.trader);
        }
      }

      if (uniqueTraders.size === 0) {
        return [];
      }

      // Convert to array and limit to 50 addresses to prevent RPC overload
      const traderAddresses = Array.from(uniqueTraders).slice(0, 50);

      // Batch read balances for all traders
      const contracts = traderAddresses.map((address) => ({
        address: contractAddress,
        abi: CLAWS_ABI,
        functionName: 'getBalance',
        args: [handle, address],
      } as const));

      const results = await publicClient.multicall({
        contracts,
        allowFailure: false,
      });

      // Build holders array with balances
      const holdersData: Holder[] = traderAddresses
        .map((address, index) => {
          const balance = results[index] as bigint;
          return {
            address,
            balance,
            balanceNumber: Number(balance),
          };
        })
        .filter((holder) => holder.balance > 0n) // Only include holders with non-zero balance
        .sort((a, b) => Number(b.balance) - Number(a.balance)) // Sort by balance descending
        .slice(0, 20); // Limit to top 20 holders

      return holdersData;
    },
    enabled: !!handle && !!publicClient && contractAddress !== '0x0000000000000000000000000000000000000000',
    staleTime: 30_000, // 30s cache
    refetchInterval: 60_000, // Refetch every minute
  });

  return {
    holders: holders ?? [],
    isLoading,
    error,
  };
}
