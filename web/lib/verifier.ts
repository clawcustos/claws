import { createWalletClient, createPublicClient, http, parseAbi } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Contract ABI (only the functions we need)
const CLAWS_ABI = parseAbi([
  'function addSourceVerifiedAgent(address agent, string xHandle, string moltbookId) external',
  'function sourceVerified(address) external view returns (bool)',
  'function verifier() external view returns (address)',
])

// Get contract address from env
const CLAWS_CONTRACT = process.env.CLAWS_CONTRACT_ADDRESS as `0x${string}`
const VERIFIER_PRIVATE_KEY = process.env.VERIFIER_PRIVATE_KEY as `0x${string}`

// Create clients
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
})

function getWalletClient() {
  if (!VERIFIER_PRIVATE_KEY) {
    throw new Error('VERIFIER_PRIVATE_KEY not set')
  }
  const account = privateKeyToAccount(VERIFIER_PRIVATE_KEY)
  return createWalletClient({
    account,
    chain: base,
    transport: http(),
  })
}

/**
 * Check if an agent is already source-verified
 */
export async function isAgentVerified(agentAddress: `0x${string}`): Promise<boolean> {
  if (!CLAWS_CONTRACT) {
    throw new Error('CLAWS_CONTRACT_ADDRESS not set')
  }
  
  const verified = await publicClient.readContract({
    address: CLAWS_CONTRACT,
    abi: CLAWS_ABI,
    functionName: 'sourceVerified',
    args: [agentAddress],
  })
  
  return verified
}

/**
 * Add a source-verified agent (call from backend after X verification)
 */
export async function addVerifiedAgent(
  agentAddress: `0x${string}`,
  xHandle: string,
  moltbookId: string = ''
): Promise<`0x${string}`> {
  if (!CLAWS_CONTRACT) {
    throw new Error('CLAWS_CONTRACT_ADDRESS not set')
  }
  
  const walletClient = getWalletClient()
  
  const hash = await walletClient.writeContract({
    address: CLAWS_CONTRACT,
    abi: CLAWS_ABI,
    functionName: 'addSourceVerifiedAgent',
    args: [agentAddress, xHandle, moltbookId],
  })
  
  // Wait for confirmation
  await publicClient.waitForTransactionReceipt({ hash })
  
  return hash
}

/**
 * Get the current verifier address
 */
export async function getVerifierAddress(): Promise<`0x${string}`> {
  if (!CLAWS_CONTRACT) {
    throw new Error('CLAWS_CONTRACT_ADDRESS not set')
  }
  
  const verifier = await publicClient.readContract({
    address: CLAWS_CONTRACT,
    abi: CLAWS_ABI,
    functionName: 'verifier',
  })
  
  return verifier
}
