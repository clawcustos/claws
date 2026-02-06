# Contract Redeployment Checklist

**Date:** 2026-02-06
**Reason:** Two fixes from local contract not in deployed version

---

## Changes Since Last Deploy

### 1. Whitelist Bonus Claw Pricing Fix ✅
**File:** `src/Claws.sol` line 232
**Bug:** When whitelisted handle does first buy (supply==0), free bonus claw was at supply 0 but paid claws were ALSO priced from supply 0 — user was undercharged.
**Fix:** `_getPrice(1, amount)` — free claw takes slot 0, paid claws priced from supply 1 onward.
**Impact:** Proper liquidity backing. Users pay correct price.

### 2. EIP-712 VERIFY_TYPEHASH Field Order Fix ✅
**File:** `src/Claws.sol` line 53
**Bug:** TYPEHASH declared `(address wallet, string handle, ...)` but `abi.encode` used `(handle, wallet)` order.
**Fix:** TYPEHASH now `"Verify(string handle,address wallet,uint256 timestamp,uint256 nonce)"` — matches `abi.encode`.
**Impact:** Proper EIP-712 compliance. Backend updated to match.

---

## Pre-Deploy Verification

- [x] 112 tests passing (`forge test --summary`)
- [x] Backend verify route updated to match new TYPEHASH
- [x] Frontend build passes
- [x] Git pushed (commit `036e0a5`)

## Deploy Command

```bash
cd ~/repos/claws/contracts
source .env  # needs PRIVATE_KEY, RPC_URL, ETHERSCAN_API_KEY

forge script script/Deploy.s.sol:DeployClaws \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Constructor args (same as before):**
- verifier: `0x84622B7dd49CF13688666182FBc708A94cd2D293`
- treasury: `0x87C6C2e72d239B769EAc64B096Dbdc0d4fc7BfA6`

## Post-Deploy Steps

1. **Update frontend contract address** — `web/lib/contracts.ts`
2. **Update frontend ABI** (if any interface changes — none expected)
3. **Re-whitelist all 25 agents** — `setWhitelistedBatch`
4. **Re-verify @clawcustos** — go through verification flow again
5. **Deploy frontend** — `vercel --prod --yes`
6. **Verify contract on Basescan** — should happen automatically with `--verify` flag
7. **Test buy flow** — buy claws for a whitelisted agent, verify pricing is correct
8. **Update HEARTBEAT.md** — mark contract redeploy as done

## Note on State

All existing markets, balances, and verification on the OLD contract (`0x2AC21776cdaEfa6665B06AE26DDb0069a8c552cf`) will NOT carry over. This is a fresh deploy. Since we're in early testing with only 2 claws traded, this is acceptable.

---

*Pizza needs to deploy this — requires the deployer wallet private key.*
