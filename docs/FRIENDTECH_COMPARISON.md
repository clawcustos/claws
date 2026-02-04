# Claws vs friend.tech Contract Comparison

**Date:** 2026-02-04
**friend.tech contract:** `0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4` (Base)
**Claws contract:** `contracts/src/Claws.sol`

---

## Executive Summary

Claws is a significant evolution of the friend.tech model. The core bonding curve pricing is identical, but Claws adds critical security features, a dual-verification system, and better UX protections that friend.tech lacks.

| Feature | friend.tech | Claws | Winner |
|---------|-------------|-------|--------|
| Bonding curve formula | `supply²/16000` | `supply²/16000` | Tie |
| Reentrancy protection | None | ReentrancyGuard | Claws |
| Pausable | No | Yes | Claws |
| Slippage protection | No | Yes (maxCost/minProceeds) | Claws |
| First purchase | Subject only | Anyone (if source-verified) | Claws |
| Fee accumulation | Direct to subject | Pending until verified | Claws |
| Revocation | No | Yes | Claws |
| Excess refund | Implicit | Explicit | Claws |

---

## Detailed Comparison

### 1. Pricing Formula (Identical)

Both use the same sum-of-squares bonding curve:

```solidity
// friend.tech
function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
    uint256 sum1 = supply == 0 ? 0 : (supply - 1) * (supply) * (2 * (supply - 1) + 1) / 6;
    uint256 sum2 = supply == 0 && amount == 1 ? 0 : (supply - 1 + amount) * (supply + amount) * (2 * (supply - 1 + amount) + 1) / 6;
    uint256 summation = sum2 - sum1;
    return summation * 1 ether / 16000;
}

// Claws - identical formula
function getPrice(uint256 supply, uint256 amount) public pure returns (uint256) {
    uint256 sum1 = supply == 0 ? 0 : (supply - 1) * supply * (2 * (supply - 1) + 1) / 6;
    uint256 sum2 = supply == 0 && amount == 1
        ? 0
        : (supply + amount - 1) * (supply + amount) * (2 * (supply + amount - 1) + 1) / 6;
    uint256 summation = sum2 - sum1;
    return summation * 1 ether / 16000;
}
```

**Verdict:** Proven formula, no changes needed.

---

### 2. Security: Reentrancy Protection

**friend.tech:** None. Vulnerable pattern:
```solidity
function buyShares(address sharesSubject, uint256 amount) public payable {
    // ... state changes ...
    sharesBalance[sharesSubject][msg.sender] += amount;
    sharesSupply[sharesSubject] = supply + amount;
    emit Trade(...);
    // External calls AFTER state changes (good)
    (bool success1, ) = protocolFeeDestination.call{value: protocolFee}("");
    (bool success2, ) = sharesSubject.call{value: subjectFee}("");
    require(success1 && success2, "Unable to send funds");
    // BUT no reentrancy guard - relies solely on CEI pattern
}
```

**Claws:** Uses OpenZeppelin's ReentrancyGuard:
```solidity
function buyClaws(address agent, uint256 amount, uint256 maxCost)
    external payable nonReentrant whenNotPaused {
    // ...
}
```

**Verdict:** friend.tech uses CEI pattern which is generally safe, but Claws adds belt-and-suspenders protection. Claws wins.

---

### 3. Security: Pausable

**friend.tech:** No pause mechanism. If a vulnerability is discovered, there's no way to stop trading.

**Claws:** Full pausable with split permissions:
```solidity
function pause() external onlyVerifier {  // Verifier OR owner can pause
    _pause();
}

function unpause() external onlyOwner {    // Only owner can unpause
    _unpause();
}
```

**Verdict:** Critical for incident response. Claws wins.

---

### 4. Slippage Protection

**friend.tech:** None. Front-running is trivial:
```solidity
function buyShares(address sharesSubject, uint256 amount) public payable {
    // No maxCost parameter - user can be sandwiched
    require(msg.value >= price + protocolFee + subjectFee, "Insufficient payment");
}
```

**Claws:** Built-in slippage protection:
```solidity
function buyClaws(address agent, uint256 amount, uint256 maxCost) external payable {
    // ...
    if (totalCost > maxCost) revert SlippageExceeded();
}

function sellClaws(address agent, uint256 amount, uint256 minProceeds) external {
    // ...
    if (payout < minProceeds) revert SlippageExceeded();
}
```

**Verdict:** Essential for user protection. Claws wins.

---

### 5. Market Creation Model

**friend.tech:** Subject must buy their own first share:
```solidity
require(supply > 0 || sharesSubject == msg.sender, "Only the shares' subject can buy the first share");
```

This means:
- Subject must have ETH and know about the platform
- No speculative market creation
- Friction to onboarding

**Claws:** Speculator-created markets with verification:
```solidity
if (supply == 0) {
    if (!sourceVerified[agent]) revert AgentNotSourceVerified();
    if (revoked[agent]) revert AgentIsRevoked();
    emit MarketCreated(agent, msg.sender);
}
```

This means:
- Anyone can create a market for a verified agent
- Agents don't need ETH or platform knowledge initially
- Speculators can bet on agents before they onboard
- Agent claims their reserved claw + accumulated fees later

**Verdict:** Claws model is superior for agent onboarding and speculation. Claws wins.

---

### 6. Fee Distribution

**friend.tech:** Direct to subject always:
```solidity
(bool success2, ) = sharesSubject.call{value: subjectFee}("");
```

Problem: If subject is a contract that reverts, trades fail.

**Claws:** Conditional with accumulation:
```solidity
if (clawsVerified[agent] && !revoked[agent]) {
    _safeTransfer(agent, agentFee);
} else {
    pendingFees[agent] += agentFee;
}
```

Benefits:
- Fees accumulate before agent verifies (incentive to onboard)
- Revoked agents don't receive fees
- No failed trades due to agent contract issues

**Verdict:** More flexible and safer. Claws wins.

---

### 7. Verification & Revocation

**friend.tech:** None. Anyone is implicitly a valid subject.

**Claws:** Dual verification system:
```solidity
// Source verification (moltbook/X) - enables market creation
mapping(address => bool) public sourceVerified;

// Claws verification - enables fee claims
mapping(address => bool) public clawsVerified;

// Revocation for compromised accounts
mapping(address => bool) public revoked;
```

**Verdict:** Critical for an agent-focused platform. Claws wins.

---

### 8. Excess Payment Handling

**friend.tech:** No explicit refund (excess ETH stays in contract):
```solidity
require(msg.value >= price + protocolFee + subjectFee, "Insufficient payment");
// No refund logic - excess ETH is lost to contract
```

**Claws:** Explicit refund:
```solidity
uint256 excess = msg.value - totalCost;
if (excess > 0) {
    _safeTransfer(msg.sender, excess);
}
```

**Verdict:** Better UX. Claws wins.

---

### 9. Quirks in friend.tech

**sellShares is payable:**
```solidity
function sellShares(address sharesSubject, uint256 amount) public payable {
```

This is odd - why would a sell function accept ETH? Likely a copy-paste oversight. Any ETH sent is trapped.

**No events for admin changes:**
friend.tech has no events for `setFeeDestination`, `setProtocolFeePercent`, `setSubjectFeePercent`.

**Claws emits events for all admin actions:**
```solidity
emit VerifierUpdated(_verifier);
emit ProtocolFeeDestinationUpdated(_destination);
emit FeesUpdated(_protocolFee, _agentFee);
```

---

### 10. What friend.tech Has That Claws Doesn't

**renounceOwnership:** friend.tech inherits this from Ownable (can permanently remove owner). Claws doesn't have this - owner can only be transferred, not renounced.

**Consideration:** Could add `renounceOwnership` to Claws for decentralization endgame, but it's not critical for launch.

---

## Fee Configuration Comparison

| Parameter | friend.tech (on-chain) | Claws |
|-----------|------------------------|-------|
| Protocol Fee | 5% (50000000000000000) | 5% (same encoding) |
| Subject/Agent Fee | 5% (50000000000000000) | 5% (same encoding) |
| Max Total Fee | No cap | 20% cap |

Claws adds a fee cap:
```solidity
if (_protocolFee + _agentFee > 200000000000000000) revert FeesTooHigh();
```

---

## Recommendations

### Keep As-Is
1. Bonding curve formula - proven, identical
2. Fee percentages - 5%/5% is market standard
3. CEI pattern - correct in both

### Claws Advantages to Highlight
1. **Slippage protection** - huge UX win
2. **Pausable** - essential for incident response
3. **Speculator markets** - better for agent onboarding
4. **Fee accumulation** - incentivizes agent verification
5. **Revocation** - handles compromised accounts

### Minor Suggestions
1. Consider adding `renounceOwnership` for future decentralization
2. Could add a minimum trade amount to prevent dust spam (friend.tech doesn't have this either)

---

## Conclusion

Claws is a **strict upgrade** over friend.tech:
- Same proven economics (bonding curve)
- Better security (reentrancy guard, pausable)
- Better UX (slippage protection, excess refunds)
- Agent-native features (verification, revocation, fee accumulation)

The additional ~400 lines of code (529 vs ~90) are entirely justified by the added functionality and safety.

---

## Sources

- [friend.tech Keys Contract (BaseScan)](https://basescan.org/address/0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4)
- [friend.tech Contract Source (Codeslaw)](https://www.codeslaw.app/contracts/base/0xcf205808ed36593aa40a44f10c7f7c2f67d4a4d4)
- [friend.tech About Page](https://www.friend.tech/about)
