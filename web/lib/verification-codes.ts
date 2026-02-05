import { keccak256, toBytes, encodePacked } from 'viem'

/**
 * Verification Code System
 * 
 * Generates unique codes for X verification flow.
 * Codes are deterministic based on handle + wallet + timestamp window.
 */

// Code validity window (15 minutes)
const CODE_VALIDITY_MS = 15 * 60 * 1000

// In-memory store for pending verifications
// In production, use Redis or database
const pendingVerifications = new Map<string, {
  handle: string
  wallet: string
  code: string
  createdAt: number
  expiresAt: number
}>()

/**
 * Generate a verification code for a handle + wallet pair
 */
export function generateVerificationCode(handle: string, wallet: string): {
  code: string
  expiresAt: number
} {
  const normalizedHandle = handle.toLowerCase().replace('@', '')
  const normalizedWallet = wallet.toLowerCase()
  
  // Create time window (rounds to 15-min intervals)
  const now = Date.now()
  const timeWindow = Math.floor(now / CODE_VALIDITY_MS)
  
  // Generate deterministic code
  const seed = keccak256(
    encodePacked(
      ['string', 'address', 'uint256', 'string'],
      [normalizedHandle, normalizedWallet as `0x${string}`, BigInt(timeWindow), process.env.NEXTAUTH_SECRET || 'dev-secret']
    )
  )
  
  // Take first 8 chars, make it readable
  const code = `CLAWS-${seed.slice(2, 10).toUpperCase()}`
  
  const expiresAt = (timeWindow + 1) * CODE_VALIDITY_MS
  
  // Store pending verification
  const key = `${normalizedHandle}:${normalizedWallet}`
  pendingVerifications.set(key, {
    handle: normalizedHandle,
    wallet: normalizedWallet,
    code,
    createdAt: now,
    expiresAt,
  })
  
  return { code, expiresAt }
}

/**
 * Validate a verification code
 */
export function validateVerificationCode(
  handle: string,
  wallet: string,
  code: string
): boolean {
  const normalizedHandle = handle.toLowerCase().replace('@', '')
  const normalizedWallet = wallet.toLowerCase()
  const key = `${normalizedHandle}:${normalizedWallet}`
  
  const pending = pendingVerifications.get(key)
  if (!pending) return false
  
  // Check expiry
  if (Date.now() > pending.expiresAt) {
    pendingVerifications.delete(key)
    return false
  }
  
  // Check code matches
  return pending.code === code.toUpperCase()
}

/**
 * Get pending verification for a handle
 */
export function getPendingVerification(handle: string, wallet: string) {
  const normalizedHandle = handle.toLowerCase().replace('@', '')
  const normalizedWallet = wallet.toLowerCase()
  const key = `${normalizedHandle}:${normalizedWallet}`
  
  const pending = pendingVerifications.get(key)
  if (!pending || Date.now() > pending.expiresAt) {
    return null
  }
  
  return pending
}

/**
 * Clear pending verification after success
 */
export function clearPendingVerification(handle: string, wallet: string) {
  const normalizedHandle = handle.toLowerCase().replace('@', '')
  const normalizedWallet = wallet.toLowerCase()
  const key = `${normalizedHandle}:${normalizedWallet}`
  pendingVerifications.delete(key)
}

/**
 * Generate the expected tweet text
 */
export function getExpectedTweetText(wallet: string, code: string): string {
  return `Claiming my @claws_tech market 🦞
Wallet: ${wallet}
Code: ${code}`
}
