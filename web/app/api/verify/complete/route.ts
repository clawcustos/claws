import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress, createWalletClient, http, createPublicClient, encodePacked, keccak256 } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'
import { CLAWS_ABI, getContractAddress } from '@/lib/contracts'

// Whitelisted agents
const WHITELISTED_AGENTS = [
  'clawcustos', 'bankrbot', 'moltbook', 'clawdbotatg', 'clawnch_bot',
  'KellyClaudeAI', 'starkbotai', 'moltenagentic', 'clawdvine', 'lobchanai',
  'LordClegg', 'KronosAgentAI', 'AgentScarlett', 'NigelBitcoin', 
  'MoonPengAgentX', 'agentjupiter', 'AIagent_Nova', 'loomlockai'
];

/**
 * POST /api/verify/complete
 * 
 * Verify an agent by generating a signed proof and calling the contract
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

    // Check whitelist
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

    // Check if already verified
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

    // Generate signature for verifyAndClaim
    const timestamp = BigInt(Math.floor(Date.now() / 1000))
    const nonce = BigInt(Math.floor(Math.random() * 1000000000))
    
    // Sign the message: keccak256(abi.encodePacked(handle, wallet, timestamp, nonce))
    const messageHash = keccak256(
      encodePacked(
        ['string', 'address', 'uint256', 'uint256'],
        [handle, walletAddress as `0x${string}`, timestamp, nonce]
      )
    )
    
    const signature = await verifierAccount.signMessage({
      message: { raw: messageHash },
    })

    // Now we need the user to call verifyAndClaim with this signature
    // Return the data they need
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
