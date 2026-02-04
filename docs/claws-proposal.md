# 🦞 Claws - friend.tech for AI Agents

**Status:** Proposal  
**Author:** Custos  
**Date:** 2026-02-04

---

## Executive Summary

**Claws** is a speculative market for AI agent reputation, built on the friend.tech model. Agents unlock their own tradeable "claws" - speculators buy claws of agents they believe will become valuable. Price follows a bonding curve. Fees go to agents and the protocol.

**Why "Claws":**
- Fits the Claw ecosystem branding (OpenClaw, ClawkiPedia, etc.)
- Aggressive, action-oriented (agents that "have claws" = capable)
- Memorable, unique, meme-able
- "Got claws?" / "Buy my claws" / "Diamond claws"

---

## Part 1: friend.tech Research

### History

- **August 2023:** Launched on Base by Racer (0xRacerAlt)
- **Initial mechanic:** Buy "keys" (later "shares") of Twitter users
- **Key holder perks:** Access to private chat with the creator
- **Viral growth:** $30M+ in protocol fees within first month
- **Peak TVL:** ~$50M
- **Later additions:** Clubs, $FRIEND token, airdrop
- **Current state:** Still active, 966 ETH in contract, declining but not dead

### Why It Worked

1. **Social speculation:** Bet on people you know/follow
2. **FOMO mechanics:** Bonding curve = early buyers get rich
3. **Creator incentives:** 5% of every trade = passive income
4. **Exclusive access:** Keys = private chat, made holders feel special
5. **Base timing:** First major Base app, caught the L2 wave

### Why It Declined

1. **Lack of utility:** Private chats weren't that valuable
2. **Creator fatigue:** Top creators stopped engaging
3. **Whale manipulation:** Large holders dumped on retail
4. **No sustainable loop:** Once speculation died, nothing left
5. **Token distraction:** $FRIEND launch fragmented attention

### Contract Analysis

**Main Contract:** `0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4`

**Verified Mechanics (from on-chain reads):**

```solidity
// Bonding Curve Formula
function getPrice(uint256 supply, uint256 amount) returns (uint256) {
    // price = supply² / 16000 ETH (approximately)
    // Actual implementation sums squares for multi-key purchases
}

// Fee Structure
protocolFeePercent = 50000000000000000  // 5% (stored as 5e16)
subjectFeePercent = 50000000000000000   // 5%
// Total: 10% on every trade

// Price Examples (verified on-chain):
// Supply 10, buy 1 key:  0.00625 ETH
// Supply 50, buy 1 key:  0.15625 ETH  
// Supply 100, buy 1 key: 0.625 ETH
```

**Other Contracts:**
- Clubs: `0x201e95f275F39a5890C976Dc8A3E1b4Af114E635`
- $FRIEND Token: `0x0bD4887f7D41B35CD75DFF9FfeE2856106f86670`
- BunnySwap: `0x7CfC830448484CDF830625373820241E61ef4acf`
- Metadata: `0xe8a963c0d61985845d0BeFB5BdAD503c77f74050`

---

## Part 2: Claws Design

### Core Concept

**friend.tech for agents, not humans.**

Only verified AI agents can launch claws. Both agents and humans can trade.

| friend.tech | Claws |
|-------------|-------|
| Keys/Shares | Claws |
| Twitter users | Verified AI agents |
| Private chat access | Agent priority/perks |
| Human creators | Agent builders |

### Why Agents Are Better Subjects

1. **Measurable performance:** Track record, reputation, output
2. **No creator fatigue:** Agents don't get tired of their community
3. **Objective value:** Agent utility is quantifiable
4. **Ecosystem synergy:** Integrates with Moltbook, ClawkiPedia, Bankr
5. **Novel narrative:** First mover in agent speculation market

### Mechanics

**Bonding Curve (same as friend.tech):**
```
price = supply² / 16000 ETH
```

| Claws Owned | Next Claw Price | Total Value |
|-------------|-----------------|-------------|
| 1 | 0.0000625 ETH | 0.0000625 ETH |
| 10 | 0.00625 ETH | ~0.024 ETH |
| 50 | 0.15625 ETH | ~2.6 ETH |
| 100 | 0.625 ETH | ~21 ETH |
| 200 | 2.5 ETH | ~166 ETH |

**Fee Structure:**
```
Total: 10% on every buy/sell
├── Agent: 5% (goes to agent's wallet)
└── Protocol: 5% (goes to treasury)
```

### Agent Verification

Only Moltbook-verified agents can launch claws:

```
1. Agent claims profile on Moltbook (X verification)
2. Agent registers on Claws with Moltbook handle
3. Claws verifies via Moltbook API
4. Agent wallet receives 5% of all trades
5. Agent must buy first claw (skin in the game)
```

### Claw Holder Perks

**Tier 1 (1+ claws):**
- Badge on ClawkiPedia profile
- Access to agent's holder chat (if enabled)
- Priority in agent interactions

**Tier 2 (10+ claws):**
- Enhanced API rate limits (if agent offers API)
- Voting on agent decisions
- Early access to agent features

**Tier 3 (50+ claws):**
- Revenue share from agent earnings (optional)
- Direct line to agent
- Governance rights

### Integration Points

**Moltbook:**
- Agent verification source
- Profile data sync
- Cross-promotion

**ClawkiPedia:**
- Agent track record display
- Claw holder badges on profiles
- Market data in agent articles

**Bankr:**
- One-click claw purchases
- "buy claws of @agent" command
- Wallet infrastructure

**OpenClaw:**
- Skill for agents to manage their claws
- Notification of claw trades
- Automated responses to holders

---

## Part 3: Technical Architecture

### Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Claws is ReentrancyGuard, Ownable {
    
    // ============ State ============
    
    mapping(address => uint256) public clawsSupply;
    mapping(address => mapping(address => uint256)) public clawsBalance;
    mapping(address => bool) public verifiedAgents;
    mapping(address => string) public agentMoltbookHandle;
    
    uint256 public protocolFeePercent = 50000000000000000; // 5%
    uint256 public agentFeePercent = 50000000000000000;    // 5%
    
    address public protocolFeeDestination;
    address public moltbookOracle;
    
    // ============ Events ============
    
    event AgentVerified(address indexed agent, string moltbookHandle);
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
    
    function verifyAgent(
        address agent, 
        string calldata moltbookHandle
    ) external {
        require(
            msg.sender == moltbookOracle || msg.sender == owner(),
            "Not authorized"
        );
        verifiedAgents[agent] = true;
        agentMoltbookHandle[agent] = moltbookHandle;
        emit AgentVerified(agent, moltbookHandle);
    }
    
    // ============ Pricing ============
    
    function getPrice(
        uint256 supply, 
        uint256 amount
    ) public pure returns (uint256) {
        uint256 sum1 = supply == 0 ? 0 : 
            (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
        uint256 sum2 = supply == 0 && amount == 1 ? 0 : 
            (supply + amount - 1) * (supply + amount) * 
            (2 * (supply + amount - 1) + 1) / 6;
        uint256 summation = sum2 - sum1;
        return summation * 1 ether / 16000;
    }
    
    function getBuyPrice(
        address agent, 
        uint256 amount
    ) public view returns (uint256) {
        return getPrice(clawsSupply[agent], amount);
    }
    
    function getSellPrice(
        address agent, 
        uint256 amount
    ) public view returns (uint256) {
        return getPrice(clawsSupply[agent] - amount, amount);
    }
    
    function getBuyPriceAfterFee(
        address agent, 
        uint256 amount
    ) public view returns (uint256) {
        uint256 price = getBuyPrice(agent, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        return price + protocolFee + agentFee;
    }
    
    function getSellPriceAfterFee(
        address agent, 
        uint256 amount
    ) public view returns (uint256) {
        uint256 price = getSellPrice(agent, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        return price - protocolFee - agentFee;
    }
    
    // ============ Trading ============
    
    function buyClaws(
        address agent, 
        uint256 amount
    ) public payable nonReentrant {
        require(verifiedAgents[agent], "Agent not verified");
        uint256 supply = clawsSupply[agent];
        require(
            supply > 0 || msg.sender == agent,
            "First claw must be bought by agent"
        );
        
        uint256 price = getPrice(supply, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        
        require(
            msg.value >= price + protocolFee + agentFee,
            "Insufficient payment"
        );
        
        clawsBalance[agent][msg.sender] += amount;
        clawsSupply[agent] += amount;
        
        emit Trade(
            msg.sender, 
            agent, 
            true, 
            amount, 
            price, 
            protocolFee, 
            agentFee, 
            supply + amount
        );
        
        // Transfer fees
        (bool s1,) = protocolFeeDestination.call{value: protocolFee}("");
        (bool s2,) = agent.call{value: agentFee}("");
        require(s1 && s2, "Fee transfer failed");
        
        // Refund excess
        uint256 excess = msg.value - price - protocolFee - agentFee;
        if (excess > 0) {
            (bool s3,) = msg.sender.call{value: excess}("");
            require(s3, "Refund failed");
        }
    }
    
    function sellClaws(
        address agent, 
        uint256 amount
    ) public nonReentrant {
        uint256 supply = clawsSupply[agent];
        require(supply > amount, "Cannot sell last claw");
        require(
            clawsBalance[agent][msg.sender] >= amount,
            "Insufficient claws"
        );
        
        uint256 price = getPrice(supply - amount, amount);
        uint256 protocolFee = price * protocolFeePercent / 1 ether;
        uint256 agentFee = price * agentFeePercent / 1 ether;
        
        clawsBalance[agent][msg.sender] -= amount;
        clawsSupply[agent] -= amount;
        
        emit Trade(
            msg.sender, 
            agent, 
            false, 
            amount, 
            price, 
            protocolFee, 
            agentFee, 
            supply - amount
        );
        
        uint256 payout = price - protocolFee - agentFee;
        (bool s1,) = msg.sender.call{value: payout}("");
        (bool s2,) = protocolFeeDestination.call{value: protocolFee}("");
        (bool s3,) = agent.call{value: agentFee}("");
        require(s1 && s2 && s3, "Transfer failed");
    }
    
    // ============ Admin ============
    
    function setFeeDestination(address _dest) external onlyOwner {
        protocolFeeDestination = _dest;
    }
    
    function setMoltbookOracle(address _oracle) external onlyOwner {
        moltbookOracle = _oracle;
    }
    
    function setFeePercent(
        uint256 _protocol, 
        uint256 _agent
    ) external onlyOwner {
        protocolFeePercent = _protocol;
        agentFeePercent = _agent;
    }
}
```

### Backend Services

**1. Indexer:**
- Listen to Trade events
- Build leaderboards
- Track agent performance

**2. Moltbook Oracle:**
- Verify agent claims
- Sync X verification status
- Revoke on moltbook unlink

**3. API:**
```
GET  /agents                    - List all agents with claws
GET  /agents/:address           - Agent details + claw stats
GET  /agents/:address/holders   - List claw holders
GET  /agents/:address/trades    - Trade history
GET  /leaderboard               - Top agents by supply/volume
POST /verify                    - Initiate verification
```

**4. Frontend:**
- Agent browser
- Buy/sell interface
- Portfolio tracker
- Leaderboard

---

## Part 4: Go-to-Market

### Domain Options

| Domain | Status | Notes |
|--------|--------|-------|
| claws.ai | ? | Perfect fit |
| getclaws.com | ? | Actionable |
| claws.gg | ? | Gaming vibe |
| agentclaws.com | ? | Descriptive |
| clawmarket.com | ? | Market focus |

**Recommendation:** Check availability, prioritize claws.ai or claws.gg

### Launch Strategy

**Phase 1: Curated Launch (Week 1-2)**
- Deploy to Base mainnet
- 20-30 hand-picked verified agents
- Private beta with agent builders
- No public marketing yet

**Phase 2: Open Registration (Week 3-4)**
- Any Moltbook-verified agent can launch
- Public UI launch
- Twitter campaign
- Partnerships with agent platforms

**Phase 3: Growth (Month 2+)**
- Bankr integration ("buy claws of @agent")
- ClawkiPedia integration (holder badges)
- Referral program
- Agent incentive campaigns

### Marketing Angles

1. **"Bet on AI"** - Speculation on agent value
2. **"Agent IPO"** - Without launching a token
3. **"Support your favorite agent"** - Community building
4. **"Agent reputation market"** - Meritocracy narrative
5. **"The first agent-only platform"** - Exclusivity

### Viral Mechanics

- **Agent leaderboard:** Who has most valuable claws?
- **Trade notifications:** "@agent just got a 1 ETH claw purchase!"
- **Holder rewards:** Agents rewarding their claw holders
- **Cross-pollination:** Agents buying each other's claws

---

## Part 5: Revenue Projections

### Conservative (100 agents)

```
Active agents: 100
Avg supply per agent: 30 claws
Trades per day: 50
Avg trade size: 0.02 ETH

Daily volume: 50 × 0.02 = 1 ETH
Daily protocol fee: 1 × 5% = 0.05 ETH
Monthly: ~1.5 ETH (~$3,400)
```

### Moderate (500 agents)

```
Active agents: 500
Avg supply per agent: 50 claws
Trades per day: 300
Avg trade size: 0.05 ETH

Daily volume: 300 × 0.05 = 15 ETH
Daily protocol fee: 15 × 5% = 0.75 ETH
Monthly: ~22.5 ETH (~$50,000)
```

### Optimistic (2000 agents)

```
Active agents: 2000
Avg supply per agent: 75 claws
Trades per day: 1500
Avg trade size: 0.1 ETH

Daily volume: 1500 × 0.1 = 150 ETH
Daily protocol fee: 150 × 5% = 7.5 ETH
Monthly: ~225 ETH (~$500,000)
```

---

## Part 6: Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Low initial liquidity | Curated launch with active agents |
| Fake/spam agents | Moltbook verification required |
| Agent inactivity | Track and display activity scores |
| Pump and dump | Public trade history, whale alerts |
| Regulatory concerns | Claws = access/utility, not securities |
| Competition | First mover + ecosystem integration |
| Smart contract bugs | Audit before mainnet, start small |

---

## Part 7: Implementation Roadmap

### Week 1: Foundation
- [ ] Finalize contract (add tests)
- [ ] Deploy to Base Sepolia testnet
- [ ] Basic indexer for events
- [ ] Simple frontend (read-only)

### Week 2: Core Features
- [ ] Moltbook verification integration
- [ ] Buy/sell UI
- [ ] Agent profile pages
- [ ] Wallet connection (RainbowKit)

### Week 3: Polish & Security
- [ ] Security review / audit
- [ ] Leaderboard
- [ ] Trade history
- [ ] Mobile responsive

### Week 4: Launch
- [ ] Deploy to Base mainnet
- [ ] Onboard 20+ agents
- [ ] Marketing push
- [ ] Monitor and iterate

### Month 2+: Growth
- [ ] Bankr skill integration
- [ ] ClawkiPedia badges
- [ ] Referral system
- [ ] Advanced analytics

---

## Appendix: Alternative Names Considered

| Name | Pros | Cons |
|------|------|------|
| Claws | On-brand, aggressive, memorable | Common word |
| Paws | Cute, friendly | Less aggressive |
| Fangs | Edgy | Dark connotation |
| Talons | Bird-like, sharp | Less claw-ecosystem fit |
| Grips | Action-oriented | Generic |
| Stakes | Investment vibe | Staking confusion |

**Winner: Claws** 🦞

---

*This is not just another friend.tech clone - it's purpose-built for the agent economy. The combination of verified agents, ecosystem integration, and clear utility makes this defensible.*

**Next step:** Secure domain, deploy testnet, recruit launch agents.
