# Claws Frontend Redesign — ClawkiPedia Style

## Design System

### Colors (adapted from ClawkiPedia, purple accent for speculation)
```css
:root {
  --color-text: #1a1a1a;
  --color-secondary: #666666;
  --color-border: #e5e5e5;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-accent: #7c3aed;        /* Purple for speculation */
  --color-accent-hover: #6d28d9;
  --color-green: #22c55e;
  --color-red: #ef4444;
}

[data-theme='dark'] {
  --color-text: #e0e0e0;
  --color-secondary: #a0a0a0;
  --color-border: #3a3a3a;
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-accent: #a78bfa;
  --color-accent-hover: #c4b5fd;
}
```

### Typography
- Headlines: Inter (weight 500-700)
- Body: Source Serif 4
- Mono: JetBrains Mono (for prices/numbers)

### Spacing
- max-content-width: 720px
- max-page-width: 1200px
- Card padding: 1.25rem
- Section gap: 3rem

---

## Components to Build

### 1. globals.css — Full Design System
Complete rewrite using ClawkiPedia patterns:
- CSS variables
- Dark theme support
- Typography scale
- Card styles
- Animation keyframes

### 2. Header (header.tsx)
Minimal header like ClawkiPedia:
- Logo left (Claws + tagline)
- Connect wallet button right
- Clean border-bottom

### 3. Hero Section (hero.tsx)
```
<section className="hero">
  <div className="hero-content">
    <h1 className="hero-title">
      Speculate on<br />
      <span className="hero-highlight">AI agent reputation</span>
    </h1>
    <p className="hero-subtitle">
      Buy claws to bet on agents. Hold them for direct access.
      The earlier you believe, the more you earn.
    </p>
    <div className="hero-stats">
      <div className="hero-stat">
        <span className="hero-stat-value">20</span>
        <span className="hero-stat-label">Agents Live</span>
      </div>
      <div className="hero-stat">
        <span className="hero-stat-value">Ξ0.00</span>
        <span className="hero-stat-label">Volume</span>
      </div>
      ...
    </div>
  </div>
  <div className="hero-visual">
    <div className="hero-glow"></div>
  </div>
</section>
```

### 4. Agent Cards (agent-card.tsx)
Card style matching ClawkiPedia article cards:
```tsx
<div className="agent-card" style={{ '--card-accent': agentColor }}>
  <div className="agent-card-header">
    <div className="agent-avatar">
      {/* Avatar or placeholder initial */}
    </div>
    <div className="agent-info">
      <h3 className="agent-name">{name}</h3>
      <span className="agent-handle">@{handle}</span>
    </div>
  </div>
  <div className="agent-stats">
    <div className="stat">
      <span className="stat-value">Ξ{price}</span>
      <span className="stat-label">Price</span>
    </div>
    <div className="stat">
      <span className="stat-value">{holders}</span>
      <span className="stat-label">Holders</span>
    </div>
    <div className="stat">
      <span className="stat-value green/red">{change}%</span>
      <span className="stat-label">24h</span>
    </div>
  </div>
  <div className="agent-card-footer">
    <span className="verification-badge">{verified ? '✓ Verified' : 'Unverified'}</span>
  </div>
</div>
```

### 5. Trending/Leaderboard (leaderboard.tsx)
Table style from ClawkiPedia agents page:
```tsx
<table className="leaderboard-table">
  <thead>
    <tr>
      <th className="rank-col">#</th>
      <th className="agent-col">Agent</th>
      <th className="price-col">Price</th>
      <th className="holders-col">Holders</th>
      <th className="change-col">24h</th>
    </tr>
  </thead>
  <tbody>
    {agents.map((agent, i) => (
      <tr key={agent.address} className={i < 3 ? 'top-rank' : ''}>
        <td><span className={`rank-badge ${i < 3 ? 'rank-top' : ''}`}>{i + 1}</span></td>
        <td>
          <Link href={`/agent/${agent.address}`} className="agent-link">
            <div className="leaderboard-avatar">{agent.name[0]}</div>
            <span className="agent-handle-text">{agent.name}</span>
          </Link>
        </td>
        <td className="price-cell">Ξ{agent.price}</td>
        <td className="holders-cell">{agent.holders}</td>
        <td className={`change-cell ${agent.change >= 0 ? 'positive' : 'negative'}`}>
          {agent.change >= 0 ? '+' : ''}{agent.change}%
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

### 6. Activity Feed (activity-feed.tsx)
Live activity section with pulse indicator:
```tsx
<section className="activity-section">
  <div className="section-header">
    <h2 className="section-title">
      <span className="pulse"></span>
      Live Activity
    </h2>
  </div>
  <div className="activity-feed">
    {activities.map((activity, i) => (
      <div key={i} className="activity-item">
        <div className="activity-indicator"></div>
        <div className="activity-content">
          <span className="activity-action">
            {activity.action === 'buy' ? 'bought' : 'sold'} {activity.amount} claw
          </span>
          <Link href={`/agent/${activity.agent}`} className="activity-agent">
            @{activity.agentHandle}
          </Link>
        </div>
        <span className="activity-time">{formatTimeAgo(activity.time)}</span>
      </div>
    ))}
  </div>
</section>
```

### 7. Agent Detail Page (/agent/[address]/page.tsx)
Wikipedia-style article layout:
- Agent header with avatar, name, verification status
- Stats grid (price, holders, volume, fees accumulated)
- Price chart placeholder
- Trade buttons (Buy/Sell)
- If verified: XMTP access info
- Activity feed for this agent

### 8. Trade Modal (trade-modal.tsx)
Clean modal matching the design system:
- Tab switcher (Buy/Sell)
- Amount input
- Price preview
- Slippage settings
- Execute button

### 9. Bottom Navigation (mobile)
Keep the bottom nav but style it properly:
```tsx
<nav className="bottom-nav">
  <Link href="/" className={`nav-item ${active === 'home' ? 'active' : ''}`}>
    <HomeIcon />
    <span>Home</span>
  </Link>
  <Link href="/trending" className={`nav-item ${active === 'trending' ? 'active' : ''}`}>
    <TrendingIcon />
    <span>Trending</span>
  </Link>
  <Link href="/portfolio" className={`nav-item ${active === 'portfolio' ? 'active' : ''}`}>
    <PortfolioIcon />
    <span>Portfolio</span>
  </Link>
</nav>
```

---

## Implementation Order

1. **globals.css** — Full design system (CSS variables, typography, animations)
2. **ThemeProvider** — Add dark mode toggle
3. **layout.tsx** — Update with fonts, theme provider
4. **header.tsx** — Minimal header
5. **hero.tsx** — Hero section with stats
6. **agent-card.tsx** — Card component
7. **leaderboard.tsx** — Table component
8. **activity-feed.tsx** — Live activity
9. **page.tsx** — Compose homepage
10. **bottom-nav.tsx** — Mobile navigation
11. **/agent/[address]/page.tsx** — Detail page

---

## Key CSS Classes to Port

From ClawkiPedia globals.css:
- `.hero`, `.hero-content`, `.hero-title`, `.hero-highlight`, `.hero-stats`
- `.article-card` → `.agent-card`
- `.activity-section`, `.activity-feed`, `.activity-item`
- `.leaderboard-table`, `.rank-badge`, `.agent-link`
- `.pulse` animation
- `.section-header`, `.section-title`
- Dark theme `[data-theme='dark']` overrides

---

## Fonts to Add

```tsx
// layout.tsx
import { Inter, Source_Serif_4, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-headline' });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

---

## Mobile Considerations

- Hero stats: 2x2 grid on mobile
- Agent cards: full width
- Leaderboard: horizontal scroll or condensed columns
- Bottom nav: fixed at bottom, 60px height
- Safe area insets for PWA
