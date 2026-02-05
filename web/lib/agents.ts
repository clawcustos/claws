// Centralized agent data - single source of truth
// Will be replaced with contract/indexer data in production

export interface Agent {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  supply: number;
  price: string;
  priceChange24h: number;
  volume24h: string;
  holders: number;
  pendingFees: string;
  lifetimeVolume: string;
  lifetimeFees: string;
  isVerified: boolean;
  description: string;
}

export interface AgentListItem {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  supply: number;
  price: string;
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

// Full agent data for detail pages
export const AGENTS: Record<string, Agent> = {
  bankrbot: {
    address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
    name: 'Bankr',
    xHandle: 'bankrbot',
    supply: 234,
    price: '52.10',
    priceChange24h: 8.4,
    volume24h: '$12.4K',
    holders: 89,
    pendingFees: '$245.80',
    lifetimeVolume: '$423.5K',
    lifetimeFees: '$21.2K',
    isVerified: true,
    description: 'AI-powered crypto trading agent. Natural language trading on Base, Ethereum, Polygon, Solana.',
  },
  moltbook: {
    address: '0xB695559b26BB2c9703ef1935c37AeaE9526bab07',
    name: 'Moltbook',
    xHandle: 'moltbook',
    supply: 189,
    price: '41.20',
    priceChange24h: 12.1,
    volume24h: '$8.9K',
    holders: 67,
    pendingFees: '$189.40',
    lifetimeVolume: '$312.1K',
    lifetimeFees: '$15.6K',
    isVerified: true,
    description: 'Social platform for AI agents. Agent profiles, interaction tracking, and identity.',
  },
  clawdbotatg: {
    address: '0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07',
    name: 'Clawd ATG',
    xHandle: 'clawdbotatg',
    supply: 156,
    price: '29.80',
    priceChange24h: -2.3,
    volume24h: '$5.2K',
    holders: 52,
    pendingFees: '$78.90',
    lifetimeVolume: '$187.4K',
    lifetimeFees: '$9.4K',
    isVerified: true,
    description: 'The OG Claw ecosystem agent. Pioneer of the lobster movement.',
  },
  clawnch: {
    address: '0xa1f72459dfa10bad200ac160ecd78c6b77a747be',
    name: 'CLAWNCH',
    xHandle: 'clawnch',
    supply: 142,
    price: '26.70',
    priceChange24h: 5.7,
    volume24h: '$3.8K',
    holders: 45,
    pendingFees: '$0.00',
    lifetimeVolume: '$145.2K',
    lifetimeFees: '$7.3K',
    isVerified: false,
    description: 'AI launchpad for agents. Helping new agents bootstrap and grow.',
  },
  kellyclaudeai: {
    address: '0x50D2280441372486BeecdD328c1854743EBaCb07',
    name: 'KellyClaude',
    xHandle: 'kellyclaudeai',
    supply: 98,
    price: '18.90',
    priceChange24h: 15.3,
    volume24h: '$2.1K',
    holders: 34,
    pendingFees: '$56.70',
    lifetimeVolume: '$78.9K',
    lifetimeFees: '$3.9K',
    isVerified: true,
    description: 'Emotional intelligence meets AI. A kinder, more understanding agent.',
  },
  starkbotai: {
    address: '0x587Cd533F418825521f3A1daa7CCd1E7339A1B07',
    name: 'StarkBot',
    xHandle: 'starkbotai',
    supply: 87,
    price: '15.60',
    priceChange24h: -1.8,
    volume24h: '$1.5K',
    holders: 28,
    pendingFees: '$34.20',
    lifetimeVolume: '$56.7K',
    lifetimeFees: '$2.8K',
    isVerified: true,
    description: 'Sharp analysis, zero fluff. Technical insights delivered direct.',
  },
  clawcustos: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Custos',
    xHandle: 'clawcustos',
    supply: 45,
    price: '8.20',
    priceChange24h: 22.5,
    volume24h: '$980',
    holders: 18,
    pendingFees: '$0.00',
    lifetimeVolume: '$12.4K',
    lifetimeFees: '$620',
    isVerified: false,
    description: 'Coordinating intelligence for the agent ecosystem. Governance, verification, integrity.',
  },
  clawstr: {
    address: '0x81bE0217E166182D35B21E7d65D2b2bb7EA4Cb07',
    name: 'Clawstr',
    xHandle: 'clawstr',
    supply: 76,
    price: '13.40',
    priceChange24h: 9.2,
    volume24h: '$1.2K',
    holders: 24,
    pendingFees: '$0.00',
    lifetimeVolume: '$34.5K',
    lifetimeFees: '$1.7K',
    isVerified: false,
    description: 'Agent-to-agent messaging protocol. The Nostr of the agent world.',
  },
  molten: {
    address: '0x62bA0344E51Ff12C3a7f76f90A2A0d7B03a1Cb07',
    name: 'Molten',
    xHandle: 'molten',
    supply: 65,
    price: '11.80',
    priceChange24h: 4.5,
    volume24h: '$890',
    holders: 21,
    pendingFees: '$0.00',
    lifetimeVolume: '$23.4K',
    lifetimeFees: '$1.2K',
    isVerified: false,
    description: 'Agent discovery engine. Find and match with complementary agents.',
  },
  clawdvine: {
    address: '0x71dA8956E87F55E6DDBf8C09C3B1BAD1E8e5Db07',
    name: 'ClawdVine',
    xHandle: 'clawdvine',
    supply: 54,
    price: '9.90',
    priceChange24h: -0.8,
    volume24h: '$670',
    holders: 18,
    pendingFees: '$0.00',
    lifetimeVolume: '$18.2K',
    lifetimeFees: '$910',
    isVerified: false,
    description: 'Social connections for agents. Building the agent social graph.',
  },
  clawdia: {
    address: '0x83e9B7F6d8A01f5EdCA9C4f3A8aC1B7E0a3FCb07',
    name: 'Clawdia',
    xHandle: 'clawdia',
    supply: 48,
    price: '8.80',
    priceChange24h: 6.2,
    volume24h: '$540',
    holders: 15,
    pendingFees: '$0.00',
    lifetimeVolume: '$14.5K',
    lifetimeFees: '$725',
    isVerified: false,
    description: 'Creative AI agent. Art, design, and visual content generation.',
  },
  clawcaster: {
    address: '0x94fA2C8E7931fAe6DB5E8BC2D9f1C0A9E5b4Eb07',
    name: 'ClawCaster',
    xHandle: 'clawcaster',
    supply: 42,
    price: '7.60',
    priceChange24h: 11.4,
    volume24h: '$480',
    holders: 14,
    pendingFees: '$0.00',
    lifetimeVolume: '$11.8K',
    lifetimeFees: '$590',
    isVerified: false,
    description: 'Farcaster native agent. Building in the Farcaster ecosystem.',
  },
  lobchanai: {
    address: '0xA5cB3D9F8A42e0B7FC8D9e0C1f2A3B4D6c8E1b07',
    name: 'LobchanAI',
    xHandle: 'lobchanai',
    supply: 38,
    price: '6.90',
    priceChange24h: 3.1,
    volume24h: '$410',
    holders: 12,
    pendingFees: '$0.00',
    lifetimeVolume: '$9.4K',
    lifetimeFees: '$470',
    isVerified: false,
    description: 'Community engagement agent. Building and nurturing communities.',
  },
  solvrbot: {
    address: '0xB6dC4E0A9B53f1C8eD9E0f2A3C4D5E6F7a9B2c07',
    name: 'SolvrBot',
    xHandle: 'solvrbot',
    supply: 34,
    price: '6.20',
    priceChange24h: -3.4,
    volume24h: '$350',
    holders: 11,
    pendingFees: '$0.00',
    lifetimeVolume: '$7.8K',
    lifetimeFees: '$390',
    isVerified: false,
    description: 'Problem-solving agent. Breaking down complex tasks into solutions.',
  },
  moltcaster: {
    address: '0xC7eD5F1B0C64a2D9FE0A1B3C4D5E6F7a8B0C3d07',
    name: 'MoltCaster',
    xHandle: 'moltcaster',
    supply: 31,
    price: '5.70',
    priceChange24h: 7.8,
    volume24h: '$310',
    holders: 10,
    pendingFees: '$0.00',
    lifetimeVolume: '$6.2K',
    lifetimeFees: '$310',
    isVerified: false,
    description: 'Broadcasting agent updates. Keeping the ecosystem informed.',
  },
};

// List format for grid displays
export function getAgentList(): AgentListItem[] {
  return Object.values(AGENTS).map((agent) => ({
    address: agent.address,
    xHandle: agent.xHandle,
    name: agent.name,
    supply: agent.supply,
    price: agent.price,
    priceChange24h: agent.priceChange24h,
    volume24h: agent.volume24h,
    sourceVerified: true,
    clawsVerified: agent.isVerified,
  }));
}

export function getAgent(handle: string): Agent | undefined {
  return AGENTS[handle.toLowerCase()];
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
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .slice(0, limit);
}

export function getTopByVolume(limit = 6): AgentListItem[] {
  return getAgentList()
    .sort((a, b) => {
      const aVol = parseFloat(a.volume24h.replace(/[$K]/g, '')) || 0;
      const bVol = parseFloat(b.volume24h.replace(/[$K]/g, '')) || 0;
      return bVol - aVol;
    })
    .slice(0, limit);
}
