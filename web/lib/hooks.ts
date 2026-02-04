'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, parseEther, formatEther } from 'viem';
import { CLAWS_ADDRESS, CLAWS_ABI } from './contracts';

// Read hooks
export function useClawsSupply(agent: Address | undefined) {
  return useReadContract({
    address: CLAWS_ADDRESS,
    abi: CLAWS_ABI,
    functionName: 'clawsSupply',
    args: agent ? [agent] : undefined,
    query: { enabled: !!agent },
  });
}

export function useClawsBalance(agent: Address | undefined, holder: Address | undefined) {
  return useReadContract({
    address: CLAWS_ADDRESS,
    abi: CLAWS_ABI,
    functionName: 'clawsBalance',
    args: agent && holder ? [agent, holder] : undefined,
    query: { enabled: !!agent && !!holder },
  });
}

export function useBuyPrice(agent: Address | undefined, amount: bigint = 1n) {
  return useReadContract({
    address: CLAWS_ADDRESS,
    abi: CLAWS_ABI,
    functionName: 'getBuyPriceAfterFee',
    args: agent ? [agent, amount] : undefined,
    query: { enabled: !!agent },
  });
}

export function useSellPrice(agent: Address | undefined, amount: bigint = 1n) {
  return useReadContract({
    address: CLAWS_ADDRESS,
    abi: CLAWS_ABI,
    functionName: 'getSellPriceAfterFee',
    args: agent ? [agent, amount] : undefined,
    query: { enabled: !!agent },
  });
}

export function useAgentStatus(agent: Address | undefined) {
  return useReadContract({
    address: CLAWS_ADDRESS,
    abi: CLAWS_ABI,
    functionName: 'getAgentStatus',
    args: agent ? [agent] : undefined,
    query: { enabled: !!agent },
  });
}

export function useMarketExists(agent: Address | undefined) {
  return useReadContract({
    address: CLAWS_ADDRESS,
    abi: CLAWS_ABI,
    functionName: 'marketExists',
    args: agent ? [agent] : undefined,
    query: { enabled: !!agent },
  });
}

// Write hooks
export function useBuyClaws() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buy = (agent: Address, amount: bigint, value: bigint) => {
    writeContract({
      address: CLAWS_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'buyClaws',
      args: [agent, amount],
      value,
    });
  };

  return { buy, isPending, isConfirming, isSuccess, error, hash };
}

export function useSellClaws() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sell = (agent: Address, amount: bigint) => {
    writeContract({
      address: CLAWS_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'sellClaws',
      args: [agent, amount],
    });
  };

  return { sell, isPending, isConfirming, isSuccess, error, hash };
}

export function useVerifyAndClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const verify = () => {
    writeContract({
      address: CLAWS_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'verifyAndClaim',
    });
  };

  return { verify, isPending, isConfirming, isSuccess, error, hash };
}

// Utility
export function formatPrice(wei: bigint | undefined): string {
  if (!wei) return '0';
  return parseFloat(formatEther(wei)).toFixed(6);
}
