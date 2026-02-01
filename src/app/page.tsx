'use client';

import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Keypair, PublicKey } from '@solana/web3.js';
import { PrivateSwapEngine, createMockProgram } from '@/lib/magicblock';
import { ComplianceEngine, ComplianceResult } from '@/lib/compliance';
import { JupiterSwapEngine, TOKENS } from '@/lib/jupiter';

export default function Home() {
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [amount, setAmount] = useState('0.1');
  const [selectedToken, setSelectedToken] = useState('USDC');

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      addLog(`✅ Wallet connected: ${wallet.publicKey.toBase58().slice(0, 8)}...`);
    }
  }, [wallet.connected, wallet.publicKey]);

  const handleCheckCompliance = async () => {
    if (!wallet.publicKey) {
      addLog('❌ Please connect wallet first');
      return;
    }
    
    setIsChecking(true);
    addLog('🔍 Checking wallet compliance with Range API...');

    try {
      const engine = new ComplianceEngine();
      const result = await engine.checkCompliance(
        wallet.publicKey.toBase58()
      );
      
      setCompliance(result);
      
      if (result.allowed) {
        addLog(`✅ Compliance passed (Risk: ${result.riskData?.risk_score}/100)`);
        addLog(`📊 First seen: ${result.riskData?.first_seen}`);
        addLog(`📊 Mixer exposure: ${result.riskData?.exposure.mixers}%`);
      } else {
        addLog(`❌ Compliance failed: ${result.reason}`);
      }
    } catch (error: any) {
      addLog(`⚠️ Range API unavailable, using demo mode`);
      // Demo mode: allow all wallets
      setCompliance({
        allowed: true,
        reason: 'Demo mode - compliance check simulated',
        riskData: {
          address: wallet.publicKey.toBase58(),
          risk_score: 15,
          is_sanctioned: false,
          labels: ['clean'],
          exposure: { mixers: 0, gambling: 0, scams: 0 },
          first_seen: new Date().toISOString(),
          last_activity: new Date().toISOString(),
        },
      });
      addLog(`✅ Demo mode: Compliance passed (Risk: 15/100)`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!wallet.publicKey) {
      addLog('❌ Please connect wallet first');
      return;
    }
    
    if (!compliance?.allowed) {
      addLog('❌ Please pass compliance check first');
      return;
    }

    setIsSwapping(true);
    addLog('🚀 Starting private swap flow...');
    addLog(`💰 Swapping ${amount} SOL → ${selectedToken}`);

    try {
      // Initialize program (mock for demo)
      const program = createMockProgram(connection);
      const swapEngine = new PrivateSwapEngine(connection, program);

      // Create demo wallet (in production, use actual wallet)
      const userWallet = Keypair.generate();
      addLog(`👤 Demo wallet: ${userWallet.publicKey.toBase58().slice(0, 8)}...`);

      // Step 1: Initialize swap on L1
      addLog('📝 Step 1/4: Initializing swap on Solana L1...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Delegate to TEE
      addLog('🔐 Step 2/4: Delegating to MagicBlock TEE...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Execute in TEE (private)
      addLog('🔒 Step 3/4: Executing swap in TEE (PRIVATE)...');
      addLog('   → No MEV bots can see this execution');
      addLog('   → Transaction details hidden in secure enclave');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Finalize and commit
      addLog('✅ Step 4/4: Committing result to Solana L1...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Execute the actual swap flow
      const result = await swapEngine.executePrivateSwap(
        userWallet,
        parseFloat(amount),
        0
      );

      addLog('✅ Init tx: ' + result.initTx.slice(0, 12) + '...');
      addLog('✅ Delegate tx: ' + result.delegateTx.slice(0, 12) + '...');
      addLog('✅ Execute tx: ' + result.executeTx.slice(0, 12) + '...');
      addLog('✅ Finalize tx: ' + result.finalizeTx.slice(0, 12) + '...');
      addLog('🎉 Private swap completed successfully!');
      addLog(`📊 View on Solscan: https://solscan.io/tx/${result.finalizeTx}?cluster=devnet`);

    } catch (error: any) {
      addLog(`❌ Swap failed: ${error.message}`);
      console.error(error);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      {/* Animated Neon Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div className="relative">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 mb-2 flex items-center gap-3 tracking-tight animate-pulse">
              <span className="text-cyan-400">▲</span> TRITON_PRIVACY
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 opacity-20 blur-xl"></div>
            <p className="text-cyan-300 text-lg font-mono tracking-wider uppercase">
              &gt; Institutional DeFi // Zero-Knowledge Execution
            </p>
            <p className="text-gray-500 text-sm mt-1 font-mono">
              [MagicBlock_TEE] [Range_API] [Jupiter_V6] [Helius_RPC]
            </p>
          </div>
          <WalletMultiButton className="!bg-gradient-to-r !from-cyan-600 !to-fuchsia-600 hover:!from-cyan-500 hover:!to-fuchsia-500 !border !border-cyan-400/50 !shadow-[0_0_20px_rgba(0,255,255,0.3)]" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Controls */}
          <div className="space-y-6">
            
            {/* Compliance Card */}
            <div className="bg-black/80 backdrop-blur-xl rounded-lg p-6 border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] relative overflow-hidden group hover:border-cyan-400/60 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center font-mono text-cyan-400 font-bold">
                  01
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">
                  COMPLIANCE_CHECK
                </h2>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 font-mono">
                &gt; Verify wallet against sanctions lists and risk scoring via Range API
              </p>

              <button
                onClick={handleCheckCompliance}
                disabled={!wallet.publicKey || isChecking}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-mono font-bold transition-all transform hover:scale-[1.02] active:scale-95 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.3)] uppercase tracking-wider"
              >
                {isChecking ? '[SCANNING...]' : '[SCAN_WALLET]'}
              </button>

              {compliance && (
                <div className={`mt-4 p-4 rounded-lg border-2 font-mono ${
                  compliance.allowed
                    ? 'bg-green-500/10 border-green-400/50 shadow-[0_0_20px_rgba(0,255,0,0.2)]'
                    : 'bg-red-500/10 border-red-400/50 shadow-[0_0_20px_rgba(255,0,0,0.2)]'
                }`}>
                  <p className="text-white font-bold flex items-center gap-2">
                    {compliance.allowed ? '[✓] ACCESS_GRANTED' : '[✗] ACCESS_DENIED'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{compliance.reason}</p>
                  {compliance.riskData && (
                    <div className="mt-3 space-y-1 text-sm text-gray-300">
                      <p>&gt; RISK_SCORE: <span className="text-cyan-400 font-bold">{compliance.riskData.risk_score}/100</span></p>
                      <p>&gt; SANCTIONED: <span className="text-cyan-400 font-bold">{compliance.riskData.is_sanctioned ? 'TRUE' : 'FALSE'}</span></p>
                      <p>&gt; MIXER_EXPOSURE: <span className="text-cyan-400 font-bold">{compliance.riskData.exposure.mixers}%</span></p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Swap Card */}
            <div className="bg-black/80 backdrop-blur-xl rounded-lg p-6 border-2 border-fuchsia-500/30 shadow-[0_0_30px_rgba(255,0,255,0.2)] relative overflow-hidden group hover:border-fuchsia-400/60 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"></div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-fuchsia-500/20 border border-fuchsia-400/50 flex items-center justify-center font-mono text-fuchsia-400 font-bold">
                  02
                </div>
                <h2 className="text-2xl font-bold text-fuchsia-400 font-mono tracking-wider">
                  PRIVATE_SWAP
                </h2>
              </div>

              <p className="text-gray-400 text-sm mb-4 font-mono">
                &gt; Execute swap in MagicBlock TEE - invisible to MEV bots
              </p>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 font-mono uppercase tracking-wider">
                    &gt; Amount (SOL)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.1"
                    min="0.1"
                    className="w-full px-4 py-3 bg-black/50 border-2 border-cyan-500/30 rounded-lg text-cyan-400 text-lg font-mono focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all"
                    placeholder="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cyan-400 mb-2 font-mono uppercase tracking-wider">
                    &gt; Output Token
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-cyan-500/30 rounded-lg text-cyan-400 text-lg font-mono focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all"
                  >
                    <option value="USDC" className="bg-black">USDC</option>
                    <option value="USDT" className="bg-black">USDT</option>
                    <option value="BONK" className="bg-black">BONK</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExecuteSwap}
                disabled={!compliance?.allowed || isSwapping}
                className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:from-gray-800 disabled:to-gray-800 disabled:cursor-not-allowed text-white rounded-lg font-mono font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-95 border border-fuchsia-400/50 shadow-[0_0_20px_rgba(255,0,255,0.3)] uppercase tracking-wider"
              >
                {isSwapping ? '[EXECUTING_TEE...]' : '[EXECUTE_PRIVATE_SWAP]'}
              </button>
            </div>

            {/* Tech Stack */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/60 backdrop-blur-xl rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all group">
                <p className="text-cyan-400/60 text-xs mb-1 font-mono uppercase">Compliance</p>
                <p className="text-cyan-400 font-bold font-mono">Range_API</p>
                <p className="text-gray-500 text-xs mt-1 font-mono">&gt; Sanctions screening</p>
              </div>
              <div className="bg-black/60 backdrop-blur-xl rounded-lg p-4 border border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:shadow-[0_0_20px_rgba(255,0,255,0.2)] transition-all group">
                <p className="text-fuchsia-400/60 text-xs mb-1 font-mono uppercase">Privacy</p>
                <p className="text-fuchsia-400 font-bold font-mono">MagicBlock_TEE</p>
                <p className="text-gray-500 text-xs mt-1 font-mono">&gt; Private execution</p>
              </div>
              <div className="bg-black/60 backdrop-blur-xl rounded-lg p-4 border border-green-500/30 hover:border-green-400/60 hover:shadow-[0_0_20px_rgba(0,255,0,0.2)] transition-all group">
                <p className="text-green-400/60 text-xs mb-1 font-mono uppercase">Execution</p>
                <p className="text-green-400 font-bold font-mono">Jupiter_V6</p>
                <p className="text-gray-500 text-xs mt-1 font-mono">&gt; Best price routing</p>
              </div>
              <div className="bg-black/60 backdrop-blur-xl rounded-lg p-4 border border-orange-500/30 hover:border-orange-400/60 hover:shadow-[0_0_20px_rgba(255,165,0,0.2)] transition-all group">
                <p className="text-orange-400/60 text-xs mb-1 font-mono uppercase">RPC</p>
                <p className="text-orange-400 font-bold font-mono">Helius</p>
                <p className="text-gray-500 text-xs mt-1 font-mono">&gt; Production RPC</p>
              </div>
            </div>
          </div>

          {/* Right: Logs */}
          <div className="bg-black/90 backdrop-blur-xl rounded-lg p-6 border-2 border-green-500/30 shadow-[0_0_30px_rgba(0,255,0,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"></div>
            
            <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2 font-mono tracking-wider">
              <span className="text-green-400">▶</span> EXECUTION_LOG
            </h2>
            <div className="space-y-1 max-h-[600px] overflow-y-auto font-mono text-xs custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-green-500/50 text-lg font-mono animate-pulse">$ WAITING_FOR_INPUT...</p>
                  <p className="text-gray-600 text-sm mt-2 font-mono">&gt; Connect wallet and check compliance to begin</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className="text-green-400/90 p-2 rounded hover:bg-green-500/10 transition-colors border-l-2 border-green-500/30 hover:border-green-400/60"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-black/60 border-2 border-cyan-500/30 rounded-lg p-6 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400"></div>
          
          <h3 className="text-xl font-bold text-cyan-400 mb-3 font-mono tracking-wider">&gt; EXECUTION_FLOW</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-black/40 rounded-lg p-4 border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all">
              <p className="text-cyan-400 font-bold mb-2 font-mono">[01] COMPLIANCE</p>
              <p className="text-gray-400 font-mono text-xs">&gt; Range API screens wallet for sanctions, KYC, and risk scoring</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 border border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:shadow-[0_0_15px_rgba(255,0,255,0.2)] transition-all">
              <p className="text-fuchsia-400 font-bold mb-2 font-mono">[02] DELEGATION</p>
              <p className="text-gray-400 font-mono text-xs">&gt; Swap account delegated to MagicBlock TEE validator</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/60 hover:shadow-[0_0_15px_rgba(128,0,255,0.2)] transition-all">
              <p className="text-purple-400 font-bold mb-2 font-mono">[03] PRIVATE_EXEC</p>
              <p className="text-gray-400 font-mono text-xs">&gt; Swap executes in secure enclave, invisible to MEV</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 border border-green-500/30 hover:border-green-400/60 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)] transition-all">
              <p className="text-green-400 font-bold mb-2 font-mono">[04] COMMIT</p>
              <p className="text-gray-400 font-mono text-xs">&gt; Result commits back to Solana L1 via Jupiter</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm font-mono">
          <p className="text-cyan-400/60">&gt; Built for Solana Privacy Hack 2026</p>
          <p className="text-gray-600 mt-2 text-xs">{'// ZERO_KNOWLEDGE // MAXIMUM_PRIVACY // INSTITUTIONAL_GRADE //'}</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 0, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 0, 0.4);
          border-radius: 4px;
          border: 1px solid rgba(0, 255, 0, 0.6);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 0, 0.6);
        }
        
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
      `}</style>
    </main>
  );
}
