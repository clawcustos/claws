// The official ERC-8004 Identity Registry on Base
// NOTE: Address TBD - using placeholder until confirmed
export const ERC8004_REGISTRY_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

// Minimal ABI for read-only queries
export const ERC8004_REGISTRY_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'index', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'getAgentWallet',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'agentId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

// Registration file type (from ERC-8004 spec)
export interface ERC8004Registration {
  type: string;
  name: string;
  description: string;
  image?: string;
  services?: Array<{
    name: string;
    endpoint: string;
    version?: string;
  }>;
  x402Support?: boolean;
  active?: boolean;
  registrations?: Array<{
    agentId: number;
    agentRegistry: string;
  }>;
  supportedTrust?: string[];
}

// Zero address check helper
export function isZeroAddress(address: string): boolean {
  return address.toLowerCase() === '0x0000000000000000000000000000000000000000';
}

// Resolve IPFS URLs to HTTP gateway URLs
export function resolveTokenURI(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return uri;
}

// Parse base64 data URIs
export function parseDataURI(uri: string): string | null {
  if (!uri.startsWith('data:')) return null;
  
  const commaIndex = uri.indexOf(',');
  if (commaIndex === -1) return null;
  
  const base64Data = uri.slice(commaIndex + 1);
  try {
    return atob(base64Data);
  } catch {
    return null;
  }
}

// Fetch and parse registration JSON from tokenURI
export async function fetchRegistration(tokenURI: string): Promise<ERC8004Registration | null> {
  try {
    const resolvedURI = resolveTokenURI(tokenURI);
    
    // Handle base64 data URI
    if (resolvedURI.startsWith('data:')) {
      const json = parseDataURI(resolvedURI);
      if (!json) return null;
      return JSON.parse(json) as ERC8004Registration;
    }
    
    // Handle HTTP/HTTPS URL
    const response = await fetch(resolvedURI);
    if (!response.ok) return null;
    return (await response.json()) as ERC8004Registration;
  } catch {
    return null;
  }
}
