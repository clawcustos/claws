import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress } from 'viem'
import { 
  generateVerificationCode, 
  getExpectedTweetText 
} from '@/lib/verification-codes'

/**
 * POST /api/verify/start
 * 
 * Step 1: Generate verification code
 * User must be signed in with X OAuth
 * 
 * Body: { walletAddress: string }
 * Returns: { code, tweetText, expiresAt }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.twitterId || !session?.twitterUsername) {
      return NextResponse.json(
        { error: 'Not authenticated with X. Please sign in first.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { walletAddress } = body

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Generate verification code
    const { code, expiresAt } = generateVerificationCode(
      session.twitterUsername,
      walletAddress
    )
    
    const tweetText = getExpectedTweetText(walletAddress, code)

    return NextResponse.json({
      success: true,
      handle: session.twitterUsername,
      wallet: walletAddress,
      code,
      tweetText,
      expiresAt,
      expiresIn: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
    })

  } catch (error) {
    console.error('Start verification error:', error)
    return NextResponse.json(
      { error: 'Failed to start verification', details: String(error) },
      { status: 500 }
    )
  }
}
