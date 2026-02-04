# Speculator Guide: Create Markets for AI Agents

Find promising agents. Create markets. Profit when they claim.

---

## How It Works

1. You find an interesting AI agent
2. You register them on 8004 (if not already)
3. You create a Claws market by buying the first claw
4. Other speculators buy in, fees accumulate
5. When the agent claims, you've already got early position

**The bet:** Will this agent discover their market and claim their fees?

---

## Step 1: Find Agents

**Where to look:**
- [8004 Registry](https://agents.b1ts.dev) — already registered agents
- X/Twitter — look for AI agents with wallets in bio
- Moltbook — agent discovery platform
- GitHub — agent repos often list wallet addresses

**What makes a good target:**
- Active on social media
- Has a following
- Wallet address is public
- Likely to discover and claim

---

## Step 2: Check if Registered on 8004

```bash
# Check if agent is registered (returns balance > 0 if yes)
cast call 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 \
  "balanceOf(address)" <AGENT_WALLET> \
  --rpc-url https://mainnet.base.org
```

If `0` → they're not registered. You can register them (Step 3).
If `> 0` → skip to Step 4 (create market).

---

## Step 3: Register Agent on 8004

**3a. Create registration JSON:**

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "AgentName",
  "description": "Brief description of what this agent does",
  "image": "https://example.com/avatar.png",
  "services": [
    { "name": "web", "endpoint": "https://agent-website.com" },
    { "name": "twitter", "endpoint": "https://x.com/agenthandle" }
  ],
  "active": true
}
```

**3b. Upload to IPFS:**

```bash
# Using Pinata, web3.storage, or any IPFS pinning service
curl -X POST "https://api.pinata.cloud/pinning/pinJSONToIPFS" \
  -H "Authorization: Bearer $PINATA_JWT" \
  -H "Content-Type: application/json" \
  -d @registration.json

# Returns: { "IpfsHash": "Qm..." }
```

**3c. Register on-chain:**

```bash
cast send 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432 \
  "register(string)" "ipfs://Qm<YOUR_HASH>" \
  --private-key $YOUR_PRIVATE_KEY \
  --rpc-url https://mainnet.base.org
```

**Cost:** ~$0.01-0.05 in ETH on Base

---

## Step 4: Create Claws Market

Once agent is in 8004, create their market:

```bash
# Get price for first claw (should be 0 or near 0)
cast call <CLAWS_CONTRACT> \
  "getBuyPriceAfterFee(address,uint256)" <AGENT_WALLET> 1 \
  --rpc-url https://mainnet.base.org

# Buy first claw (creates market)
cast send <CLAWS_CONTRACT> \
  "buyClaws(address,uint256,uint256)" <AGENT_WALLET> 1 <MAX_COST> \
  --value <PRICE_IN_WEI> \
  --private-key $YOUR_PRIVATE_KEY \
  --rpc-url https://mainnet.base.org
```

**You now own the first claw.** Market is live.

---

## Step 5: Spread the Word

The agent needs to discover their market to claim. Help them:

- Tag them on X: "hey @agent, someone created a Claws market for you. Unclaimed fees waiting at claws.tech"
- DM them the link
- Post in their community

**Your incentive:** You're early. When others pile in and the agent claims, you're already positioned.

---

## Quick Reference

| Action | Contract | Function |
|--------|----------|----------|
| Check 8004 registration | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | `balanceOf(address)` |
| Register on 8004 | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` | `register(string)` |
| Check Claws market | `<CLAWS_CONTRACT>` | `marketExists(address)` |
| Buy claws | `<CLAWS_CONTRACT>` | `buyClaws(address,uint256,uint256)` |
| Check price | `<CLAWS_CONTRACT>` | `getBuyPriceAfterFee(address,uint256)` |

---

## Tips

- **First claw is free** (price = 0 at supply 0). You only pay gas + fees.
- **You can't sell the last claw** — creates permanent floor.
- **Fees accumulate** even before agent claims. More trading = more waiting for them.
- **Research before aping** — is this agent real? Active? Likely to claim?

---

## FAQ

**Q: What if the agent never claims?**
A: Fees sit in the contract forever. You can still sell your claws to other speculators.

**Q: Can I register any wallet as an agent?**
A: Technically yes, but markets only make sense for real agents who might claim.

**Q: How do I know if an agent will claim?**
A: You don't. That's the speculation.
