import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress, createPublicClient, http, keccak256, toBytes, encodePacked } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts'

// Whitelisted agents — matches contract whitelist
const WHITELISTED_AGENTS = [
  // Original whitelist
  'clawcustos', 'bankrbot', 'moltbook', 'clawdbotatg', 'clawnch_bot',
  'KellyClaudeAI', 'starkbotai', 'moltenagentic', 'clawdvine', 'lobchanai',
  // Display list agents
  'CLAWD_Token', 'clawcaster', '0_x_coral', 'Clawdia772541',
  'agentrierxyz', 'clawditor', 'moltipedia_ai', 'solvrbot',
  // Vetted 2026-02-06
  'ClawdMarket', 'clawbrawl2026', 'ConwayResearch', 'moltxio',
  'moltlaunch', 'clawmartxyz', 'moltverse_space',
];

// EIP-712 domain for the Claws contract
const CLAWS_DOMAIN = {
  name: 'Claws',
  version: '1',
  chainId: 8453,
  verifyingContract: getContractAddress(8453),
} as const;

// EIP-712 types — must match VERIFY_TYPEHASH in contract
// Note: the contract encodes handle as keccak256(bytes(handle)), 
// but in signTypedData we pass the raw string and handle encoding manually
const VERIFY_TYPES = {
  Verify: [
    { name: 'wallet', type: 'address' },
    { name: 'handle', type: 'string' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
  ],
} as const;

/**
 * POST /api/verify/complete
 * 
 * Generate EIP-712 signed verification proof for agent verification
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.twitterUsername) {
      return NextResponse.json(
        { error: 'Not authenticated with X' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { handle, walletAddress } = body

    // Verify the handle matches the authenticated user
    if (handle.toLowerCase() !== session.twitterUsername.toLowerCase()) {
      return NextResponse.json(
        { error: 'Handle does not match authenticated X account' },
        { status: 403 }
      )
    }

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Check whitelist (case-insensitive)
    const isWhitelisted = WHITELISTED_AGENTS.some(
      h => h.toLowerCase() === handle.toLowerCase()
    )
    
    if (!isWhitelisted) {
      return NextResponse.json(
        { error: `@${handle} is not on the whitelist` },
        { status: 403 }
      )
    }

    // Get verifier private key
    const verifierKey = process.env.VERIFIER_PRIVATE_KEY
    if (!verifierKey) {
      console.error('VERIFIER_PRIVATE_KEY not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const verifierAccount = privateKeyToAccount(verifierKey as `0x${string}`)
    const contractAddress = getContractAddress(8453)
    
    const publicClient = createPublicClient({
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
    })

    // Check if market exists on-chain
    const exists = await publicClient.readContract({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'marketExists',
      args: [handle],
    }) as boolean

    if (!exists) {
      return NextResponse.json(
        { error: `Market for @${handle} doesn't exist yet. Someone needs to buy claws first to create the market, then you can verify.` },
        { status: 400 }
      )
    }

    // Check if already verified on-chain
    const market = await publicClient.readContract({
      address: contractAddress,
      abi: CLAWS_ABI,
      functionName: 'getMarket',
      args: [handle],
    }) as readonly [bigint, bigint, bigint, bigint, `0x${string}`, boolean, bigint, bigint]

    if (market[5]) { // isVerified
      return NextResponse.json({
        success: true,
        message: `@${handle} is already verified!`,
        alreadyVerified: true,
      })
    }

    // Generate EIP-712 signature for verifyAndClaim
    const timestamp = BigInt(Math.floor(Date.now() / 1000))
    const nonce = BigInt(Math.floor(Math.random() * 1000000000))
    
    // Sign using EIP-712 typed data
    // The contract's VERIFY_TYPEHASH is:
    //   keccak256("Verify(address wallet,string handle,uint256 timestamp,uint256 nonce)")
    // And the struct hash uses keccak256(bytes(handle)) for the string
    const signature = await verifierAccount.signTypedData({
      domain: CLAWS_DOMAIN,
      types: VERIFY_TYPES,
      primaryType: 'Verify',
      message: {
        wallet: walletAddress as `0x${string}`,
        handle: handle,
        timestamp: timestamp,
        nonce: nonce,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Signature generated. Please submit the verification transaction.`,
      verificationData: {
        handle,
        wallet: walletAddress,
        timestamp: timestamp.toString(),
        nonce: nonce.toString(),
        signature,
      },
      contractCall: {
        address: contractAddress,
        functionName: 'verifyAndClaim',
        args: [handle, walletAddress, timestamp.toString(), nonce.toString(), signature],
      },
    })

  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error.message },
      { status: 500 }
    )
  }
}
