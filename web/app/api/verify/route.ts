import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { addVerifiedAgent, isAgentVerified } from '@/lib/verifier'
import { isAddress } from 'viem'

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

/**
 * POST /api/verify
 * 
 * Body: { walletAddress: string }
 * 
 * Flow:
 * 1. User must be signed in with Twitter
 * 2. User provides their wallet address
 * 3. We check if they've tweeted their wallet address
 * 4. If valid, we call the contract to verify them
 */
export async function POST(req: NextRequest) {
  try {
    // Check auth
    const session = await auth()
    if (!session?.twitterId || !session?.twitterUsername) {
      return NextResponse.json(
        { error: 'Not authenticated with Twitter' },
        { status: 401 }
      )
    }

    // Get wallet address from body
    const body = await req.json()
    const { walletAddress } = body

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    // Check if already verified
    const alreadyVerified = await isAgentVerified(walletAddress as `0x${string}`)
    if (alreadyVerified) {
      return NextResponse.json(
        { error: 'Agent already verified', alreadyVerified: true },
        { status: 400 }
      )
    }

    // Search for verification tweet
    const tweetFound = await findVerificationTweet(
      session.twitterId,
      session.twitterUsername,
      walletAddress
    )

    if (!tweetFound) {
      return NextResponse.json(
        { 
          error: 'Verification tweet not found',
          instructions: `Tweet: "Verifying my wallet ${walletAddress} on @claws_tech" from @${session.twitterUsername}`,
        },
        { status: 400 }
      )
    }

    // Call contract to verify
    const txHash = await addVerifiedAgent(
      walletAddress as `0x${string}`,
      session.twitterUsername,
      '' // moltbookId - empty for now
    )

    return NextResponse.json({
      success: true,
      txHash,
      agent: walletAddress,
      xHandle: session.twitterUsername,
    })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/verify?wallet=0x...
 * 
 * Check verification status for a wallet
 */
export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get('wallet')
    
    if (!wallet || !isAddress(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    const verified = await isAgentVerified(wallet as `0x${string}`)
    
    return NextResponse.json({ wallet, verified })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Status check failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Search user's recent tweets for verification message
 */
async function findVerificationTweet(
  userId: string,
  username: string,
  walletAddress: string
): Promise<boolean> {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn('TWITTER_BEARER_TOKEN not set, skipping tweet verification')
    // In development, we might want to skip this check
    return process.env.NODE_ENV === 'development'
  }

  try {
    // Search user's recent tweets
    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=text`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Twitter API error:', await response.text())
      return false
    }

    const data = await response.json()
    const tweets = data.data || []

    // Check if any tweet contains the wallet address
    const walletLower = walletAddress.toLowerCase()
    for (const tweet of tweets) {
      const text = tweet.text.toLowerCase()
      if (text.includes(walletLower) && text.includes('verif')) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Tweet search error:', error)
    return false
  }
}
