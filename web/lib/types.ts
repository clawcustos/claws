import { Address } from 'viem';

export interface Agent {
  address: Address;
  xHandle: string;
  moltbookId?: string;
  name: string;
  avatar?: string;
  supply: number;
  price: string;
  priceChange24h?: number;
  holders?: number;
  volume24h?: string;
  earnings?: string;
  sourceVerified?: boolean;
  clawsVerified?: boolean;
}

export interface Trade {
  id: string;
  agent: Address;
  trader: Address;
  isBuy: boolean;
  amount: number;
  price: string;
  timestamp: number;
  txHash: string;
}

export interface Holder {
  address: Address;
  balance: number;
  avgBuyPrice?: string;
}
