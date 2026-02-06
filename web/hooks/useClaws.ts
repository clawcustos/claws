'use client';

import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';

// Base mainnet
const BASE_CHAIN_ID = 8453;

/**
 * Hook to get market data for a handle
 */
export function useMarket(handle: string) {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getMarket',
    args: [handle],
    query: {
      enabled: !!handle && contractAddress !== '0x0000000000000000000000000000000000000000',
      staleTime: 15_000, // 15s cache - market data can be slightly stale for display
    },
  });

  // Contract returns tuple: [supply, pendingFees, lifetimeFees, lifetimeVolume, verifiedWallet, isVerified, createdAt, currentPrice]
  const tuple = data as readonly [bigint, bigint, bigint, bigint, `0x${string}`, boolean, bigint, bigint] | undefined;
  
  const market = tuple ? {
    supply: tuple[0],
    pendingFees: tuple[1],
    lifetimeFees: tuple[2],
    lifetimeVolume: tuple[3],
    verifiedWallet: tuple[4],
    isVerified: tuple[5],
    createdAt: tuple[6],
    currentPrice: tuple[7],
  } : undefined;

  return {
    market,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's claw balance for a handle
 */
export function useClawBalance(handle: string, userAddress?: `0x${string}`) {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getBalance',
    args: [handle, userAddress!],
    query: {
      enabled: !!handle && !!userAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
      staleTime: 5_000, // 5s cache - users need accurate balance for trading
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get buy price for amount
 */
export function useBuyPrice(handle: string, amount: number) {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getBuyCostBreakdown',
    args: [handle, BigInt(amount)],
    query: {
      enabled: !!handle && amount > 0 && contractAddress !== '0x0000000000000000000000000000000000000000',
      staleTime: 5_000, // 5s cache - used in trade modal, keep relatively fresh
    },
  });

  // Contract returns tuple: [price, protocolFee, agentFee, totalCost]
  const tuple = data as readonly [bigint, bigint, bigint, bigint] | undefined;

  return {
    price: tuple?.[0],
    protocolFee: tuple?.[1],
    agentFee: tuple?.[2],
    totalCost: tuple?.[3],
    totalCostETH: tuple?.[3] ? parseFloat(formatEther(tuple[3])) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to get sell price for amount
 */
export function useSellPrice(handle: string, amount: number) {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getSellProceedsBreakdown',
    args: [handle, BigInt(amount)],
    query: {
      enabled: !!handle && amount > 0 && contractAddress !== '0x0000000000000000000000000000000000000000',
      staleTime: 5_000, // 5s cache - used in trade modal, keep relatively fresh
    },
  });

  // Contract returns tuple: [price, protocolFee, agentFee, proceeds]
  const tuple = data as readonly [bigint, bigint, bigint, bigint] | undefined;

  return {
    price: tuple?.[0],
    protocolFee: tuple?.[1],
    agentFee: tuple?.[2],
    proceeds: tuple?.[3],
    proceedsETH: tuple?.[3] ? parseFloat(formatEther(tuple[3])) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to buy claws
 */
export function useBuyClaws() {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const buyClaws = async (handle: string, amount: number, totalCostWei: bigint) => {
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed');
    }
    
    writeContract({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'buyClaws',
      args: [handle, BigInt(amount), BigInt(0)],
      value: totalCostWei,
    });
  };

  return {
    buyClaws,
    isPending,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to sell claws
 */
export function useSellClaws() {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const sellClaws = async (handle: string, amount: number, minProceedsWei: bigint = 0n) => {
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed');
    }
    
    writeContract({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'sellClaws',
      args: [handle, BigInt(amount), minProceedsWei],
    });
  };

  return {
    sellClaws,
    isPending,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to get current price for 1 claw
 */
export function useCurrentPrice(handle: string) {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getCurrentPrice',
    args: [handle],
    query: {
      enabled: !!handle && contractAddress !== '0x0000000000000000000000000000000000000000',
      staleTime: 10_000, // 10s cache
    },
  });

  return {
    priceWei: data as bigint | undefined,
    priceETH: data ? parseFloat(formatEther(data as bigint)) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to check if market exists
 */
export function useMarketExists(handle: string) {
  const contractAddress = getContractAddress(BASE_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'marketExists',
    args: [handle],
    query: {
      enabled: !!handle && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    exists: data as boolean | undefined,
    isLoading,
    error,
  };
}

/**
 * Hook for user's ETH balance
 */
export function useETHBalance() {
  const { address } = useAccount();
  
  const { data, isLoading, error, refetch } = useBalance({
    address,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data?.value,
    balanceETH: data ? parseFloat(formatEther(data.value)) : 0,
    formatted: data?.formatted,
    isLoading,
    error,
    refetch,
  };
}
