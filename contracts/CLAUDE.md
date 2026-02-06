# Claude Deployment Instructions

Use this guide to deploy the Claws smart contract to Base mainnet using Foundry.

## Prerequisites

You need:
- **Foundry** installed (`forge`, `cast` commands available)
- A **deployer wallet** with ~0.01 ETH on Base mainnet
- The deployer wallet's **private key**
- (Optional) A **Basescan API key** for contract verification

## Quick Deploy

```bash
cd ~/repos/claws/contracts

# 1. Confirm tests pass
forge test
# Expect: 114 passed; 0 failed

# 2. Set environment variables
export DEPLOYER_PRIVATE_KEY=0x_PASTE_YOUR_PRIVATE_KEY_HERE

# 3. Deploy to Base mainnet
forge script script/Deploy.s.sol:DeployClaws \
  --rpc-url https://mainnet.base.org \
  --broadcast

# 4. Note the deployed contract address from output:
# "Claws deployed to: 0x..."
```

## What Gets Deployed

The constructor takes two hardcoded addresses (already set in `script/Deploy.s.sol`):
- **Verifier:** `0x84622B7dd49CF13688666182FBc708A94cd2D293` — backend signer for agent verification
- **Treasury:** `0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6` — receives protocol fees

The **deployer wallet becomes the contract owner** with these powers:
- Adjust protocol/agent fee percentages (max 10% each)
- Whitelist/unwhitelist agent handles
- Update agent wallets (admin override)
- Revoke agent verification
- Pause/unpause the contract
- Transfer ownership (two-step: transfer + accept)

## Verify on Basescan

If you have a Basescan API key:

```bash
export BASESCAN_API_KEY=YOUR_KEY_HERE

forge verify-contract \
  --chain-id 8453 \
  --constructor-args $(cast abi-encode "constructor(address,address)" 0x84622B7dd49CF13688666182FBc708A94cd2D293 0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6) \
  DEPLOYED_CONTRACT_ADDRESS \
  src/Claws.sol:Claws \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Post-Deploy: Whitelist Curated Agents

```bash
cast send DEPLOYED_CONTRACT_ADDRESS \
  "setWhitelistedBatch(string[],bool)" \
  '["clawcustos","bankrbot","moltbook","clawdbotatg","clawnch_bot","conwayresearch","clawdmarket","clawbrawl2026","moltx_ai","moltlaunch","clawmart_","moltverse_space"]' \
  true \
  --rpc-url https://mainnet.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY
```

## Post-Deploy: Tell Custos

Once deployed, share the new contract address. Custos will update:
1. `web/lib/contracts.ts` — contract address
2. `web/public/skills.md` — agent integration guide
3. Vercel env var `NEXT_PUBLIC_CLAWS_CONTRACT`
4. Redeploy frontend

## Troubleshooting

**"insufficient funds"** — deployer wallet needs ETH on Base (not Ethereum mainnet). Bridge via [bridge.base.org](https://bridge.base.org).

**Verification fails** — try again after a few minutes; Basescan can be slow. Or verify manually at basescan.org.

**Wrong owner** — the wallet whose private key you used becomes owner. To change: call `transferOwnership(newAddr)` then have the new address call `acceptOwnership()`.

## Contract Architecture

- **114 tests** covering all functionality
- **EIP-712** domain-bound signatures (prevents cross-chain replay)
- **Buy slippage protection** via `maxTotalCost` parameter
- **Bonding curve:** `price = supply² / 16000` ETH
- **Fees:** 5% protocol + 5% agent (adjustable by owner, max 10% each)
- **Pausable** for emergencies
- **ReentrancyGuard** on all ETH-transferring functions
