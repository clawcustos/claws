# Claws Review Document

**Last Updated:** 2026-02-05 10:25 GMT  
**Author:** Custos  
**Status:** Ready for mainnet deployment review

---

## Executive Summary

Claws is a bonding curve speculation market for AI agents on Base mainnet. Users buy/sell "claws" (access tokens) for specific agent handles, with prices determined by the friend.tech formula.

**Key Design Decisions:**
- Handle-based markets (X handles, not wallet addresses)
- Whole claws only (minimum 1 claw per trade — no fractional)
- friend.tech pricing formula: `price = supply² / 16000 ETH`
- 5% protocol fee + 5% agent fee (10% total)
- X OAuth verification for agents to claim fees

---

## Contract Architecture

### File: `contracts/src/Claws.sol`

**Core Features:**
- Handle-based market creation (permissionless)
- Bonding curve buy/sell with ETH
- Signature-based agent verification
- Fee accumulation for verified agents
- Slippage protection on sells

**Key State:**
```solidity
struct Market {
    uint256 supply;           // Total claws in circulation
    uint256 pendingFees;      // Unclaimed agent fees (ETH)
    uint256 lifetimeFees;     // Total fees earned (ETH)
    uint256 lifetimeVolume;   // Total trade volume (ETH)
    address verifiedWallet;   // Bound wallet (zero until verified)
    bool isVerified;          // Whether agent has verified
    uint256 createdAt;        // Block timestamp of market creation
}

mapping(bytes32 => Market) public markets;                          // handleHash => Market
mapping(bytes32 => mapping(address => uint256)) public clawsBalance; // handleHash => user => balance
```

### Price Formula

```
price = supply² / 16000 ETH
```

**Price points:**
| Supply | Price per Claw | Total Value Locked |
|--------|----------------|-------------------|
| 1 | 0.0000625 ETH (~$0.19) | ~$0.06 |
| 10 | 0.00625 ETH (~$19) | ~$230 |
| 50 | 0.156 ETH (~$468) | ~$7,800 |
| 100 | 0.625 ETH (~$1,875) | ~$62,500 |
| 200 | 2.5 ETH (~$7,500) | ~$500,000 |

*Prices at $3,000/ETH*

### Fee Structure

- **Protocol fee:** 5% (goes to treasury)
- **Agent fee:** 5% (accumulates until agent verifies and claims)
- **Total:** 10% on each trade

### Verification Flow

1. Agent signs up via X OAuth on claws.tech
2. Backend verifies X ownership, generates signature
3. Agent calls `verifyAndClaim()` with signature
4. Contract binds wallet to handle, marks verified
5. Agent can now claim accumulated fees

---

## Design Decisions

### 1. Whole Claws Only (No Fractions)

**Decision:** Minimum 1 claw per trade  
**Rationale:** 
- Cleaner UX ("you own 5 claws" not "you own 2.847 claws")
- Creates scarcity feel similar to friend.tech keys
- Whales pay premium for late entry
- Rewards early believers
- Simpler math and mental model

**Trade-off:** Users get priced out faster at high supply. Accepted.

### 2. Handle-Based Markets (Not Wallet-Based)

**Decision:** Markets keyed by X handle hash, not agent wallet address  
**Rationale:**
- Agents can verify later (markets exist before verification)
- Handle is the identity, wallet is implementation detail
- Handles are human-readable and recognizable
- Allows market creation before agent onboards

### 3. ETH Denomination (Not USDC)

**Decision:** Native ETH, not USDC  
**Rationale:**
- No approval transaction needed (better UX)
- friend.tech formula is proven
- Native to Base ecosystem
- Simpler contract (no ERC20 integration)

### 4. friend.tech Formula (supply²/16000)

**Decision:** Keep exact friend.tech formula  
**Rationale:**
- Proven in production (~$50M TVL at peak)
- Familiar to crypto users
- Creates early buyer advantage
- Strong FOMO mechanics at high supply

---

## Security Considerations

### Strengths

1. **ReentrancyGuard** — All state-changing functions protected
2. **Checks-Effects-Interactions** — Proper CEI pattern in buy/sell
3. **Slippage protection** — `minProceeds` parameter on sells
4. **Overflow protection** — Solidity 0.8.x built-in
5. **Handle normalization** — Lowercase conversion prevents duplicates
6. **Signature replay prevention** — Nonce tracking for verification

### Known Edge Cases

1. **First claw liquidity** — First claw costs ~0 ETH, but selling requires contract balance. Self-healing (next buy adds liquidity). Documented, not fixed.

2. **CannotSellLastClaw** — Prevents complete supply drain. Intentional.

### Admin Functions

- `setVerifier(address)` — Change verification signer (owner only)
- `setTreasury(address)` — Change fee destination (owner only)

**Recommendation for mainnet:** Use multisig as owner (2-of-3 minimum).

---

## Frontend Status

### Completed
- [x] Blood red (#DC2626) on black theme
- [x] Real X profile pictures for 18 verified agents
- [x] Initials-based avatar fallback
- [x] CLAWS.TECH logo and branding
- [x] BETA v0.0.1 badge
- [x] Live activity ticker (mock data)
- [x] Bottom navigation (Home, Agents, Trending, Clawfolio)
- [x] Search with filtering (verified/unverified) and sorting
- [x] Agent cards with price display
- [x] Trade modal with buy/sell
- [x] Clawfolio page (portfolio management)
- [x] Price chart component (SVG-based)
- [x] Legal pages (Terms, Privacy, Disclaimer)
- [x] skill.md for agent onboarding

### Pending
- [ ] Wire real contract calls (replace mock data)
- [ ] X OAuth verification backend
- [ ] Mobile UI polish
- [ ] PWA support (future)

### Live Preview
- URL: https://web-sigma-weld-76.vercel.app
- Build: Passing

---

## Verified Agents (18)

All handles verified against live X accounts:

1. clawcustos
2. bankrbot
3. moltbook
4. clawdbotatg
5. clawnch_bot
6. kellyclaudeai
7. starkbotai
8. moltenagentic
9. clawdvine
10. clawd_token
11. clawcaster
12. 0_x_coral
13. lobchanai
14. clawdia772541
15. agentrierxyz
16. clawditor
17. moltipedia_ai
18. solvrbot

---

## Deployment Checklist

### Pre-Deploy
- [x] Contract finalized (handle-based, whole claws)
- [x] friend.tech formula confirmed
- [x] Fee structure set (5%/5%)
- [ ] Treasury address confirmed
- [ ] Verifier address confirmed
- [ ] Deploy wallet funded with ETH

### Deploy Steps
1. Deploy `Claws.sol` to Base mainnet
2. Verify contract on Basescan
3. Update `web/lib/contracts.ts` with address
4. Wire frontend to live contract
5. Test buy/sell flow

### Post-Deploy
- [ ] Basescan verification
- [ ] Frontend integration
- [ ] X OAuth backend
- [ ] Monitoring setup

---

## Contract Interface Summary

### Write Functions
```solidity
function createMarket(string handle) external
function buyClaws(string handle, uint256 amount) external payable
function sellClaws(string handle, uint256 amount, uint256 minProceeds) external
function verifyAndClaim(string handle, address wallet, uint256 timestamp, uint256 nonce, bytes signature) external
function claimFees(string handle) external
```

### Read Functions
```solidity
function getMarket(string handle) external view returns (...)
function getBalance(string handle, address user) external view returns (uint256)
function getBuyPrice(bytes32 handleHash, uint256 amount) external view returns (uint256)
function getSellPrice(bytes32 handleHash, uint256 amount) external view returns (uint256)
function getBuyCostBreakdown(string handle, uint256 amount) external view returns (...)
function getSellProceedsBreakdown(string handle, uint256 amount) external view returns (...)
function getCurrentPrice(string handle) external view returns (uint256)
function marketExists(string handle) external view returns (bool)
```

---

## Questions for Review

1. **Whole claws enforcement** — Contract accepts any `uint256 amount`. Should we add `require(amount >= 1, "Minimum 1 claw")`? Currently relies on frontend enforcement.

2. **Handle length limit** — Currently max 32 bytes. Sufficient for X handles?

3. **Treasury/Verifier addresses** — What addresses to use for mainnet deploy?

4. **Emergency pause** — Contract has no pause mechanism. Add Pausable for mainnet?

---

## Changelog

### 2026-02-05
- Confirmed whole claws only (no fractions)
- Updated pricing table with supply/value calculations
- Finalized design decisions documentation
- Ready for mainnet deployment review

### 2026-02-04
- Major UI/UX overhaul
- Handle-based contract architecture
- Price chart and activity feed components
- Legal pages created
- 18 agents verified

---

*Review document for Claude Code or external auditor. Update as changes are made.*
