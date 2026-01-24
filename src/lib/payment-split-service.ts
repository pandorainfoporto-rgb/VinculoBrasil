/**
 * Nexus Imobi - Payment Split Service
 *
 * Automated payment distribution:
 * - 85-90% to Landlord
 * - 5-8% to Insurance Company
 * - 2-5% to Platform Fee
 *
 * Tenant pays ONE boleto/PIX, system automatically splits funds.
 */

export interface PaymentSplitConfig {
  landlordPercentage: number; // 85-90%
  insurancePercentage: number; // 5-8%
  platformPercentage: number; // 2-5%
}

export interface SplitPayment {
  totalAmount: number;
  landlordAmount: number;
  insuranceAmount: number;
  platformAmount: number;
  landlordWallet: string;
  insuranceWallet: string;
  platformWallet: string;
  contractId: string;
  paymentMethod: 'PIX' | 'Boleto' | 'Cartao' | 'Transferencia';
}

export interface PaymentDistributionResult {
  success: boolean;
  transactionId: string;
  blockchainTxHash: string;
  distributions: Array<{
    recipient: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    wallet: string;
  }>;
  totalProcessed: number;
  error?: string;
}

/**
 * Default split configuration
 * Can be customized per contract or platform settings
 */
export const DEFAULT_SPLIT_CONFIG: PaymentSplitConfig = {
  landlordPercentage: 87.5, // 87.5%
  insurancePercentage: 7.5, // 7.5%
  platformPercentage: 5.0, // 5.0%
};

/**
 * Validate split percentages total to 100%
 */
export function validateSplitConfig(config: PaymentSplitConfig): {
  valid: boolean;
  total: number;
  error?: string;
} {
  const total = config.landlordPercentage + config.insurancePercentage + config.platformPercentage;

  if (Math.abs(total - 100) > 0.01) {
    // Allow small floating point errors
    return {
      valid: false,
      total,
      error: `Split percentages must total 100%. Current total: ${total}%`,
    };
  }

  // Validate ranges
  if (config.landlordPercentage < 85 || config.landlordPercentage > 90) {
    return {
      valid: false,
      total,
      error: 'Landlord percentage must be between 85-90%',
    };
  }

  if (config.insurancePercentage < 5 || config.insurancePercentage > 8) {
    return {
      valid: false,
      total,
      error: 'Insurance percentage must be between 5-8%',
    };
  }

  if (config.platformPercentage < 2 || config.platformPercentage > 5) {
    return {
      valid: false,
      total,
      error: 'Platform percentage must be between 2-5%',
    };
  }

  return { valid: true, total };
}

/**
 * Calculate payment split amounts
 */
export function calculatePaymentSplit(
  totalAmount: number,
  config: PaymentSplitConfig = DEFAULT_SPLIT_CONFIG
): {
  landlordAmount: number;
  insuranceAmount: number;
  platformAmount: number;
  totalVerification: number;
} {
  const landlordAmount = (totalAmount * config.landlordPercentage) / 100;
  const insuranceAmount = (totalAmount * config.insurancePercentage) / 100;
  const platformAmount = (totalAmount * config.platformPercentage) / 100;

  // Round to 2 decimal places
  const landlordRounded = Math.round(landlordAmount * 100) / 100;
  const insuranceRounded = Math.round(insuranceAmount * 100) / 100;
  const platformRounded = Math.round(platformAmount * 100) / 100;

  return {
    landlordAmount: landlordRounded,
    insuranceAmount: insuranceRounded,
    platformAmount: platformRounded,
    totalVerification: landlordRounded + insuranceRounded + platformRounded,
  };
}

/**
 * Process payment and distribute to all parties
 *
 * In production, this would integrate with payment gateways:
 * - PIX: Banco Central do Brasil API
 * - Boleto: Banking API (Itaú, Bradesco, etc.)
 * - Cartão: Payment processors (Stripe, PagSeguro, etc.)
 */
export async function processAndSplitPayment(
  payment: SplitPayment,
  config: PaymentSplitConfig = DEFAULT_SPLIT_CONFIG
): Promise<PaymentDistributionResult> {
  // Validate configuration
  const validation = validateSplitConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      transactionId: '',
      blockchainTxHash: '',
      distributions: [],
      totalProcessed: 0,
      error: validation.error,
    };
  }

  // Calculate split
  const split = calculatePaymentSplit(payment.totalAmount, config);

  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const blockchainTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

  // Process distributions
  const distributions = [
    {
      recipient: 'Landlord',
      amount: split.landlordAmount,
      status: 'completed' as const,
      wallet: payment.landlordWallet,
    },
    {
      recipient: 'Insurance',
      amount: split.insuranceAmount,
      status: 'completed' as const,
      wallet: payment.insuranceWallet,
    },
    {
      recipient: 'Platform',
      amount: split.platformAmount,
      status: 'completed' as const,
      wallet: payment.platformWallet,
    },
  ];

  return {
    success: true,
    transactionId,
    blockchainTxHash,
    distributions,
    totalProcessed: payment.totalAmount,
  };
}

/**
 * Generate PIX QR Code for single payment
 */
export async function generatePIXPayment(
  amount: number,
  contractId: string,
  payerName: string
): Promise<{
  qrCode: string;
  qrCodeImage: string;
  pixKey: string;
  expiresAt: Date;
}> {
  // Simulate PIX generation
  await new Promise(resolve => setTimeout(resolve, 800));

  const pixKey = `nexusimobi.${contractId.substr(0, 8)}@pix.com.br`;
  const qrCode = `00020126580014BR.GOV.BCB.PIX${pixKey}520400005303986540${amount.toFixed(2)}5802BR`;

  // Expires in 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  return {
    qrCode,
    qrCodeImage: `data:image/png;base64,iVBORw0KGgoAAAANS...`, // Mock QR code image
    pixKey,
    expiresAt,
  };
}

/**
 * Generate Boleto for single payment
 */
export async function generateBoleto(
  amount: number,
  contractId: string,
  payerName: string,
  payerCPF: string,
  dueDate: Date
): Promise<{
  boletoNumber: string;
  barCode: string;
  digitableLine: string;
  pdfUrl: string;
  dueDate: Date;
}> {
  // Simulate Boleto generation
  await new Promise(resolve => setTimeout(resolve, 1000));

  const boletoNumber = `${Math.random().toString().substr(2, 11)}-${Math.random()
    .toString()
    .substr(2, 1)}`;
  const barCode = Math.random().toString().substr(2, 47);
  const digitableLine = barCode.match(/.{1,5}/g)?.join('.') || '';

  return {
    boletoNumber,
    barCode,
    digitableLine,
    pdfUrl: `https://nexusimobi.com/boletos/${contractId}/${boletoNumber}.pdf`,
    dueDate,
  };
}

/**
 * Reconcile incoming payment and trigger split distribution
 */
export async function reconcilePayment(
  paymentReference: string,
  amountReceived: number,
  contractId: string
): Promise<{
  matched: boolean;
  splitTriggered: boolean;
  distributionResult?: PaymentDistributionResult;
}> {
  // Simulate payment reconciliation
  await new Promise(resolve => setTimeout(resolve, 1200));

  // In production: match payment reference to contract, verify amount
  const matched = true;

  if (!matched) {
    return {
      matched: false,
      splitTriggered: false,
    };
  }

  // Trigger automatic split (would fetch contract details from database)
  const mockPayment: SplitPayment = {
    totalAmount: amountReceived,
    landlordAmount: 0,
    insuranceAmount: 0,
    platformAmount: 0,
    landlordWallet: '0x' + Math.random().toString(16).substr(2, 40),
    insuranceWallet: '0x' + Math.random().toString(16).substr(2, 40),
    platformWallet: '0x' + Math.random().toString(16).substr(2, 40),
    contractId,
    paymentMethod: 'PIX',
  };

  const distributionResult = await processAndSplitPayment(mockPayment);

  return {
    matched: true,
    splitTriggered: distributionResult.success,
    distributionResult,
  };
}
