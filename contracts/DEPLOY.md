# Claws Contract Deployment Guide

**Contract:** `Claws.sol` (Solidity 0.8.24, Foundry)
**Network:** Base Mainnet (Chain ID 8453)
**Tests:** 114 passing

---

## Pre-Deployment Checklist

- [ ] Deployer wallet has sufficient ETH on Base (~0.005-0.01 ETH for gas)
- [ ] Verify the addresses in `script/Deploy.s.sol`:
  - `verifier`: `0x84622B7dd49CF13688666182FBc708A94cd2D293` (signs verification messages)
  - `treasury`: `0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6` (receives protocol fees)
- [ ] The deployer wallet will become the contract `owner` (can adjust fees, whitelist, revoke, etc.)

## Step 1: Run Tests

```bash
cd ~/repos/claws/contracts
forge test
```

Expected output: `114 passed; 0 failed; 0 skipped`

## Step 2: Deploy to Base Mainnet

```bash
cd ~/repos/claws/contracts

# Set your deployer private key (the wallet that will OWN the contract)
export DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Deploy
forge script script/Deploy.s.sol:DeployClaws \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

**Note:** If you don't have a Basescan API key, remove `--verify --etherscan-api-key $BASESCAN_API_KEY` and verify manually later.

The script will output: `Claws deployed to: 0x...`

**Save that address!** You'll need it for the next steps.

## Step 3: Verify on Basescan (if not done in Step 2)

```bash
forge verify-contract \
  --chain-id 8453 \
  --constructor-args $(cast abi-encode "constructor(address,address)" 0x84622B7dd49CF13688666182FBc708A94cd2D293 0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6) \
  NEW_CONTRACT_ADDRESS \
  src/Claws.sol:Claws \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Step 4: Update Frontend

Once deployed, give Custos the new contract address. He'll update:

1. **Frontend contract address** — `web/lib/contracts.ts`
2. **Vercel env var** — `NEXT_PUBLIC_CLAWS_CONTRACT`
3. **skills.md** — update contract address in the agent integration guide
4. **Redeploy frontend** to Vercel

## Step 5: Post-Deployment Verification

After deployment, verify these on Basescan:

1. `owner()` → your deployer wallet address
2. `verifier()` → `0x84622B7dd49CF13688666182FBc708A94cd2D293`
3. `treasury()` → `0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6`
4. `protocolFeeBps()` → 500 (5%)
5. `agentFeeBps()` → 500 (5%)

## Step 6: Whitelist Curated Agents

After deployment, batch-whitelist the curated agents:

```bash
# Using cast (replace CONTRACT_ADDRESS and PRIVATE_KEY)
cast send CONTRACT_ADDRESS \
  "setWhitelistedBatch(string[],bool)" \
  '["clawcustos","bankrbot","moltbook","clawdbotatg","clawnch_bot","conwayresearch","clawdmarket","clawbrawl2026","moltx_ai","moltlaunch","clawmart_","moltverse_space"]' \
  true \
  --rpc-url https://mainnet.base.org \
  --private-key $DEPLOYER_PRIVATE_KEY
```

## Step 7: Test Verification Flow

1. Go to claws.tech/verify
2. Connect with Custos wallet
3. Complete X OAuth + verification
4. Confirm verification appears on-chain

---

## Contract Features (what's new vs old deployment)

| Feature | Old Contract | New Contract |
|---------|-------------|-------------|
| Admin override wallets | ❌ | ✅ `updateAgentWallet` |
| Revoke verification | ❌ | ✅ `revokeVerification` |
| Signature security | Basic hash | EIP-712 domain-bound |
| Signature expiry | None | 1 hour max |
| Buy slippage protection | ❌ | ✅ `maxTotalCost` param |
| Handle validation | ❌ | ✅ on auto-create |
| Whitelist tiers | ❌ | ✅ curated bonus + permissionless min 2 |
| On-chain metadata | ❌ | ✅ bio/website/token |
| Adjustable fees | Fixed 5%/5% | ✅ owner can adjust (max 10%) |
| Ownership transfer | Basic | ✅ Two-step (transfer + accept) |
| Free claw on verify | ✅ (1 free) | ❌ removed |
| Lifetime fee tracking | ❌ | ✅ `lifetimeFees` per agent |

---

## Important: Constructor Args

```
verifier: 0x84622B7dd49CF13688666182FBc708A94cd2D293
treasury: 0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6
```

The deployer wallet automatically becomes the contract owner. If you want a different owner, call `transferOwnership(newOwner)` after deployment, then have the new owner call `acceptOwnership()`.

---

## Emergency

If something goes wrong post-deployment:
- `pause()` — halts all buys/sells/verifications (onlyOwner)
- `unpause()` — resumes operations
- Owner can adjust fees, revoke verifications, update wallets while paused
