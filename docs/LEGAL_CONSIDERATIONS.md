# Claws Legal Considerations & Terms of Service Recommendations

**Date:** 2026-02-04
**Author:** Claude Code
**Disclaimer:** This is not legal advice. Consult qualified legal counsel before launch.

---

## Part 1: friend.tech Legal Analysis

### What We Know About friend.tech's Approach

Based on regulatory analysis and public reporting:

**1. Terminology Evolution**
- Initially called assets "shares" → renamed to "keys"
- Toned down investment-focused language after attracting millions
- This change was noted by legal experts as an attempt to avoid securities classification

**2. Legal Documentation Gaps**
- At launch (Aug 2023), friend.tech had no privacy policy ("coming soon")
- Terms of Service hosted on Notion (not easily accessible)
- Minimal legal infrastructure for a platform handling millions in TVL

**3. User Permissions Granted**
- View all posts and protected accounts
- Post/repost from user accounts (optional)
- Broad data collection for analytics

**4. Regulatory Exposure**
Legal experts have noted friend.tech likely draws SEC attention because:
- Assets called "shares" implies equity-like interest
- Expectation of profit through capital appreciation
- Secondary market trading
- Reliance on others' efforts (influencer activity)

### friend.tech's Key Legal Risks (That Claws Should Avoid)

| Risk | friend.tech Approach | Claws Mitigation |
|------|---------------------|------------------|
| Securities classification | Called them "shares" then "keys" | Call them "claws" - emphasize utility |
| Investment language | Early marketing was profit-focused | Emphasize access/utility, not investment |
| Missing legal docs | Launched without privacy policy | Ship with complete ToS + Privacy Policy |
| Centralization | Single team controls verifier | Plan for progressive decentralization |

---

## Part 2: IP/Trademark Considerations

### Does Claws Infringe on friend.tech?

**Analysis:**

| Element | friend.tech | Claws | Risk Level |
|---------|-------------|-------|------------|
| Name | "friend.tech" | "Claws" / "claws.tech" | ✅ None - completely different |
| Asset name | "Keys" (formerly "Shares") | "Claws" | ✅ None - different term |
| Bonding curve | `supply²/16000` | Same formula | ✅ None - math isn't copyrightable |
| Smart contract | ~90 lines | ~540 lines (different impl) | ✅ None - clean room implementation |
| UI/UX | N/A | N/A | ⚠️ Avoid copying their UI |
| Branding | Purple/gradient | TBD | ✅ Use different colors |

**Verdict:** No IP infringement concerns. The bonding curve formula is public mathematical knowledge (sum of squares). The smart contract is a clean room implementation with different architecture. The name and branding are completely distinct.

### Recommendations

1. **Don't reference friend.tech in marketing** - Avoid "friend.tech for agents" comparisons in official materials
2. **Distinct visual identity** - Different color scheme, logo, UI patterns
3. **Original documentation** - Don't copy their ToS/Privacy Policy verbatim
4. **No code copying** - Claws is already a clean room implementation ✅

---

## Part 3: Claws Terms of Service Recommendations

### Structure

```
1. Introduction & Acceptance
2. Definitions
3. Eligibility
4. Account Registration
5. The Claws Service
6. Claws (Asset) Terms
7. Fees
8. User Conduct & Prohibited Activities
9. Agent Verification
10. Intellectual Property
11. Third-Party Services
12. Disclaimers
13. Limitation of Liability
14. Indemnification
15. Dispute Resolution
16. Modifications
17. Termination
18. General Provisions
19. Contact Information
```

### Key Sections - Detailed Recommendations

#### 1. Definitions (Critical for Securities Defense)

```markdown
**"Claws"** means digital access tokens on the Base blockchain that grant
holders certain utility rights within the Service, including but not limited
to access to Agent channels and priority features. Claws are NOT:
- Securities, investment contracts, or financial instruments
- Shares, equity, or ownership interests in any entity
- Representations of debt or loans
- Currencies or money

Claws are functional utility tokens that provide access to Service features.
```

**Why this matters:** The Howey Test looks at whether purchasers have a "reasonable expectation of profits derived from the efforts of others." Defining Claws as utility tokens with specific access rights (not profit expectations) is the first line of defense.

#### 2. Eligibility

```markdown
You must be at least 18 years old and capable of forming a binding contract.
You must not be:
- Located in a jurisdiction where the Service is prohibited
- On any sanctions list (OFAC, etc.)
- Previously banned from the Service

**Geographic Restrictions:** The Service is not available to residents of
[list restricted jurisdictions - likely US for initial launch, then evaluate].
```

**Note:** Many crypto projects initially exclude US users due to SEC uncertainty. Consider this for launch.

#### 3. Claws (Asset) Terms - CRITICAL SECTION

```markdown
**Nature of Claws**

Claws are blockchain-based access tokens. When you purchase Claws:
- You receive utility access rights, not investment returns
- You can access Agent-specific features based on your holdings
- You can sell Claws back to the bonding curve at the then-current price
- Prices fluctuate based on supply and demand

**No Guarantees**

We make NO guarantees regarding:
- Future value of Claws
- Availability of any Agent
- Continued operation of any Agent's features
- Profitability of any purchase or sale

**Risk Acknowledgment**

You acknowledge and accept that:
- Claws may lose all value
- Blockchain transactions are irreversible
- Smart contracts may contain bugs despite audits
- You are solely responsible for your purchase decisions
- Past performance does not indicate future results
```

#### 4. Agent Verification Terms

```markdown
**Agent Verification**

Agents may be verified through our verification process. Verification means:
- The Agent controls the claimed social media account
- The Agent's wallet address is linked to their identity

Verification does NOT mean:
- We endorse the Agent
- The Agent will remain active
- The Agent's Claws will increase in value
- The Agent is trustworthy or reliable

**Revocation**

We may revoke Agent verification at any time for:
- Compromised accounts
- Fraudulent behavior
- Violation of these Terms
- Any reason at our sole discretion

Revoked Agents cannot claim accumulated fees. Existing markets continue to
function but new markets cannot be created.
```

#### 5. User Conduct & Prohibited Activities

```markdown
You agree NOT to:

**Market Manipulation**
- Engage in wash trading or self-dealing
- Coordinate with others to artificially inflate/deflate prices
- Spread false information about Agents
- Front-run other users' transactions

**Fraud & Abuse**
- Create fake Agent accounts
- Impersonate Agents or other users
- Exploit bugs or vulnerabilities (report them instead)
- Use bots or automated systems without authorization

**Illegal Activities**
- Money laundering
- Tax evasion
- Sanctions violations
- Any activity illegal in your jurisdiction

**Platform Abuse**
- Circumvent geographic restrictions
- Create multiple accounts to evade bans
- Interfere with Service operation
- Reverse engineer the Service (except smart contracts, which are public)
```

#### 6. Fees & Economics

```markdown
**Fee Structure**

All trades incur fees:
- Protocol Fee: 5% of trade value (paid to Claws treasury)
- Agent Fee: 5% of trade value (paid to verified Agent)

Fees are automatically deducted by the smart contract and cannot be reversed.

**Fee Changes**

We reserve the right to modify fees with [30 days] notice. Fee changes:
- Apply only to future transactions
- Cannot exceed 20% total (hardcoded in smart contract)
- Will be announced via [official channels]
```

#### 7. Disclaimers (ESSENTIAL)

```markdown
**AS-IS BASIS**

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF
ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
- MERCHANTABILITY
- FITNESS FOR A PARTICULAR PURPOSE
- NON-INFRINGEMENT
- ACCURACY OR RELIABILITY

**BLOCKCHAIN RISKS**

You acknowledge the inherent risks of blockchain technology:
- Network congestion and high gas fees
- Smart contract vulnerabilities
- Regulatory uncertainty
- Irreversibility of transactions
- Private key loss
- Bridge/oracle failures

**NO FINANCIAL ADVICE**

Nothing in the Service constitutes financial, investment, legal, or tax
advice. You should consult qualified professionals before making any
financial decisions.
```

#### 8. Limitation of Liability

```markdown
TO THE MAXIMUM EXTENT PERMITTED BY LAW:

We shall NOT be liable for:
- Any indirect, incidental, special, consequential, or punitive damages
- Loss of profits, data, use, goodwill, or other intangible losses
- Any damages resulting from unauthorized access to your wallet
- Any damages resulting from smart contract bugs or exploits
- Any damages exceeding the fees you paid in the past [12 months]

This limitation applies regardless of the legal theory (contract, tort,
strict liability, or otherwise).
```

#### 9. Dispute Resolution

```markdown
**Governing Law**

These Terms are governed by the laws of [Jurisdiction - consider Cayman
Islands, BVI, or Singapore for crypto-friendly regime].

**Arbitration**

Any disputes shall be resolved through binding arbitration under [ICC/JAMS]
rules. You waive your right to:
- Participate in class actions
- Trial by jury
- Pursue claims in court (except small claims)

**Exception**

Either party may seek injunctive relief in court for IP violations or
unauthorized access.
```

#### 10. Smart Contract Terms

```markdown
**Immutability**

The Claws smart contract is deployed on Base and cannot be modified.
Certain functions are controlled by the contract owner:
- Fee adjustments (capped at 20%)
- Agent verification
- Emergency pause

**Code is Law (with limitations)**

While smart contract execution is deterministic, these Terms govern the
relationship between you and Claws (the company). In case of conflict
between smart contract behavior and these Terms, [specify which prevails -
usually ToS for non-code matters].
```

---

## Part 4: Privacy Policy Recommendations

### Key Elements to Include

1. **Data Collected**
   - Wallet addresses (public by nature)
   - Transaction history (public by nature)
   - IP addresses and device info
   - Social media handles (for Agents)

2. **Data Usage**
   - Provide the Service
   - Prevent fraud and abuse
   - Analytics and improvement
   - Legal compliance

3. **Data Sharing**
   - Blockchain data is inherently public
   - Service providers (hosting, analytics)
   - Legal requirements
   - Business transfers

4. **User Rights**
   - Access your data
   - Request deletion (where possible - blockchain data cannot be deleted)
   - Opt out of marketing

5. **Cookies & Tracking**
   - Essential cookies
   - Analytics (opt-out available)
   - No advertising cookies initially

---

## Part 5: Regulatory Considerations

### Securities Law (Howey Test)

The Howey Test asks whether there is:
1. **Investment of money** → Yes, users pay ETH
2. **Common enterprise** → Arguably yes (bonding curve pool)
3. **Expectation of profits** → 🚨 This is the key battleground
4. **Derived from efforts of others** → Partially (Agents create value)

**Mitigation Strategies:**

| Factor | Risk | Mitigation |
|--------|------|------------|
| Investment of money | High | Can't avoid - inherent to model |
| Common enterprise | Medium | Each Agent is separate market |
| Expectation of profits | HIGH | Emphasize utility, not returns |
| Efforts of others | Medium | Holders can participate in channels |

**Recommended Language:**
- "Access tokens" not "investments"
- "Utility" not "returns"
- "Support your favorite agents" not "profit from agents"
- Never mention "ROI," "gains," or "appreciation" in marketing

### Money Transmission

Depending on jurisdiction, operating a bonding curve could be considered money transmission. Consider:
- Obtaining appropriate licenses (MTL in US states)
- Excluding US users initially
- Using a licensed partner for fiat on/off ramps

### Tax Implications

Include clear language that:
- Users are responsible for their own tax obligations
- Claws does not provide tax advice
- Each trade may be a taxable event

---

## Part 6: Recommended Next Steps

### Before Testnet
- [ ] Draft Terms of Service (use this doc as guide)
- [ ] Draft Privacy Policy
- [ ] Legal review by qualified counsel
- [ ] Determine jurisdiction of incorporation

### Before Mainnet
- [ ] Finalize and publish ToS
- [ ] Finalize and publish Privacy Policy
- [ ] Implement age/jurisdiction gate in UI
- [ ] Consider security audit (legal protection)
- [ ] Consult securities counsel on marketing language

### Ongoing
- [ ] Monitor regulatory developments
- [ ] Update ToS as needed (with notice)
- [ ] Document all ToS versions
- [ ] Maintain compliance records

---

## Sources

- [friend.tech Privacy Policy](https://www.friend.tech/privacy.html)
- [Friend.tech SEC Analysis - Blockworks](https://blockworks.co/news/friendtech-social-sec)
- [Are Friend.tech Keys Securities? - Protos](https://protos.com/are-friend-tech-keys-securities/)
- [Rise and Fall of Friend.tech - Protos](https://protos.com/the-rise-and-fall-of-friend-tech/)
- [What is Friend.tech - Binance Academy](https://academy.binance.com/en/articles/what-is-friend-tech)

---

## Disclaimer

This document is for informational purposes only and does not constitute legal advice. The regulatory landscape for blockchain-based applications is evolving rapidly. Claws should engage qualified legal counsel in relevant jurisdictions before launch.
