'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAgentList, type AgentListItem } from '@/lib/agents';
import { useAgentRankings } from './useAgentRankings';

export type RankedAgent = AgentListItem & {
  supply: number;
  priceETH: number;
  volumeETH: number;
  feesETH: number;
  isVerified: boolean;
};

interface RankingsData {
  byPrice: RankedAgent[];
  byVolume: RankedAgent[];
}

/**
 * Fetches rankings from the server-side cached API endpoint.
 * Falls back to direct RPC (useAgentRankings) if API fails.
 * Refreshes every 60 seconds.
 */
export function useAgentRankingsAPI() {
  const [data, setData] = useState<RankingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Fallback to direct RPC if API fails
  const fallbackRankings = useAgentRankings();

  const fetchRankings = useCallback(async () => {
    if (useFallback) return;

    try {
      const response = await fetch('/api/rankings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Rankings API fetch failed, falling back to direct RPC:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setUseFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [useFallback]);

  // Initial fetch
  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Refresh interval (60 seconds)
  useEffect(() => {
    if (useFallback) return;

    const interval = setInterval(() => {
      fetchRankings();
    }, 60_000);

    return () => clearInterval(interval);
  }, [fetchRankings, useFallback]);

  // Return fallback data if API failed
  if (useFallback) {
    return {
      byPrice: fallbackRankings.byPrice,
      byVolume: fallbackRankings.byVolume,
      isLoading: fallbackRankings.isLoading,
      error,
    };
  }

  return {
    byPrice: data?.byPrice || [],
    byVolume: data?.byVolume || [],
    isLoading,
    error,
  };
}
