// Contract configuration
// Bonding curve formula: price = supply² / 16000 ETH

export const CONTRACTS = {
  baseSepolia: {
    claws: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },
  base: {
    claws: '0x2AC21776cdaEfa6665B06AE26DDb0069a8c552cf' as `0x${string}`,
  },
} as const;

// Claws contract ABI (ETH-based bonding curve)
export const CLAWS_ABI = [
  // Read functions
  {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'getMarket',
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
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }, { name: 'user', type: 'address' }],
    name: 'getBalance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }, { name: 'amount', type: 'uint256' }],
    name: 'getBuyPriceByHandle',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }, { name: 'amount', type: 'uint256' }],
    name: 'getSellPriceByHandle',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'getCurrentPrice',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }, { name: 'amount', type: 'uint256' }],
    name: 'getBuyCostBreakdown',
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'protocolFee', type: 'uint256' },
      { name: 'agentFee', type: 'uint256' },
      { name: 'totalCost', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }, { name: 'amount', type: 'uint256' }],
    name: 'getSellProceedsBreakdown',
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'protocolFee', type: 'uint256' },
      { name: 'agentFee', type: 'uint256' },
      { name: 'proceeds', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'marketExists',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PRICE_DIVISOR',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PROTOCOL_FEE_BPS',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'AGENT_FEE_BPS',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'handleHash', type: 'bytes32' }],
    name: 'agentMetadata',
    outputs: [
      { name: 'bio', type: 'string' },
      { name: 'website', type: 'string' },
      { name: 'token', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Write functions
  {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'createMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'maxTotalCost', type: 'uint256' },
    ],
    name: 'buyClaws',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'minProceeds', type: 'uint256' },
    ],
    name: 'sellClaws',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'wallet', type: 'address' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'verifyAndClaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'bio', type: 'string' },
      { name: 'website', type: 'string' },
      { name: 'token', type: 'address' },
    ],
    name: 'setAgentMetadata',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'claimFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'handleHash', type: 'bytes32' },
      { indexed: false, name: 'handle', type: 'string' },
      { indexed: false, name: 'creator', type: 'address' },
    ],
    name: 'MarketCreated',
    type: 'event',
  },
  {
    anonymous: false,
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
    name: 'Trade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'handleHash', type: 'bytes32' },
      { indexed: false, name: 'handle', type: 'string' },
      { indexed: false, name: 'wallet', type: 'address' },
    ],
    name: 'AgentVerified',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'handleHash', type: 'bytes32' },
      { indexed: false, name: 'wallet', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'FeesClaimed',
    type: 'event',
  },
] as const;

// Helper to get contract address for chain
export function getContractAddress(chainId: number): `0x${string}` {
  switch (chainId) {
    case 84532: // Base Sepolia
      return CONTRACTS.baseSepolia.claws;
    case 8453: // Base
      return CONTRACTS.base.claws;
    default:
      return CONTRACTS.baseSepolia.claws;
  }
}
