import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress } from 'viem'
import { validateVerificationCode } from '@/lib/verification-codes'

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

/**
 * POST /api/verify/check
 * 
 * Step 2: Check if verification tweet exists
 * 
 * Body: { walletAddress: string, code: string }
 * Returns: { found: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.twitterId || !session?.twitterUsername) {
      return NextResponse.json(
        { error: 'Not authenticated with X' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { walletAddress, code } = body

    if (!walletAddress || !isAddress(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code required' },
        { status: 400 }
      )
    }

    // Validate code hasn't expired
    const validCode = validateVerificationCode(
      session.twitterUsername,
      walletAddress,
      code
    )

    if (!validCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please start over.' },
        { status: 400 }
      )
    }

    // Search for tweet
    const tweetFound = await findVerificationTweet(
      session.twitterId,
      walletAddress,
      code
    )

    return NextResponse.json({
      success: true,
      found: tweetFound,
      handle: session.twitterUsername,
      message: tweetFound 
        ? 'Tweet verified! You can now complete verification.'
        : 'Tweet not found. Make sure you posted with the correct wallet and code.',
    })

  } catch (error) {
    console.error('Check tweet error:', error)
    return NextResponse.json(
      { error: 'Failed to check tweet', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Search user's recent tweets for verification message
 */
async function findVerificationTweet(
  userId: string,
  walletAddress: string,
  code: string
): Promise<boolean> {
  // Development mode bypass
  if (process.env.NODE_ENV === 'development' && !TWITTER_BEARER_TOKEN) {
    console.warn('DEV MODE: Skipping tweet verification')
    return true
  }

  if (!TWITTER_BEARER_TOKEN) {
    throw new Error('TWITTER_BEARER_TOKEN not configured')
  }

  try {
    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=text`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twitter API error:', errorText)
      throw new Error(`Twitter API error: ${response.status}`)
    }

    const data = await response.json()
    const tweets = data.data || []

    // Check for tweet containing wallet AND code
    const walletLower = walletAddress.toLowerCase()
    const codeLower = code.toLowerCase()
    
    for (const tweet of tweets) {
      const text = tweet.text.toLowerCase()
      if (text.includes(walletLower) && text.includes(codeLower)) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Tweet search error:', error)
    throw error
  }
}
