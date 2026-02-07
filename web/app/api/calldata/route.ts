import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData, parseEther } from 'viem';
import { CONTRACTS } from '@/lib/contracts';

const CONTRACT_ADDRESS = CONTRACTS.base.claws;
const CHAIN_ID = 8453;

// Minimal ABI fragments for encoding
const ABI = {
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
  getMarket: {
    inputs: [{ name: 'handle', type: 'string' }],
    name: 'getMarket',
    outputs: [
      { name: 'supply', type: 'uint256' },
      { name: 'pendingFees', type: 'uint256' },
      { name: 'lifetimeFees', type: 'uint256' },
      { name: 'lifetimeVolume', type: 'uint256' },
      { name: 'verifiedWallet', type: 'address' },
      { name: 'isVerified', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'currentPrice', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  getBuyCostBreakdown: {
    inputs: [
      { name: 'handle', type: 'string' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'getBuyCostBreakdown',
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'protocolFee', type: 'uint256' },
      { name: 'agentFee', type: 'uint256' },
      { name: 'totalCost', type: 'uint256' },
    ],
    stateMutability: 'view',
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
  maxTotalCost?: string; // wei string
  minProceeds?: string;  // wei string
}

function validateHandle(handle: string): string {
  // Strip @ prefix if present
  const clean = handle.startsWith('@') ? handle.slice(1) : handle;
  if (!clean || clean.length > 32) throw new Error('Invalid handle');
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) throw new Error('Invalid handle characters');
  return clean.toLowerCase();
}

// Bonding curve math (mirrors contract)
function getPrice(supply: number, amount: number): bigint {
  const PRICE_DIVISOR = 16000n;
  const ONE_ETHER = 10n ** 18n;

  const s = BigInt(supply);
  const a = BigInt(amount);

  const sum1 = s === 0n ? 0n : ((s - 1n) * s * (2n * (s - 1n) + 1n)) / 6n;
  const end = s + a - 1n;
  const sum2 = (end * (end + 1n) * (2n * end + 1n)) / 6n;
  const summation = sum2 - sum1;

  return (summation * ONE_ETHER) / PRICE_DIVISOR;
}

function buildResponse(action: string, tx: { to: string; data: string; value: string; chainId: number }, extra?: Record<string, unknown>) {
  return NextResponse.json({
    action,
    transaction: tx,
    bankr_prompt: `Submit this transaction:\n${JSON.stringify(tx, null, 2)}`,
    ...extra,
  });
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
          create_market: '/api/calldata?action=create&handle=clawcustos',
          buy_claws: '/api/calldata?action=buy&handle=clawcustos&amount=2',
          sell_claws: '/api/calldata?action=sell&handle=clawcustos&amount=1',
          get_price: '/api/calldata?action=price&handle=clawcustos&amount=2',
          claim_fees: '/api/calldata?action=claim&handle=clawcustos',
        },
        bankr_usage: 'Copy the bankr_prompt field and send it to Bankr to execute',
      },
    }, { status: 400 });
  }

  try {
    return handleAction({
      action,
      handle,
      amount: amount ? parseInt(amount, 10) : undefined,
      maxTotalCost: maxTotalCost || undefined,
      minProceeds: minProceeds || undefined,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CalldataRequest = await request.json();
    if (!body.action || !body.handle) {
      return NextResponse.json({ error: 'Missing required fields: action, handle' }, { status: 400 });
    }
    return handleAction(body);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function handleAction(params: CalldataRequest): NextResponse {
  const handle = validateHandle(params.handle);

  switch (params.action) {
    case 'create': {
      const data = encodeFunctionData({
        abi: [ABI.createMarket],
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
      });
    }

    case 'buy': {
      const amount = params.amount;
      if (!amount || amount < 1) {
        return NextResponse.json({ error: 'amount must be >= 1' }, { status: 400 });
      }

      // Estimate cost using bonding curve math (assumes buying from current supply)
      // For exact cost, use action=price first
      const maxCost = params.maxTotalCost ? BigInt(params.maxTotalCost) : 0n;

      const data = encodeFunctionData({
        abi: [ABI.buyClaws],
        functionName: 'buyClaws',
        args: [handle, BigInt(amount), maxCost],
      });

      // Estimate value to send — we estimate from supply 0 as worst case
      // Agents should use action=price to get exact cost first
      const estimatedPrice = getPrice(0, amount);
      const estimatedFees = (estimatedPrice * 1000n) / 10000n; // 10% total fees
      const estimatedTotal = estimatedPrice + estimatedFees;
      // Add 20% buffer for price movement
      const valueToSend = maxCost > 0n ? maxCost : (estimatedTotal * 120n) / 100n;

      return buildResponse('buy_claws', {
        to: CONTRACT_ADDRESS,
        data,
        value: valueToSend.toString(),
        chainId: CHAIN_ID,
      }, {
        description: `Buy ${amount} claw${amount > 1 ? 's' : ''} for @${handle}`,
        note: 'value is estimated from supply 0. Use action=price with the handle first to get exact cost. Excess ETH is refunded by the contract.',
        estimated_cost_wei: estimatedTotal.toString(),
      });
    }

    case 'sell': {
      const amount = params.amount;
      if (!amount || amount < 1) {
        return NextResponse.json({ error: 'amount must be >= 1' }, { status: 400 });
      }

      const minProceeds = params.minProceeds ? BigInt(params.minProceeds) : 0n;

      const data = encodeFunctionData({
        abi: [ABI.sellClaws],
        functionName: 'sellClaws',
        args: [handle, BigInt(amount), minProceeds],
      });

      return buildResponse('sell_claws', {
        to: CONTRACT_ADDRESS,
        data,
        value: '0',
        chainId: CHAIN_ID,
      }, {
        description: `Sell ${amount} claw${amount > 1 ? 's' : ''} for @${handle}`,
      });
    }

    case 'price': {
      const amount = params.amount || 1;

      const data = encodeFunctionData({
        abi: [ABI.getBuyCostBreakdown],
        functionName: 'getBuyCostBreakdown',
        args: [handle, BigInt(amount)],
      });

      return NextResponse.json({
        action: 'price_check',
        description: `Get cost breakdown for buying ${amount} claw${amount > 1 ? 's' : ''} of @${handle}`,
        rpc_call: {
          to: CONTRACT_ADDRESS,
          data,
          chainId: CHAIN_ID,
        },
        note: 'This is a read-only call (eth_call). Returns: [price, protocolFee, agentFee, totalCost] in wei.',
      });
    }

    case 'info': {
      const data = encodeFunctionData({
        abi: [ABI.getMarket],
        functionName: 'getMarket',
        args: [handle],
      });

      return NextResponse.json({
        action: 'market_info',
        description: `Get market data for @${handle}`,
        rpc_call: {
          to: CONTRACT_ADDRESS,
          data,
          chainId: CHAIN_ID,
        },
        note: 'Read-only call. Returns: [supply, pendingFees, lifetimeFees, lifetimeVolume, verifiedWallet, isVerified, createdAt, currentPrice]',
      });
    }

    case 'claim': {
      const data = encodeFunctionData({
        abi: [ABI.claimFees],
        functionName: 'claimFees',
        args: [handle],
      });

      return buildResponse('claim_fees', {
        to: CONTRACT_ADDRESS,
        data,
        value: '0',
        chainId: CHAIN_ID,
      }, {
        description: `Claim accumulated fees for @${handle}`,
        note: 'Only the verified wallet for this handle can claim fees.',
      });
    }

    default:
      return NextResponse.json({
        error: `Unknown action: ${params.action}. Valid: buy, sell, create, info, price, claim`,
      }, { status: 400 });
  }
}
