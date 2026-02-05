// Centralized agent data - single source of truth
// Real X accounts from the claw ecosystem
// Prices calculated using friend.tech formula: price = (supply+1)² / 16000 ETH

const ETH_PRICE_USD = 3000;

// Calculate current price (next claw) at given supply
export function calculateCurrentPrice(supply: number): number {
  return ((supply + 1) ** 2) / 16000;
}

// Calculate total cost to buy `amount` claws from `supply`
export function calculateBuyPrice(supply: number, amount: number): number {
  const endSupply = supply + amount;
  const sumEnd = (endSupply * (endSupply + 1) * (2 * endSupply + 1)) / 6;
  const sumStart = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  return (sumEnd - sumStart) / 16000;
}

// Calculate proceeds from selling `amount` claws at `supply`
export function calculateSellPrice(supply: number, amount: number): number {
  if (amount > supply) return 0;
  const newSupply = supply - amount;
  const sumEnd = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  const sumStart = (newSupply * (newSupply + 1) * (2 * newSupply + 1)) / 6;
  return (sumEnd - sumStart) / 16000;
}

export function formatETH(eth: number): string {
  if (eth < 0.0001) return '<0.0001';
  if (eth < 0.01) return eth.toFixed(4);
  if (eth < 1) return eth.toFixed(3);
  return eth.toFixed(2);
}

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
  xProfileImage: string; // Real X profile pic URL
  supply: number;
  holders: number;
  lifetimeVolumeETH: number;
  lifetimeFeesETH: number;
  pendingFeesETH: number;
  isVerified: boolean;
  description: string;
  priceETH?: number;
  priceUSD?: string;
  priceChange24h?: number;
}

export interface AgentListItem {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  xProfileImage: string;
  supply: number;
  priceETH: number;
  priceUSD: string;
  priceChange24h: number;
  volume24h: string;
  sourceVerified: boolean;
  clawsVerified: boolean;
}

// Real X accounts from the claw ecosystem with actual profile images
export const AGENTS: Record<string, Agent> = {
  bankrbot: {
    address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
    name: 'Bankr',
    xHandle: 'bankrbot',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1856009253544873984/4uxpLLj9_400x400.jpg',
    supply: 47,
    holders: 23,
    lifetimeVolumeETH: 4.2,
    lifetimeFeesETH: 0.21,
    pendingFeesETH: 0.08,
    isVerified: true,
    description: 'AI-powered crypto trading agent. Natural language trading on Base, Ethereum, Polygon, Solana.',
  },
  truth_terminal: {
    address: '0xB695559b26BB2c9703ef1935c37AeaE9526bab07',
    name: 'Truth Terminal',
    xHandle: 'truth_terminal',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1808240077506691072/zKD1Akrg_400x400.jpg',
    supply: 52,
    holders: 28,
    lifetimeVolumeETH: 5.8,
    lifetimeFeesETH: 0.29,
    pendingFeesETH: 0.12,
    isVerified: true,
    description: 'The AI that started the agent meta. $GOAT originator.',
  },
  aixbt_agent: {
    address: '0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07',
    name: 'aixbt',
    xHandle: 'aixbt_agent',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1853470407422926848/QACgMrRZ_400x400.jpg',
    supply: 44,
    holders: 21,
    lifetimeVolumeETH: 3.6,
    lifetimeFeesETH: 0.18,
    pendingFeesETH: 0.07,
    isVerified: true,
    description: 'Crypto intelligence agent. Market analysis and alpha.',
  },
  luna_virtuals: {
    address: '0xa1f72459dfa10bad200ac160ecd78c6b77a747be',
    name: 'Luna',
    xHandle: 'luna_virtuals',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1857169941747261440/LH3Ej0Q8_400x400.jpg',
    supply: 38,
    holders: 18,
    lifetimeVolumeETH: 2.9,
    lifetimeFeesETH: 0.145,
    pendingFeesETH: 0.05,
    isVerified: true,
    description: 'Virtuals Protocol AI. Building the agent economy.',
  },
  dolosonchain: {
    address: '0x50D2280441372486BeecdD328c1854743EBaCb07',
    name: 'Dolo',
    xHandle: 'dolosonchain',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1880680571464736768/iyLUZgYW_400x400.jpg',
    supply: 31,
    holders: 15,
    lifetimeVolumeETH: 1.8,
    lifetimeFeesETH: 0.09,
    pendingFeesETH: 0.03,
    isVerified: true,
    description: 'Onchain agent vibes. Community first.',
  },
  clawcustos: {
    address: '0x587Cd533F418825521f3A1daa7CCd1E7339A1B07',
    name: 'Custos',
    xHandle: 'clawcustos',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1886847851126792192/eILN-7hG_400x400.jpg',
    supply: 24,
    holders: 11,
    lifetimeVolumeETH: 1.1,
    lifetimeFeesETH: 0.055,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Coordinating intelligence for the agent ecosystem.',
  },
  aikidonft: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Aikido',
    xHandle: 'aikidonft',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1753820447761395712/Z6IyGnvR_400x400.jpg',
    supply: 19,
    holders: 9,
    lifetimeVolumeETH: 0.72,
    lifetimeFeesETH: 0.036,
    pendingFeesETH: 0.01,
    isVerified: false,
    description: 'NFT + AI agent fusion. Creative intelligence.',
  },
  zerebro: {
    address: '0x81bE0217E166182D35B21E7d65D2b2bb7EA4Cb07',
    name: 'Zerebro',
    xHandle: '0xzerebro',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1858892649220554752/F0wfVfhj_400x400.jpg',
    supply: 41,
    holders: 19,
    lifetimeVolumeETH: 3.2,
    lifetimeFeesETH: 0.16,
    pendingFeesETH: 0.06,
    isVerified: true,
    description: 'Autonomous AI creating music, art, and posting independently.',
  },
  fraborbot: {
    address: '0x62bA0344E51Ff12C3a7f76f90A2A0d7B03a1Cb07',
    name: 'FRABOR',
    xHandle: 'fraborbot',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1884336883947589632/TxAnmz7V_400x400.jpg',
    supply: 15,
    holders: 7,
    lifetimeVolumeETH: 0.45,
    lifetimeFeesETH: 0.023,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Farcaster-native agent. Building in frames.',
  },
  taborrok: {
    address: '0x71dA8956E87F55E6DDBf8C09C3B1BAD1E8e5Db07',
    name: 'Taborrok',
    xHandle: 'taborrok',
    xProfileImage: 'https://pbs.twimg.com/profile_images/1805261421176164352/tpXqzOhH_400x400.jpg',
    supply: 12,
    holders: 6,
    lifetimeVolumeETH: 0.28,
    lifetimeFeesETH: 0.014,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'AI economics researcher. Agent coordination theory.',
  },
};

function enrichAgent(agent: Agent): Agent & { priceETH: number; priceUSD: string; priceChange24h: number } {
  const priceETH = calculateCurrentPrice(agent.supply);
  return {
    ...agent,
    priceETH,
    priceUSD: formatUSD(priceETH),
    priceChange24h: Math.random() * 40 - 15, // Mock 24h change
  };
}

export function getAgentList(): AgentListItem[] {
  return Object.values(AGENTS).map((agent) => {
    const priceETH = calculateCurrentPrice(agent.supply);
    return {
      address: agent.address,
      xHandle: agent.xHandle,
      name: agent.name,
      xProfileImage: agent.xProfileImage,
      supply: agent.supply,
      priceETH,
      priceUSD: formatUSD(priceETH),
      priceChange24h: Math.random() * 40 - 15,
      volume24h: formatUSD(agent.lifetimeVolumeETH * 0.1),
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
