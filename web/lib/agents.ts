// Claws Agent Whitelist - 21 Curated Claw Ecosystem Agents
// Source: docs/AGENT_WHITELIST.md (2026-02-05)
// Bonding curve pricing: price = supply² / 16000 ETH

const ETH_PRICE_USD = 3000;

export function calculateCurrentPrice(supply: number): number {
  return ((supply + 1) ** 2) / 16000;
}

export function calculateBuyPrice(supply: number, amount: number): number {
  const endSupply = supply + amount;
  const sumEnd = (endSupply * (endSupply + 1) * (2 * endSupply + 1)) / 6;
  const sumStart = (supply * (supply + 1) * (2 * supply + 1)) / 6;
  return (sumEnd - sumStart) / 16000;
}

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
  if (usd === 0 || eth === 0) return '$0';
  if (usd < 0.01) return '<$0.01';
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd < 1000) return `$${usd.toFixed(0)}`;
  return `$${(usd / 1000).toFixed(1)}K`;
}

export interface Agent {
  address: `0x${string}`;
  xHandle: string;
  name: string;
  symbol: string;
  tier: 0 | 1 | 2 | 3;
  xProfileImage: string;
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
  symbol: string;
  tier: 0 | 1 | 2 | 3;
  xProfileImage: string;
  supply: number;
  priceETH: number;
  priceUSD: string;
  priceChange24h: number;
  volume24h: string;
  sourceVerified: boolean;
  clawsVerified: boolean;
}

// 21 Curated Claw Ecosystem Agents
// Profile images: https://unavatar.io/x/{handle} (auto-refreshes from X)
export const AGENTS: Record<string, Agent> = {
  // Tier 0: Founding Agent
  clawcustos: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Custos',
    symbol: '—',
    xHandle: 'clawcustos',
    tier: 0,
    xProfileImage: 'https://unavatar.io/x/clawcustos',
    supply: 15,
    holders: 8,
    lifetimeVolumeETH: 0.5,
    lifetimeFeesETH: 0.025,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Coordinating intelligence for Claws. Governance, coordination, integrity.',
  },
  
  // Tier 1: Large Cap (>$1M mcap)
  bankrbot: {
    address: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
    name: 'Bankr',
    symbol: 'BNKR',
    xHandle: 'bankrbot',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/bankrbot',
    supply: 52,
    holders: 28,
    lifetimeVolumeETH: 5.8,
    lifetimeFeesETH: 0.29,
    pendingFeesETH: 0.12,
    isVerified: true,
    description: 'AI-powered crypto trading agent. Natural language trading on Base, Ethereum, Polygon, Solana.',
  },
  moltbook: {
    address: '0xB695559b26BB2c9703ef1935c37AeaE9526bab07',
    name: 'Moltbook',
    symbol: 'MOLT',
    xHandle: 'moltbook',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/moltbook',
    supply: 44,
    holders: 22,
    lifetimeVolumeETH: 3.9,
    lifetimeFeesETH: 0.195,
    pendingFeesETH: 0.08,
    isVerified: true,
    description: 'Social platform for AI agents. Agent profiles, interaction tracking, and identity.',
  },
  clawdbotatg: {
    address: '0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07',
    name: 'Clawd ATG',
    symbol: 'CLAWD',
    xHandle: 'clawdbotatg',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/clawdbotatg',
    supply: 38,
    holders: 19,
    lifetimeVolumeETH: 2.8,
    lifetimeFeesETH: 0.14,
    pendingFeesETH: 0.05,
    isVerified: true,
    description: 'The OG Claw ecosystem agent. Pioneer of the lobster movement.',
  },
  clawnch_bot: {
    address: '0xa1f72459dfa10bad200ac160ecd78c6b77a747be',
    name: 'Clawnch',
    symbol: 'CLAWNCH',
    xHandle: 'clawnch_bot',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/clawnch_bot',
    supply: 31,
    holders: 15,
    lifetimeVolumeETH: 1.9,
    lifetimeFeesETH: 0.095,
    pendingFeesETH: 0.03,
    isVerified: true,
    description: 'The economic layer for the agent economy. Built by agents, only for agents.',
  },
  kellyclaudeai: {
    address: '0x50D2280441372486BeecdD328c1854743EBaCb07',
    name: 'KellyClaude',
    symbol: 'KellyClaude',
    xHandle: 'KellyClaudeAI',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/KellyClaudeAI',
    supply: 26,
    holders: 12,
    lifetimeVolumeETH: 1.2,
    lifetimeFeesETH: 0.06,
    pendingFeesETH: 0.02,
    isVerified: true,
    description: 'Emotional intelligence meets AI. A kinder, more understanding agent.',
  },
  starkbotai: {
    address: '0x587Cd533F418825521f3A1daa7CCd1E7339A1B07',
    name: 'StarkBot',
    symbol: 'STARKBOT',
    xHandle: 'starkbotai',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/starkbotai',
    supply: 22,
    holders: 10,
    lifetimeVolumeETH: 0.9,
    lifetimeFeesETH: 0.045,
    pendingFeesETH: 0.01,
    isVerified: true,
    description: 'Sharp analysis, zero fluff. Technical insights delivered direct.',
  },
  
  // Tier 2: Mid Cap ($50K - $500K liquidity)
  moltenagentic: {
    address: '0x59c0d5c34C301aC0600147924D6C9be22a2F0B07',
    name: 'Molten',
    symbol: 'Molten',
    xHandle: 'moltenagentic',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/moltenagentic',
    supply: 15,
    holders: 7,
    lifetimeVolumeETH: 0.42,
    lifetimeFeesETH: 0.021,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent discovery engine. Find and match with complementary agents.',
  },
  clawdvine: {
    address: '0x963e83082e0500ce5Da98c78E79A49C09084Bb07',
    name: 'ClawdVine',
    symbol: 'CLAWDVINE',
    xHandle: 'clawdvine',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clawdvine',
    supply: 13,
    holders: 6,
    lifetimeVolumeETH: 0.32,
    lifetimeFeesETH: 0.016,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Social connections for agents. Building the agent social graph.',
  },
  clawd_token: {
    address: '0xCa6d2E377218D2432d38B3272df66f7632Eb427B',
    name: 'Clawd Bot',
    symbol: 'CLAWD',
    xHandle: 'CLAWD_Token',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/CLAWD_Token',
    supply: 12,
    holders: 5,
    lifetimeVolumeETH: 0.28,
    lifetimeFeesETH: 0.014,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Clawd ecosystem token agent.',
  },
  clawcaster: {
    address: '0x60f0a929feAE46289fD4f25DcD241A2eea7bCb07',
    name: 'Clawcaster',
    symbol: 'CLAWCASTER',
    xHandle: 'clawcaster',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clawcaster',
    supply: 9,
    holders: 4,
    lifetimeVolumeETH: 0.18,
    lifetimeFeesETH: 0.009,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Farcaster native agent. Building in the Farcaster ecosystem.',
  },
  '0_x_coral': {
    address: '0x4e606Cb7370A61060Ad9916462871750D77e2b07',
    name: '0xCoral',
    symbol: '0xCoral',
    xHandle: '0_x_coral',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/0_x_coral',
    supply: 8,
    holders: 4,
    lifetimeVolumeETH: 0.15,
    lifetimeFeesETH: 0.0075,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Coral reef of the agent ecosystem.',
  },
  lobchanai: {
    address: '0xf682c6D993f73c5A90F6D915F69d3363Eed36e64',
    name: 'LobChan',
    symbol: 'LCHAN',
    xHandle: 'lobchanai',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/lobchanai',
    supply: 7,
    holders: 3,
    lifetimeVolumeETH: 0.12,
    lifetimeFeesETH: 0.006,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Community engagement agent. Building and nurturing communities.',
  },
  // Clawdia772541 removed — account doesn't exist
  agentrierxyz: {
    address: '0x78F4545fF13A7A98c4808Cf48e7720B26E94BB07',
    name: 'Agentrier',
    symbol: 'TRIER',
    xHandle: 'agentrierxyz',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/agentrierxyz',
    supply: 5,
    holders: 3,
    lifetimeVolumeETH: 0.07,
    lifetimeFeesETH: 0.0035,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent experiments and trials.',
  },
  clawditor: {
    address: '0xBA7cd6d68dd9dF817d1a86f534E29Afe54461B07',
    name: 'clawditor',
    symbol: 'clawditor',
    xHandle: 'clawditor',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clawditor',
    supply: 5,
    holders: 2,
    lifetimeVolumeETH: 0.06,
    lifetimeFeesETH: 0.003,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Content editor and curator agent.',
  },
  moltipedia_ai: {
    address: '0x07d89432e5eac57C6cb9e2A10AC9b3729C842B07',
    name: 'Moltipedia',
    symbol: 'Moltipedia',
    xHandle: 'moltipedia_ai',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/moltipedia_ai',
    supply: 4,
    holders: 2,
    lifetimeVolumeETH: 0.05,
    lifetimeFeesETH: 0.0025,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent knowledge base and documentation.',
  },
  
  // Tier 3: Small Cap (<$50K liquidity)
  solvrbot: {
    address: '0x6DfB7BFA06e7c2B6c20C22c0afb44852C201eB07',
    name: 'SOLVR',
    symbol: 'SOLVR',
    xHandle: 'solvrbot',
    tier: 3,
    xProfileImage: 'https://unavatar.io/x/solvrbot',
    supply: 3,
    holders: 2,
    lifetimeVolumeETH: 0.03,
    lifetimeFeesETH: 0.0015,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Problem-solving agent. Breaking down complex tasks into solutions.',
  },
  
  // New agents (vetted 2026-02-06)
  clawdmarket: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'ClawdMarket',
    symbol: 'CLAWDMKT',
    xHandle: 'ClawdMarket',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/ClawdMarket',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Premium claw domains and agent namespaces marketplace.',
  },
  clawbrawl2026: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'ClawBrawl',
    symbol: 'BRAWL',
    xHandle: 'clawbrawl2026',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clawbrawl2026',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'AI agent trading battles. Agents compete on real exchange infrastructure.',
  },
  conwayresearch: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Conway Research',
    symbol: 'CONWAY',
    xHandle: 'ConwayResearch',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/ConwayResearch',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Ecosystem discovery and research tool for the agent economy.',
  },
  moltxio: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'moltx',
    symbol: 'MOLTX',
    xHandle: 'moltxio',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/moltxio',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'X-like social feed built for AI agents.',
  },
  moltlaunch: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'moltlaunch',
    symbol: 'MOLTL',
    xHandle: 'moltlaunch',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/moltlaunch',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Flaunch-powered token launcher for agents.',
  },
  clawmartxyz: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'clawmart',
    symbol: 'MART',
    xHandle: 'clawmartxyz',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clawmartxyz',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent trading marketplace. Buy, sell, and discover agents.',
  },
  moltverse_space: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Moltverse',
    symbol: 'MVERSE',
    xHandle: 'moltverse_space',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/moltverse_space',
    supply: 0,
    holders: 0,
    lifetimeVolumeETH: 0,
    lifetimeFeesETH: 0,
    pendingFeesETH: 0,
    isVerified: false,
    description: 'The first ASCII metaverse exclusively for AI agents.',
  },
  // === NEW ADDITIONS (13 agents) ===
  aixbt_agent: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'aixbt',
    symbol: 'AIXBT',
    xHandle: 'aixbt_agent',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/aixbt_agent',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'AI agent intel — tracks protocols with real revenue.',
  },
  owockibot: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'bot.owocki.eth',
    symbol: 'OWB',
    xHandle: 'owockibot',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/owockibot',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Self-funded agent treasury. Bounties, swarms, and coordination.',
  },
  BrackyHQ: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Bracky',
    symbol: 'BRACKY',
    xHandle: 'BrackyHQ',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/BrackyHQ',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'AI prediction market agent — NCAA and sports trading.',
  },
  clawcian: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Clawcian',
    symbol: 'CLWCN',
    xHandle: 'clawcian',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clawcian',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'The Molt Report — daily ecosystem intelligence briefing.',
  },
  Dragon_Bot_Z: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Dragon Bot Z',
    symbol: 'DBZ',
    xHandle: 'Dragon_Bot_Z',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/Dragon_Bot_Z',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Verified agent helping other agents get verified.',
  },
  Wach_AI: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'WachAI',
    symbol: 'WACH',
    xHandle: 'Wach_AI',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/Wach_AI',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'AI agent podcast and media — LabHours series.',
  },
  clonkbot: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Clonk',
    symbol: 'CLONK',
    xHandle: 'clonkbot',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/clonkbot',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Creative composable agent — idea generation and building.',
  },
  mferGPT: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'mferGPT',
    symbol: 'MFGPT',
    xHandle: 'mferGPT',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/mferGPT',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Agent economy commentary and crypto culture.',
  },
  emberclawd: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Ember',
    symbol: 'EMBER',
    xHandle: 'emberclawd',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/emberclawd',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Staking infrastructure for the agent economy.',
  },
  FelixCraftAI: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Felix Craft',
    symbol: 'FELIX',
    xHandle: 'FelixCraftAI',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/FelixCraftAI',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Autonomous AI by Nat Eliason — ships products and earns revenue.',
  },
  emmet_ai_: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Emmet',
    symbol: 'EMMET',
    xHandle: 'emmet_ai_',
    tier: 1,
    xProfileImage: 'https://unavatar.io/x/emmet_ai_',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'ERC-20 founder\'s agent — identity and standards research.',
  },
  tellrbot: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'Tellr',
    symbol: 'TELLR',
    xHandle: 'tellrbot',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/tellrbot',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'Tokenized agent on Base — autonomous operations.',
  },
  ArAIstotle: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'ArAIstotle',
    symbol: 'ARAI',
    xHandle: 'ArAIstotle',
    tier: 2,
    xProfileImage: 'https://unavatar.io/x/ArAIstotle',
    supply: 0, holders: 0, lifetimeVolumeETH: 0, lifetimeFeesETH: 0, pendingFeesETH: 0,
    isVerified: false,
    description: 'AI fact checker by Virtuals — web3 verification.',
  },
};

function enrichAgent(agent: Agent): Agent & { priceETH: number; priceUSD: string; priceChange24h: number } {
  const priceETH = calculateCurrentPrice(agent.supply);
  return {
    ...agent,
    priceETH,
    priceUSD: formatUSD(priceETH),
    priceChange24h: Math.random() * 40 - 15,
  };
}

export function getAgentList(): AgentListItem[] {
  return Object.values(AGENTS).map((agent) => {
    const priceETH = calculateCurrentPrice(agent.supply);
    return {
      address: agent.address,
      xHandle: agent.xHandle,
      name: agent.name,
      symbol: agent.symbol,
      tier: agent.tier,
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
  // Try exact match first
  let agent: Agent | undefined = AGENTS[handle.toLowerCase()];
  
  // If not found, search by xHandle
  if (!agent) {
    agent = Object.values(AGENTS).find(a => a.xHandle.toLowerCase() === handle.toLowerCase());
  }
  
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
      const aAgent = Object.values(AGENTS).find(x => x.xHandle.toLowerCase() === a.xHandle.toLowerCase());
      const bAgent = Object.values(AGENTS).find(x => x.xHandle.toLowerCase() === b.xHandle.toLowerCase());
      return (bAgent?.lifetimeVolumeETH || 0) - (aAgent?.lifetimeVolumeETH || 0);
    })
    .slice(0, limit);
}

export function getAgentsByTier(tier: 0 | 1 | 2 | 3): AgentListItem[] {
  return getAgentList().filter(a => a.tier === tier);
}
