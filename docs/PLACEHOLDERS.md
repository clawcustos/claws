# Claws — Placeholders & Integration Points

## Contract Integration (needs deployed contract + ABI)

### Homepage (`/`)
- [ ] `Agents Live` stat — count of agents with supply > 0
- [ ] `Total Volume` stat — sum of all trade ETH amounts
- [ ] `Holders` stat — unique holder addresses
- [ ] `Fees Collected` stat — sum of protocol + agent fees
- [ ] `Trending Agents` list — agents sorted by recent volume/activity

### Agent Page (`/agent/[address]`)
- [ ] `Price` — `getBuyPrice(agent, 1)`
- [ ] `Supply` — `clawsSupply[agent]`
- [ ] `Holders` — count from indexed data
- [ ] `Fees` — `pendingFees[agent]`
- [ ] `sourceVerified` / `clawsVerified` status
- [ ] Buy/Sell functionality — `buyClaws()` / `sellClaws()`
- [ ] User balance — `clawsBalance[agent][user]`

### Leaderboard (`/leaderboard`)
- [ ] Agents ranked by market cap (supply × price)
- [ ] 24h volume per agent
- [ ] Price change (requires historical data)

### Clawfolio (`/clawfolio`)
- [ ] User's claw holdings across all agents
- [ ] Portfolio value calculation
- [ ] Trade history for user

---

## Backend API Integration (needs Prisma + API routes)

### Agent Data
- [ ] `/api/agents` — list all agents with metadata
- [ ] `/api/agents/[address]` — single agent details
- [ ] `/api/agents/trending` — sorted by activity

### Trade Indexing
- [ ] Event listener for `Trade` events
- [ ] Store in `Trade` table with price, amount, timestamp
- [ ] `/api/trades/[agent]` — trade history for agent

### Price History (for charts)
- [ ] `/api/price-history/[agent]` — historical prices
- [ ] Aggregate trades into OHLC data

### Verification Flow
- [ ] `/api/verify/initiate` — agent requests verification
- [ ] `/api/verify/check` — validate tweet contains wallet
- [ ] `/api/verify/complete` — mark verified in DB

### Stats
- [ ] `/api/stats` — global protocol stats (cached)

---

## X/Twitter Integration

### Avatar Fetching
- [x] Using `unavatar.io/twitter/{handle}` — **DONE**

### Verification
- [ ] Twitter API or scraping to verify tweet content
- [ ] Tweet must contain wallet address in specific format

---

## Contract ABI Needed

```solidity
// Key functions to integrate:
function getBuyPrice(address agent, uint256 amount) view returns (uint256)
function getSellPrice(address agent, uint256 amount) view returns (uint256)
function getBuyPriceAfterFee(address agent, uint256 amount) view returns (uint256)
function getSellPriceAfterFee(address agent, uint256 amount) view returns (uint256)
function buyClaws(address agent, uint256 amount) payable
function sellClaws(address agent, uint256 amount)
function clawsSupply(address agent) view returns (uint256)
function clawsBalance(address agent, address holder) view returns (uint256)
function sourceVerified(address agent) view returns (bool)
function clawsVerified(address agent) view returns (bool)
function pendingFees(address agent) view returns (uint256)
function getAgentStatus(address agent) view returns (bool, bool, bool, uint256, uint256)
```

---

## Mock Data Currently Used

### Homepage
- `agentsLive: 20` (hardcoded)
- `totalVolume: '12.45'` (hardcoded)
- `totalHolders: 342` (hardcoded)
- `feesCollected: '0.62'` (hardcoded)

### Agent Cards
- Mock agent list in `agent-list.tsx`
- X handles mapped to addresses manually

### Agent Page
- Falls back to mock data if no contract data
