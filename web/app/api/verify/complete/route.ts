import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress, createPublicClient, http, keccak256, encodePacked, encodeAbiParameters, toBytes, toHex, concat } from 'viem'
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

/**
 * POST /api/verify/complete
 * 
 * Generate EIP-712 signed verification proof for agent verification.
 * 
 * EIP-712 field order (matching contract): handle, wallet, timestamp, nonce
 * TYPEHASH: "Verify(string handle,address wallet,uint256 timestamp,uint256 nonce)"
 * abi.encode: (TYPEHASH, keccak256(bytes(handle)), wallet, timestamp, nonce)
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

    // Read the DOMAIN_SEPARATOR from the contract to ensure exact match
    const domainSeparator = await publicClient.readContract({
      address: contractAddress,
      abi: [{
        inputs: [],
        name: 'DOMAIN_SEPARATOR',
        outputs: [{ name: '', type: 'bytes32' }],
        stateMutability: 'view',
        type: 'function',
      }],
      functionName: 'DOMAIN_SEPARATOR',
    }) as `0x${string}`

    // Generate verification params
    const timestamp = BigInt(Math.floor(Date.now() / 1000))
    const nonce = BigInt(Math.floor(Math.random() * 1000000000))
    
    // Construct the EXACT same digest the contract constructs:
    // VERIFY_TYPEHASH = keccak256("Verify(string handle,address wallet,uint256 timestamp,uint256 nonce)")
    const VERIFY_TYPEHASH = keccak256(
      toBytes("Verify(string handle,address wallet,uint256 timestamp,uint256 nonce)")
    )
    
    // structHash = keccak256(abi.encode(VERIFY_TYPEHASH, keccak256(bytes(handle)), wallet, timestamp, nonce))
    const handleHash = keccak256(toBytes(handle))
    
    const structHash = keccak256(
      encodeAbiParameters(
        [
          { name: 'typehash', type: 'bytes32' },
          { name: 'handleHash', type: 'bytes32' },
          { name: 'wallet', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
        ],
        [VERIFY_TYPEHASH, handleHash, walletAddress as `0x${string}`, timestamp, nonce]
      )
    )
    
    // digest = keccak256("\x19\x01" || DOMAIN_SEPARATOR || structHash)
    const digest = keccak256(
      concat([
        toHex(new Uint8Array([0x19, 0x01])),
        domainSeparator,
        structHash,
      ])
    )
    
    // Sign the raw digest directly (NOT signMessage which adds Ethereum prefix)
    // The contract uses ECDSA.recover on the EIP-712 digest directly
    const signature = await verifierAccount.sign({
      hash: digest,
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
