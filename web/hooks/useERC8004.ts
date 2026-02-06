'use client';

import { useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { 
  ERC8004_REGISTRY_ADDRESS, 
  ERC8004_REGISTRY_ABI, 
  isZeroAddress,
  fetchRegistration,
  type ERC8004Registration 
} from '@/lib/erc8004';

// Base mainnet
const BASE_CHAIN_ID = 8453;

export interface UseERC8004Result {
  registered: boolean;
  agentId?: number;
  registration?: ERC8004Registration;
  x402?: boolean;
  isLoading: boolean;
}

/**
 * Hook to check if a wallet address has an ERC-8004 identity registration
 * 
 * Given an agent's verified wallet address, check if they have an ERC-8004 identity.
 * Uses balanceOf to check if the wallet owns any 8004 identity tokens.
 * If yes, fetches the tokenURI and parses the registration JSON.
 * Cache aggressively (5 min staleTime) since 8004 registrations rarely change.
 * If ERC8004_REGISTRY_ADDRESS is zero address, return { registered: false } immediately (feature flag).
 */
export function useERC8004(walletAddress?: string): UseERC8004Result {
  // Feature flag: if registry address is zero, return unregistered immediately
  const registryDisabled = isZeroAddress(ERC8004_REGISTRY_ADDRESS);
  
  // Check if wallet has any ERC-8004 tokens
  const { data: balance, isLoading: balanceLoading } = useReadContract({
    address: ERC8004_REGISTRY_ADDRESS,
    abi: ERC8004_REGISTRY_ABI,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!walletAddress && !registryDisabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  const hasTokens = balance !== undefined && balance > 0n;
  
  // Get the first token ID owned by the wallet
  const { data: tokenId, isLoading: tokenIdLoading } = useReadContract({
    address: ERC8004_REGISTRY_ADDRESS,
    abi: ERC8004_REGISTRY_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: walletAddress && hasTokens ? [walletAddress as `0x${string}`, 0n] : undefined,
    query: {
      enabled: !!walletAddress && hasTokens && !registryDisabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Get the tokenURI for the token
  const { data: tokenURI, isLoading: tokenURILoading } = useReadContract({
    address: ERC8004_REGISTRY_ADDRESS,
    abi: ERC8004_REGISTRY_ABI,
    functionName: 'tokenURI',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined && !registryDisabled,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  });

  // Fetch and parse the registration JSON
  const { data: registration, isLoading: registrationLoading } = useQuery({
    queryKey: ['erc8004', 'registration', tokenURI],
    queryFn: async () => {
      if (!tokenURI) return null;
      return fetchRegistration(tokenURI);
    },
    enabled: !!tokenURI && !registryDisabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If registry is disabled, return immediately
  if (registryDisabled) {
    return { registered: false, isLoading: false };
  }

  const isLoading = balanceLoading || tokenIdLoading || tokenURILoading || registrationLoading;
  const registered = hasTokens && !!registration;

  return {
    registered,
    agentId: tokenId !== undefined ? Number(tokenId) : undefined,
    registration: registration || undefined,
    x402: registration?.x402Support,
    isLoading,
  };
}
