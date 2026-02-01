// Production-grade Range API integration for compliance checks
const RANGE_API_KEY = process.env.NEXT_PUBLIC_RANGE_API_KEY || '';
const RANGE_BASE_URL = 'https://api.range.org/v1';

export interface RangeRiskAssessment {
  address: string;
  risk_score: number;
  is_sanctioned: boolean;
  labels: string[];
  exposure: {
    mixers: number;
    gambling: number;
    scams: number;
  };
  first_seen: string;
  last_activity: string;
}

export interface ComplianceResult {
  allowed: boolean;
  reason: string;
  riskData: RangeRiskAssessment | null;
}

export class ComplianceEngine {
  
  /**
   * Assess wallet risk using Range API
   */
  async assessWalletRisk(address: string): Promise<RangeRiskAssessment> {
    const response = await fetch(
      `${RANGE_BASE_URL}/wallets/${address}/risk`,
      {
        headers: {
          'Authorization': `Bearer ${RANGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Range API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Check if wallet passes compliance requirements
   */
  async checkCompliance(address: string): Promise<ComplianceResult> {
    
    try {
      const riskData = await this.assessWalletRisk(address);

      // Sanctions check (OFAC)
      if (riskData.is_sanctioned) {
        return {
          allowed: false,
          reason: 'Wallet is on sanctions list (OFAC)',
          riskData,
        };
      }

      // High-risk score check
      if (riskData.risk_score > 70) {
        return {
          allowed: false,
          reason: `High risk score: ${riskData.risk_score}/100`,
          riskData,
        };
      }

      // Mixer exposure check
      if (riskData.exposure.mixers > 50) {
        return {
          allowed: false,
          reason: 'Significant mixer exposure detected',
          riskData,
        };
      }

      // Scam exposure check
      if (riskData.exposure.scams > 30) {
        return {
          allowed: false,
          reason: 'High scam exposure detected',
          riskData,
        };
      }

      return {
        allowed: true,
        reason: 'Compliance checks passed',
        riskData,
      };

    } catch (error) {
      console.error('Compliance check failed:', error);
      throw error;
    }
  }

  /**
   * Batch compliance checks for multiple wallets
   */
  async batchCheck(addresses: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    await Promise.all(
      addresses.map(async (addr) => {
        try {
          const result = await this.checkCompliance(addr);
          results.set(addr, result.allowed);
        } catch (error) {
          console.error(`Failed to check ${addr}:`, error);
          results.set(addr, false);
        }
      })
    );

    return results;
  }

  /**
   * Get detailed risk breakdown
   */
  getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 30) return 'low';
    if (score < 50) return 'medium';
    if (score < 70) return 'high';
    return 'critical';
  }
}
