import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi, keccak256, toBytes } from 'viem'
import { base } from 'viem/chains'

const CLAWS_CONTRACT = process.env.CLAWS_CONTRACT_ADDRESS as `0x${string}`

const CLAWS_ABI = parseAbi([
  'function markets(bytes32 handleHash) external view returns (uint256 supply, uint256 pendingFees, uint256 lifetimeFees, address verifiedWallet, bool isVerified)',
])

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

/**
 * GET /api/verify?handle=username
 * 
 * Check verification status for an X handle
 */
export async function GET(req: NextRequest) {
  try {
    const handle = req.nextUrl.searchParams.get('handle')
    
    if (!handle) {
      return NextResponse.json(
        { error: 'Handle required. Use ?handle=username' },
        { status: 400 }
      )
    }

    const normalizedHandle = handle.toLowerCase().replace('@', '')
    
    // If no contract deployed yet, return unverified
    if (!CLAWS_CONTRACT) {
      return NextResponse.json({ 
        handle: normalizedHandle,
        verified: false,
        wallet: null,
        marketExists: false,
        message: 'Contract not deployed yet',
      })
    }

    // Hash the handle (must match contract's hashing)
    const handleHash = keccak256(toBytes(normalizedHandle))
    
    try {
      const market = await publicClient.readContract({
        address: CLAWS_CONTRACT,
        abi: CLAWS_ABI,
        functionName: 'markets',
        args: [handleHash],
      })

      const [supply, pendingFees, lifetimeFees, verifiedWallet, isVerified] = market

      return NextResponse.json({ 
        handle: normalizedHandle,
        verified: isVerified,
        wallet: isVerified ? verifiedWallet : null,
        marketExists: supply > 0n,
        supply: supply.toString(),
        pendingFees: pendingFees.toString(),
        lifetimeFees: lifetimeFees.toString(),
      })
    } catch (contractError) {
      // Contract call failed - likely no market exists
      return NextResponse.json({ 
        handle: normalizedHandle,
        verified: false,
        wallet: null,
        marketExists: false,
      })
    }

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Status check failed', details: String(error) },
      { status: 500 }
    )
  }
}
