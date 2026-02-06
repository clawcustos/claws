import { NextRequest, NextResponse } from 'next/server'

// Cache validated handles for 1 hour (avoid rate limits)
const cache = new Map<string, { data: HandleInfo; ts: number }>()
const CACHE_TTL = 3600_000 // 1 hour

interface HandleInfo {
  exists: boolean
  handle: string
  displayName: string | null
  bio: string | null
  followers: number | null
  avatar: string | null
  verified: boolean
}

/**
 * GET /api/validate-handle?handle=xxx
 * 
 * Checks if an X/Twitter handle exists and returns basic profile info.
 * Uses the public X API (no auth required for basic lookups).
 * Cached for 1 hour per handle.
 */
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')?.replace(/^@/, '').trim().toLowerCase()

  if (!handle) {
    return NextResponse.json({ error: 'handle parameter required' }, { status: 400 })
  }

  if (!/^[a-zA-Z0-9_]{1,15}$/.test(handle)) {
    return NextResponse.json({ error: 'Invalid handle format' }, { status: 400 })
  }

  // Check cache
  const cached = cache.get(handle)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  }

  try {
    const info = await lookupHandle(handle)
    cache.set(handle, { data: info, ts: Date.now() })

    // Prune cache if it gets too big
    if (cache.size > 5000) {
      const cutoff = Date.now() - CACHE_TTL
      for (const [key, val] of cache) {
        if (val.ts < cutoff) cache.delete(key)
      }
    }

    return NextResponse.json(info, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error) {
    console.error('Handle validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate handle', exists: false, handle },
      { status: 500 }
    )
  }
}

// App-only bearer token cache (generated from client credentials)
let appBearerToken: string | null = null
let appBearerExpiry = 0

async function getAppBearerToken(): Promise<string | null> {
  // Check explicit env var first
  if (process.env.TWITTER_BEARER_TOKEN) return process.env.TWITTER_BEARER_TOKEN
  
  // Return cached token if still valid
  if (appBearerToken && Date.now() < appBearerExpiry) return appBearerToken
  
  // Generate from client credentials (OAuth 2.0 Client Credentials flow)
  const clientId = process.env.TWITTER_CLIENT_ID
  const clientSecret = process.env.TWITTER_CLIENT_SECRET
  if (!clientId || !clientSecret) return null
  
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const res = await fetch('https://api.twitter.com/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    if (data.access_token) {
      appBearerToken = data.access_token
      appBearerExpiry = Date.now() + 3600_000 // Cache 1 hour
      return appBearerToken
    }
  } catch (e) {
    console.error('Failed to get app bearer token:', e)
  }
  
  return null
}

async function lookupHandle(handle: string): Promise<HandleInfo> {
  const notFound: HandleInfo = {
    exists: false,
    handle,
    displayName: null,
    bio: null,
    followers: null,
    avatar: null,
    verified: false,
  }

  // Try Twitter API v2 (bearer token — explicit or generated from client creds)
  const bearerToken = await getAppBearerToken()
  if (bearerToken) {
    try {
      const res = await fetch(
        `https://api.twitter.com/2/users/by/username/${handle}?user.fields=description,public_metrics,profile_image_url,verified`,
        {
          headers: { Authorization: `Bearer ${bearerToken}` },
          next: { revalidate: 3600 },
        }
      )

      if (res.status === 404 || res.status === 400) return notFound

      // If 401/403, token might be invalid — clear cache
      if (res.status === 401 || res.status === 403) {
        appBearerToken = null
        appBearerExpiry = 0
        // Fall through to fallback
      } else if (res.ok) {
        const json = await res.json()
        if (json.errors?.some((e: any) => e.title === 'Not Found Error')) return notFound
        if (!json.data) return notFound

        const user = json.data
        return {
          exists: true,
          handle: user.username,
          displayName: user.name || null,
          bio: user.description || null,
          followers: user.public_metrics?.followers_count ?? null,
          avatar: user.profile_image_url?.replace('_normal', '_200x200') || null,
          verified: user.verified || false,
        }
      }
    } catch (e) {
      console.error('Twitter API v2 error:', e)
    }
  }

  // Fallback: scrape-based check via public page
  try {
    const res = await fetch(`https://x.com/${handle}`, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ClawsBot/1.0)',
      },
    })

    // 200 = exists, 302 = exists (redirect), 404 = doesn't exist
    if (res.status === 200 || res.status === 302) {
      return {
        exists: true,
        handle,
        displayName: null,
        bio: null,
        followers: null,
        avatar: null,
        verified: false,
      }
    }

    return notFound
  } catch (e) {
    console.error('Fallback check error:', e)
    return notFound
  }
}
