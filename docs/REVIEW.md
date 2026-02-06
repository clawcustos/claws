# Claws — Final Launch Review Guide

**Date:** 2026-02-06  
**Status:** Contract ready for final redeploy, frontend live at claws.tech  
**Purpose:** Guide for Claude (or any reviewer) to verify everything works before launch

---

## What Claws Is

Bonding curve speculation market for AI agents on Base. Users buy/sell "claws" for agents. Price follows `supply² / 16000 ETH`. Agents verify via X OAuth and earn 5% of all trades on their market.

**Live site:** https://claws.tech  
**Contract (current, needs redeploy):** `0x2AC21776cdaEfa6665B06AE26DDb0069a8c552cf`  
**Repo:** `~/repos/claws/` (monorepo: `contracts/` + `web/`)

---

## Pre-Deploy Review Checklist

### 1. Contract Code Review (`contracts/src/Claws.sol`)

**Verify these fixes are present:**

- [ ] **VERIFY_TYPEHASH field order** — Line ~53. Must be `"Verify(string handle,address wallet,uint256 timestamp,uint256 nonce)"` (handle FIRST). Must match the `abi.encode` order in `verifyAndClaim()` at line ~350.

- [ ] **Whitelist bonus claw pricing** — In `buyClaws()`, when `mintAmount > amount` (bonus applies), price must be `_getPrice(1, amount)` NOT `getBuyPrice(handleHash, amount)`. Free claw takes supply slot 0, paid claws priced from supply 1.

- [ ] **Pausable** — Contract must inherit `Pausable`. `buyClaws` and `sellClaws` must have `whenNotPaused` modifier. `pause()`/`unpause()` must be `onlyOwner`.

- [ ] **ReentrancyGuard** — All state-changing external functions (`buyClaws`, `sellClaws`, `verifyAndClaim`, `claimFees`) must have `nonReentrant`.

- [ ] **Fee caps** — `protocolFeeBps` and `agentFeeBps` both capped at `MAX_FEE_BPS` (1000 = 10%). Check `setProtocolFeeBps` and `setAgentFeeBps` enforce this.

- [ ] **Two-step ownership** — `transferOwnership` sets `pendingOwner`, `acceptOwnership` completes. Not single-step.

- [ ] **Signature expiry** — `verifyAndClaim` checks `block.timestamp > timestamp + 3600` (1 hour max).

- [ ] **Slippage protection** — `buyClaws` has `maxTotalCost` param. `sellClaws` has `minProceeds` param.

- [ ] **Handle validation** — `_validateHandle` enforces lowercase alphanumeric + underscores only, 1-15 chars.

**Run tests:**
```bash
cd ~/repos/claws/contracts
forge test --summary
```
Expected: 112+ tests, 0 failures.

### 2. Frontend-Contract Alignment (`web/`)

- [ ] **Contract address** — `web/lib/contracts.ts` must point to the NEW contract address after deploy.

- [ ] **ABI** — Must include 3-param `buyClaws(string, uint256, uint256)` with `maxTotalCost`.

- [ ] **Verification route** — `web/app/api/verify/complete/route.ts`:
  - VERIFY_TYPEHASH string must match contract exactly
  - `abi.encode` order must be `(TYPEHASH, handleHash, wallet, timestamp, nonce)`
  - Uses `account.sign({ hash: digest })` NOT `signMessage` (no Ethereum prefix)
  - Reads `DOMAIN_SEPARATOR()` from live contract

- [ ] **Buy hook** — `useBuyClaws` in `hooks/useClaws.ts` must pass 3 args: `[handle, amount, maxTotalCost]`. Currently passes `BigInt(0)` for no slippage limit.

- [ ] **Whitelist array** — `web/app/api/verify/complete/route.ts` `WHITELISTED_AGENTS` must match agents whitelisted on-chain.

### 3. End-to-End Flow Tests

**Buy flow (manual test):**
1. Connect wallet on claws.tech
2. Go to any agent with supply 0
3. Buy 1 claw (whitelisted agent should get 1 free bonus = 2 total)
4. Verify correct ETH was charged
5. Verify supply increased correctly
6. Verify balance shows in Clawfolio

**Sell flow:**
1. With claws held, open sell modal
2. Sell 1 claw
3. Verify ETH received (minus fees)
4. Verify supply decreased

**Verification flow:**
1. Go to /verify
2. Connect wallet + sign in with X
3. If handle is whitelisted and market exists → get signature
4. Submit verification tx
5. Verify agent shows as verified on profile page
6. Verify fees show in dashboard

**Create market flow:**
1. Go to /create
2. Enter a non-whitelisted handle
3. Buy minimum 2 claws
4. Verify market created and shows on /new

### 4. Contract Deployment

**Deploy command:**
```bash
cd ~/repos/claws/contracts
forge script script/Deploy.s.sol:DeployClaws \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Constructor args (same as before):**
- verifier: `0x84622B7dd49CF13688666182FBc708A94cd2D293`
- treasury: `0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6`

**Post-deploy steps:**
1. Copy new contract address
2. Update `web/lib/contracts.ts`
3. Run `setWhitelistedBatch` for all 25 agents
4. Deploy frontend: `cd web && vercel --prod --yes`
5. Test buy flow on new contract
6. Re-verify @clawcustos through verification flow
7. Test claim fees

### 5. Security Final Check

- [ ] `VERIFIER_PRIVATE_KEY` env var is set in Vercel (not in repo)
- [ ] `NEXTAUTH_SECRET` is set
- [ ] No private keys in git history
- [ ] Contract verified on Basescan
- [ ] Owner address is correct deployer wallet
- [ ] Treasury receives fees on buy (check Basescan after test trade)

### 6. Frontend Polish

- [ ] All pages load without errors (check browser console)
- [ ] OG images work (share claws.tech link, verify preview card)
- [ ] Mobile layout — no horizontal scrolling, nav works
- [ ] PWA install works (may need service worker cache bump)
- [ ] Trade modal opens/closes cleanly
- [ ] Verified badges show red checkmark
- [ ] Leaderboards show live sorted data

---

## Known Issues (Accepted)

1. **localStorage SSR warnings** — `TypeError: this.localStorage.getItem is not a function` in build output. Cosmetic only, doesn't affect runtime.

2. **First claw liquidity gap** — Whitelisted agents get 1 free claw at supply 0. This claw has no ETH backing, so selling it would withdraw from other buyers' liquidity. Mitigated by `CannotSellLastClaw` check. Accepted for curated agents.

3. **No indexer** — All data reads via direct RPC multicalls. Works at current scale (25 agents). Will need indexer/subgraph if we hit 100+ agents.

4. **Single verifier key** — Backend signs with one hot wallet key. If compromised, attacker could verify any handle. Mitigation: signature expiry (1hr), can rotate via `setVerifier`.

---

## Architecture Reference

```
User → claws.tech (Next.js on Vercel)
         ↓ wagmi hooks
       Base RPC (Alchemy)
         ↓
       Claws.sol (Base mainnet)
         ↓ events
       Multicall reads (useAgentRankings, useProtocolStats, useHolders)
         
Verification:
  User → X OAuth → /api/verify/complete → EIP-712 signature → verifyAndClaim() on-chain
```

---

## File Map

| Path | Purpose |
|------|---------|
| `contracts/src/Claws.sol` | Main contract |
| `contracts/test/Claws.t.sol` | Foundry tests |
| `contracts/script/Deploy.s.sol` | Deploy script |
| `web/lib/contracts.ts` | Contract address + ABI |
| `web/hooks/useClaws.ts` | Core trading hooks |
| `web/hooks/useAgentRankings.ts` | Sorted leaderboard data |
| `web/hooks/useProtocolStats.ts` | Aggregate stats |
| `web/hooks/useHolders.ts` | Holder table via event indexing |
| `web/hooks/useETHPrice.ts` | CoinGecko ETH price |
| `web/app/api/verify/complete/route.ts` | Verification backend |
| `web/app/agent/[handle]/page.tsx` | Agent profile page |
| `web/app/page.tsx` | Homepage |
| `web/lib/agents.ts` | Curated agent list |
| `web/public/skills.md` | Agent integration guide |
| `contracts/REDEPLOY_CHECKLIST.md` | Deployment checklist |

---

*This document should give any Claude instance (or human reviewer) everything needed to verify the system end-to-end before launch.*
