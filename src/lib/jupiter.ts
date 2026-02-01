import { Connection, VersionedTransaction, Keypair, PublicKey } from '@solana/web3.js';
import { createJupiterApiClient } from '@jup-ag/api';

const jupiterApi = createJupiterApiClient();

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

export interface SwapResult {
  txid: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: string;
}

export class JupiterSwapEngine {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Get best swap quote from Jupiter aggregator
   */
  async getQuote(params: QuoteParams) {
    const { inputMint, outputMint, amount, slippageBps = 50 } = params;
    
    const quote = await jupiterApi.quoteGet({
      inputMint,
      outputMint,
      amount,
      slippageBps,
      onlyDirectRoutes: false,
      asLegacyTransaction: false,
    });
    
    if (!quote) {
      throw new Error('No route found');
    }

    console.log('📊 Jupiter Quote:', {
      inAmount: quote.inAmount,
      outAmount: quote.outAmount,
      priceImpact: quote.priceImpactPct,
      marketInfos: quote.routePlan.length,
    });

    return quote;
  }

  /**
   * Execute swap with Jupiter V6
   */
  async executeSwap(
    quote: any,
    userPublicKey: string,
    wallet: Keypair
  ): Promise<SwapResult> {
    
    // Get swap transaction
    const { swapTransaction } = await jupiterApi.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: 1000000,
      },
    });

    // Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Sign transaction
    transaction.sign([wallet]);

    // Send with retry logic
    const rawTransaction = transaction.serialize();
    
    let txid: string = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        txid = await this.connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          maxRetries: 2,
        });
        break;
      } catch (error: any) {
        if (attempt === 2) throw error;
        console.warn(`Attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Confirm with timeout
    await Promise.race([
      this.connection.confirmTransaction(txid, 'confirmed'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Confirmation timeout')), 30000)
      ),
    ]);

    console.log('✅ Jupiter swap confirmed:', txid);
    
    return {
      txid,
      inputAmount: quote.inAmount,
      outputAmount: quote.outAmount,
      priceImpact: quote.priceImpactPct,
    };
  }

  /**
   * Get token price in USD
   */
  async getTokenPrice(mintAddress: string): Promise<number> {
    try {
      const response = await fetch(
        `https://price.jup.ag/v4/price?ids=${mintAddress}`
      );
      const data = await response.json();
      return data.data[mintAddress]?.price || 0;
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      return 0;
    }
  }

  /**
   * Get supported tokens list
   */
  async getSupportedTokens(): Promise<any[]> {
    try {
      const response = await fetch('https://token.jup.ag/all');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [];
    }
  }
}

// Common token addresses
export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
};
