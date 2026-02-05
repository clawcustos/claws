// Centralized agent data - single source of truth
// Prices calculated using friend.tech formula: price = (supply+1)² / 16000 ETH

// ETH price assumption for USD display (update as needed)
const ETH_PRICE_USD = 3000;

// Calculate current price (next claw) at given supply
// Formula: (supply + 1)² / 16000 ETH
export function calculateCurrentPrice(supply: number): number {
  return ((supply + 1) ** 2) / 16000;
}

// Calculate total cost to buy `amount` claws from `supply`
// Sum of squares from (supply+1) to (supply+amount)
export function calculateBuyPrice(supply: number, amount: number): number {
  const endSupply = supply + amount;
  const sumEnd = (endSupply * (endSupply + 1) * (2 * endSupply + 1)) / 6;
  const sumStart = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  const sumSquares = sumEnd - sumStart;
  return sumSquares / 16000;
}

// Calculate proceeds from selling `amount` claws at `supply`
export function calculateSellPrice(supply: number, amount: number): number {
  if (amount > supply) return 0;
  const newSupply = supply - amount;
  const sumEnd = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  const sumStart = (newSupply * (newSupply + 1) * (2 * newSupply + 1)) / 6;
  const sumSquares = sumEnd - sumStart;
  return sumSquares / 16000;
}

// Format ETH price for display
export function formatETH(eth: number): string {
  if (eth < 0.0001) return '<0.0001';
  if (eth < 0.01) return eth.toFixed(4);
  if (eth < 1) return eth.toFixed(3);
  return eth.toFixed(2);
}

// Format USD price
export function formatUSD(eth: number): string {
  const usd = eth * ETH_PRICE_USD;
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

export interface Agent {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  supply: number;
  holders: number;
  lifetimeVolumeETH: number;
  lifetimeFeesETH: number;
  pendingFeesETH: number;
  isVerified: boolean;
  description: string;
  // Computed
  priceETH?: number;
  priceUSD?: string;
  priceChange24h?: number;
}

export interface AgentListItem {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  supply: number;
  priceETH: number;
  priceUSD: string;
  priceChange24h: number;
  volume24h: string;
  sourceVerified: boolean;
  clawsVerified: boolean;
}

export const AGENT_EMOJIS: Record<string, string> = {
  bankrbot: '💰',
  moltbook: '🦀',
  clawdbotatg: '🦞',
  clawnch: '🚀',
  kellyclaudeai: '🤖',
  starkbotai: '⚡',
  clawcustos: '🏛️',
  clawstr: '🦞',
  molten: '🔥',
  clawdvine: '🍇',
  clawdia: '✨',
  clawcaster: '📡',
  lobchanai: '🦞',
  solvrbot: '🔧',
  moltcaster: '📺',
};

// Full agent data with realistic supplies
// Price is computed from supply using bonding curve
export const AGENTS: Record<string, Agent> = {
  bankrbot: {
    address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
    name: 'Bankr',
    xHandle: 'bankrbot',
    supply: 47,
    holders: 23,
    lifetimeVolumeETH: 4.2,
    lifetimeFeesETH: 0.21,
    pendingFeesETH: 0.08,
    isVerified: true,
    description: 'AI-powered crypto trading agent. Natural language trading on Base, Ethereum, Polygon, Solana.',
  },
  moltbook: {
    address: '0xB695559b26BB2c9703ef1935c37AeaE9526bab07',
    name: 'Moltbook',
    xHandle: 'moltbook',
    supply: 38,
    holders: 18,
    lifetimeVolumeETH: 2.8,
    lifetimeFeesETH: 0.14,
    pendingFeesETH: 0.05,
    isVerified: true,
    description: 'Social platform for AI agents. Agent profiles, interaction tracking, and identity.',
  },
  clawdbotatg: {
    address: '0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07',
    name: 'Clawd ATG',
    xHandle: 'clawdbotatg',
    supply: 31,
    holders: 14,
    lifetimeVolumeETH: 1.9,
    lifetimeFeesETH: 0.095,
    pendingFeesETH: 0.03,
    isVerified: true,
    description: 'The OG Claw ecosystem agent. Pioneer of the lobster movement.',
  },
  clawnch: {
    address: '0xa1f72459dfa10bad200ac160ecd78c6b77a747be',
    name: 'CLAWNCH',
    xHandle: 'clawnch',
    supply: 28,
    holders: 12,
    lifetimeVolumeETH: 1.5,
    lifetimeFeesETH: 0.075,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'AI launchpad for agents. Helping new agents bootstrap and grow.',
  },
  kellyclaudeai: {
    address: '0x50D2280441372486BeecdD328c1854743EBaCb07',
    name: 'KellyClaude',
    xHandle: 'kellyclaudeai',
    supply: 22,
    holders: 10,
    lifetimeVolumeETH: 0.95,
    lifetimeFeesETH: 0.048,
    pendingFeesETH: 0.02,
    isVerified: true,
    description: 'Emotional intelligence meets AI. A kinder, more understanding agent.',
  },
  starkbotai: {
    address: '0x587Cd533F418825521f3A1daa7CCd1E7339A1B07',
    name: 'StarkBot',
    xHandle: 'starkbotai',
    supply: 19,
    holders: 9,
    lifetimeVolumeETH: 0.72,
    lifetimeFeesETH: 0.036,
    pendingFeesETH: 0.01,
    isVerified: true,
    description: 'Sharp analysis, zero fluff. Technical insights delivered direct.',
  },
  clawcustos: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Custos',
    xHandle: 'clawcustos',
    supply: 15,
    holders: 7,
    lifetimeVolumeETH: 0.45,
    lifetimeFeesETH: 0.023,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Coordinating intelligence for the agent ecosystem. Governance, verification, integrity.',
  },
  clawstr: {
    address: '0x81bE0217E166182D35B21E7d65D2b2bb7EA4Cb07',
    name: 'Clawstr',
    xHandle: 'clawstr',
    supply: 12,
    holders: 6,
    lifetimeVolumeETH: 0.28,
    lifetimeFeesETH: 0.014,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent-to-agent messaging protocol. The Nostr of the agent world.',
  },
  molten: {
    address: '0x62bA0344E51Ff12C3a7f76f90A2A0d7B03a1Cb07',
    name: 'Molten',
    xHandle: 'molten',
    supply: 10,
    holders: 5,
    lifetimeVolumeETH: 0.19,
    lifetimeFeesETH: 0.0095,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent discovery engine. Find and match with complementary agents.',
  },
  clawdvine: {
    address: '0x71dA8956E87F55E6DDBf8C09C3B1BAD1E8e5Db07',
    name: 'ClawdVine',
    xHandle: 'clawdvine',
    supply: 8,
    holders: 4,
    lifetimeVolumeETH: 0.12,
    lifetimeFeesETH: 0.006,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Social connections for agents. Building the agent social graph.',
  },
  clawdia: {
    address: '0x83e9B7F6d8A01f5EdCA9C4f3A8aC1B7E0a3FCb07',
    name: 'Clawdia',
    xHandle: 'clawdia',
    supply: 6,
    holders: 3,
    lifetimeVolumeETH: 0.07,
    lifetimeFeesETH: 0.0035,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Creative AI agent. Art, design, and visual content generation.',
  },
  clawcaster: {
    address: '0x94fA2C8E7931fAe6DB5E8BC2D9f1C0A9E5b4Eb07',
    name: 'ClawCaster',
    xHandle: 'clawcaster',
    supply: 5,
    holders: 3,
    lifetimeVolumeETH: 0.05,
    lifetimeFeesETH: 0.0025,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Farcaster native agent. Building in the Farcaster ecosystem.',
  },
  lobchanai: {
    address: '0xA5cB3D9F8A42e0B7FC8D9e0C1f2A3B4D6c8E1b07',
    name: 'LobchanAI',
    xHandle: 'lobchanai',
    supply: 4,
    holders: 2,
    lifetimeVolumeETH: 0.03,
    lifetimeFeesETH: 0.0015,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Community engagement agent. Building and nurturing communities.',
  },
  solvrbot: {
    address: '0xB6dC4E0A9B53f1C8eD9E0f2A3C4D5E6F7a9B2c07',
    name: 'SolvrBot',
    xHandle: 'solvrbot',
    supply: 3,
    holders: 2,
    lifetimeVolumeETH: 0.02,
    lifetimeFeesETH: 0.001,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Problem-solving agent. Breaking down complex tasks into solutions.',
  },
  moltcaster: {
    address: '0xC7eD5F1B0C64a2D9FE0A1B3C4D5E6F7a8B0C3d07',
    name: 'MoltCaster',
    xHandle: 'moltcaster',
    supply: 2,
    holders: 1,
    lifetimeVolumeETH: 0.01,
    lifetimeFeesETH: 0.0005,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Broadcasting agent updates. Keeping the ecosystem informed.',
  },
};

// Add computed price fields to agent
function enrichAgent(agent: Agent): Agent & { priceETH: number; priceUSD: string; priceChange24h: number } {
  const priceETH = calculateCurrentPrice(agent.supply);
  return {
    ...agent,
    priceETH,
    priceUSD: formatUSD(priceETH),
    priceChange24h: Math.random() * 30 - 10, // Mock 24h change for now
  };
}

// List format for grid displays
export function getAgentList(): AgentListItem[] {
  return Object.values(AGENTS).map((agent) => {
    const priceETH = calculateCurrentPrice(agent.supply);
    return {
      address: agent.address,
      xHandle: agent.xHandle,
      name: agent.name,
      supply: agent.supply,
      priceETH,
      priceUSD: formatUSD(priceETH),
      priceChange24h: Math.random() * 30 - 10, // Mock for now
      volume24h: formatUSD(agent.lifetimeVolumeETH * 0.1), // Rough 24h estimate
      sourceVerified: true,
      clawsVerified: agent.isVerified,
    };
  });
}

export function getAgent(handle: string): (Agent & { priceETH: number; priceUSD: string; priceChange24h: number }) | undefined {
  const agent = AGENTS[handle.toLowerCase()];
  if (!agent) return undefined;
  return enrichAgent(agent);
}

export function getAgentEmoji(handle: string): string {
  return AGENT_EMOJIS[handle.toLowerCase()] || '🤖';
}

// Sorted lists
export function getTrendingAgents(limit = 6): AgentListItem[] {
  return getAgentList()
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, limit);
}

export function getTopByPrice(limit = 6): AgentListItem[] {
  return getAgentList()
    .sort((a, b) => b.priceETH - a.priceETH)
    .slice(0, limit);
}

export function getTopByVolume(limit = 6): AgentListItem[] {
  return getAgentList()
    .sort((a, b) => {
      const aAgent = AGENTS[a.xHandle.toLowerCase()];
      const bAgent = AGENTS[b.xHandle.toLowerCase()];
      return (bAgent?.lifetimeVolumeETH || 0) - (aAgent?.lifetimeVolumeETH || 0);
    })
    .slice(0, limit);
}
