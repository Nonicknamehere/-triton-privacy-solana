# 🚀 Deployment Guide

Complete guide for deploying Triton Privacy to production.

## Prerequisites

- Solana CLI installed
- Anchor CLI installed (0.32.1)
- Bun installed
- Wallet with SOL for deployment

## Step 1: Deploy Anchor Program

### 1.1 Build Program

```bash
cd programs/triton-privacy
anchor build
```

### 1.2 Get Program ID

```bash
anchor keys list
# Output: triton_privacy: <PROGRAM_ID>
```

### 1.3 Update Program ID

Update in three places:

**programs/triton-privacy/src/lib.rs:**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**Anchor.toml:**
```toml
[programs.devnet]
triton_privacy = "YOUR_PROGRAM_ID_HERE"
```

**Rebuild after updating:**
```bash
anchor build
```

### 1.4 Deploy to Devnet

```bash
# Ensure you have SOL
solana balance
# If needed: solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show YOUR_PROGRAM_ID --url devnet
```

### 1.5 Deploy to Mainnet (Production)

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Ensure sufficient SOL (deployment costs ~5-10 SOL)
solana balance

# Deploy
anchor deploy --provider.cluster mainnet

# Verify
solana program show YOUR_PROGRAM_ID --url mainnet-beta
```

## Step 2: Configure Environment Variables

### 2.1 Get API Keys

**Helius RPC:**
1. Visit https://helius.dev
2. Create account
3. Create new project
4. Copy API key

**Range API:**
1. Visit https://range.org
2. Sign up for API access
3. Copy API key

### 2.2 Create .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NEXT_PUBLIC_HELIUS_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_RANGE_API_KEY=your_range_key
NEXT_PUBLIC_PROGRAM_ID=your_deployed_program_id
```

## Step 3: Deploy Frontend

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

### Option B: Self-Hosted

```bash
# Build
bun build

# Start production server
bun start

# Or use PM2 for process management
npm i -g pm2
pm2 start "bun start" --name triton-privacy
```

### Option C: Docker

```dockerfile
# Dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["bun", "start"]
```

```bash
# Build and run
docker build -t triton-privacy .
docker run -p 3000:3000 --env-file .env.local triton-privacy
```

## Step 4: Verify Deployment

### 4.1 Test Program

```bash
# Run test script
bun run test:program
```

### 4.2 Test Frontend

1. Visit your deployed URL
2. Connect wallet
3. Run compliance check
4. Execute test swap
5. Verify logs

### 4.3 Monitor

**Solana Program:**
```bash
# Check program logs
solana logs YOUR_PROGRAM_ID --url devnet
```

**Frontend:**
- Check Vercel logs
- Monitor browser console
- Check API responses

## Step 5: Production Checklist

### Security
- [ ] Program audited
- [ ] Environment variables secured
- [ ] Rate limiting implemented
- [ ] Error handling comprehensive
- [ ] Input validation on all endpoints

### Performance
- [ ] RPC endpoint optimized (Helius)
- [ ] Frontend bundle optimized
- [ ] Images optimized
- [ ] Caching configured
- [ ] CDN configured

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics (Plausible/Fathom)
- [ ] Uptime monitoring
- [ ] Transaction monitoring
- [ ] API usage tracking

### Compliance
- [ ] Range API integrated
- [ ] Terms of service
- [ ] Privacy policy
- [ ] User consent flows
- [ ] Data retention policy

## Troubleshooting

### Program Deployment Fails

```bash
# Check balance
solana balance

# Check program size
ls -lh target/deploy/triton_privacy.so

# If too large, optimize
anchor build --release
```

### Frontend Build Fails

```bash
# Clear cache
rm -rf .next node_modules
bun install
bun build
```

### RPC Issues

```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  YOUR_HELIUS_RPC
```

### Wallet Connection Issues

- Ensure wallet adapter is latest version
- Check browser console for errors
- Verify network matches (devnet/mainnet)
- Clear browser cache

## Maintenance

### Update Program

```bash
# Build new version
anchor build

# Upgrade program (requires upgrade authority)
anchor upgrade target/deploy/triton_privacy.so \
  --program-id YOUR_PROGRAM_ID \
  --provider.cluster devnet
```

### Update Frontend

```bash
# Pull latest changes
git pull

# Install dependencies
bun install

# Build and deploy
bun build
vercel --prod
```

## Cost Estimates

### Devnet (Free)
- Program deployment: Free (airdrop SOL)
- Transactions: Free
- Testing: Free

### Mainnet
- Program deployment: ~5-10 SOL
- Program rent: ~2 SOL/year
- Transaction fees: ~0.000005 SOL/tx
- Helius RPC: Free tier available
- Range API: Contact for pricing

## Support

- GitHub Issues: https://github.com/yourusername/triton-privacy/issues
- Discord: [Your Discord]
- Email: [Your Email]

---

**Last Updated:** 2026-01-31
