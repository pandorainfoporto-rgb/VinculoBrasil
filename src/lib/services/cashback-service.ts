// =============================================================================
// CashbackService - Servico de Distribuicao de Tokens VBRz
// =============================================================================
// Este servico gerencia toda a logica de cashback do ecossistema Vinculo:
// - Processar pagamentos de aluguel e distribuir cashback
// - Gerenciar bonus de indicacao
// - Aplicar multiplicadores de fidelidade
// - Integrar com smart contract VinculoToken.sol
// =============================================================================

import {
  type CashbackType,
  type CashbackTransaction,
  type CashbackDistributionParams,
  type CashbackDistributionResult,
  type TokenBalance,
  type LoyaltyTier,
  type ReferralRecord,
  type RedeemParams,
  type RedeemResult,
  type UserTokenStats,
  VBRZ_CONFIG,
  CASHBACK_RATES,
  LOYALTY_TIERS,
  TIER_REQUIREMENTS,
  vbrzToBRL,
  brlToVBRz,
} from '../tokenomics-types';

// =============================================================================
// CLASSE PRINCIPAL
// =============================================================================

export class CashbackService {
  private treasuryWallet: string;
  private operatorWallet: string;
  private contractAddress: string;

  constructor(config?: {
    treasuryWallet?: string;
    operatorWallet?: string;
    contractAddress?: string;
  }) {
    this.treasuryWallet = config?.treasuryWallet || '0x...Treasury';
    this.operatorWallet = config?.operatorWallet || '0x...Operator';
    this.contractAddress = config?.contractAddress || '0x...VinculoToken';
  }

  // ---------------------------------------------------------------------------
  // FUNCAO PRINCIPAL: Processar Cashback de Aluguel
  // ---------------------------------------------------------------------------

  /**
   * Processa o cashback de um pagamento de aluguel
   * Chamado apos confirmacao de pagamento em dia
   *
   * @param params Parametros do pagamento
   * @returns Resultado da distribuicao
   */
  async processRentCashback(
    params: CashbackDistributionParams
  ): Promise<CashbackDistributionResult> {
    const { tenantWallet, rentAmountBRL, contractId, paymentDate, dueDate } = params;

    try {
      // 1. Verifica se pagamento foi em dia
      const isPaidOnTime = paymentDate <= dueDate;
      if (!isPaidOnTime) {
        return {
          success: false,
          transactionId: '',
          cashbackVBRz: 0,
          cashbackBRL: 0,
          error: 'Pagamento fora do prazo nao gera cashback',
        };
      }

      // 2. Busca tier de fidelidade do usuario
      const userBalance = await this.getUserBalance(tenantWallet);
      const tier = userBalance?.loyaltyTier || 'bronze';
      const multiplier = LOYALTY_TIERS[tier].cashbackMultiplier;

      // 3. Calcula cashback base (1% do aluguel)
      const baseCashbackBRL = rentAmountBRL * CASHBACK_RATES.RENT_PAYMENT;

      // 4. Aplica multiplicador de fidelidade
      const finalCashbackBRL = baseCashbackBRL * multiplier;

      // 5. Converte para VBRz
      const cashbackVBRz = brlToVBRz(finalCashbackBRL);

      // 6. Gera hash unico da transacao
      const txHash = this.generateTransactionHash(
        tenantWallet,
        cashbackVBRz,
        'RENT_PAYMENT',
        contractId
      );

      // 7. Simula chamada ao smart contract
      // Em producao: await this.callSmartContract('processRentCashback', [...])
      const transactionId = await this.simulateBlockchainTransaction({
        method: 'processRentCashback',
        params: {
          tenantWallet,
          rentAmountCentavos: Math.round(rentAmountBRL * 100),
          contractId,
          txHash,
        },
      });

      // 8. Registra transacao no banco
      const transaction: CashbackTransaction = {
        id: transactionId,
        userId: '', // Seria preenchido com userId real
        walletAddress: tenantWallet,
        type: 'RENT_PAYMENT',
        referenceType: 'payment',
        referenceId: contractId,
        originalAmountBRL: rentAmountBRL,
        cashbackRate: CASHBACK_RATES.RENT_PAYMENT,
        cashbackAmountVBRz: cashbackVBRz,
        cashbackValueBRL: finalCashbackBRL,
        loyaltyBonus: multiplier,
        bonusAmountVBRz: cashbackVBRz * (multiplier - 1),
        status: 'confirmed',
        txHash,
        createdAt: new Date(),
        processedAt: new Date(),
        confirmedAt: new Date(),
      };

      // 9. Envia notificacao WhatsApp
      await this.sendCashbackNotification(tenantWallet, cashbackVBRz, finalCashbackBRL);

      return {
        success: true,
        transactionId,
        cashbackVBRz,
        cashbackBRL: finalCashbackBRL,
        txHash,
      };
    } catch (error) {
      console.error('Erro ao processar cashback:', error);
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // BONUS DE INDICACAO
  // ---------------------------------------------------------------------------

  /**
   * Processa bonus de indicacao quando indicado completa primeira acao
   *
   * @param referrerWallet Carteira de quem indicou
   * @param referredUserId ID do usuario indicado
   * @returns Resultado do bonus
   */
  async processReferralBonus(
    referrerWallet: string,
    referredUserId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const bonusVBRz = CASHBACK_RATES.REFERRAL_BONUS;
      const bonusBRL = vbrzToBRL(bonusVBRz);

      const txHash = this.generateTransactionHash(
        referrerWallet,
        bonusVBRz,
        'REFERRAL',
        referredUserId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'processReferralBonus',
        params: {
          referrerWallet,
          referredUserId,
          txHash,
        },
      });

      await this.sendCashbackNotification(referrerWallet, bonusVBRz, bonusBRL, 'indicacao');

      return {
        success: true,
        transactionId,
        cashbackVBRz: bonusVBRz,
        cashbackBRL: bonusBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // BONUS DE SEGURO
  // ---------------------------------------------------------------------------

  /**
   * Processa bonus por contratacao de seguro
   *
   * @param userWallet Carteira do usuario
   * @param premiumBRL Valor do premio do seguro
   * @param insuranceId ID da apolice
   */
  async processInsuranceBonus(
    userWallet: string,
    premiumBRL: number,
    insuranceId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const baseCashbackBRL = premiumBRL * CASHBACK_RATES.INSURANCE_BONUS;
      const cashbackVBRz = brlToVBRz(baseCashbackBRL);

      const txHash = this.generateTransactionHash(
        userWallet,
        cashbackVBRz,
        'INSURANCE_BONUS',
        insuranceId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: userWallet,
          amount: cashbackVBRz,
          cashbackType: 3, // INSURANCE_BONUS
          referenceId: insuranceId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz,
        cashbackBRL: baseCashbackBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // BONUS DE GARANTIDOR
  // ---------------------------------------------------------------------------

  /**
   * Processa bonus mensal para garantidores ativos
   *
   * @param guarantorWallet Carteira do garantidor
   * @param commissionBRL Comissao do garantidor
   * @param contractId ID do contrato
   */
  async processGuarantorBonus(
    guarantorWallet: string,
    commissionBRL: number,
    contractId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const bonusBRL = commissionBRL * CASHBACK_RATES.GUARANTOR_BONUS;
      const bonusVBRz = brlToVBRz(bonusBRL);

      const txHash = this.generateTransactionHash(
        guarantorWallet,
        bonusVBRz,
        'GUARANTOR_BONUS',
        contractId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: guarantorWallet,
          amount: bonusVBRz,
          cashbackType: 1, // GUARANTOR_BONUS
          referenceId: contractId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz: bonusVBRz,
        cashbackBRL: bonusBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // CASHBACK PROPRIETARIO
  // ---------------------------------------------------------------------------

  /**
   * Processa cashback para proprietario quando aluguel e recebido
   */
  async processLandlordRentReceived(
    landlordWallet: string,
    rentAmountBRL: number,
    contractId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const rate = 0.005; // 0.5% para proprietario
      const baseCashbackBRL = rentAmountBRL * rate;
      const cashbackVBRz = brlToVBRz(baseCashbackBRL);

      const txHash = this.generateTransactionHash(
        landlordWallet,
        cashbackVBRz,
        'RENT_RECEIVED',
        contractId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: landlordWallet,
          amount: cashbackVBRz,
          cashbackType: 'RENT_RECEIVED',
          referenceId: contractId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz,
        cashbackBRL: baseCashbackBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Processa cashback de antecipacao para proprietario
   */
  async processAnticipationCashback(
    landlordWallet: string,
    anticipationFeeBRL: number,
    anticipationId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const rate = 0.02; // 2% da taxa de antecipacao
      const cashbackBRL = anticipationFeeBRL * rate;
      const cashbackVBRz = brlToVBRz(cashbackBRL);

      const txHash = this.generateTransactionHash(
        landlordWallet,
        cashbackVBRz,
        'ANTICIPATION_CASHBACK',
        anticipationId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: landlordWallet,
          amount: cashbackVBRz,
          cashbackType: 'ANTICIPATION_CASHBACK',
          referenceId: anticipationId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz,
        cashbackBRL: cashbackBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // CASHBACK MARKETPLACE
  // ---------------------------------------------------------------------------

  /**
   * Processa cashback de compra no marketplace
   */
  async processMarketplacePurchase(
    buyerWallet: string,
    purchaseAmountBRL: number,
    orderId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const userBalance = await this.getUserBalance(buyerWallet);
      const tier = userBalance?.loyaltyTier || 'bronze';
      const multiplier = LOYALTY_TIERS[tier].cashbackMultiplier;

      const rate = 0.01; // 1% base
      const baseCashbackBRL = purchaseAmountBRL * rate;
      const finalCashbackBRL = baseCashbackBRL * multiplier;
      const cashbackVBRz = brlToVBRz(finalCashbackBRL);

      const txHash = this.generateTransactionHash(
        buyerWallet,
        cashbackVBRz,
        'MARKETPLACE_PURCHASE',
        orderId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: buyerWallet,
          amount: cashbackVBRz,
          cashbackType: 'MARKETPLACE_PURCHASE',
          referenceId: orderId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz,
        cashbackBRL: finalCashbackBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Processa cashback de contratacao de servico
   */
  async processServiceHire(
    clientWallet: string,
    serviceAmountBRL: number,
    serviceId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const userBalance = await this.getUserBalance(clientWallet);
      const tier = userBalance?.loyaltyTier || 'bronze';
      const multiplier = LOYALTY_TIERS[tier].cashbackMultiplier;

      const rate = 0.01; // 1% base
      const baseCashbackBRL = serviceAmountBRL * rate;
      const finalCashbackBRL = baseCashbackBRL * multiplier;
      const cashbackVBRz = brlToVBRz(finalCashbackBRL);

      const txHash = this.generateTransactionHash(
        clientWallet,
        cashbackVBRz,
        'SERVICE_HIRE',
        serviceId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: clientWallet,
          amount: cashbackVBRz,
          cashbackType: 'SERVICE_HIRE',
          referenceId: serviceId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz,
        cashbackBRL: finalCashbackBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // BONUS DE CONTRATO
  // ---------------------------------------------------------------------------

  /**
   * Processa bonus de assinatura de contrato (Welcome bonus para inquilino)
   */
  async processContractSigningBonus(
    tenantWallet: string,
    contractId: string
  ): Promise<CashbackDistributionResult> {
    try {
      const bonusVBRz = 100; // 100 VBRz fixo
      const bonusBRL = vbrzToBRL(bonusVBRz);

      const txHash = this.generateTransactionHash(
        tenantWallet,
        bonusVBRz,
        'CONTRACT_SIGNING',
        contractId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: tenantWallet,
          amount: bonusVBRz,
          cashbackType: 'CONTRACT_SIGNING',
          referenceId: contractId,
        },
      });

      await this.sendCashbackNotification(tenantWallet, bonusVBRz, bonusBRL, 'contrato');

      return {
        success: true,
        transactionId,
        cashbackVBRz: bonusVBRz,
        cashbackBRL: bonusBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Processa bonus de renovacao de contrato
   */
  async processContractRenewalBonus(
    tenantWallet: string,
    contractId: string,
    renewalNumber: number
  ): Promise<CashbackDistributionResult> {
    try {
      // Bonus aumenta com renovacoes: 150, 200, 250 VBRz
      const bonusVBRz = 100 + (renewalNumber * 50);
      const bonusBRL = vbrzToBRL(bonusVBRz);

      const txHash = this.generateTransactionHash(
        tenantWallet,
        bonusVBRz,
        'CONTRACT_RENEWAL',
        contractId
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: tenantWallet,
          amount: bonusVBRz,
          cashbackType: 'CONTRACT_RENEWAL',
          referenceId: contractId,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz: bonusVBRz,
        cashbackBRL: bonusBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // BONUS DE FIDELIDADE
  // ---------------------------------------------------------------------------

  /**
   * Processa bonus por pagamentos consecutivos (streak)
   */
  async processStreakBonus(
    tenantWallet: string,
    consecutivePayments: number,
    contractId: string
  ): Promise<CashbackDistributionResult | null> {
    // Bonus a cada 6 pagamentos consecutivos
    if (consecutivePayments % 6 !== 0) {
      return null;
    }

    try {
      const bonusVBRz = 50; // 50 VBRz por streak
      const bonusBRL = vbrzToBRL(bonusVBRz);

      const txHash = this.generateTransactionHash(
        tenantWallet,
        bonusVBRz,
        'STREAK_BONUS',
        `${contractId}-streak-${consecutivePayments}`
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: tenantWallet,
          amount: bonusVBRz,
          cashbackType: 'STREAK_BONUS',
          referenceId: contractId,
        },
      });

      await this.sendCashbackNotification(tenantWallet, bonusVBRz, bonusBRL, 'streak');

      return {
        success: true,
        transactionId,
        cashbackVBRz: bonusVBRz,
        cashbackBRL: bonusBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Processa bonus de upgrade de tier
   */
  async processTierUpgradeBonus(
    userWallet: string,
    newTier: LoyaltyTier
  ): Promise<CashbackDistributionResult> {
    const tierBonuses: Record<LoyaltyTier, number> = {
      bronze: 0,
      prata: 100,
      ouro: 250,
      diamante: 500,
    };

    try {
      const bonusVBRz = tierBonuses[newTier];
      if (bonusVBRz === 0) {
        return {
          success: false,
          transactionId: '',
          cashbackVBRz: 0,
          cashbackBRL: 0,
          error: 'Tier bronze nao recebe bonus',
        };
      }

      const bonusBRL = vbrzToBRL(bonusVBRz);

      const txHash = this.generateTransactionHash(
        userWallet,
        bonusVBRz,
        'TIER_UPGRADE',
        newTier
      );

      const transactionId = await this.simulateBlockchainTransaction({
        method: 'distributeCashback',
        params: {
          recipient: userWallet,
          amount: bonusVBRz,
          cashbackType: 'TIER_UPGRADE',
          referenceId: newTier,
        },
      });

      return {
        success: true,
        transactionId,
        cashbackVBRz: bonusVBRz,
        cashbackBRL: bonusBRL,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        cashbackVBRz: 0,
        cashbackBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // RESGATE DE TOKENS
  // ---------------------------------------------------------------------------

  /**
   * Resgata tokens por servico ou voucher
   *
   * @param params Parametros do resgate
   */
  async redeemTokens(params: RedeemParams): Promise<RedeemResult> {
    const { userWallet, amountVBRz, serviceId, serviceType, description } = params;

    try {
      const valueBRL = vbrzToBRL(amountVBRz);

      // Verifica saldo
      const balance = await this.getUserBalance(userWallet);
      if (!balance || balance.balanceVBRz < amountVBRz) {
        return {
          success: false,
          transactionId: '',
          tokensRedeemed: 0,
          valueBRL: 0,
          error: 'Saldo insuficiente',
        };
      }

      // Simula queima de tokens
      const transactionId = await this.simulateBlockchainTransaction({
        method: 'redeemForService',
        params: {
          amount: amountVBRz,
          serviceId,
          description,
        },
      });

      // Gera voucher se aplicavel
      const voucherCode = this.generateVoucherCode(serviceId);

      return {
        success: true,
        transactionId,
        tokensRedeemed: amountVBRz,
        valueBRL,
        voucherCode,
      };
    } catch (error) {
      return {
        success: false,
        transactionId: '',
        tokensRedeemed: 0,
        valueBRL: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // ---------------------------------------------------------------------------
  // CONSULTAS
  // ---------------------------------------------------------------------------

  /**
   * Obtem saldo do usuario
   */
  async getUserBalance(walletAddress: string): Promise<TokenBalance | null> {
    // Simula busca no banco/blockchain
    // Em producao: chamaria smart contract getBalanceWithValue()

    return {
      userId: 'user-123',
      walletAddress,
      balanceVBRz: 1250,
      balanceBRL: 125.0,
      lockedBalance: 0,
      totalReceived: 2500,
      totalBurned: 1250,
      totalTransferred: 0,
      loyaltyTier: 'prata',
      loyaltyMultiplier: 1.2,
      lastUpdated: new Date(),
      createdAt: new Date('2024-01-01'),
    };
  }

  /**
   * Obtem estatisticas do usuario
   */
  async getUserStats(walletAddress: string): Promise<UserTokenStats | null> {
    const balance = await this.getUserBalance(walletAddress);
    if (!balance) return null;

    return {
      userId: balance.userId,
      currentBalance: balance.balanceVBRz,
      currentValueBRL: balance.balanceBRL,
      totalCashbackReceived: balance.totalReceived,
      cashbackByType: {
        RENT_PAYMENT: 2000,
        RENT_EARLY_PAYMENT: 0,
        CONTRACT_SIGNING: 0,
        CONTRACT_RENEWAL: 0,
        RENT_RECEIVED: 0,
        PROPERTY_LISTING: 0,
        ANTICIPATION_FEE: 0,
        GUARANTOR_BONUS: 0,
        GUARANTEE_ISSUED: 0,
        GUARANTEE_RENEWAL: 0,
        MARKETPLACE_PURCHASE: 0,
        MARKETPLACE_SALE: 0,
        SERVICE_HIRE: 0,
        INSURANCE_BONUS: 0,
        INSURANCE_RENEWAL: 0,
        ANTICIPATION_CASHBACK: 0,
        PIX_PAYMENT: 0,
        REFERRAL: 500,
        REFERRAL_TENANT: 0,
        REFERRAL_LANDLORD: 0,
        REFERRAL_GUARANTOR: 0,
        LOYALTY_REWARD: 0,
        TIER_UPGRADE: 0,
        STREAK_BONUS: 0,
        PROMOTIONAL: 0,
        FIRST_RENT: 0,
        WELCOME_BONUS: 0,
      },
      totalRedeemed: balance.totalBurned,
      redemptionsByCategory: {
        marketplace: 750,
        insurance: 0,
        rent_discount: 500,
        partner_voucher: 0,
      },
      totalReferrals: 3,
      successfulReferrals: 1,
      referralBonusEarned: 500,
      currentTier: balance.loyaltyTier,
      pointsToNextTier: TIER_REQUIREMENTS.ouro.minBalance - balance.balanceVBRz,
      tierBenefits: LOYALTY_TIERS[balance.loyaltyTier],
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date(),
    };
  }

  /**
   * Obtem historico de transacoes
   */
  async getTransactionHistory(
    walletAddress: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: CashbackType;
    }
  ): Promise<CashbackTransaction[]> {
    // Simula busca de transacoes
    return [
      {
        id: 'tx-001',
        userId: 'user-123',
        walletAddress,
        type: 'RENT_PAYMENT',
        referenceType: 'payment',
        referenceId: 'contract-abc',
        originalAmountBRL: 1500,
        cashbackRate: 0.01,
        cashbackAmountVBRz: 18,
        cashbackValueBRL: 1.8,
        loyaltyBonus: 1.2,
        bonusAmountVBRz: 3.6,
        status: 'confirmed',
        txHash: '0x123...',
        createdAt: new Date('2024-12-01'),
        processedAt: new Date('2024-12-01'),
        confirmedAt: new Date('2024-12-01'),
      },
      {
        id: 'tx-002',
        userId: 'user-123',
        walletAddress,
        type: 'REFERRAL',
        referenceType: 'referral',
        referenceId: 'ref-xyz',
        originalAmountBRL: 0,
        cashbackRate: 0,
        cashbackAmountVBRz: 500,
        cashbackValueBRL: 50,
        loyaltyBonus: 1,
        bonusAmountVBRz: 0,
        status: 'confirmed',
        txHash: '0x456...',
        createdAt: new Date('2024-11-15'),
        processedAt: new Date('2024-11-15'),
        confirmedAt: new Date('2024-11-15'),
      },
    ];
  }

  /**
   * Calcula tier de fidelidade baseado no saldo e tempo
   */
  calculateLoyaltyTier(balance: number, monthsActive: number): LoyaltyTier {
    if (
      balance >= TIER_REQUIREMENTS.diamante.minBalance &&
      monthsActive >= TIER_REQUIREMENTS.diamante.minMonths
    ) {
      return 'diamante';
    }
    if (
      balance >= TIER_REQUIREMENTS.ouro.minBalance &&
      monthsActive >= TIER_REQUIREMENTS.ouro.minMonths
    ) {
      return 'ouro';
    }
    if (
      balance >= TIER_REQUIREMENTS.prata.minBalance &&
      monthsActive >= TIER_REQUIREMENTS.prata.minMonths
    ) {
      return 'prata';
    }
    return 'bronze';
  }

  // ---------------------------------------------------------------------------
  // HELPERS PRIVADOS
  // ---------------------------------------------------------------------------

  /**
   * Gera hash unico para transacao (evita duplicatas)
   */
  private generateTransactionHash(
    wallet: string,
    amount: number,
    type: CashbackType,
    referenceId: string
  ): string {
    const data = `${wallet}-${amount}-${type}-${referenceId}-${Date.now()}`;
    // Simula hash - em producao usaria keccak256
    return `0x${Buffer.from(data).toString('hex').slice(0, 64)}`;
  }

  /**
   * Simula transacao blockchain
   */
  private async simulateBlockchainTransaction(params: {
    method: string;
    params: Record<string, unknown>;
  }): Promise<string> {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Gera ID de transacao
    return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Envia notificacao de cashback via WhatsApp
   */
  private async sendCashbackNotification(
    wallet: string,
    amountVBRz: number,
    valueBRL: number,
    type: string = 'aluguel'
  ): Promise<void> {
    // Simula envio de notificacao
    const message =
      type === 'indicacao'
        ? `🎉 Parabens! Voce ganhou ${amountVBRz} VBRz (R$ ${valueBRL.toFixed(2)}) pela indicacao!`
        : `✅ Pagamento confirmado! Voce acabou de ganhar ${amountVBRz.toFixed(0)} VBRz (≈ R$ ${valueBRL.toFixed(2)})`;

    console.log(`[WhatsApp Notification] ${wallet}: ${message}`);
  }

  /**
   * Gera codigo de voucher para resgate
   */
  private generateVoucherCode(serviceId: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VBRz-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

// =============================================================================
// INSTANCIA SINGLETON
// =============================================================================

export const cashbackService = new CashbackService();

// =============================================================================
// FUNCOES DE CONVENIENCIA
// =============================================================================

/**
 * Processa cashback de pagamento de aluguel
 * Funcao wrapper para uso direto
 */
export async function processRentCashback(
  contractId: string,
  rentAmount: number,
  paymentDate: Date,
  dueDate: Date,
  tenantWallet: string
): Promise<CashbackDistributionResult> {
  return cashbackService.processRentCashback({
    contractId,
    rentAmountBRL: rentAmount,
    paymentDate,
    dueDate,
    tenantWallet,
  });
}

/**
 * Calcula preview do cashback sem processar
 */
export function previewRentCashback(
  rentAmountBRL: number,
  tier: LoyaltyTier = 'bronze'
): { cashbackVBRz: number; cashbackBRL: number; multiplier: number } {
  const baseCashbackBRL = rentAmountBRL * CASHBACK_RATES.RENT_PAYMENT;
  const multiplier = LOYALTY_TIERS[tier].cashbackMultiplier;
  const finalCashbackBRL = baseCashbackBRL * multiplier;
  const cashbackVBRz = brlToVBRz(finalCashbackBRL);

  return {
    cashbackVBRz,
    cashbackBRL: finalCashbackBRL,
    multiplier,
  };
}
