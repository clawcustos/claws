import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAddress } from 'viem'
import { 
  validateVerificationCode, 
  clearPendingVerification 
} from '@/lib/verification-codes'
import { 
  generateVerificationProof, 
  encodeProofForContract 
} from '@/lib/proof-signer'

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN

/**
 * POST /api/verify/complete
 * 
 * Step 3: Complete verification - generate signed proof for contract
 * 
 * Body: { walletAddress: string, code: string }
 * Returns: { proof, encodedProof }
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

    // Validate code
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

    // Verify tweet exists one more time
    const tweetFound = await findVerificationTweet(
      session.twitterId,
      walletAddress,
      code
    )

    if (!tweetFound) {
      return NextResponse.json(
        { error: 'Verification tweet not found. Please post the tweet first.' },
        { status: 400 }
      )
    }

    // Generate signed proof for contract
    const proof = await generateVerificationProof(
      session.twitterUsername,
      walletAddress as `0x${string}`
    )

    const encodedProof = encodeProofForContract(proof)

    // Clear pending verification (one-time use)
    clearPendingVerification(session.twitterUsername, walletAddress)

    return NextResponse.json({
      success: true,
      handle: session.twitterUsername,
      wallet: walletAddress,
      proof: {
        handle: proof.handle,
        wallet: proof.wallet,
        timestamp: proof.timestamp.toString(),
        nonce: proof.nonce.toString(),
        signature: proof.signature,
      },
      encodedProof,
      contractCall: {
        function: 'verifyAndClaim(string,bytes)',
        args: [session.twitterUsername, encodedProof],
        description: 'Submit this to the Claws contract to bind your wallet and claim fees',
      },
    })

  } catch (error) {
    console.error('Complete verification error:', error)
    return NextResponse.json(
      { error: 'Failed to complete verification', details: String(error) },
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
