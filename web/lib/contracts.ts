import { Address } from 'viem';

// Contract address - update after deployment
export const CLAWS_ADDRESS: Address = '0x0000000000000000000000000000000000000000';

// Contract ABI (key functions only)
export const CLAWS_ABI = [
  // Read functions
  {
    name: 'clawsSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'clawsBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'holder', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'sourceVerified',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'clawsVerified',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'pendingFees',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'agentXHandle',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'getBuyPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getBuyPriceAfterFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getSellPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getSellPriceAfterFee',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getAgentStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [
      { name: '_sourceVerified', type: 'bool' },
      { name: '_clawsVerified', type: 'bool' },
      { name: '_reservedClawClaimed', type: 'bool' },
      { name: '_pendingFees', type: 'uint256' },
      { name: '_supply', type: 'uint256' },
    ],
  },
  {
    name: 'marketExists',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agent', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  // Write functions
  {
    name: 'buyClaws',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'sellClaws',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'verifyAndClaim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  // Events
  {
    name: 'Trade',
    type: 'event',
    inputs: [
      { name: 'trader', type: 'address', indexed: true },
      { name: 'agent', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
      { name: 'clawAmount', type: 'uint256', indexed: false },
      { name: 'ethAmount', type: 'uint256', indexed: false },
      { name: 'protocolFee', type: 'uint256', indexed: false },
      { name: 'agentFee', type: 'uint256', indexed: false },
      { name: 'newSupply', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'MarketCreated',
    type: 'event',
    inputs: [
      { name: 'agent', type: 'address', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
    ],
  },
  {
    name: 'AgentClawsVerified',
    type: 'event',
    inputs: [{ name: 'agent', type: 'address', indexed: true }],
  },
] as const;
