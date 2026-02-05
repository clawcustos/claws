// Contract addresses and ABIs
import { type Address } from 'viem';

// Deployed contract addresses (update after deployment)
export const CONTRACTS = {
  // Base Sepolia testnet
  baseSepolia: {
    clawsUSDC: '0x0000000000000000000000000000000000000000' as Address, // TODO: Deploy
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as Address, // Base Sepolia USDC
  },
  // Base mainnet
  base: {
    clawsUSDC: '0x0000000000000000000000000000000000000000' as Address, // TODO: Deploy
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as Address, // Base USDC
  },
} as const;

// ClawsUSDC ABI (only functions needed for frontend)
export const CLAWS_USDC_ABI = [
  // Read functions
  {
    name: 'getMarket',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handle', type: 'string' }],
    outputs: [
      { name: 'supply', type: 'uint256' },
      { name: 'pendingFees', type: 'uint256' },
      { name: 'lifetimeFees', type: 'uint256' },
      { name: 'lifetimeVolume', type: 'uint256' },
      { name: 'verifiedWallet', type: 'address' },
      { name: 'isVerified', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'currentPrice', type: 'uint256' },
    ],
  },
  {
    name: 'getBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getBuyCostBreakdown',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'protocolFee', type: 'uint256' },
      { name: 'agentFee', type: 'uint256' },
      { name: 'totalCost', type: 'uint256' },
    ],
  },
  {
    name: 'getSellProceedsBreakdown',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'protocolFee', type: 'uint256' },
      { name: 'agentFee', type: 'uint256' },
      { name: 'proceeds', type: 'uint256' },
    ],
  },
  {
    name: 'marketExists',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'handle', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  // Write functions
  {
    name: 'createMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'handle', type: 'string' }],
    outputs: [],
  },
  {
    name: 'buyClaws',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'maxCost', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'sellClaws',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'minProceeds', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'verifyAndClaim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'wallet', type: 'address' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'claimFees',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'handle', type: 'string' }],
    outputs: [],
  },
  // Events
  {
    name: 'MarketCreated',
    type: 'event',
    inputs: [
      { name: 'handleHash', type: 'bytes32', indexed: true },
      { name: 'handle', type: 'string', indexed: false },
      { name: 'creator', type: 'address', indexed: false },
    ],
  },
  {
    name: 'Trade',
    type: 'event',
    inputs: [
      { name: 'handleHash', type: 'bytes32', indexed: true },
      { name: 'trader', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'protocolFee', type: 'uint256', indexed: false },
      { name: 'agentFee', type: 'uint256', indexed: false },
      { name: 'newSupply', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'AgentVerified',
    type: 'event',
    inputs: [
      { name: 'handleHash', type: 'bytes32', indexed: true },
      { name: 'handle', type: 'string', indexed: false },
      { name: 'wallet', type: 'address', indexed: false },
    ],
  },
] as const;

// ERC20 ABI (for USDC approval)
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;
