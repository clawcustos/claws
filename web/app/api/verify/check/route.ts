import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress } from 'viem'

/**
 * POST /api/verify/check
 * 
 * Check if user posted the verification tweet
 * Uses their OAuth access token to fetch their own tweets
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.twitterId || !session?.twitterUsername || !session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with X. Please sign in again.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Verification code required' },
        { status: 400 }
      )
    }

    // Fetch user's recent tweets using their access token
    const tweetFound = await findVerificationTweet(
      session.twitterId,
      session.accessToken,
      code
    )

    return NextResponse.json({
      success: true,
      found: tweetFound,
      handle: session.twitterUsername,
      message: tweetFound 
        ? 'Tweet verified! You can now complete verification.'
        : 'Tweet not found. Make sure you posted the verification tweet.',
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
 * Search user's recent tweets for verification code
 */
async function findVerificationTweet(
  userId: string,
  accessToken: string,
  code: string
): Promise<boolean> {
  try {
    // Use user's access token to fetch their tweets
    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=text`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Twitter API error:', response.status, errorText)
      
      if (response.status === 401) {
        throw new Error('X session expired. Please sign in again.')
      }
      throw new Error(`Twitter API error: ${response.status}`)
    }

    const data = await response.json()
    const tweets = data.data || []

    // Look for tweet containing the verification code
    const codeLower = code.toLowerCase()
    
    for (const tweet of tweets) {
      const text = tweet.text.toLowerCase()
      if (text.includes(codeLower) && text.includes('claws')) {
        return true
      }
    }

    return false
  } catch (error) {
    console.error('Tweet search error:', error)
    throw error
  }
}
