#!/bin/bash

# Triton Privacy - Devnet Deployment Script
# For Solana Privacy Hack 2026

set -e

echo "🚀 Triton Privacy - Devnet Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install with: sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
fi
echo -e "${GREEN}✅ Solana CLI found${NC}"

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    echo "Install with: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    exit 1
fi
echo -e "${GREEN}✅ Anchor CLI found${NC}"

if ! command -v rustc &> /dev/null; then
    echo -e "${RED}❌ Rust not found${NC}"
    echo "Install with: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi
echo -e "${GREEN}✅ Rust found${NC}"

echo ""

# Configure Solana
echo "⚙️  Configuring Solana for devnet..."
solana config set --url devnet
echo -e "${GREEN}✅ Configured for devnet${NC}"
echo ""

# Check balance
echo "💰 Checking SOL balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance, requesting airdrop...${NC}"
    solana airdrop 2 || echo -e "${YELLOW}⚠️  Airdrop failed, you may need to wait and try again${NC}"
    sleep 2
    solana airdrop 2 || echo -e "${YELLOW}⚠️  Second airdrop failed${NC}"
fi
echo ""

# Build program
echo "🔨 Building Anchor program..."
anchor build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Get program ID
echo "🔑 Getting program ID..."
PROGRAM_ID=$(anchor keys list | grep triton_privacy | awk '{print $2}')
echo "Program ID: $PROGRAM_ID"
echo ""

# Check if program ID needs updating in lib.rs
echo "📝 Checking program ID in lib.rs..."
CURRENT_ID=$(grep "declare_id!" programs/triton-privacy/src/lib.rs | sed 's/.*"\(.*\)".*/\1/')

if [ "$CURRENT_ID" != "$PROGRAM_ID" ]; then
    echo -e "${YELLOW}⚠️  Program ID mismatch, updating...${NC}"
    sed -i "s/declare_id!(\".*\")/declare_id!(\"$PROGRAM_ID\")/" programs/triton-privacy/src/lib.rs
    echo -e "${GREEN}✅ Updated program ID in lib.rs${NC}"
    
    echo "🔨 Rebuilding with correct program ID..."
    anchor build
    echo -e "${GREEN}✅ Rebuild complete${NC}"
else
    echo -e "${GREEN}✅ Program ID already correct${NC}"
fi
echo ""

# Deploy
echo "🚀 Deploying to devnet..."
anchor deploy --provider.cluster devnet
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""

# Update .env.local
echo "📝 Updating .env.local..."
if [ -f .env.local ]; then
    # Update existing file
    if grep -q "NEXT_PUBLIC_PROGRAM_ID" .env.local; then
        sed -i "s/NEXT_PUBLIC_PROGRAM_ID=.*/NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID/" .env.local
    else
        echo "NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID" >> .env.local
    fi
else
    # Create new file
    cp .env.example .env.local
    sed -i "s/NEXT_PUBLIC_PROGRAM_ID=.*/NEXT_PUBLIC_PROGRAM_ID=$PROGRAM_ID/" .env.local
fi
echo -e "${GREEN}✅ Updated .env.local${NC}"
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
solana program show $PROGRAM_ID --url devnet
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}🎉 Deployment Successful!${NC}"
echo "======================================"
echo ""
echo "📋 Deployment Details:"
echo "  Program ID: $PROGRAM_ID"
echo "  Network: Devnet"
echo "  Solscan: https://solscan.io/account/$PROGRAM_ID?cluster=devnet"
echo ""
echo "🔗 Next Steps:"
echo "  1. Start frontend: bun dev"
echo "  2. Connect wallet (set to devnet)"
echo "  3. Test compliance check"
echo "  4. Test private swap"
echo "  5. Deploy frontend: vercel --prod"
echo ""
echo "📚 Documentation:"
echo "  - HACKATHON_DEPLOY.md - Full deployment guide"
echo "  - DEPLOYMENT.md - Production deployment"
echo "  - README.md - Project overview"
echo ""
