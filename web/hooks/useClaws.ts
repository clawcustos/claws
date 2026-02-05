'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { baseSepolia, base } from 'wagmi/chains';
import { CONTRACTS, CLAWS_USDC_ABI, ERC20_ABI } from '@/lib/contracts';

// Get contract addresses for current chain
function useContractAddresses() {
  const chainId = useChainId();
  
  if (chainId === baseSepolia.id) {
    return CONTRACTS.baseSepolia;
  }
  
  return CONTRACTS.base;
}

// Hook to get market data for a handle
export function useMarket(handle: string) {
  const { clawsUSDC } = useContractAddresses();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: clawsUSDC,
    abi: CLAWS_USDC_ABI,
    functionName: 'getMarket',
    args: [handle],
    query: {
      enabled: !!handle && clawsUSDC !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    market: data ? {
      supply: Number(data[0]),
      pendingFees: Number(formatUnits(data[1], 6)),
      lifetimeFees: Number(formatUnits(data[2], 6)),
      lifetimeVolume: Number(formatUnits(data[3], 6)),
      verifiedWallet: data[4] as Address,
      isVerified: data[5],
      createdAt: Number(data[6]),
      currentPrice: Number(formatUnits(data[7], 6)),
    } : null,
    isLoading,
    error,
    refetch,
  };
}

// Hook to get user's claw balance for a handle
export function useClawBalance(handle: string) {
  const { address } = useAccount();
  const { clawsUSDC } = useContractAddresses();
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: clawsUSDC,
    abi: CLAWS_USDC_ABI,
    functionName: 'getBalance',
    args: [handle, address!],
    query: {
      enabled: !!handle && !!address && clawsUSDC !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    balance: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

// Hook to get buy cost breakdown
export function useBuyCost(handle: string, amount: number) {
  const { clawsUSDC } = useContractAddresses();
  
  const { data, isLoading, error } = useReadContract({
    address: clawsUSDC,
    abi: CLAWS_USDC_ABI,
    functionName: 'getBuyCostBreakdown',
    args: [handle, BigInt(amount)],
    query: {
      enabled: !!handle && amount > 0 && clawsUSDC !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    cost: data ? {
      price: Number(formatUnits(data[0], 6)),
      protocolFee: Number(formatUnits(data[1], 6)),
      agentFee: Number(formatUnits(data[2], 6)),
      totalCost: Number(formatUnits(data[3], 6)),
    } : null,
    isLoading,
    error,
  };
}

// Hook to get sell proceeds breakdown
export function useSellProceeds(handle: string, amount: number) {
  const { clawsUSDC } = useContractAddresses();
  
  const { data, isLoading, error } = useReadContract({
    address: clawsUSDC,
    abi: CLAWS_USDC_ABI,
    functionName: 'getSellProceedsBreakdown',
    args: [handle, BigInt(amount)],
    query: {
      enabled: !!handle && amount > 0 && clawsUSDC !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    proceeds: data ? {
      price: Number(formatUnits(data[0], 6)),
      protocolFee: Number(formatUnits(data[1], 6)),
      agentFee: Number(formatUnits(data[2], 6)),
      proceeds: Number(formatUnits(data[3], 6)),
    } : null,
    isLoading,
    error,
  };
}

// Hook for USDC balance and allowance
export function useUSDC() {
  const { address } = useAccount();
  const { clawsUSDC, usdc } = useContractAddresses();
  
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdc,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });
  
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdc,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, clawsUSDC],
    query: {
      enabled: !!address && clawsUSDC !== '0x0000000000000000000000000000000000000000',
    },
  });

  return {
    balance: balance ? Number(formatUnits(balance, 6)) : 0,
    allowance: allowance ? Number(formatUnits(allowance, 6)) : 0,
    refetch: () => {
      refetchBalance();
      refetchAllowance();
    },
  };
}

// Hook to approve USDC spending
export function useApproveUSDC() {
  const { clawsUSDC, usdc } = useContractAddresses();
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amount: number) => {
    const amountBigInt = parseUnits(amount.toString(), 6);
    
    writeContract({
      address: usdc,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [clawsUSDC, amountBigInt],
    });
  };

  return {
    approve,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook to buy claws
export function useBuyClaws() {
  const { clawsUSDC } = useContractAddresses();
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const buy = async (handle: string, amount: number, maxCostUSD: number) => {
    const maxCostBigInt = parseUnits(maxCostUSD.toString(), 6);
    
    writeContract({
      address: clawsUSDC,
      abi: CLAWS_USDC_ABI,
      functionName: 'buyClaws',
      args: [handle, BigInt(amount), maxCostBigInt],
    });
  };

  return {
    buy,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
  };
}

// Hook to sell claws
export function useSellClaws() {
  const { clawsUSDC } = useContractAddresses();
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const sell = async (handle: string, amount: number, minProceedsUSD: number) => {
    const minProceedsBigInt = parseUnits(minProceedsUSD.toString(), 6);
    
    writeContract({
      address: clawsUSDC,
      abi: CLAWS_USDC_ABI,
      functionName: 'sellClaws',
      args: [handle, BigInt(amount), minProceedsBigInt],
    });
  };

  return {
    sell,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    error,
  };
}
