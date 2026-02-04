# friend.tech Full Ecosystem Analysis & Claws Gap Report

**Date:** 2026-02-04
**Author:** Claude Code
**Purpose:** Comprehensive review of all friend.tech contracts to identify gaps and opportunities for Claws

---

## Executive Summary

friend.tech evolved from a simple bonding curve (V1) to a complex ecosystem with:
- **8 contracts** for various functions
- **Native token** ($FRIEND/Points) with merkle-based airdrop
- **Clubs** - multi-token bonding curves with referrals
- **AMM** (BunnySwap) for Points/ETH liquidity
- **Staking** (BestFriend) for LP rewards
- **On-chain metadata** for users and clubs

**Key Finding:** Claws V1 is appropriately scoped. Most friend.tech additions came after initial traction and are not needed for launch. However, there are a few features worth considering for V2.

---

## friend.tech Contract Inventory

| Contract | Address | Purpose | Relevance to Claws |
|----------|---------|---------|-------------------|
| Keys (V1) | `0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4` | Original bonding curve | ✅ Already analyzed |
| Clubs | `0x201e95f275F39a5890C976Dc8A3E1b4Af114E635` | Multi-token bonding curves | 🟡 V2 consideration |
| Points ($FRIEND) | `0x0bD4887f7D41B35CD75DFF9FfeE2856106f86670` | Native token with airdrop | ❌ Not needed |
| BunnySwap | `0x7CfC830448484CDF830625373820241E61ef4acf` | AMM for Points/ETH | ❌ Not needed |
| RabbitRouter | `0xBf250AE227De43deDaF01ccBFD8CC83027efc1E2` | Swap router | ❌ Not needed |
| BestFriend | `0x1d2Dff13E7F4109fdCaf4dDb59Fbd853Abfc4208` | LP staking rewards | ❌ Not needed |
| User Metadata | `0xe8a963c0d61985845d0BeFB5BdAD503c77f74050` | On-chain user data | 🟡 V2 consideration |
| Club Metadata | `0x16cBE31782aab246F0D492a399Dd9154f0AFDB9a` | On-chain club data | ❌ Not needed |

---

## Detailed Contract Analysis

### 1. Keys (V1) - Original Contract
**Already covered in FRIENDTECH_COMPARISON.md**

Summary: Claws is a strict upgrade with:
- ReentrancyGuard ✅
- Pausable ✅
- Slippage protection ✅
- Verification system ✅
- Fee accumulation ✅

---

### 2. Clubs - Multi-Token Bonding Curves

**What it does:**
```solidity
contract Clubs is Owned(msg.sender) {
    // Each "club" is a separate token with its own bonding curve
    mapping(uint256 => uint256) public totalSupply;
    mapping(uint256 id => uint256 curveCoefficient) public coefficients;

    // Different pool types with different curve steepness
    mapping(uint8 pooltype => uint256 coefficient) public poolCoefficients;

    // Uses Points token instead of ETH
    IPoints public immutable points;

    // Referral system
    mapping(address referer => uint256 feesEarned) public referralFeesEarned;
}
```

**Key Features:**
1. **Multiple pool types** - Different curve coefficients for different steepness
2. **Referral system** - Split fees between referrer and referee
3. **Points-denominated** - Uses $FRIEND token, not ETH
4. **EOA-only transfers** - Blocks contract interactions (anti-bot)

**Fee structure:**
```solidity
uint256 public protocolFeePercent;      // To protocol
uint256 public bestFriendFeePercent;    // To LP staking pool
uint256 public referralFeePercent;      // Split between referrer/referee
```

**Relevance to Claws:**

| Feature | Worth Adding? | Notes |
|---------|--------------|-------|
| Multi-token (clubs) | ❌ No | Claws already has per-agent markets |
| Referral system | 🟡 Maybe V2 | Could drive growth |
| EOA-only | ❌ No | Breaks composability |
| Points denomination | ❌ No | ETH is simpler |

**Recommendation:** Consider referral system for V2. Could split the 5% agent fee into 4% agent + 1% referral, or add separate referral fee.

---

### 3. Points ($FRIEND Token)

**What it does:**
```solidity
contract Points is Owned(msg.sender), IPoints {
    // Merkle-based airdrop with two roots
    bytes32 public immutable merkleRootA;
    bytes32 public immutable merkleRootB;

    // Gift distribution on claim
    function claimA(
        bytes32[] calldata proof,
        address recipient,
        uint256 amount,
        address[] calldata giftRecipients,  // Can split claim with friends
        uint256 giftAmount
    ) external;

    // Whitelist-controlled transfers
    modifier onlyWhitelisted() {
        require(isAllowed[msg.sender] || isOpen[msg.sig], "WHITELIST");
        _;
    }
}
```

**Key Features:**
1. **Merkle airdrop** - Two claim phases (A/B)
2. **Gift mechanism** - Can distribute portion of claim to friends
3. **Whitelist transfers** - Only approved contracts can transfer
4. **Points, not token** - Intentionally not ERC20 compliant initially

**Relevance to Claws:**

| Feature | Worth Adding? | Notes |
|---------|--------------|-------|
| Native token | ❌ No | Adds complexity, regulatory risk |
| Merkle airdrop | ❌ No | Not needed for launch |
| Gift mechanism | 🟡 Interesting | Could incentivize sharing |

**Recommendation:** Skip for V1. If Claws needs a token later, it's a separate consideration.

---

### 4. BunnySwap (AMM)

**What it does:**
```solidity
contract BunnySwap is ERC20("BunnySwap", "POINTS-ETH", 18), Owned, ReentrancyGuard {
    // UniswapV2-style AMM for Points/ETH
    address public token0;  // Points
    address public token1;  // WETH

    uint112 private reserve0;
    uint112 private reserve1;

    // Adjustable fee tier
    uint64 public feeTier;  // Default 15 = 1.5%

    // Router authorization
    mapping(address => bool) public isAllowedRouter;
}
```

**Key Features:**
1. **UniV2 fork** - Standard x*y=k AMM
2. **Points/ETH pair** - Provides liquidity for the ecosystem
3. **Adjustable fees** - Owner can modify fee tier
4. **Router whitelist** - Only authorized routers can swap

**Relevance to Claws:**

| Feature | Worth Adding? | Notes |
|---------|--------------|-------|
| AMM | ❌ No | Claws uses bonding curve, not AMM |
| Liquidity pools | ❌ No | Not needed for bonding curve model |

**Recommendation:** Not relevant. Claws doesn't need an AMM.

---

### 5. RabbitRouter

**What it does:**
Standard Uniswap-style router with:
- `addLiquidity` / `removeLiquidity`
- `swapExactTokensForETH` / `swapETHForExactTokens`
- Quote and path calculation functions

**Relevance to Claws:** None. Only needed if we had an AMM.

---

### 6. BestFriend (LP Staking)

**What it does:**
```solidity
contract BestFriend is Owned(msg.sender), IBestFriend {
    struct UserInfo {
        uint256 lastDepositBlock;
        uint256 amount;
        uint256 rewardDebt;
    }

    // MasterChef-style staking
    uint256 public immutable pointsPerBlock;
    PoolInfo public pool;

    // Bonus points from trading fees
    function addBonusPoints(uint256 _amount) external {
        pool.bonusPointsAccrued += _amount;
    }

    // 5-block withdrawal delay
    require(user.lastDepositBlock + 5 < block.number, "withdraw: wait");
}
```

**Key Features:**
1. **LP staking** - Stake BunnySwap LP tokens for Points rewards
2. **Fee recycling** - Trading fees boost staking rewards
3. **Withdrawal delay** - 5 blocks to prevent gaming

**Relevance to Claws:**

| Feature | Worth Adding? | Notes |
|---------|--------------|-------|
| Staking rewards | ❌ No | No LP tokens to stake |
| Fee recycling | 🟡 Interesting | Could recycle unclaimed fees |

**Recommendation:** Not needed for V1. Could consider fee recycling mechanism later.

---

### 7. User Metadata (Unverified)

**Inferred purpose:** Store user profile data on-chain
- Likely stores: username, bio, profile picture hash, social links
- 16 payable functions, 7 events

**Relevance to Claws:**

| Feature | Worth Adding? | Notes |
|---------|--------------|-------|
| On-chain metadata | 🟡 Maybe | Could store agent X handle, moltbook ID |

**Current Claws approach:**
```solidity
mapping(address => string) public agentXHandle;
mapping(address => string) public agentMoltbookId;
```

Claws already stores minimal agent metadata. A dedicated metadata contract could be useful if we need more fields, but current approach is sufficient for V1.

---

### 8. Club Metadata (Unverified)

**Inferred purpose:** Store club-specific metadata on-chain

**Relevance to Claws:** None. Claws doesn't have clubs.

---

## Gap Analysis Summary

### Features Claws Already Has That friend.tech Lacks

| Feature | Claws | friend.tech V1 |
|---------|-------|----------------|
| ReentrancyGuard | ✅ | ❌ |
| Pausable | ✅ | ❌ |
| Slippage protection | ✅ | ❌ |
| Verification system | ✅ | ❌ |
| Revocation | ✅ | ❌ |
| Fee accumulation | ✅ | ❌ |
| Batch verification | ✅ | ❌ |
| Lifetime fee tracking | ✅ | ❌ |

### Features friend.tech Has That Claws Lacks

| Feature | friend.tech | Priority for Claws | Recommendation |
|---------|-------------|-------------------|----------------|
| Referral system | Clubs | 🟡 Medium | Consider for V2 |
| Native token | Points | ❌ Low | Skip - regulatory risk |
| AMM liquidity | BunnySwap | ❌ None | Not needed |
| LP staking | BestFriend | ❌ None | Not needed |
| Multi-token curves | Clubs | ❌ Low | Per-agent markets are better |
| EOA-only transfers | Clubs | ❌ None | Breaks composability |

---

## Detailed Recommendations

### 1. Referral System (V2 Priority: Medium)

**friend.tech implementation:**
```solidity
function buyToken(uint256 tokenId, uint256 maxTokensIn, uint256 keysOut, address referral) public {
    // ...
    if (referral != address(0)) {
        uint256 referralFee = tokensIn * referralFeePercent / 1 ether;
        uint256 senderFee = referralFee / 2;
        uint256 referredFee = referralFee - senderFee;
        referralFeesEarned[referral] += senderFee;
        referralFeesEarned[msg.sender] += referredFee;
        protocolFee -= referralFee;
    }
}
```

**Proposed Claws implementation:**
```solidity
// State
mapping(address => uint256) public referralFeesEarned;
uint256 public referralFeePercent = 10000000000000000; // 1%

// In buyClaws
function buyClaws(address agent, uint256 amount, uint256 maxCost, address referrer) external payable {
    // ... existing logic ...

    if (referrer != address(0) && referrer != msg.sender) {
        uint256 referralFee = price * referralFeePercent / 1 ether;
        referralFeesEarned[referrer] += referralFee / 2;
        referralFeesEarned[msg.sender] += referralFee / 2;
        // Deduct from protocol fee, not agent fee
        protocolFee -= referralFee;
    }
}

function claimReferralFees() external {
    uint256 amount = referralFeesEarned[msg.sender];
    referralFeesEarned[msg.sender] = 0;
    _safeTransfer(msg.sender, amount);
}
```

**Benefits:**
- Incentivizes organic growth
- Users have skin in the game
- Protocol fee funds it, agent fee untouched

**Considerations:**
- Adds complexity
- Potential for gaming (self-referral prevention needed)
- Gas overhead per trade

**Verdict:** Good V2 feature, not needed for launch.

---

### 2. On-Chain Agent Metadata (V2 Priority: Low)

Current Claws stores:
- `agentXHandle` - X/Twitter handle
- `agentMoltbookId` - Moltbook ID

Could expand to:
- Profile image hash (IPFS)
- Bio
- Website URL
- Verification timestamp

**Verdict:** Current approach is sufficient. Metadata can live off-chain for V1.

---

### 3. Fee Recycling (V2 Priority: Low)

friend.tech's BestFriend routes portion of fees back to stakers. Claws could:
- Route unclaimed pending fees (from unverified agents) to a community pool
- Create staking mechanism for CLAW holders (if token exists)

**Verdict:** Interesting but premature. Revisit after launch.

---

### 4. Transfer Restrictions (Priority: None)

friend.tech Clubs has EOA-only transfers:
```solidity
modifier onlyEOA(address account) {
    uint256 size;
    assembly { size := extcodesize(account) }
    if (size > 0 && !sendWhitelist[account]) revert("EOA Only");
    _;
}
```

**Verdict:** Don't add. This breaks composability and is anti-DeFi. friend.tech did this to prevent bots, but Claws should embrace programmable access.

---

## What friend.tech Got Wrong

1. **No reentrancy protection** - Risky
2. **No pause mechanism** - Can't respond to emergencies
3. **No slippage protection** - Users get sandwiched
4. **No excess refund** - Users lose ETH
5. **Token distraction** - $FRIEND launch fragmented attention
6. **EOA restrictions** - Killed composability
7. **Complexity creep** - 8 contracts is hard to maintain

---

## Final Recommendations

### For V1 (Testnet/Mainnet Launch)
✅ **Ship as-is.** Claws is already better than friend.tech V1.

### For V2 (Post-Launch)
1. **Referral system** - Add optional referrer param to buyClaws
2. **EIP-712 verification** - Already planned
3. **Additional agent metadata** - If needed by frontend

### Skip Entirely
- Native token
- AMM/liquidity pools
- LP staking
- EOA restrictions
- Multi-token curves (per-agent is better)

---

## Conclusion

friend.tech's expansion from V1 to 8 contracts was driven by:
1. Need to launch a token (regulatory pressure?)
2. Creating yield for token holders
3. Feature bloat to maintain engagement

Claws should **not** follow this path. The core bonding curve is proven. Claws' innovations (verification, revocation, fee accumulation, slippage protection) are meaningful improvements that address real problems.

**Ship V1, gather feedback, iterate thoughtfully.**

---

## Sources

- [friend.tech Keys Contract (Codeslaw)](https://www.codeslaw.app/contracts/base/0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4)
- [friend.tech Clubs Contract (Codeslaw)](https://www.codeslaw.app/contracts/base/0x201e95f275F39a5890C976Dc8A3E1b4Af114E635)
- [friend.tech Points Contract (Codeslaw)](https://www.codeslaw.app/contracts/base/0x0bD4887f7D41B35CD75DFF9FfeE2856106f86670)
- [friend.tech BunnySwap Contract (Codeslaw)](https://www.codeslaw.app/contracts/base/0x7CfC830448484CDF830625373820241E61ef4acf)
- [friend.tech BestFriend Contract (Codeslaw)](https://www.codeslaw.app/contracts/base/0x1d2Dff13E7F4109fdCaf4dDb59Fbd853Abfc4208)
- [friend.tech About Page](https://www.friend.tech/about)
