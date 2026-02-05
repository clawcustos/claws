import { 
  createWalletClient, 
  http, 
  keccak256, 
  encodePacked,
  encodeAbiParameters,
  parseAbiParameters,
  Hex
} from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

/**
 * Proof Signer
 * 
 * Signs verification proofs that agents submit to the contract.
 * The contract verifies the signature matches the trusted verifier address.
 */

const VERIFIER_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY as `0x${string}`

interface VerificationProof {
  handle: string
  wallet: `0x${string}`
  timestamp: bigint
  nonce: bigint
  signature: Hex
}

/**
 * Generate a signed verification proof
 * 
 * This proof is submitted to the contract's verifyAndClaim() function.
 */
export async function generateVerificationProof(
  handle: string,
  wallet: `0x${string}`
): Promise<VerificationProof> {
  if (!VERIFIER_PRIVATE_KEY) {
    throw new Error('VERIFIER_PRIVATE_KEY not configured')
  }
  
  const account = privateKeyToAccount(VERIFIER_PRIVATE_KEY)
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  })
  
  const normalizedHandle = handle.toLowerCase().replace('@', '')
  const timestamp = BigInt(Math.floor(Date.now() / 1000))
  const nonce = BigInt(Math.floor(Math.random() * 1000000000))
  
  // Create message hash (must match contract's verification)
  const messageHash = keccak256(
    encodePacked(
      ['string', 'address', 'uint256', 'uint256'],
      [normalizedHandle, wallet, timestamp, nonce]
    )
  )
  
  // Sign the hash
  const signature = await walletClient.signMessage({
    message: { raw: messageHash },
  })
  
  return {
    handle: normalizedHandle,
    wallet,
    timestamp,
    nonce,
    signature,
  }
}

/**
 * Get the verifier address (for contract setup)
 */
export function getVerifierAddress(): `0x${string}` {
  if (!VERIFIER_PRIVATE_KEY) {
    throw new Error('VERIFIER_PRIVATE_KEY not configured')
  }
  
  const account = privateKeyToAccount(VERIFIER_PRIVATE_KEY)
  return account.address
}

/**
 * Encode proof for contract call
 */
export function encodeProofForContract(proof: VerificationProof): Hex {
  return encodeAbiParameters(
    parseAbiParameters('string handle, address wallet, uint256 timestamp, uint256 nonce, bytes signature'),
    [proof.handle, proof.wallet, proof.timestamp, proof.nonce, proof.signature]
  )
}
