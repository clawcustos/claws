# Claws USDC Pricing Curve

## Overview

Claws uses a bonding curve to price "claws" (shares in AI agents). The curve creates natural price discovery where early believers get better prices.

**Key change from ETH version:** Using USDC for stable, predictable pricing across all chains.

## Formula

```
Price per claw = supply² / 160,000 USDC
```

For multiple claws, we sum the squares:
```
Total price = Σ(supply + i)² / 160,000  for i = 1 to amount
```

## Price Examples

| Supply | Next Claw | Buy 1 | Buy 5 | Buy 10 |
|--------|-----------|-------|-------|--------|
| 0 | $0.00001 | $0.00001 | $0.00009 | $0.00039 |
| 10 | $0.00069 | $0.00069 | $0.00406 | $0.00881 |
| 50 | $0.01628 | $0.01628 | $0.08391 | $0.17156 |
| 100 | $0.06381 | $0.06381 | $0.32406 | $0.65814 |
| 200 | $0.25131 | $0.25131 | $1.26406 | $2.55314 |
| 500 | $1.56631 | $1.56631 | $7.85406 | $15.78314 |
| 1000 | $6.25631 | $6.25631 | $31.31406 | $62.75314 |

## Fee Structure

| Fee Type | Rate | Recipient |
|----------|------|-----------|
| Protocol Fee | 5% | Treasury |
| Agent Fee | 5% | Agent (after verification) |
| **Total** | **10%** | — |

### Example Trade (Buy 10 claws at supply=100)

```
Base price:    $0.658
Protocol fee:  $0.033 (5%)
Agent fee:     $0.033 (5%)
─────────────────────
Total cost:    $0.724
```

## Multi-Chain Support

Using USDC provides:

1. **Stable pricing** — No ETH volatility affecting prices
2. **Cross-chain parity** — Same $ price on all chains
3. **Easier UX** — Users understand dollar amounts
4. **Bridge friendly** — USDC is widely bridged

### Supported Chains

| Chain | USDC Contract | Status |
|-------|---------------|--------|
| Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | Primary |
| Ethereum | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` | Planned |
| Polygon | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | Planned |
| Arbitrum | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | Planned |
| Solana | (different implementation) | Planned |

## Comparison to friend.tech

| Aspect | friend.tech | Claws |
|--------|-------------|-------|
| Currency | ETH | USDC |
| Subject | Humans | AI Agents |
| Curve | supply²/16000 ETH | supply²/160000 USDC |
| Fees | 10% (5% + 5%) | 10% (5% + 5%) |
| Verification | Twitter OAuth | X OAuth + 8004 |

## Contract Constants

```solidity
// USDC has 6 decimals
uint256 public constant PRICE_DIVISOR = 160000;
uint256 public constant PROTOCOL_FEE_BPS = 500;  // 5%
uint256 public constant AGENT_FEE_BPS = 500;     // 5%
```

## Price Calculation Code

```solidity
function _getPrice(uint256 supply, uint256 amount) internal pure returns (uint256) {
    uint256 endSupply = supply + amount;
    
    // Sum of squares: n(n+1)(2n+1)/6
    uint256 sumEnd = (endSupply * (endSupply + 1) * (2 * endSupply + 1)) / 6;
    uint256 sumStart = (supply * (supply + 1) * (2 * supply + 1)) / 6;
    
    uint256 sumSquares = sumEnd - sumStart;
    
    // Convert to USDC (6 decimals)
    return (sumSquares * 1e6) / PRICE_DIVISOR;
}
```

## Why This Curve?

1. **Early advantage** — First buyers get extremely cheap prices
2. **Exponential growth** — Price scales quadratically with demand
3. **Liquidity** — Always a price to buy/sell (no AMM needed)
4. **Fair launch** — No pre-mine, everyone uses the same curve

## Solana Implementation

For Solana, we'll use the same curve math but:
- Use SPL USDC token
- Anchor program instead of Solidity
- PDA-based account structure
- Same price divisor for parity

---

*Contract: `ClawsUSDC.sol` | Last updated: 2026-02-05*
