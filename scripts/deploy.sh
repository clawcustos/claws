#!/bin/bash

# Claws Deployment Script

set -e

NETWORK=${1:-base-sepolia}

echo "🦞 Deploying Claws to $NETWORK..."

cd "$(dirname "$0")/../contracts"

# Load environment
if [ -f .env ]; then
  source .env
fi

if [ -z "$PRIVATE_KEY" ]; then
  echo "Error: PRIVATE_KEY not set"
  exit 1
fi

if [ -z "$PROTOCOL_FEE_DESTINATION" ]; then
  echo "Error: PROTOCOL_FEE_DESTINATION not set"
  exit 1
fi

# Deploy based on network
case $NETWORK in
  "base-sepolia")
    RPC_URL=${BASE_SEPOLIA_RPC_URL:-"https://sepolia.base.org"}
    ;;
  "base")
    RPC_URL=${BASE_RPC_URL:-"https://mainnet.base.org"}
    ;;
  *)
    echo "Unknown network: $NETWORK"
    exit 1
    ;;
esac

echo "RPC: $RPC_URL"
echo "Fee destination: $PROTOCOL_FEE_DESTINATION"

# Deploy
forge create src/Claws.sol:Claws \
  --rpc-url "$RPC_URL" \
  --private-key "$PRIVATE_KEY" \
  --constructor-args "$PROTOCOL_FEE_DESTINATION" \
  --verify

echo "✅ Deployment complete!"
