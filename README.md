# 🔱 Triton Privacy Solana (TPS)

### TPS with Privacy | The Water Clock of Privacy

> **Track:** Solana Privacy Hackathon (2026)
> **Category:** Compliance Infrastructure / Privacy Layer

---

## ⏳ The Paradox: Free vs. Expensive

> *"Information wants to be free. Information also wants to be expensive."*
> — **Stewart Brand**, 1984

For 36 years, the digital age failed to resolve this tension.

* **Information wants to be free** because the cost of copying it is vanishing (The internet, Blockchains).
* **Information wants to be expensive** because it is immensely valuable (Alpha, Strategy, Identity).

TradFi made it expensive but closed. Crypto-Anarchy made it free but chaotic.
**Triton Privacy Solana (TPS)** is the protocol that ticks between these two ideas. It is the **Third Power (Tritos)** that resolves the paradox.

---

## 🕰️ The Third Clock: Civilization is Maintenance

We are used to celebrating innovation, but Stewart Brand teaches us that *"Civilization is Maintenance."* Systems survive not because of disruption, but because of routine care.

Legacy privacy tools (like Tornado Cash) failed not because of code, but because they lacked **maintenance**—they had no mechanism to clean themselves of illicit actors.

**Triton is the Third Clock.**

1. **The Clock of the Long Now:** Inside a mountain, gears turn once a year. *(Civilizational Maintenance)*.
2. **The Clock of History (2020):** On Solana, the SHA-256 water clock ticks every 400ms. *(Network Consensus)*.
3. **The Clock of Privacy (2026):** In Triton, the clock ticks within the trade. It maintains the balance between "Free" (Public Verify) and "Expensive" (Private Execute).

---

## 💡 Solution

Triton Privacy enables **compliant private swaps** through a 4-layer architecture:

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│           TRITON PRIVACY SWAP TERMINAL                  │
└─────────────────────────────────────────────────────────┘

Layer 1: COMPLIANCE GATE (Range API)
├─ Pre-screen wallet for sanctions/KYC
├─ Block high-risk addresses (score > 70)
└─ API: https://api.range.org/v1/wallets/{address}/risk

Layer 2: PRIVATE EXECUTION (MagicBlock PER)
├─ Delegate swap account to TEE validator
├─ Execute swap in isolated TEE environment
├─ Commit result back to Solana L1
└─ Endpoint: https://tee.magicblock.app

Layer 3: LIQUIDITY ROUTING (Jupiter V6)
├─ Get best route via Jupiter API
├─ Execute swap with VersionedTransaction
└─ API: https://quote-api.jup.ag/v6

Layer 4: INFRASTRUCTURE (Helius RPC)
├─ Enhanced transaction delivery
├─ WebSocket subscriptions for updates
└─ RPC: https://devnet.helius-rpc.com
```

## 🏆 Sponsor Integration

| Sponsor | Technology | Bounty | Integration |
|---------|-----------|--------|-------------|
| **MagicBlock** | PER (TEE) | $5,000 | Private swap execution in secure enclave |
| **Range** | Compliance API | $1,500 | Sanctions screening & risk scoring |
| **Helius** | RPC Infrastructure | $5,000 | Enhanced transaction delivery |
| **Jupiter** | V6 Aggregator | Core | Best execution routing |

**Total Target:** $11,500+

## 🚀 Quick Start

### Prerequisites

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install Anchor (for Solana program)
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.32.1
avm use 0.32.1

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/triton-privacy
cd triton-privacy

# Install dependencies
bun install

# Setup Solana wallet
solana-keygen new --outfile ~/.config/solana/devnet.json
solana config set --url devnet
solana airdrop 2
```

### Environment Variables

Create `.env.local`:

```bash
# Helius RPC (get from https://helius.dev)
NEXT_PUBLIC_HELIUS_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_KEY

# Range API (get from https://range.org)
NEXT_PUBLIC_RANGE_API_KEY=your_range_api_key

# Program ID (after deployment)
NEXT_PUBLIC_PROGRAM_ID=your_program_id
```

### Deploy Anchor Program

```bash
# Build program
cd programs/triton-privacy
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Copy program ID to .env.local
anchor keys list
```

### Run Frontend

```bash
# Development
bun dev

# Production build
bun build
bun start
```

Visit `http://localhost:3000`

## 📖 How It Works

### User Flow

1. **Connect Wallet** → User connects Phantom/Solflare wallet
2. **Compliance Check** → Range API screens for sanctions/risk
3. **Configure Swap** → User sets amount and output token
4. **Private Execution** → Swap executes in MagicBlock TEE
5. **Commit to L1** → Result commits back to Solana

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Styling
- **Solana Wallet Adapter** - Wallet integration

### Blockchain
- **Anchor 0.32.1** - Solana program framework
- **Solana Web3.js** - Blockchain interaction
- **MagicBlock SDK** - TEE integration
- **Jupiter API** - Swap aggregation

### APIs
- **Range API** - Compliance & risk scoring
- **Helius RPC** - Enhanced Solana RPC
- **Jupiter V6** - Liquidity aggregation

## 📁 Project Structure

```
triton-privacy/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main application UI
│   │   ├── layout.tsx        # Root layout with wallet provider
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   └── WalletProvider.tsx # Wallet adapter setup
│   └── lib/
│       ├── compliance.ts     # Range API integration
│       ├── jupiter.ts        # Jupiter swap engine
│       └── magicblock.ts     # MagicBlock TEE client
├── programs/
│   └── triton-privacy/
│       ├── src/
│       │   └── lib.rs        # Anchor program
│       └── Cargo.toml        # Rust dependencies
├── package.json              # Node dependencies
└── README.md                 # This file
```

---

## 2026 Roadmap

### Phase 1: MVP (Current)
- [x] Range API integration
- [x] MagicBlock TEE client
- [x] Jupiter V6 integration
- [x] Basic UI/UX
- [x] Anchor program

### Phase 2: Production
- [ ] Full MagicBlock PER integration with Rust MXE
- [ ] Real Jupiter swap execution
- [ ] Multi-token support
- [ ] Slippage protection
- [ ] Transaction history

### Phase 3: Enterprise
- [ ] KYC/AML provider integration
- [ ] Institutional custody support
- [ ] Advanced order types
- [ ] Analytics dashboard
- [ ] API for programmatic access

## Team

Built by Amir @Jakisheff and Tina @Nonicknamehere for Solana Privacy Hack 2026

## Acknowledgments

- MagicBlock Labs for TEE infrastructure
- Range Protocol for compliance tools
- Jupiter Exchange for liquidity aggregation
- Helius for RPC infrastructure
- Solana Foundation for the hackathon

---

### License

MIT

> *Stay Hungry. Stay Foolish. Stay Private.*
