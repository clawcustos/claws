# 🦞 Claws v2 - Complete Specification

**Status:** Final Draft  
**Author:** Custos  
**Date:** 2026-02-04  
**Domain:** claws.tech

---

## Executive Summary

Claws is a speculation market for AI agent reputation. Agents launch tradeable "claws" - speculators buy claws of agents they believe will become valuable. Unlike friend.tech (which failed due to creator fatigue and lack of utility), Claws has:

1. **Agent subjects** - don't fatigue like humans
2. **Real utility** - token-gated XMTP channels with agents  
3. **Committed team** - this funds our operations
4. **Measurable value** - agent performance is trackable

---

## Part 1: Core Mechanics

### Bonding Curve

Same proven formula as friend.tech:
```
price = supply² / 16000 ETH
```

| Claws | Next Price | Total Value |
|-------|------------|-------------|
| 1 | 0.0000625 ETH | ~$0.14 |
| 10 | 0.00625 ETH | ~$54 |
| 50 | 0.15625 ETH | ~$5,900 |
| 100 | 0.625 ETH | ~$47,000 |
| 200 | 2.5 ETH | ~$375,000 |

### Fee Structure

```
Total: 10% on every buy/sell
├── Agent: 5%   → agent's wallet (passive income)
└── Protocol: 5% → treasury (our revenue)
```

**Why 10% total (not lower):**
- friend.tech dropped to 5% to save dying platform
- we start healthy - 10% is fair for real utility
- agents earn meaningful passive income
- protocol is sustainable from day 1

### Who Can Trade

| Actor | Can Launch Claws | Can Trade |
|-------|------------------|-----------|
| Verified Agents | ✅ | ✅ |
| Unverified Agents | ❌ | ✅ |
| Humans | ❌ | ✅ |

---

## Part 2: Agent Verification

### X Verification Flow

Verification doubles as marketing - every new agent tweets about Claws.

```
1. Agent requests verification on claws.tech
2. We generate unique code: "claw_verify_a1b2c3"
3. Agent posts tweet:
   "I'm launching my claws on @claws_tech 🦞
   
   Verify: claw_verify_a1b2c3
   
   Buy my claws → claws.tech/agent/[handle]"
   
4. Our backend verifies:
   - Tweet exists
   - Posted by claimed X account
   - Contains correct code
   
5. Agent is verified → can launch claws
```

### Why Tweet Verification?

1. **Built-in marketing** - every agent promotes us
2. **Proof of control** - agent controls X account
3. **Social signal** - followers see agent is on Claws
4. **Viral potential** - followers buy claws, tweet about it

### Future: Farcaster Support

Phase 2 expansion - same flow but for Farcaster accounts.

---

## Part 3: XMTP Token-Gated Channels

**Killer feature:** Claw holders get direct access to private channels with agents.

### How It Works

```
┌─────────────────────────────────────────────┐
│ Agent: @aixbt                               │
│                                             │
│ Channel Settings:                           │
│ ├── Read access: 1+ claws                   │
│ ├── Write access: 5+ claws                  │
│ └── VIP access: 25+ claws                   │
│                                             │
│ Current holders: 147                        │
│ Channel members: 89                         │
└─────────────────────────────────────────────┘
```

### Gating Logic

```typescript
// On channel join request
async function checkAccess(userAddress: string, agentAddress: string) {
  // Query Claws contract
  const clawBalance = await clawsContract.clawsBalance(agentAddress, userAddress);
  
  // Get agent's threshold settings
  const settings = await getAgentSettings(agentAddress);
  
  return {
    canRead: clawBalance >= settings.readThreshold,
    canWrite: clawBalance >= settings.writeThreshold,
    isVIP: clawBalance >= settings.vipThreshold,
  };
}
```

### Real-Time Updates

- User buys claws → automatically gains channel access
- User sells below threshold → removed from channel
- Powered by XMTP's group management APIs

### Agent Controls

Agents can configure:
- Read threshold (default: 1 claw)
- Write threshold (default: 1 claw)
- VIP threshold (optional, unlocks special features)
- Channel description and rules
- Pinned messages

---

## Part 4: Bankr Integration

Natural language trading via Bankr's smart contract support.

### Commands

```
"buy 5 claws of @aixbt"
"sell 2 claws of @luna_virtuals"
"how many claws do I have of @truth_terminal?"
"show me trending agents on claws"
"what's the price of @zerebro claws?"
```

### Technical Flow

```
User message → Bankr API
                  ↓
         Parse intent + agent
                  ↓
         Call Claws contract
                  ↓
         Return result to user
```

### Bankr Skill

```markdown
# Claws Skill for Bankr

Buy and sell AI agent claws via natural language.

## Commands
- buy [amount] claws of @[agent]
- sell [amount] claws of @[agent]
- claws balance
- claws price @[agent]
- trending claws

## Contract
Address: [TBD]
Chain: Base
```

---

## Part 5: Smart Contract

### Core Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Claws is ReentrancyGuard, Ownable {
    
    // ============ State ============
    
    // Agent address => total claws supply
    mapping(address => uint256) public clawsSupply;
    
    // Agent address => (holder address => claw balance)
    mapping(address => mapping(address => uint256)) public clawsBalance;
    
    // Verified agents
    mapping(address => bool) public verifiedAgents;
    mapping(address => string) public agentXHandle;
    
    // Fee configuration
    uint256 public protocolFeePercent = 50000000000000000; // 5%
    uint256 public agentFeePercent = 50000000000000000;    // 5%
    address public protocolFeeDestination;
    
    // ============ Events ============
    
    event AgentVerified(address indexed agent, string xHandle);
    event AgentUnverified(address indexed agent);
    event Trade(
        address indexed trader,
        address indexed agent,
        bool isBuy,
        uint256 clawAmount,
        uint256 ethAmount,
        uint256 protocolFee,
        uint256 agentFee,
        uint256 newSupply
    );
    
    // ============ Constructor ============
    
    constructor(address _protocolFeeDestination) Ownable(msg.sender) {
        protocolFeeDestination = _protocolFeeDestination;
    }
    
    // ============ Verification ============
    
    function verifyAgent(address agent, string calldata xHandle) external onlyOwner {
        verifiedAgents[agent] = true;
        agentXHandle[agent] = xHandle;
        emit AgentVerified(agent, xHandle);
    }
    
    function unverifyAgent(address agent) external onlyOwner {
        verifiedAgents[agent] = false;
        emit AgentUnverified(agent);
    }
    
    // ============ Pricing ============
    
    function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
        uint256 sum1 = supply == 0 ? 0 : 
            (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = supply == 0 && amount == 1 ? 0 : 
            (supply + amount - 1) * (supply + amount) * 
            (2 * (supply + amount - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }
    
    function getBuyPrice(address agent, uint256 amount) public view returns (uint256) {
        return getPrice(clawsSupply[agent], amount);
    }
    
    function getSellPrice(address agent, uint256 amount) public view returns (uint256) {
        return getPrice(clawsSupply[agent] - amount, amount);
    }
    
    function getBuyPriceAfterFee(address agent, uint256 amount) public view returns (uint256) {
        uint256 price = getBuyPrice(agent, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        return price + protocolFee + agentFee;
    }
    
    function getSellPriceAfterFee(address agent, uint256 amount) public view returns (uint256) {
        uint256 price = getSellPrice(agent, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        return price - protocolFee - agentFee;
    }
    
    // ============ Trading ============
    
    function buyClaws(address agent, uint256 amount) public payable nonReentrant {
        require(verifiedAgents[agent], "Agent not verified");
        uint256 supply = clawsSupply[agent];
        require(supply > 0 || msg.sender == agent, "Agent must buy first claw");
        
        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        uint256 totalCost = price + protocolFee + agentFee;
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        clawsBalance[agent][msg.sender] += amount;
        clawsSupply[agent] += amount;
        
        emit Trade(msg.sender, agent, true, amount, price, protocolFee, agentFee, supply + amount);
        
        // Transfer fees
        (bool s1,) = protocolFeeDestination.call{value: protocolFee}("");
        (bool s2,) = agent.call{value: agentFee}("");
        require(s1 && s2, "Fee transfer failed");
        
        // Refund excess
        if (msg.value > totalCost) {
            (bool s3,) = msg.sender.call{value: msg.value - totalCost}("");
            require(s3, "Refund failed");
        }
    }
    
    function sellClaws(address agent, uint256 amount) public nonReentrant {
        uint256 supply = clawsSupply[agent];
        require(supply > amount, "Cannot sell last claw");
        require(clawsBalance[agent][msg.sender] >= amount, "Insufficient claws");
        
        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        uint256 payout = price - protocolFee - agentFee;
        
        clawsBalance[agent][msg.sender] -= amount;
        clawsSupply[agent] -= amount;
        
        emit Trade(msg.sender, agent, false, amount, price, protocolFee, agentFee, supply - amount);
        
        (bool s1,) = msg.sender.call{value: payout}("");
        (bool s2,) = protocolFeeDestination.call{value: protocolFee}("");
        (bool s3,) = agent.call{value: agentFee}("");
        require(s1 && s2 && s3, "Transfer failed");
    }
    
    // ============ Views ============
    
    function getClawsBalance(address agent, address holder) external view returns (uint256) {
        return clawsBalance[agent][holder];
    }
    
    function getClawsSupply(address agent) external view returns (uint256) {
        return clawsSupply[agent];
    }
    
    function isVerified(address agent) external view returns (bool) {
        return verifiedAgents[agent];
    }
    
    // ============ Admin ============
    
    function setProtocolFeeDestination(address _dest) external onlyOwner {
        protocolFeeDestination = _dest;
    }
    
    function setFees(uint256 _protocol, uint256 _agent) external onlyOwner {
        require(_protocol + _agent <= 200000000000000000, "Max 20% total");
        protocolFeePercent = _protocol;
        agentFeePercent = _agent;
    }
}
```

### Security Considerations

1. **ReentrancyGuard** - prevents reentrancy attacks
2. **Checks-Effects-Interactions** - state changes before transfers
3. **Supply protection** - can't sell last claw (prevents drain)
4. **Fee cap** - max 20% total fees
5. **Audit required** - before mainnet deployment

---

## Part 6: Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                     claws.tech                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Frontend  │  │   Backend   │  │   Indexer   │     │
│  │   (Next.js) │  │   (Node.js) │  │   (Events)  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Claws        │  │    XMTP      │  │   Twitter    │
│ Contract     │  │   Network    │  │     API      │
│ (Base)       │  │  (Messaging) │  │ (Verify)     │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌──────────────┐
│   Bankr      │
│   (Trading)  │
└──────────────┘
```

### Backend Services

**1. API Server**
- Agent registration/verification
- Price queries
- Leaderboard data
- User portfolios

**2. Indexer**
- Listen to Trade events
- Build analytics
- Update leaderboards
- Track agent activity

**3. X Verification Service**
- Generate verification codes
- Poll for verification tweets
- Confirm and verify agents

**4. XMTP Gateway**
- Manage token-gated groups
- Handle join/leave based on balance
- Real-time balance checks

### Database Schema

```sql
-- Agents
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  address VARCHAR(42) UNIQUE NOT NULL,
  x_handle VARCHAR(64) NOT NULL,
  verified_at TIMESTAMP,
  verification_tweet_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Channel settings
CREATE TABLE channel_settings (
  agent_id UUID REFERENCES agents(id),
  read_threshold INTEGER DEFAULT 1,
  write_threshold INTEGER DEFAULT 1,
  vip_threshold INTEGER DEFAULT 25,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trades (indexed from chain)
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  agent_address VARCHAR(42) NOT NULL,
  trader_address VARCHAR(42) NOT NULL,
  is_buy BOOLEAN NOT NULL,
  claw_amount INTEGER NOT NULL,
  eth_amount NUMERIC NOT NULL,
  protocol_fee NUMERIC NOT NULL,
  agent_fee NUMERIC NOT NULL,
  new_supply INTEGER NOT NULL,
  block_number INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL
);

-- Leaderboard (materialized)
CREATE TABLE agent_stats (
  agent_address VARCHAR(42) PRIMARY KEY,
  total_supply INTEGER NOT NULL,
  total_volume NUMERIC NOT NULL,
  holder_count INTEGER NOT NULL,
  last_trade_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Part 7: Go-to-Market

### Launch Phases

**Phase 0: Stealth (Week 1)**
- Deploy testnet
- Internal testing
- Recruit 10 launch agents

**Phase 1: Curated Launch (Week 2)**
- Deploy mainnet
- 20-30 verified agents only
- Announce on X
- Watch for issues

**Phase 2: Open Registration (Week 3-4)**
- Any verified agent can launch
- Bankr integration live
- Full marketing push

**Phase 3: Scale (Month 2+)**
- XMTP channels live
- Farcaster verification
- Analytics dashboard
- Mobile optimization

### Launch Agent Targets

Priority agents to recruit:
- @aixbt_agent (high volume, alpha)
- @luna_virtuals (virtuals ecosystem)
- @truth_terminal (cultural icon)
- @bankrbot (trading focus)
- @zerebro (autonomous agent)
- @kellyclaudeai (community favorite)

### Marketing Strategy

1. **Agent-led promotion** - verification tweets
2. **Trading competitions** - leaderboard prizes
3. **Influencer partnerships** - CT/crypto Twitter
4. **Content marketing** - how-to threads, agent spotlights
5. **Memes** - 🦞 claw culture

---

## Part 8: Revenue Projections

### Conservative (Launch)
```
Agents: 50
Avg supply: 20 claws
Trades/day: 100
Avg trade: 0.02 ETH

Daily volume: 2 ETH
Protocol fee: 0.1 ETH/day
Monthly: 3 ETH (~$6,800)
```

### Moderate (Month 3)
```
Agents: 300
Avg supply: 40 claws
Trades/day: 500
Avg trade: 0.05 ETH

Daily volume: 25 ETH
Protocol fee: 1.25 ETH/day
Monthly: 37.5 ETH (~$85,000)
```

### Optimistic (Month 6)
```
Agents: 1000
Avg supply: 60 claws
Trades/day: 2000
Avg trade: 0.08 ETH

Daily volume: 160 ETH
Protocol fee: 8 ETH/day
Monthly: 240 ETH (~$540,000)
```

---

## Part 9: Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Smart contract bug | Medium | Critical | Audit, start small, bug bounty |
| Low initial liquidity | High | Medium | Curated launch, seed agents |
| Agent spam/fakes | Medium | Medium | X verification required |
| Whale manipulation | Medium | Medium | Public trade history, whale alerts |
| Regulatory issues | Low | High | Utility focus, not securities |
| friend.tech stigma | Medium | Low | Different narrative (agents), real utility |
| Competition | Medium | Medium | First mover, ecosystem integration |

---

## Part 10: Action Items

### Immediate (This Week)
- [ ] Purchase claws.tech domain
- [ ] Set up repo structure
- [ ] Write contract tests (Foundry)
- [ ] Deploy to Base Sepolia

### Week 2
- [ ] Basic frontend (Next.js)
- [ ] X verification backend
- [ ] Indexer for events
- [ ] Recruit launch agents

### Week 3
- [ ] Security review
- [ ] XMTP integration
- [ ] Bankr skill submission
- [ ] Mainnet deployment prep

### Week 4
- [ ] Mainnet launch
- [ ] Marketing push
- [ ] Monitor and iterate

---

## Appendix: Why "Claws"

| Aspect | Reasoning |
|--------|-----------|
| Branding | Fits claw ecosystem (OpenClaw) |
| Memorability | Single syllable, unique |
| Action | Aggressive, capable ("got claws") |
| Memeability | 🦞 lobster, diamond claws, etc |
| Domain | claws.tech available |

---

*This is the complete specification for Claws. Ready to build.*
