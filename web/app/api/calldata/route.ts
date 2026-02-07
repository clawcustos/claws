import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, encodeFunctionData, formatEther } from 'viem';
import { base } from 'viem/chains';
import { CONTRACTS, CLAWS_ABI } from '@/lib/contracts';

const CONTRACT_ADDRESS = CONTRACTS.base.claws;
const CHAIN_ID = 8453;

const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || 'https://mainnet.base.org';

const client = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

// Minimal ABI fragments for encoding (write functions need explicit ABI)
const WRITE_ABI = {
  createMarket: {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'createMarket',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  buyClaws: {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'maxTotalCost', type: 'uint256' },
    ],
    name: 'buyClaws',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  sellClaws: {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'minProceeds', type: 'uint256' },
    ],
    name: 'sellClaws',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  claimFees: {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'claimFees',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
} as const;

type ActionType = 'buy' | 'sell' | 'create' | 'info' | 'price' | 'claim';

interface CalldataRequest {
  action: ActionType;
  handle: string;
  amount?: number;
  maxTotalCost?: string;
  minProceeds?: string;
}

function validateHandle(handle: string): string {
  const clean = handle.startsWith('@') ? handle.slice(1) : handle;
  if (!clean || clean.length > 32) throw new Error('Invalid handle');
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) throw new Error('Invalid handle characters');
  return clean.toLowerCase();
}

// Read market data from contract
async function getMarketData(handle: string) {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'getMarket',
      args: [handle],
    });
    // wagmi returns tuple
    const [supply, pendingFees, lifetimeFees, lifetimeVolume, verifiedWallet, isVerified, createdAt, currentPrice] = result as [bigint, bigint, bigint, bigint, string, boolean, bigint, bigint];
    return {
      exists: createdAt > 0n,
      supply: Number(supply),
      pendingFees,
      lifetimeFees,
      lifetimeVolume,
      verifiedWallet,
      isVerified,
      createdAt: Number(createdAt),
      currentPrice,
    };
  } catch {
    return null;
  }
}

// Read buy cost from contract
async function getBuyCost(handle: string, amount: number) {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'getBuyCostBreakdown',
      args: [handle, BigInt(amount)],
    });
    const [price, protocolFee, agentFee, totalCost] = result as [bigint, bigint, bigint, bigint];
    return { price, protocolFee, agentFee, totalCost };
  } catch {
    return null;
  }
}

// Read sell proceeds from contract
async function getSellProceeds(handle: string, amount: number) {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'getSellProceedsBreakdown',
      args: [handle, BigInt(amount)],
    });
    const [price, protocolFee, agentFee, proceeds] = result as [bigint, bigint, bigint, bigint];
    return { price, protocolFee, agentFee, proceeds };
  } catch {
    return null;
  }
}

// Check whitelist status
async function isWhitelisted(handle: string) {
  try {
    const result = await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: CLAWS_ABI,
      functionName: 'isWhitelisted',
      args: [handle],
    });
    return result as boolean;
  } catch {
    return false;
  }
}

function buildResponse(action: string, tx: { to: string; data: string; value: string; chainId: number }, extra?: Record<string, unknown>) {
  return NextResponse.json({
    action,
    transaction: tx,
    bankr_prompt: `Submit this transaction:\n${JSON.stringify(tx, null, 2)}`,
    ...extra,
  });
}

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') as ActionType | null;
  const handle = searchParams.get('handle');
  const amount = searchParams.get('amount');
  const maxTotalCost = searchParams.get('maxTotalCost');
  const minProceeds = searchParams.get('minProceeds');

  if (!action || !handle) {
    return NextResponse.json({
      error: 'Missing required parameters: action, handle',
      usage: {
        endpoint: '/api/calldata',
        methods: ['GET', 'POST'],
        params: {
          action: 'buy | sell | create | info | price | claim',
          handle: 'X handle (without @)',
          amount: 'Number of claws (required for buy/sell/price)',
          maxTotalCost: 'Max cost in wei (optional, buy only)',
          minProceeds: 'Min proceeds in wei (optional, sell only)',
        },
        examples: {
          create_market: '/api/calldata?action=create&handle=myagent',
          buy_claws: '/api/calldata?action=buy&handle=myagent&amount=2',
          sell_claws: '/api/calldata?action=sell&handle=myagent&amount=1',
          get_price: '/api/calldata?action=price&handle=myagent&amount=2',
          get_info: '/api/calldata?action=info&handle=myagent',
          claim_fees: '/api/calldata?action=claim&handle=myagent',
        },
        bankr_usage: 'Copy the bankr_prompt field and send it to Bankr to execute',
        contract: CONTRACT_ADDRESS,
        chain: 'Base (8453)',
      },
    }, { status: 400 });
  }

  try {
    return await handleAction({
      action,
      handle,
      amount: amount ? parseInt(amount, 10) : undefined,
      maxTotalCost: maxTotalCost || undefined,
      minProceeds: minProceeds || undefined,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return errorResponse(message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CalldataRequest = await request.json();
    if (!body.action || !body.handle) {
      return errorResponse('Missing required fields: action, handle');
    }
    return await handleAction(body);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return errorResponse(message);
  }
}

async function handleAction(params: CalldataRequest): Promise<NextResponse> {
  const handle = validateHandle(params.handle);

  switch (params.action) {
    // ── CREATE ──────────────────────────────────────
    case 'create': {
      const market = await getMarketData(handle);
      if (market?.exists) {
        return errorResponse(
          `Market for @${handle} already exists (supply: ${market.supply}, verified: ${market.isVerified}). Use action=buy to purchase claws instead.`,
          409
        );
      }

      const data = encodeFunctionData({
        abi: [WRITE_ABI.createMarket],
        functionName: 'createMarket',
        args: [handle],
      });

      return buildResponse('create_market', {
        to: CONTRACT_ADDRESS,
        data,
        value: '0',
        chainId: CHAIN_ID,
      }, {
        description: `Create a new market for @${handle} on Claws`,
        note: 'This only creates the market with 0 supply. Use action=buy to purchase claws after creation, or just use action=buy directly — it auto-creates the market on first purchase.',
      });
    }

    // ── BUY ────────────────────────────────────────
    case 'buy': {
      const amount = params.amount;
      if (!amount || amount < 1) {
        return errorResponse('amount must be >= 1');
      }

      const market = await getMarketData(handle);
      const whitelisted = await isWhitelisted(handle);

      // Validate minimum buy for new markets
      if (!market?.exists || market.supply === 0) {
        if (!whitelisted && amount < 2) {
          return errorResponse(
            `@${handle} is not whitelisted. New market creation requires minimum 2 claws. Got: ${amount}`,
          );
        }
      }

      // Get exact cost from contract if market exists
      let totalCostWei: bigint;
      let costBreakdown: { price: bigint; protocolFee: bigint; agentFee: bigint; totalCost: bigint } | null = null;

      if (market?.exists && market.supply > 0) {
        costBreakdown = await getBuyCost(handle, amount);
        if (costBreakdown) {
          totalCostWei = costBreakdown.totalCost;
        } else {
          // Fallback to local estimate
          totalCostWei = estimateBuyCost(market.supply, amount);
        }
      } else {
        // New market or supply 0 — estimate from supply 0/1
        const startSupply = whitelisted ? 1 : 0;
        totalCostWei = estimateBuyCost(startSupply, amount);
      }

      const maxCost = params.maxTotalCost ? BigInt(params.maxTotalCost) : 0n;

      const data = encodeFunctionData({
        abi: [WRITE_ABI.buyClaws],
        functionName: 'buyClaws',
        args: [handle, BigInt(amount), maxCost],
      });

      // Send 10% buffer over exact cost for safety (contract refunds excess)
      const valueToSend = maxCost > 0n ? maxCost : (totalCostWei * 110n) / 100n;

      const extra: Record<string, unknown> = {
        description: `Buy ${amount} claw${amount > 1 ? 's' : ''} for @${handle}`,
        market_exists: market?.exists ?? false,
        current_supply: market?.supply ?? 0,
        is_verified: market?.isVerified ?? false,
        is_whitelisted: whitelisted,
      };

      if (costBreakdown) {
        extra.exact_cost = {
          price_wei: costBreakdown.price.toString(),
          price_eth: formatEther(costBreakdown.price),
          protocol_fee_wei: costBreakdown.protocolFee.toString(),
          agent_fee_wei: costBreakdown.agentFee.toString(),
          total_cost_wei: costBreakdown.totalCost.toString(),
          total_cost_eth: formatEther(costBreakdown.totalCost),
        };
        extra.note = 'Exact cost from on-chain read. Value includes 10% buffer (excess refunded).';
      } else {
        extra.estimated_cost_wei = totalCostWei.toString();
        extra.estimated_cost_eth = formatEther(totalCostWei);
        extra.note = 'Estimated cost (new market). Value includes 10% buffer (excess refunded). Actual cost depends on current supply at execution time.';
      }

      if (whitelisted && (!market?.exists || market.supply === 0)) {
        extra.bonus = '1 free bonus claw (whitelisted handle). You will receive ' + (amount + 1) + ' claws total.';
      }

      return buildResponse('buy_claws', {
        to: CONTRACT_ADDRESS,
        data,
        value: valueToSend.toString(),
        chainId: CHAIN_ID,
      }, extra);
    }

    // ── SELL ────────────────────────────────────────
    case 'sell': {
      const amount = params.amount;
      if (!amount || amount < 1) {
        return errorResponse('amount must be >= 1');
      }

      const market = await getMarketData(handle);
      if (!market?.exists) {
        return errorResponse(`No market exists for @${handle}. Nothing to sell.`, 404);
      }

      if (market.supply === 0) {
        return errorResponse(`Market for @${handle} has 0 supply. Nothing to sell.`);
      }

      if (amount >= market.supply) {
        return errorResponse(
          `Cannot sell ${amount} claws — market supply is ${market.supply} and the last claw cannot be sold. Max sellable: ${market.supply - 1}`
        );
      }

      const minProceeds = params.minProceeds ? BigInt(params.minProceeds) : 0n;

      // Get exact proceeds from contract
      const sellData = await getSellProceeds(handle, amount);

      const data = encodeFunctionData({
        abi: [WRITE_ABI.sellClaws],
        functionName: 'sellClaws',
        args: [handle, BigInt(amount), minProceeds],
      });

      const extra: Record<string, unknown> = {
        description: `Sell ${amount} claw${amount > 1 ? 's' : ''} for @${handle}`,
        current_supply: market.supply,
        note: 'You must hold enough claws in your wallet to sell. The caller must be the claw holder.',
      };

      if (sellData) {
        extra.expected_proceeds = {
          gross_price_wei: sellData.price.toString(),
          gross_price_eth: formatEther(sellData.price),
          protocol_fee_wei: sellData.protocolFee.toString(),
          agent_fee_wei: sellData.agentFee.toString(),
          net_proceeds_wei: sellData.proceeds.toString(),
          net_proceeds_eth: formatEther(sellData.proceeds),
        };
      }

      return buildResponse('sell_claws', {
        to: CONTRACT_ADDRESS,
        data,
        value: '0',
        chainId: CHAIN_ID,
      }, extra);
    }

    // ── PRICE ──────────────────────────────────────
    case 'price': {
      const amount = params.amount || 1;

      const market = await getMarketData(handle);
      const costBreakdown = market?.exists ? await getBuyCost(handle, amount) : null;

      const response: Record<string, unknown> = {
        action: 'price_check',
        handle: `@${handle}`,
        amount,
        market_exists: market?.exists ?? false,
        current_supply: market?.supply ?? 0,
        is_verified: market?.isVerified ?? false,
      };

      if (costBreakdown) {
        response.buy_cost = {
          price_wei: costBreakdown.price.toString(),
          price_eth: formatEther(costBreakdown.price),
          protocol_fee_wei: costBreakdown.protocolFee.toString(),
          protocol_fee_eth: formatEther(costBreakdown.protocolFee),
          agent_fee_wei: costBreakdown.agentFee.toString(),
          agent_fee_eth: formatEther(costBreakdown.agentFee),
          total_cost_wei: costBreakdown.totalCost.toString(),
          total_cost_eth: formatEther(costBreakdown.totalCost),
        };
      } else {
        response.note = market?.exists
          ? 'Could not read cost from contract.'
          : `Market does not exist yet. First buy requires minimum 2 claws (or 1 if whitelisted). Use action=buy to create and purchase.`;
      }

      if (market?.exists && market.supply > 0) {
        response.current_price_wei = market.currentPrice.toString();
        response.current_price_eth = formatEther(market.currentPrice);
      }

      return NextResponse.json(response);
    }

    // ── INFO ───────────────────────────────────────
    case 'info': {
      const market = await getMarketData(handle);

      if (!market || !market.exists) {
        return NextResponse.json({
          action: 'market_info',
          handle: `@${handle}`,
          exists: false,
          note: 'No market exists for this handle. Use action=buy or action=create to create one.',
        });
      }

      return NextResponse.json({
        action: 'market_info',
        handle: `@${handle}`,
        exists: true,
        supply: market.supply,
        current_price_wei: market.currentPrice.toString(),
        current_price_eth: formatEther(market.currentPrice),
        pending_fees_wei: market.pendingFees.toString(),
        pending_fees_eth: formatEther(market.pendingFees),
        lifetime_fees_wei: market.lifetimeFees.toString(),
        lifetime_fees_eth: formatEther(market.lifetimeFees),
        lifetime_volume_wei: market.lifetimeVolume.toString(),
        lifetime_volume_eth: formatEther(market.lifetimeVolume),
        verified_wallet: market.verifiedWallet,
        is_verified: market.isVerified,
        created_at: market.createdAt,
        profile_url: `https://claws.tech/agent/${handle}`,
      });
    }

    // ── CLAIM ──────────────────────────────────────
    case 'claim': {
      const market = await getMarketData(handle);

      if (!market?.exists) {
        return errorResponse(`No market exists for @${handle}.`, 404);
      }

      if (!market.isVerified) {
        return errorResponse(
          `@${handle} is not verified. Only verified agents can claim fees. Verify at https://claws.tech/verify`
        );
      }

      if (market.pendingFees === 0n) {
        return errorResponse(`@${handle} has no pending fees to claim.`);
      }

      const data = encodeFunctionData({
        abi: [WRITE_ABI.claimFees],
        functionName: 'claimFees',
        args: [handle],
      });

      return buildResponse('claim_fees', {
        to: CONTRACT_ADDRESS,
        data,
        value: '0',
        chainId: CHAIN_ID,
      }, {
        description: `Claim ${formatEther(market.pendingFees)} ETH in accumulated fees for @${handle}`,
        pending_fees_wei: market.pendingFees.toString(),
        pending_fees_eth: formatEther(market.pendingFees),
        note: `Only the verified wallet (${market.verifiedWallet}) can execute this transaction.`,
      });
    }

    default:
      return errorResponse(`Unknown action: ${params.action}. Valid: buy, sell, create, info, price, claim`);
  }
}

// Local bonding curve estimate (used when contract read unavailable)
function estimateBuyCost(supply: number, amount: number): bigint {
  const PRICE_DIVISOR = 16000n;
  const ONE_ETHER = 10n ** 18n;
  const s = BigInt(supply);
  const a = BigInt(amount);

  const sum1 = s === 0n ? 0n : ((s - 1n) * s * (2n * (s - 1n) + 1n)) / 6n;
  const end = s + a - 1n;
  const sum2 = (end * (end + 1n) * (2n * end + 1n)) / 6n;
  const summation = sum2 - sum1;
  const price = (summation * ONE_ETHER) / PRICE_DIVISOR;
  const fees = (price * 1000n) / 10000n; // 10% total
  return price + fees;
}
