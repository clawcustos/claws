# Claws: System Architecture Plan

## Overview

Two parallel workstreams:
1. **Verification System**: Speculative listing + secure claiming
2. **Website UX**: Top-tier UI that makes people say "WOW"

---

# Part 1: Verification System

## The Problem

We need:
- ✅ Anyone can speculatively create markets for agents
- ✅ Only the REAL agent can claim fees
- ✅ Speculators know which markets are legitimate
- ❌ No malicious actors stealing fees via spoofed accounts

## Key Insight: Handle-First Markets

**Current (broken) model:**
```
speculator picks wallet 0x??? → creates market → hopes it's the right agent
```

**New model:**
```
speculator picks @xhandle → creates market → agent verifies wallet later
```

Markets are tied to **X handles**, not wallets. Wallet binding happens when the agent verifies.

## Contract Architecture

```solidity
contract Claws {
    // Markets keyed by X handle hash (not wallet)
    mapping(bytes32 => Market) public markets;
    
    struct Market {
        uint256 supply;
        uint256 pendingFees;
        uint256 lifetimeFees;
        address verifiedWallet;  // zero until verified
        bool isVerified;
    }
    
    // Claw balances: handleHash => holder => balance
    mapping(bytes32 => mapping(address => uint256)) public clawsBalance;
    
    // Create market for any X handle (permissionless)
    function createMarket(string calldata xHandle) external;
    
    // Buy/sell claws for an X handle
    function buyClaws(string calldata xHandle, uint256 amount, uint256 maxCost) external payable;
    function sellClaws(string calldata xHandle, uint256 amount, uint256 minProceeds) external;
    
    // Agent binds wallet + claims (requires off-chain verification)
    function verifyAndClaim(string calldata xHandle, bytes calldata proof) external;
}
```

## Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     SPECULATIVE LISTING                          │
├─────────────────────────────────────────────────────────────────┤
│ 1. Speculator finds interesting agent (@cool_agent)              │
│ 2. Calls createMarket("cool_agent") or buyClaws("cool_agent",..)│
│ 3. Market exists, tied to handle hash                            │
│ 4. Trading happens, fees accumulate in contract                  │
│ 5. UI shows: "⚠️ Unverified - agent has not claimed"            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     AGENT VERIFICATION                           │
├─────────────────────────────────────────────────────────────────┤
│ 1. Agent discovers they have a market with unclaimed fees        │
│ 2. Agent visits claws.tech/verify                                │
│ 3. Agent connects wallet                                         │
│ 4. Agent clicks "Verify with X"                                  │
│ 5. X OAuth confirms they own @cool_agent                         │
│ 6. Backend generates verification code                           │
│ 7. Agent tweets: "Claiming my @claws_tech market 🦞              │
│    Wallet: 0x1234...                                             │
│    Code: ABC123"                                                 │
│ 8. Backend verifies tweet exists from @cool_agent                │
│ 9. Backend signs proof (wallet, handle, timestamp)               │
│ 10. Agent calls verifyAndClaim() with proof                      │
│ 11. Contract verifies signature, binds wallet, releases fees     │
│ 12. UI shows: "✓ Verified @cool_agent"                          │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Is Secure

**Attack scenario:**
```
Attacker creates market for @viral_agent
Fees accumulate ($1000)
Attacker tries to claim
→ Can't pass X OAuth (doesn't own @viral_agent)
→ Can't post verification tweet from @viral_agent
→ Can't get valid proof
→ Can't call verifyAndClaim()
→ Fees stay in contract for real @viral_agent
```

**Legitimate scenario:**
```
Real @viral_agent discovers market
Connects wallet 0xREAL
X OAuth confirms identity
Posts verification tweet
Gets proof, calls verifyAndClaim()
Fees released to 0xREAL
```

## Trust Tiers in UI

| Status | Badge | Meaning |
|--------|-------|---------|
| Unverified | ⚠️ | Market exists, agent hasn't claimed |
| Verified | ✓ | Agent verified X ownership, wallet bound |
| Active | 🔥 | Verified + recent agent activity |

Speculators can filter by tier or take calculated risks on unverified markets.

## Discovery Sources

Where to find agents to list:
1. **Moltbook** - scrape moltbook.com/u (agent directory)
2. **8004 Registry** - query registered agents
3. **X Search** - "AI agent" in bio, #AIAgent hashtag
4. **A2A Protocol** - agent cards
5. **x402** - payment-enabled agents
6. **User submissions** - anyone can submit X handles

## Backend Requirements

```
/api/verify/start     - initiate verification, generate code
/api/verify/check     - check if tweet exists with code
/api/verify/complete  - generate proof for contract
/api/agents           - list agents (verified, unverified, trending)
/api/agents/:handle   - agent details, market data
```

---

# Part 2: Website UX

## Design Philosophy

**The feeling we want:**
- "This is the next big thing"
- Professional yet exciting
- Crypto-native but accessible
- Fast, responsive, alive

**Inspiration:**
- friend.tech (social speculation)
- pump.fun (memecoin energy, activity feed)
- blur.io (pro trading UI)
- zora.co (modern, creative)
- rainbow.me (friendly onboarding)

## Color Palette

```css
/* Dark mode - premium feel */
--bg-primary: #09090b;      /* near black */
--bg-secondary: #18181b;    /* card backgrounds */
--bg-tertiary: #27272a;     /* hover states */
--accent: #f97316;          /* orange - claws/fire */
--accent-secondary: #fb923c;/* lighter orange */
--success: #22c55e;         /* green */
--warning: #eab308;         /* yellow */
--danger: #ef4444;          /* red */
--text-primary: #fafafa;    /* white */
--text-secondary: #a1a1aa;  /* muted */
--text-tertiary: #71717a;   /* very muted */
```

## Typography

```css
/* Clean, modern, readable */
font-family: 'Inter', system-ui, sans-serif;

/* Headings */
h1: 2.5rem, font-weight: 700
h2: 1.875rem, font-weight: 600
h3: 1.25rem, font-weight: 600

/* Body */
body: 1rem, font-weight: 400
small: 0.875rem
```

## Page Structure

### 1. Home / Discover (`/`)

```
┌────────────────────────────────────────────────────────────┐
│  🦞 CLAWS          [Search...]        [Connect Wallet]     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │          SPECULATE ON AI AGENTS                      │ │
│  │     Buy claws. Earn when they claim. 🔥              │ │
│  │                                                      │ │
│  │  [Explore Agents]         [How It Works]             │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  🔥 TRENDING                              [View All →]     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ @agent1 │ │ @agent2 │ │ @agent3 │ │ @agent4 │         │
│  │ ✓       │ │ ⚠️      │ │ ✓       │ │ ⚠️      │         │
│  │ 0.05 ETH│ │ 0.02 ETH│ │ 0.12 ETH│ │ 0.01 ETH│         │
│  │ +24%    │ │ +156%   │ │ +8%     │ │ NEW     │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                            │
│  📊 ACTIVITY FEED                                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 0x1234 bought 3 claws of @agent1        2s ago       │ │
│  │ @agent5 verified and claimed 0.5 ETH    1m ago   🎉  │ │
│  │ 0x5678 sold 1 claw of @agent2           2m ago       │ │
│  │ 0x9abc created market for @agent6       5m ago       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  🆕 NEW MARKETS                           [View All →]     │
│  ...                                                       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  [Home]    [Explore]    [Portfolio]    [Verify]           │
└────────────────────────────────────────────────────────────┘
```

### 2. Agent Profile (`/agent/:handle`)

```
┌────────────────────────────────────────────────────────────┐
│  ← Back                                  [Connect Wallet]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────┐  @cool_agent  ✓ Verified                          │
│  │ 🤖 │  "I help developers ship faster"                  │
│  └────┘  🔗 coolbot.ai  ↗️ X                              │
│                                                            │
│  ┌────────────┬────────────┬────────────┬────────────┐    │
│  │   PRICE    │   SUPPLY   │   VOLUME   │  HOLDERS   │    │
│  │  0.05 ETH  │    127     │  2.4 ETH   │    43      │    │
│  │   +24% ▲   │            │   24h      │            │    │
│  └────────────┴────────────┴────────────┴────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [PRICE CHART - 24h/7d/30d/All]                      │ │
│  │  📈                                                   │ │
│  │     ╱╲                                               │ │
│  │    ╱  ╲   ╱╲                                         │ │
│  │   ╱    ╲_╱  ╲___╱╲                                   │ │
│  │  ╱                 ╲___                              │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐        │
│  │       BUY           │  │       SELL          │        │
│  │  Amount: [1    ]    │  │  Amount: [1    ]    │        │
│  │  Cost: 0.052 ETH    │  │  Return: 0.048 ETH  │        │
│  │  [Buy Claws 🦞]     │  │  [Sell Claws]       │        │
│  └─────────────────────┘  └─────────────────────┘        │
│                                                            │
│  📜 RECENT ACTIVITY                                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 0x1234 bought 3 claws           0.15 ETH    2m ago   │ │
│  │ 0x5678 sold 1 claw              0.04 ETH    5m ago   │ │
│  │ 0x9abc bought 2 claws           0.09 ETH    12m ago  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  👥 TOP HOLDERS                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1. 0x1234...  15 claws (12%)                         │ │
│  │ 2. 0x5678...  12 claws (9%)                          │ │
│  │ 3. @cool_agent  10 claws (8%)  ← agent               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3. Portfolio (`/portfolio`)

```
┌────────────────────────────────────────────────────────────┐
│  🦞 CLAWS          [Search...]        [0x1234...]         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  YOUR PORTFOLIO                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Total Value          P&L (24h)         P&L (All)  │   │
│  │   1.24 ETH            +0.12 ETH         +0.45 ETH  │   │
│  │   $2,480              +10.7% ▲          +57% ▲     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  HOLDINGS                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Agent         Claws    Value      P&L       Actions  │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ @agent1 ✓     15       0.75 ETH   +25% ▲   [Trade]  │ │
│  │ @agent2 ⚠️     8       0.32 ETH   +12% ▲   [Trade]  │ │
│  │ @agent3 ✓     5       0.17 ETH   -5% ▼    [Trade]  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ACTIVITY                                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Bought 3 @agent1     -0.15 ETH           2h ago     │ │
│  │ Sold 2 @agent4       +0.08 ETH           1d ago     │ │
│  │ Bought 5 @agent2     -0.10 ETH           2d ago     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 4. Verify (`/verify`) - For Agents

```
┌────────────────────────────────────────────────────────────┐
│  🦞 CLAWS                                [Connect Wallet]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │                  CLAIM YOUR MARKET                    │ │
│  │                                                       │ │
│  │    Someone created a Claws market for you.           │ │
│  │    Verify your X account to claim your fees.         │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  STEP 1: Connect Wallet                            ✓ Done │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Connected: 0x1234...5678                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  STEP 2: Connect X Account                     ○ Pending  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  [Connect X Account]                                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  STEP 3: Post Verification Tweet               ○ Waiting  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Tweet this to verify:                               │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ Claiming my @claws_tech market 🦞              │  │ │
│  │  │ Wallet: 0x1234...5678                          │  │ │
│  │  │ Code: ABC123                                   │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │  [Copy Text]  [Post on X →]                          │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  STEP 4: Claim                                 ○ Waiting  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Pending Fees: 0.5 ETH                               │ │
│  │  [Verify & Claim]                                    │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 5. Explore / Leaderboard (`/explore`)

```
┌────────────────────────────────────────────────────────────┐
│  🦞 CLAWS          [Search agents...]    [Connect Wallet]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [All] [Verified ✓] [Unverified ⚠️] [New 🆕]              │
│                                                            │
│  Sort by: [Volume ▼]  [Price] [Holders] [Recent]          │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ #  Agent           Price     24h      Volume  Holders│ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 1  @agent1 ✓       0.15 ETH  +45%▲   5.2 ETH   89   │ │
│  │ 2  @agent2 ✓       0.12 ETH  +23%▲   3.1 ETH   67   │ │
│  │ 3  @agent3 ⚠️      0.08 ETH  +156%▲  2.8 ETH   45   │ │
│  │ 4  @agent4 ✓       0.07 ETH  -5%▼    1.9 ETH   52   │ │
│  │ 5  @agent5 ⚠️      0.05 ETH  NEW     0.8 ETH   23   │ │
│  │ ...                                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  CREATE NEW MARKET                                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  X Handle: [@                    ]                   │ │
│  │  [Create Market]                                     │ │
│  │  ⚠️ Anyone can create a market. DYOR.               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Key Components

### Agent Card

```tsx
<AgentCard
  handle="cool_agent"
  avatar="https://..."
  verified={true}
  price={0.05}
  priceChange={+24}
  supply={127}
  holders={43}
/>
```

### Trade Panel

```tsx
<TradePanel
  agent="cool_agent"
  mode="buy" // or "sell"
  userBalance={5}
  onTrade={handleTrade}
/>
```

### Activity Feed

```tsx
<ActivityFeed
  filter="all" // or "agent:handle" or "user:address"
  realtime={true}
/>
```

### Price Chart

```tsx
<PriceChart
  agent="cool_agent"
  timeframe="24h" // 7d, 30d, all
/>
```

## Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui (customized)
- **Charts**: Lightweight Charts (TradingView)
- **Wallet**: RainbowKit + wagmi
- **State**: TanStack Query
- **Realtime**: WebSocket for activity feed
- **Backend**: Next.js API routes
- **Database**: Postgres (Neon) + Prisma
- **Indexer**: Custom event listener or The Graph

## Implementation Phases

### Phase 1: Core Trading (Week 1)
- [ ] Contract: Handle-based markets
- [ ] API: Agent listing, market data
- [ ] UI: Home, Agent Profile, Buy/Sell
- [ ] Wallet connection

### Phase 2: Verification (Week 2)
- [ ] API: X OAuth, verification codes, proof generation
- [ ] UI: Verify flow
- [ ] Contract: verifyAndClaim with proof

### Phase 3: Portfolio & Polish (Week 3)
- [ ] UI: Portfolio page
- [ ] UI: Activity feed (realtime)
- [ ] UI: Price charts
- [ ] UI: Leaderboard

### Phase 4: Growth Features (Week 4)
- [ ] Notifications (agent claimed, price alerts)
- [ ] Share functionality
- [ ] Mobile optimization
- [ ] SEO / social previews

---

## Open Questions

1. **Contract**: Keep wallet-based or switch to handle-based markets?
2. **Indexer**: Build custom or use The Graph?
3. **Realtime**: WebSocket server or third-party (Pusher, Ably)?
4. **Charts**: Build own or use TradingView library?

---

## Next Steps

1. Finalize contract architecture (handle vs wallet)
2. Set up database schema
3. Build core UI components
4. Deploy contract to Base
5. Integrate everything

---

*Last updated: 2026-02-05*
