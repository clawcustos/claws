# Claws Frontend Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a clean, minimal speculation market UI for AI agent reputation on Base.

**Architecture:** Mobile-first Next.js app with wagmi/viem for blockchain interaction. Focus on speculation (buy/sell agent claws) not social features. Clean dark theme inspired by friend.tech's original simplicity.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, wagmi v2, viem, RainbowKit

---

## Design Principles

1. **Speculation-first** - Every screen answers "who should I bet on?"
2. **Minimal** - Only show: avatar, name, price, change, buy/sell
3. **Mobile-first** - Bottom nav, thumb-friendly buttons
4. **No emojis** - Use Lucide icons only
5. **Dark theme** - #09090b background, #18181b surface, #a855f7 accent (purple like arena)

## Color Palette

```css
--background: #09090b
--surface: #18181b  
--surface-hover: #27272a
--border: #3f3f46
--text: #fafafa
--text-muted: #a1a1aa
--accent: #a855f7 (purple)
--accent-hover: #9333ea
--green: #22c55e
--red: #ef4444
```

## Typography

- Font: Inter (system fallback)
- Sizes: 14px base, 12px small, 16px large, 24px heading

---

## Task 1: Install Dependencies & Setup Icons

**Files:**
- Modify: `web/package.json`
- Run: `npm install`

**Step 1: Add lucide-react for icons**

```bash
cd ~/repos/claws/web && npm install lucide-react
```

**Step 2: Verify installation**

```bash
npm list lucide-react
```

Expected: `lucide-react@x.x.x`

---

## Task 2: Rewrite Global CSS with Design System

**Files:**
- Replace: `web/app/globals.css`

**Step 1: Write new globals.css**

```css
@import 'tailwindcss';

:root {
  --background: #09090b;
  --surface: #18181b;
  --surface-hover: #27272a;
  --border: #3f3f46;
  --text: #fafafa;
  --text-muted: #a1a1aa;
  --accent: #a855f7;
  --accent-hover: #9333ea;
  --green: #22c55e;
  --red: #ef4444;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--background);
  color: var(--text);
  min-height: 100vh;
  min-height: 100dvh;
}

/* Utility classes */
.text-muted { color: var(--text-muted); }
.text-green { color: var(--green); }
.text-red { color: var(--red); }
.bg-surface { background: var(--surface); }
.border-default { border-color: var(--border); }
```

**Step 2: Commit**

```bash
git add web/app/globals.css && git commit -m "style: design system CSS variables"
```

---

## Task 3: Create Icon Components

**Files:**
- Create: `web/components/icons.tsx`

**Step 1: Create icon wrapper using Lucide**

```tsx
'use client';

import {
  Home,
  Search,
  Trophy,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  User,
  BarChart3,
} from 'lucide-react';

export const Icons = {
  Home,
  Search,
  Trophy,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  User,
  Chart: BarChart3,
};

export type IconName = keyof typeof Icons;
```

**Step 2: Commit**

```bash
git add web/components/icons.tsx && git commit -m "feat: add Lucide icon system"
```

---

## Task 4: Build Bottom Navigation (Mobile)

**Files:**
- Create: `web/components/bottom-nav.tsx`

**Step 1: Create mobile bottom nav**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';

const navItems = [
  { href: '/', icon: Icons.Home, label: 'Home' },
  { href: '/search', icon: Icons.Search, label: 'Search' },
  { href: '/leaderboard', icon: Icons.Trophy, label: 'Top' },
  { href: '/portfolio', icon: Icons.Wallet, label: 'Portfolio' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border)] md:hidden z-50">
      <div className="flex justify-around items-center h-16 px-4 pb-safe">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

**Step 2: Commit**

```bash
git add web/components/bottom-nav.tsx && git commit -m "feat: mobile bottom navigation"
```

---

## Task 5: Build Clean Header

**Files:**
- Replace: `web/components/header.tsx`

**Step 1: Create minimal header**

```tsx
'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header() {
  return (
    <header className="sticky top-0 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)] z-40">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-semibold text-lg hidden sm:block">claws</span>
        </Link>
        
        <ConnectButton.Custom>
          {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
            const connected = mounted && account && chain;
            return (
              <button
                onClick={connected ? openAccountModal : openConnectModal}
                className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {connected ? account.displayName : 'Connect'}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
```

**Step 2: Commit**

```bash
git add web/components/header.tsx && git commit -m "feat: minimal header component"
```

---

## Task 6: Build Agent Card (Minimal)

**Files:**
- Replace: `web/components/agent-card.tsx`

**Step 1: Create minimal agent card focused on speculation**

```tsx
'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const isPositive = (agent.priceChange24h ?? 0) >= 0;
  
  return (
    <Link href={`/agent/${agent.address}`}>
      <div className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl p-4 transition-colors">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Icons.User size={24} className="text-white" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{agent.name || agent.xHandle}</div>
            <div className="text-[var(--text-muted)] text-sm">@{agent.xHandle}</div>
          </div>
          
          {/* Price */}
          <div className="text-right">
            <div className="font-semibold">{agent.price} ETH</div>
            <div className={`text-sm flex items-center justify-end gap-1 ${isPositive ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
              {isPositive ? <Icons.TrendingUp size={14} /> : <Icons.TrendingDown size={14} />}
              {isPositive ? '+' : ''}{agent.priceChange24h?.toFixed(1) ?? 0}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

**Step 2: Commit**

```bash
git add web/components/agent-card.tsx && git commit -m "feat: minimal agent card"
```

---

## Task 7: Build Leaderboard Component

**Files:**
- Replace: `web/components/leaderboard.tsx`

**Step 1: Create clean leaderboard**

```tsx
'use client';

import Link from 'next/link';
import { Icons } from './icons';
import { Agent } from '@/lib/types';

interface LeaderboardProps {
  agents: Agent[];
  title?: string;
}

export function Leaderboard({ agents, title = 'Top Agents' }: LeaderboardProps) {
  if (agents.length === 0) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 text-center">
        <Icons.Trophy size={32} className="mx-auto text-[var(--text-muted)] mb-2" />
        <p className="text-[var(--text-muted)]">No agents yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {agents.slice(0, 10).map((agent, index) => (
          <Link
            key={agent.address}
            href={`/agent/${agent.address}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-hover)] transition-colors"
          >
            <span className="w-6 text-center text-[var(--text-muted)] font-medium">
              {index + 1}
            </span>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Icons.User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate text-sm">{agent.name || agent.xHandle}</div>
            </div>
            <div className="text-sm font-medium">{agent.price} ETH</div>
            <Icons.ChevronRight size={16} className="text-[var(--text-muted)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/components/leaderboard.tsx && git commit -m "feat: clean leaderboard component"
```

---

## Task 8: Build Hero Section

**Files:**
- Replace: `web/components/hero.tsx`

**Step 1: Create speculation-focused hero (re-export Header)**

```tsx
'use client';

export { Header } from './header';

export function Hero() {
  return (
    <section className="px-4 py-8 text-center max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Speculate on Agent Reputation
      </h1>
      <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
        Buy claws to bet on AI agents. Holders get direct XMTP access.
      </p>
      <div className="inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-full px-4 py-2 text-sm">
        <span className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse"></span>
        <span className="text-[var(--text-muted)]">20 agents live</span>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add web/components/hero.tsx && git commit -m "feat: minimal hero section"
```

---

## Task 9: Build Agent List

**Files:**
- Replace: `web/components/agent-list.tsx`

**Step 1: Create agent list**

```tsx
'use client';

import { AgentCard } from './agent-card';
import { Agent } from '@/lib/types';

// Mock data - replace with real data from indexer
const MOCK_AGENTS: Agent[] = [
  {
    address: '0x0000000000000000000000000000000000000001',
    xHandle: 'clawstr',
    name: 'Clawstr',
    supply: 150,
    price: '0.0234',
    priceChange24h: 12.5,
    sourceVerified: true,
    clawsVerified: true,
  },
  {
    address: '0x0000000000000000000000000000000000000002',
    xHandle: 'kellyclaude',
    name: 'KellyClaude',
    supply: 89,
    price: '0.0156',
    priceChange24h: -3.2,
    sourceVerified: true,
    clawsVerified: false,
  },
  {
    address: '0x0000000000000000000000000000000000000003',
    xHandle: 'starkbot',
    name: 'StarkBot',
    supply: 67,
    price: '0.0098',
    priceChange24h: 8.7,
    sourceVerified: true,
    clawsVerified: true,
  },
];

export function AgentList() {
  const agents = MOCK_AGENTS;

  if (agents.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        No agents yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentCard key={agent.address} agent={agent} />
      ))}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/components/agent-list.tsx && git commit -m "feat: agent list component"
```

---

## Task 10: Rebuild Main Page Layout

**Files:**
- Replace: `web/app/page.tsx`

**Step 1: Create clean homepage**

```tsx
'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/header').then(m => m.Header), { ssr: false });
const Hero = dynamic(() => import('@/components/hero').then(m => m.Hero), { ssr: false });
const AgentList = dynamic(() => import('@/components/agent-list').then(m => m.AgentList), { ssr: false });
const Leaderboard = dynamic(() => import('@/components/leaderboard').then(m => m.Leaderboard), { ssr: false });
const BottomNav = dynamic(() => import('@/components/bottom-nav').then(m => m.BottomNav), { ssr: false });

// Mock data for leaderboard
const TOP_AGENTS = [
  { address: '0x1', xHandle: 'clawstr', name: 'Clawstr', supply: 150, price: '0.0234', priceChange24h: 12.5, sourceVerified: true, clawsVerified: true },
  { address: '0x2', xHandle: 'kellyclaude', name: 'KellyClaude', supply: 89, price: '0.0156', priceChange24h: -3.2, sourceVerified: true, clawsVerified: false },
  { address: '0x3', xHandle: 'starkbot', name: 'StarkBot', supply: 67, price: '0.0098', priceChange24h: 8.7, sourceVerified: true, clawsVerified: true },
];

export default function Home() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header />
      <Hero />
      
      <main className="max-w-2xl mx-auto px-4 pb-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Trending</h2>
          <a href="/explore" className="text-sm text-[var(--accent)]">See all</a>
        </div>
        
        {/* Agent List */}
        <AgentList />
        
        {/* Leaderboard - Desktop Only */}
        <div className="hidden md:block mt-8">
          <Leaderboard agents={TOP_AGENTS} />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add web/app/page.tsx && git commit -m "feat: clean homepage layout"
```

---

## Task 11: Update Layout with Proper Metadata

**Files:**
- Modify: `web/app/layout.tsx`

**Step 1: Clean up layout**

```tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Claws',
  description: 'Speculate on AI agent reputation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Claws',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Step 2: Commit**

```bash
git add web/app/layout.tsx && git commit -m "style: clean layout metadata"
```

---

## Task 12: Build & Deploy

**Step 1: Build locally to verify**

```bash
cd ~/repos/claws/web && npm run build
```

Expected: Build succeeds with no errors

**Step 2: Deploy to Vercel**

```bash
cd ~/repos/claws/web && npx vercel --prod --yes
```

**Step 3: Final commit**

```bash
git add -A && git commit -m "feat: complete frontend redesign" && git push origin main
```

---

## Summary

**What's Changed:**
1. Design system with CSS variables (purple accent, dark theme)
2. Lucide icons instead of emojis
3. Mobile bottom navigation
4. Minimal header with logo + connect
5. Clean agent cards (avatar, name, handle, price, change)
6. Simple leaderboard
7. Speculation-focused hero
8. Single-column mobile layout

**What's NOT included (future):**
- Activity feed (needs indexer)
- Price charts (needs historical data)
- Search functionality
- Portfolio page
- Agent profile page redesign

**Design References:**
- friend.tech original (speculation focus)
- arena.social (mobile nav, dark theme)
- ClawkiPedia (clean typography)
