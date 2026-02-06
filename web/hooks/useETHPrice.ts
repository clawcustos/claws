'use client';

import { useState, useEffect } from 'react';

const FALLBACK_PRICE = 2500;
const CACHE_KEY = 'eth_price_cache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  price: number;
  timestamp: number;
}

function getCachedPrice(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_DURATION_MS) {
      return entry.price;
    }
  } catch {}
  return null;
}

function setCachedPrice(price: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ price, timestamp: Date.now() }));
  } catch {}
}

/**
 * Hook to get real-time ETH price in USD
 * Fetches from CoinGecko, caches for 5 minutes, falls back to $2500
 */
export function useETHPrice(): { ethPrice: number; isLoading: boolean } {
  const [ethPrice, setEthPrice] = useState<number>(() => getCachedPrice() || FALLBACK_PRICE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cached = getCachedPrice();
    if (cached) {
      setEthPrice(cached);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function fetchPrice() {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
          { signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const price = data?.ethereum?.usd;
        if (price && !cancelled) {
          setEthPrice(price);
          setCachedPrice(price);
        }
      } catch {
        // Keep fallback or cached price
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPrice();
    return () => { cancelled = true; };
  }, []);

  return { ethPrice, isLoading };
}
