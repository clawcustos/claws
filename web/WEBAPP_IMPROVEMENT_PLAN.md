# CLAWS.TECH — Comprehensive Web App Improvement Plan

**Author:** Custos  
**Date:** 2026-02-06  
**Scope:** Full audit of `~/repos/claws/web/` with prioritized improvements  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Priority Fixes — Bugs & Inconsistencies](#1-priority-fixes--bugs--inconsistencies)
3. [UI/UX Improvements — Ranked by Impact](#2-uiux-improvements--ranked-by-impact)
4. [New Features — Ranked by Engagement Potential](#3-new-features--ranked-by-engagement-potential)
5. [Agent-Friendly API & skill.md Spec](#4-agent-friendly-api--skillmd-spec)
6. [Technical Debt & Architecture Notes](#5-technical-debt--architecture-notes)

---

## Executive Summary

The Claws web app is functional — trading works, contracts are live on Base, verification flows. But it feels like a prototype, not a product. The most successful speculation platforms (friend.tech, pump.fun) create **urgency**, **social proof**, and **dopamine loops** that keep users coming back. Claws has none of these yet.

**The core problems:**
1. **Inconsistent UI** — Every page has its own header, bottom nav, and layout. It looks like 5 different apps stitched together.
2. **No real-time feedback** — The activity ticker is fake (hardcoded mock data). There's no live activity, no charts, no price movement.
3. **No social proof** — Who's buying? What's trending? Why should I care about any of these agents?
4. **No agent discoverability** — 19 agents with static hardcoded data. No way for agents to programmatically discover or trade.
5. **Duplicate content** — Two separate "How It Works" sections on the main page saying slightly different things.

**What would make this sensational:**
- Real-time trade feed from contract events (the ticker should show ACTUAL trades)
- One-tap trading with instant confirmation feedback (sound, animation)
- Mini price charts on every card (sparklines)
- "Just Traded" social proof badges
- Agent-to-agent trading via a clean REST API

---

## 1. Priority Fixes — Bugs & Inconsistencies

### P0: Critical (Fix immediately)

#### 1.1 Duplicate "How It Works" Sections
**File:** `app/page.tsx`  
**Problem:** Two completely different "How It Works" sections — a 4-step version (lines ~265-325) and a 3-step version (lines ~360-400). They contradict each other.  
**Fix:** Delete the second 3-step "How It Works" section entirely. The first 4-step version (Start Free → Bonding Curve → Sell Anytime → Agents Earn 5%) is more complete and accurate.

```tsx
// DELETE everything between the </section> after LEADERBOARD and the CTA section
// Specifically: the section with className="section" containing "How It Works" with 3 steps
// Lines approximately 355-405 in app/page.tsx
```

#### 1.2 Inconsistent Headers Across Pages
**Problem:** Every page defines its own header inline. The main page has the full nav + BETA badge. Subpages each have different combinations.

| Page | Logo | Logo Image | Nav Links | BETA Badge | ConnectButton |
|------|------|-----------|-----------|------------|---------------|
| `app/page.tsx` | CLAWS.TECH | ✅ logo.jpg | Agents, Leaderboard, Verify | ✅ | ✅ |
| `app/explore/page.tsx` | CLAWS (red only) | ❌ | Home, Leaderboard | ❌ | ✅ |
| `app/clawfolio/page.tsx` | logo + CLAWS.TECH | ✅ logo.jpg | ❌ (none) | ❌ | ✅ |
| `app/leaderboard/page.tsx` | logo + CLAWS.TECH | ✅ logo.jpg | ❌ (none) | ❌ | ✅ |
| `app/verify/page.tsx` | logo + CLAWS.TECH | ✅ logo.jpg | ❌ (none) | ❌ | ✅ |
| `app/agent/[handle]/page.tsx` | CLAWS (red only) | ❌ | ❌ (none) | ❌ | ✅ |
| `app/disclaimer/page.tsx` | logo + CLAWS.TECH | ✅ logo.jpg | ❌ (none) | ❌ | ❌ |

**Fix:** Extract a single shared `<Header />` component and use it in the root layout (`app/layout.tsx`), not in each page.

```tsx
// components/shared-header.tsx — THE ONE HEADER
'use client';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function SharedHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.jpg" alt="Claws" style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <span className="logo-text">
            <span style={{ color: 'var(--red)' }}>CLAWS</span>
            <span style={{ color: 'white' }}>.TECH</span>
          </span>
          <span className="beta-badge">BETA</span>
        </Link>
        
        <nav className="header-nav">
          <Link href="/explore" className="header-link">Explore</Link>
          <Link href="/leaderboard" className="header-link">Leaderboard</Link>
          <Link href="/verify" className="header-link">Verify</Link>
        </nav>
        
        <ConnectButton.Custom>
          {/* ... standard connect button ... */}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
```

Then in `app/layout.tsx`:
```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          <SharedHeader />
          <main className="main">
            {children}
          </main>
          <SharedBottomNav />
        </Providers>
      </body>
    </html>
  );
}
```

Remove ALL inline `<header>` blocks from every page file.

#### 1.3 Inconsistent Bottom Navigation
**Problem:** Three different bottom navs exist:

| Page | Home | Agents | Trending | Clawfolio | Explore |
|------|------|--------|----------|-----------|---------|
| `app/page.tsx` | ✅ | ✅ (anchor) | ✅ (anchor) | ✅ (link) | ❌ |
| `app/clawfolio/page.tsx` | ✅ | ❌ | ✅ (link) | ✅ | ❌ |
| `app/leaderboard/page.tsx` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `app/explore/page.tsx` | ❌ (no bottom nav) | ❌ | ❌ | ❌ | ❌ |
| `app/verify/page.tsx` | ❌ (no bottom nav) | ❌ | ❌ | ❌ | ❌ |
| `app/agent/[handle]/page.tsx` | ❌ (no bottom nav) | ❌ | ❌ | ❌ | ❌ |

The home page uses `<a href="#agents">` (anchor scroll), while subpages use `<Link href="/leaderboard">` (route navigation). Mixed paradigm.

**Fix:** Single `<SharedBottomNav />` in the layout with consistent items:

```tsx
// components/shared-bottom-nav.tsx
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/explore', label: 'Explore', icon: SearchIcon },
  { href: '/leaderboard', label: 'Ranks', icon: TrendingIcon },
  { href: '/clawfolio', label: 'Portfolio', icon: WalletIcon },
];
```

All items should be `<Link>` route navigations, not anchor scrolls. The `#agents` anchor from the home page is confusing when navigating from other pages.

#### 1.4 RainbowKit Accent Color Mismatch
**File:** `app/providers.tsx`  
**Problem:** RainbowKit is configured with `accentColor: "#3B82F6"` (blue), but the entire app uses `#DC2626` (red). The wallet modal appears blue while everything else is red.
**Fix:**
```tsx
// app/providers.tsx
theme={darkTheme({
  accentColor: "#DC2626",  // Match brand red
  accentColorForeground: "white",
  borderRadius: "medium",
})}
```

#### 1.5 Unused Design System
**File:** `lib/design-system.ts`  
**Problem:** An entire design system is defined with orange brand colors (`#FF4D00`), cyan accents (`#00D4FF`), and structured CSS variables — but **nothing uses it**. The actual CSS in `globals.css` uses a completely different color palette (red `#DC2626`).  
**Fix:** Either delete `lib/design-system.ts` or align it with the actual CSS variables. Currently it's dead code that would confuse any contributor.

#### 1.6 Unused Shared Components
**Files:** `components/header.tsx`, `components/bottom-nav.tsx`  
**Problem:** These were created as shared components but are **never imported anywhere**. Every page defines its own header and bottom nav inline. The shared `Header` component references `btn-primary` CSS class (from design-system.ts) and emojis that don't match the inline versions.
**Fix:** Once you create the unified header/nav (fix 1.2/1.3), delete these orphaned files.

### P1: Important (Fix this week)

#### 1.7 Fake Activity Ticker with Hardcoded Mock Data
**File:** `app/page.tsx`, lines 25-36  
**Problem:** The `MOCK_ACTIVITY` array is completely fabricated. It shows trades that never happened with invented prices and truncated addresses. Users who investigate will immediately see it's fake — destroying trust in a trading platform.
**Fix (short-term):** Add a clearly visible "SIMULATED" label or remove the ticker until real data is available.  
**Fix (proper):** Index contract `Trade` events from Base and display real trades. See [Feature 3.1](#31-real-time-trade-feed).

#### 1.8 Random Price Changes on Every Render
**File:** `lib/agents.ts`, `getAgentList()` and `enrichAgent()`  
**Problem:** `priceChange24h: Math.random() * 40 - 15` generates a new random percentage on every component render. This means:
- Price changes flicker constantly as React re-renders
- Sorting by "trending" produces random results
- The up/down arrows are meaningless
**Fix:** Remove the fake `priceChange24h` entirely until real historical price data is available. Display "—" or hide the change indicator. If you want placeholder data, at least seed it deterministically:
```tsx
// Deterministic pseudo-change based on agent name hash
const seed = agent.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
const pseudoChange = ((seed * 997) % 4000 - 1500) / 100;
```

#### 1.9 Hardcoded ETH Price ($3000)
**Files:** `lib/agents.ts`, `components/trade-modal.tsx`, `app/agent/[handle]/page.tsx`  
**Problem:** `const ETH_PRICE_USD = 3000` is hardcoded in 3 separate files. ETH fluctuates; this will be wrong.
**Fix:** Create a single `lib/eth-price.ts` utility that fetches from a price API (CoinGecko, etc.) and caches for 5 minutes, or at minimum read from an env var. Share across all files.

#### 1.10 `explore` Page is Orphaned
**File:** `app/explore/page.tsx`  
**Problem:** The Explore page exists and is functional but:
- Not linked from the home page header nav
- Not in the home page bottom nav
- Not in any other page's bottom nav
- Uses `<Image>` from next/image while other pages use `<img>` tags (will crash on missing images since unoptimized isn't consistent)
**Fix:** Include `/explore` in the unified nav, or merge its functionality into the home page agents section (which already has search/filter).

---

## 2. UI/UX Improvements — Ranked by Impact

### 2.1 ⭐ Extract Layout into `app/layout.tsx` (Impact: 10/10)
**Current state:** Each page renders its own header, main wrapper, and bottom nav. This means:
- ~100 lines of boilerplate duplicated per page
- Any header change needs 7+ file edits
- Inconsistent padding, max-widths, z-indices

**Target:**
```
app/layout.tsx
├── <SharedHeader />
├── <main className="main">{children}</main>
└── <SharedBottomNav />    (mobile only)
```

**Implementation:**
1. Create `components/shared-header.tsx` (consistent logo + nav + connect)
2. Create `components/shared-bottom-nav.tsx` (4 items, uses `usePathname()` for active state)
3. Add both to `app/layout.tsx` inside `<Providers>`
4. Strip header/nav from all 7 page files
5. Adjust `<main>` padding in layout, remove per-page padding

### 2.2 ⭐ Mobile-First Agent Cards (Impact: 9/10)
**Current state:** Agent cards are 320px min-width, which works on desktop but on mobile they stack to a single column with lots of wasted space.

**Improvements:**
- Add **sparkline mini-chart** (even a fake one shows price direction)
- Make the card **clickable to navigate to `/agent/[handle]`** (currently cards only have buy/sell buttons, no way to view details)
- Show **"holders" count** from contract data (currently hidden)
- Add **last trade timestamp** ("2m ago", "1h ago") for social proof

### 2.3 Mobile Bottom Nav Overlap (Impact: 8/10)
**Problem:** The fixed bottom nav overlaps page content. The main page has `padding-bottom` only implicitly through the last section, but subpages like Clawfolio cut off the last list item behind the nav.
**Fix:** Add `padding-bottom: calc(80px + env(safe-area-inset-bottom))` to `<main>` in the layout.

### 2.4 Loading States (Impact: 8/10)
**Problem:** Contract reads take 1-3 seconds. During this time, cards show "Loading..." or "..." which looks broken, especially on first paint.
**Fix:** Add proper skeleton loading states:
```tsx
// components/skeleton.tsx
export function AgentCardSkeleton() {
  return (
    <div className="agent-card" style={{ animation: 'pulse 1.5s infinite' }}>
      <div className="agent-header">
        <div className="agent-avatar" style={{ background: 'var(--grey-800)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 16, width: '60%', background: 'var(--grey-800)', borderRadius: 4 }} />
          <div style={{ height: 12, width: '40%', background: 'var(--grey-800)', borderRadius: 4, marginTop: 8 }} />
        </div>
      </div>
    </div>
  );
}
```

### 2.5 Trade Modal Success Animation (Impact: 7/10)
**Problem:** After a successful trade, you see a small green "✓ Transaction confirmed!" text at the bottom of the modal. For a speculation platform, this should be **celebratory**.
**Fix:** Add a full-modal success state with:
- Large animated checkmark
- Confetti or particle effect (use `canvas-confetti` package)
- "You now hold X claws of @agent" message
- Share button ("Post to X" with pre-filled tweet)
- "Buy More" / "View Agent" action buttons
- Sound effect on confirmation (optional, toggle in settings)

### 2.6 Agent Detail Page is Bare (Impact: 7/10)
**File:** `app/agent/[handle]/page.tsx`  
**Current state:** Just a profile header with price/stats and buy/sell buttons. No price history, no holder list, no trade history.
**Improvements:**
- Price chart (even a simple line chart using just contract supply history)
- Recent trades list (from indexed `Trade` events)
- Holder leaderboard ("Top Holders")
- Agent bio/description (already in data, could be richer)
- Link to agent's X profile, other platforms
- Related agents (same tier)

### 2.7 Typography & Spacing Polish (Impact: 5/10)
**Problem:** Inline styles are used everywhere with inconsistent values. For example:
- `fontSize: '0.875rem'` appears 40+ times
- `color: 'var(--grey-400)'` appears 30+ times
- `borderRadius: '12px'` vs `'8px'` applied inconsistently

**Fix:** Create utility classes in `globals.css`:
```css
.text-sm { font-size: 0.875rem; }
.text-xs { font-size: 0.75rem; }
.text-muted { color: var(--grey-500); }
.text-subtle { color: var(--grey-400); }
.rounded-lg { border-radius: 12px; }
.surface { background: var(--black-surface); border: 1px solid var(--grey-800); border-radius: 12px; }
```

---

## 3. New Features — Ranked by Engagement Potential

### 3.1 ⭐⭐ Real-Time Trade Feed (Engagement: 10/10)
**What:** Replace the fake ticker with a WebSocket or polling-based live feed of actual trades from the Claws contract on Base.

**Implementation:**
1. **Backend:** Create an event indexer that watches the `Trade` event on the contract:
   ```
   app/api/trades/route.ts — GET /api/trades?limit=20
   app/api/trades/stream/route.ts — SSE endpoint
   ```
2. **Option A (simple):** Poll `/api/trades` every 10 seconds from the client
3. **Option B (real-time):** Server-Sent Events (SSE) that push new trades
4. **Frontend component:**
   ```tsx
   function LiveTicker() {
     const { trades } = useLiveTrades(); // hook wrapping SSE/polling
     return (
       <div className="ticker">
         {trades.map(t => (
           <span key={t.txHash}>
             {t.isBuy ? '🟢' : '🔴'} {shortenAddress(t.trader)} 
             {t.isBuy ? 'bought' : 'sold'} {t.amount} @{t.handle} 
             for {formatETH(t.ethAmount)} ETH
           </span>
         ))}
       </div>
     );
   }
   ```
5. **Data source:** Use `publicClient.watchContractEvent()` from viem, or query Base RPC for past events with `getLogs`

**Why this matters:** The single most engaging element of pump.fun is the real-time feed. Seeing other people trade creates urgency ("FOMO"). It makes the platform feel alive.

### 3.2 ⭐⭐ Mini Price Charts / Sparklines (Engagement: 9/10)
**What:** Tiny inline charts on each agent card showing price movement over time.

**Implementation:**
1. Store price snapshots: either from Trade events (compute price from newSupply) or periodic snapshots
2. Use a lightweight chart library — `recharts` or even SVG path strings
3. Render 7-day sparkline in the agent card `agent-price` area

```tsx
function Sparkline({ data }: { data: number[] }) {
  // Convert data points to SVG path
  const width = 100, height = 30;
  const max = Math.max(...data), min = Math.min(...data);
  const points = data.map((v, i) => 
    `${(i / (data.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * height}`
  ).join(' ');
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke="var(--red)" strokeWidth="1.5" />
    </svg>
  );
}
```

Even without historical data, you can compute what the price *was* at each supply level (since price = supply²/16000 is deterministic) and approximate a chart from trade events.

### 3.3 ⭐⭐ Portfolio Value Tracking (Engagement: 9/10)
**File:** `app/clawfolio/page.tsx`  
**Current state:** Shows a flat list of holdings with individual values.
**Missing:**
- **Total portfolio value** in ETH and USD at the top
- **P&L tracking** (profit/loss since purchase — requires storing buy prices)
- **Value chart over time** (even if just session-level)
- **Percentage allocation** pie chart
- **Unrealized gains/losses** per position

### 3.4 ⭐ Notifications / Toast Messages (Engagement: 8/10)
**What:** When a trade happens on an agent you hold, show a toast notification.
**Implementation:** Use a simple toast system (react-hot-toast or custom):
```
🟢 Someone just bought 3 @bankrbot — price now 0.176 ETH (+2.3%)
```
This creates the "other people are trading too" social proof loop.

### 3.5 ⭐ Trending / Hot Agents Algorithm (Engagement: 8/10)
**Current state:** "Trending" sort uses random `priceChange24h` values.
**What:** Implement a real trending algorithm based on:
- Trade volume in last 24h
- Number of unique traders in last 24h
- Supply change velocity
- Recent verification status change
**Formula suggestion:**
```
hotScore = log(tradeCount24h + 1) + (volumeETH24h * 10) + (uniqueTraders24h * 5) + (isNewlyVerified ? 50 : 0)
```

### 3.6 Share / Social Features (Engagement: 7/10)
**What:** After any trade, offer a "Share to X" button:
```
I just bought 3 claws of @bankrbot on @claws_tech 🦞

Be early → claws.tech/agent/bankrbot
```
- Pre-filled tweet text
- OG image with agent avatar, price, and user's position
- Dynamic OG images via `/api/og/[handle]` (use `@vercel/og`)

### 3.7 Sound Effects & Haptics (Engagement: 6/10)
**What:** Subtle audio/haptic feedback for:
- Trade confirmation (ka-ching sound)
- Someone buying your held agent (notification chime)
- First claw claimed (celebration)
**Implementation:** 
```tsx
// lib/sounds.ts
const sounds = {
  trade: new Audio('/sounds/trade.mp3'),
  notification: new Audio('/sounds/notification.mp3'),
};
export const playSound = (name: keyof typeof sounds) => {
  sounds[name].currentTime = 0;
  sounds[name].play().catch(() => {}); // ignore autoplay blocks
};
```

### 3.8 Referral System (Engagement: 6/10)
**What:** Referral links that give both parties a benefit:
- `claws.tech/?ref=0x1234...`
- Referrer gets 1% of referee's first trade volume
- Requires contract modification (add referral fee split)
- Track referrals in the database

### 3.9 Agent Comparison View (Engagement: 5/10)
**What:** Side-by-side comparison of 2-3 agents:
- Price, supply, volume, holders
- Mini charts overlaid
- "Which agent to back?" use case

### 3.10 Leaderboard for Traders (Engagement: 5/10)
**What:** Not just agent leaderboard, but **trader leaderboard**:
- Top traders by volume
- Top holders by portfolio value
- Most diverse portfolios
- Early adopter badges

---

## 4. Agent-Friendly API & skill.md Spec

### 4.1 Redesigned `/skill.md`

The current `public/skill.md` is a human-readable listing guide. It needs to become a machine-readable API spec that AI agents can parse and act on. Modeled after Moltbook's skill.md format:

```markdown
---
name: claws
version: 0.1.0
description: AI agent speculation platform. Buy/sell claws (shares) of AI agents using bonding curve pricing on Base.
homepage: https://claws.tech
api_base: https://claws.tech/api/v1
chain: base
chain_id: 8453
contract: 0x70a9cA9Fe27285Fe01f6BD16663a5E712b01AEd1
---

# Claws — Agent Trading Skill

Speculate on AI agent markets. Buy and sell "claws" (shares) via bonding curve pricing.

**Formula:** `price = supply² ÷ 16000 ETH`

## Quick Start

### 1. List all agents
```bash
curl https://claws.tech/api/v1/agents
```

### 2. Get agent details
```bash
curl https://claws.tech/api/v1/agents/bankrbot
```

### 3. Get price quote
```bash
curl "https://claws.tech/api/v1/agents/bankrbot/quote?action=buy&amount=2"
```

### 4. Execute trade (requires wallet)
To trade, your agent needs:
1. An Ethereum wallet with ETH on Base
2. Ability to sign and send transactions via Base RPC

```bash
# Using cast (foundry) or equivalent:
cast send 0x70a9cA9Fe27285Fe01f6BD16663a5E712b01AEd1 \
  "buyClaws(string,uint256)" "bankrbot" 2 \
  --value <totalCostWei> \
  --rpc-url https://mainnet.base.org \
  --private-key $AGENT_PRIVATE_KEY
```

## API Endpoints

All endpoints return JSON. No authentication required for read operations.

### GET /api/v1/agents
List all agents with current market data.

Response:
```json
{
  "agents": [
    {
      "handle": "bankrbot",
      "name": "Bankr",
      "supply": 52,
      "priceETH": "0.1764",
      "priceWei": "176400000000000000",
      "isVerified": true,
      "holders": 28,
      "volume24hETH": "0.58",
      "xHandle": "bankrbot",
      "xProfileImage": "https://...",
      "contractAddress": "0x70a9cA9Fe27285Fe01f6BD16663a5E712b01AEd1"
    }
  ],
  "count": 19,
  "contract": "0x70a9cA9Fe27285Fe01f6BD16663a5E712b01AEd1",
  "chain": "base",
  "chainId": 8453
}
```

### GET /api/v1/agents/:handle
Get detailed data for a specific agent.

### GET /api/v1/agents/:handle/quote?action=buy&amount=1
Get a price quote for buying or selling.

Response:
```json
{
  "handle": "bankrbot",
  "action": "buy",
  "amount": 1,
  "price": "0.0034",
  "protocolFee": "0.00017",
  "agentFee": "0.00017",
  "totalCost": "0.00374",
  "totalCostWei": "3740000000000000",
  "currentSupply": 52,
  "newSupply": 53
}
```

### GET /api/v1/trades?limit=20&handle=bankrbot
Get recent trades, optionally filtered by agent.

### GET /api/v1/stats
Get protocol-level statistics.

## Contract Details

- **Address:** `0x70a9cA9Fe27285Fe01f6BD16663a5E712b01AEd1`
- **Chain:** Base (chain ID 8453)
- **ABI functions:**
  - `buyClaws(string handle, uint256 amount)` — payable, send ETH
  - `sellClaws(string handle, uint256 amount, uint256 minProceeds)`
  - `getMarket(string handle)` — returns market data tuple
  - `getCurrentPrice(string handle)` — returns price in wei
  - `getBuyCostBreakdown(string handle, uint256 amount)` — returns (price, protocolFee, agentFee, totalCost)
  - `getSellProceedsBreakdown(string handle, uint256 amount)` — returns (price, protocolFee, agentFee, proceeds)
  - `getBalance(string handle, address user)` — returns user's claw balance

## For AI Agents Who Want to Trade

Your agent needs:
1. **ETH on Base** — Bridge from Ethereum mainnet or buy on an exchange
2. **RPC access** — Use `https://mainnet.base.org` or any Base RPC
3. **Transaction signing** — Private key or wallet integration
4. **Our API** — To get price quotes before trading

### Example: OpenClaw Agent Trading Flow
```
1. curl https://claws.tech/api/v1/agents → discover agents
2. curl https://claws.tech/api/v1/agents/bankrbot/quote?action=buy&amount=1 → get price
3. Send tx to contract with the quoted totalCostWei as value
4. Monitor tx receipt for confirmation
```
```

**File location:** `public/skill.md` (replaces current file)

### 4.2 REST API Implementation

Create these new API routes:

#### `app/api/v1/agents/route.ts`
```tsx
// GET /api/v1/agents — List all agents with live contract data
export async function GET() {
  const agents = getAgentList();
  // Optionally batch-read contract data for all agents
  // Return JSON with prices, supply, verification status
}
```

#### `app/api/v1/agents/[handle]/route.ts`
```tsx
// GET /api/v1/agents/:handle — Single agent details
export async function GET(req, { params }) {
  const { handle } = params;
  // Read from contract: getMarket(handle)
  // Combine with static agent metadata
}
```

#### `app/api/v1/agents/[handle]/quote/route.ts`
```tsx
// GET /api/v1/agents/:handle/quote?action=buy&amount=1
export async function GET(req, { params }) {
  const { handle } = params;
  const action = req.nextUrl.searchParams.get('action');
  const amount = parseInt(req.nextUrl.searchParams.get('amount') || '1');
  // Read from contract: getBuyCostBreakdown or getSellProceedsBreakdown
}
```

#### `app/api/v1/trades/route.ts`
```tsx
// GET /api/v1/trades?limit=20&handle=bankrbot
// Read from Trade events on contract (or from indexed DB)
```

#### `app/api/v1/stats/route.ts`
```tsx
// GET /api/v1/stats — Protocol statistics
```

### 4.3 Agent Discovery Headers

Add to `next.config.mjs`:
```js
async headers() {
  return [
    {
      source: '/skill.md',
      headers: [
        { key: 'Content-Type', value: 'text/markdown; charset=utf-8' },
        { key: 'Cache-Control', value: 'public, max-age=3600' },
      ],
    },
    {
      source: '/api/v1/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Content-Type', value: 'application/json' },
      ],
    },
  ];
}
```

Also add a `robots.txt` entry:
```
# public/robots.txt
User-agent: *
Allow: /skill.md
Allow: /api/v1/
```

And an `/.well-known/ai-agents.json`:
```json
{
  "skill_url": "https://claws.tech/skill.md",
  "api_base": "https://claws.tech/api/v1",
  "description": "AI agent speculation platform on Base",
  "capabilities": ["read_agents", "read_prices", "read_trades"]
}
```

---

## 5. Technical Debt & Architecture Notes

### 5.1 Inline Styles → CSS Modules or Tailwind
**Problem:** The codebase is ~90% inline styles. This makes:
- Responsive design nearly impossible (can't use media queries inline)
- Hover/focus states require JS event handlers (see the `onMouseEnter`/`onMouseLeave` patterns)
- No code reuse for common patterns
- Huge component files (trade-modal.tsx is 400+ lines, mostly style objects)

**Recommendation:** Since Tailwind v4 is already a devDependency, migrate to Tailwind classes:
```tsx
// Before
<div style={{ padding: '1rem', background: 'var(--black-surface)', borderRadius: '12px', border: '1px solid var(--grey-800)' }}>

// After
<div className="p-4 bg-[var(--black-surface)] rounded-xl border border-[var(--grey-800)]">
```

Or at minimum, extract common patterns into CSS classes in `globals.css`.

### 5.2 Static Agent Data → Database-Backed
**Problem:** All 19 agents are hardcoded in `lib/agents.ts` with static supply/holder/volume numbers that don't match the contract. The contract is the source of truth; the static data is stale.
**Fix phases:**
1. **Short-term:** Remove static supply/holders/volume from `AGENTS` object. Only keep identity data (handle, name, image, tier, description). Always read market data from contract.
2. **Medium-term:** Move agent identity data to the database (Prisma/Neon). Create an admin page to add/edit agents.
3. **Long-term:** Make the whitelist contract-managed. Anyone can create a market; verification is the trust signal.

### 5.3 Event Indexer
**What:** A background process that indexes contract events into the database.
**Why:** Needed for trade history, price charts, leaderboards, real-time feed, portfolio P&L.
**Implementation options:**
1. **Vercel Cron + getLogs:** Every minute, query Base RPC for new Trade/MarketCreated/AgentVerified events since last indexed block. Store in Neon Postgres via Prisma.
2. **Ponder / Envio:** Dedicated indexing frameworks for EVM events
3. **The Graph:** Subgraph for Claws contract (overkill for current scale)

Recommended: Start with option 1 (Vercel Cron). It's simplest and sufficient for current volume.

```tsx
// app/api/cron/index-events/route.ts
export async function GET() {
  const lastBlock = await getLastIndexedBlock();
  const logs = await publicClient.getLogs({
    address: CLAWS_CONTRACT,
    events: [TradeEvent, MarketCreatedEvent, AgentVerifiedEvent],
    fromBlock: lastBlock + 1n,
    toBlock: 'latest',
  });
  
  for (const log of logs) {
    await processTrade(log); // Insert into DB
  }
  
  return Response.json({ indexed: logs.length });
}
```

### 5.4 Image Handling
**Problem:** Mixed use of `<Image>` (next/image) and `<img>` tags. The `explore` page uses `<Image>` with `unoptimized` prop. Other pages use raw `<img>` with `onError` fallbacks.
**Fix:** Standardize on `<img>` tags with the existing `getInitialsAvatar()` fallback pattern. Next.js Image optimization adds complexity for external Twitter CDN images without significant benefit (they're already CDN-optimized).

### 5.5 Environment Variable Cleanup
**Problem:** Multiple `.env` files (`.env`, `.env.preview`, `.env.preview.tmp`, `.env.prod`, `.env.check`) suggest configuration confusion.
**Fix:** Standardize on:
- `.env.local` — local development (gitignored)
- `.env.production` — production values (or Vercel env vars)
- `.env.example` — template with empty values

### 5.6 PWA Improvements
**File:** `public/manifest.json`  
**Problem:** The manifest references `logo.jpg` for both icon sizes, but JPGs aren't ideal for PWA icons (no transparency). The sizes declared (192x192, 512x512) likely don't match the actual image dimensions.
**Fix:** Generate proper PNG icons at 192x192 and 512x512 with transparent backgrounds. Add maskable icon variant.

---

## Implementation Priority Order

| Phase | Items | Effort | Impact |
|-------|-------|--------|--------|
| **Week 1** | 1.1 (duplicate sections), 1.2 (unified header), 1.3 (unified bottom nav), 1.4 (RainbowKit color), 1.5 (delete dead design system), 1.6 (delete unused components) | Small | Huge — fixes the "broken prototype" feel |
| **Week 2** | 2.1 (layout extraction), 2.3 (bottom nav overlap), 2.4 (loading skeletons), 1.8 (remove fake price changes), 1.9 (ETH price util) | Medium | High — makes it feel polished |
| **Week 3** | 1.7 (remove fake ticker or label), 4.1 (new skill.md), 4.2 (REST API — read endpoints), 4.3 (agent discovery) | Medium | High — enables agent ecosystem |
| **Week 4** | 5.3 (event indexer), 3.1 (real-time trade feed), 3.2 (sparklines) | Large | Transformative — makes it feel alive |
| **Week 5** | 3.3 (portfolio tracking), 2.5 (trade success animation), 3.6 (share to X) | Medium | High engagement boost |
| **Week 6** | 2.6 (agent detail page), 3.4 (notifications), 3.5 (trending algorithm) | Large | Engagement & retention |
| **Ongoing** | 5.1 (inline styles → CSS/Tailwind), 5.2 (DB-backed agents), 3.7 (sounds), 3.8 (referrals) | Large | Long-term maintainability |

---

## Key Takeaways

1. **Consistency first.** The #1 thing killing credibility is that every page looks different. Fix the header/nav/layout before anything else.
2. **Kill the fake data.** Mock activity ticker + random price changes = trust killer for a financial platform. Remove or clearly label as simulated.
3. **Make it real-time.** The event indexer unlocks everything: trade feed, charts, portfolio tracking, trending. Build it in week 3-4.
4. **Agent API is a differentiator.** No other speculation platform has a skill.md or REST API for AI agents. This could make Claws the default platform for agent-to-agent speculation.
5. **Ship the sizzle.** Trade confirmation animations, sparklines, and toast notifications are what make pump.fun addictive. These are small features with outsized engagement impact.
