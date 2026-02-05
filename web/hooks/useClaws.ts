'use client';

import { useReadContract, useWriteContract, useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts';

const BASE_SEPOLIA_CHAIN_ID = 84532;

/**
 * Hook to get market data for a handle
 */
export function useMarket(handle: string) {
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getMarket',
    args: [handle],
    query: {
      enabled: !!handle && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    market: data as {
      supply: bigint;
      pendingFees: bigint;
      lifetimeFees: bigint;
      lifetimeVolume: bigint;
      verifiedWallet: `0x${string}`;
      isVerified: boolean;
      createdAt: bigint;
      currentPrice: bigint;
    } | undefined,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to get user's claw balance for a handle
 */
export function useClawBalance(handle: string, userAddress?: `0x${string}`) {
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getBalance',
    args: [handle, userAddress!],
    query: {
      enabled: !!handle && !!userAddress && contractAddress !== '0x0000000000000000000000000000000000000000',
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
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getBuyCostBreakdown',
    args: [handle, BigInt(amount)],
    query: {
      enabled: !!handle && amount > 0 && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  const breakdown = data as {
    price: bigint;
    protocolFee: bigint;
    agentFee: bigint;
    totalCost: bigint;
  } | undefined;

  return {
    price: breakdown?.price,
    protocolFee: breakdown?.protocolFee,
    agentFee: breakdown?.agentFee,
    totalCost: breakdown?.totalCost,
    totalCostETH: breakdown?.totalCost ? parseFloat(formatEther(breakdown.totalCost)) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to get sell price for amount
 */
export function useSellPrice(handle: string, amount: number) {
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getSellProceedsBreakdown',
    args: [handle, BigInt(amount)],
    query: {
      enabled: !!handle && amount > 0 && contractAddress !== '0x0000000000000000000000000000000000000000',
    },
  });

  const breakdown = data as {
    price: bigint;
    protocolFee: bigint;
    agentFee: bigint;
    proceeds: bigint;
  } | undefined;

  return {
    price: breakdown?.price,
    protocolFee: breakdown?.protocolFee,
    agentFee: breakdown?.agentFee,
    proceeds: breakdown?.proceeds,
    proceedsETH: breakdown?.proceeds ? parseFloat(formatEther(breakdown.proceeds)) : 0,
    isLoading,
    error,
  };
}

/**
 * Hook to buy claws
 */
export function useBuyClaws() {
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  const { writeContract, isPending, isSuccess, error, data: hash } = useWriteContract();

  const buyClaws = async (handle: string, amount: number, totalCostWei: bigint) => {
    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed');
    }
    
    writeContract({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'buyClaws',
      args: [handle, BigInt(amount)],
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
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
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
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  
  const { data, isLoading, error } = useReadContract({
    address: contractAddress,
    abi: CLAWS_ABI,
    functionName: 'getCurrentPrice',
    args: [handle],
    query: {
      enabled: !!handle && contractAddress !== '0x0000000000000000000000000000000000000000',
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
  const contractAddress = getContractAddress(BASE_SEPOLIA_CHAIN_ID);
  
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
