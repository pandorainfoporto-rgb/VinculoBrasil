/**
 * Vinculo.io - Calculadora de Pagamentos de Aluguel
 *
 * Implementa as regras de pagamento conforme a Lei do Inquilinato (Lei 8.245/91):
 *
 * IMPORTANTE - LEGISLACAO BRASILEIRA:
 * Art. 42 da Lei 8.245/91 PROIBE expressamente a cobranca de aluguel
 * ANTECIPADO (pre-pago), EXCETO em casos especificos como:
 * - Locacao por temporada (Art. 48-50)
 * - Quando nao houver garantia
 *
 * Portanto, o aluguel deve ser sempre POS-PAGO (apos o uso do imovel).
 *
 * Sistema de datas base: 10, 15 ou 20 de cada mes
 * Taxa de setup: 3% do valor do aluguel (vistoria, registro, NFT, garantia)
 * Primeiro pagamento: 2 dias apos assinatura (apenas taxa de setup)
 */

export type PaymentDueDay = 10 | 15 | 20;

export interface ContractPaymentConfig {
  /** Valor mensal do aluguel */
  rentAmount: number;
  /** Data de assinatura do contrato */
  contractSignatureDate: Date;
  /** Dia de vencimento escolhido (10, 15 ou 20) */
  paymentDueDay: PaymentDueDay;
  /** Data de inicio da ocupacao (normalmente igual ou apos assinatura) */
  occupancyStartDate: Date;
}

export interface SetupFeePayment {
  /** Descricao do pagamento */
  description: string;
  /** Valor da taxa de setup (3%) */
  amount: number;
  /** Data de vencimento (2 dias apos assinatura) */
  dueDate: Date;
  /** Detalhamento do que inclui */
  breakdown: {
    vistoriaInicial: number;
    registroContrato: number;
    mintagemNFT: number;
    geracaoGarantia: number;
  };
}

export interface FirstRentPayment {
  /** Descricao do pagamento */
  description: string;
  /** Valor do primeiro aluguel (proporcional) */
  amount: number;
  /** Data de vencimento */
  dueDate: Date;
  /** Dias de ocupacao no periodo */
  daysOccupied: number;
  /** Total de dias no periodo de calculo */
  totalDaysInPeriod: number;
  /** Periodo de referencia */
  referenceStartDate: Date;
  referenceEndDate: Date;
  /** E proporcional? */
  isProRata: boolean;
}

export interface PaymentSchedule {
  /** Taxa de setup */
  setupFee: SetupFeePayment;
  /** Primeiro aluguel (proporcional) */
  firstRent: FirstRentPayment;
  /** Segundo aluguel (integral, primeira mensalidade completa) */
  secondRent: {
    description: string;
    amount: number;
    dueDate: Date;
    referenceMonth: string;
  };
  /** Datas base para vencimentos futuros */
  futurePayments: {
    dayOfMonth: PaymentDueDay;
    amount: number;
    startingFrom: Date;
  };
}

/**
 * Taxa de setup fixa: 3% do valor do aluguel
 */
export const SETUP_FEE_PERCENTAGE = 0.03;

/**
 * Dias apos assinatura para pagamento da taxa de setup
 */
export const SETUP_FEE_DAYS_AFTER_SIGNATURE = 2;

/**
 * Datas de vencimento disponiveis
 */
export const AVAILABLE_DUE_DAYS: PaymentDueDay[] = [10, 15, 20];

/**
 * Calcula a taxa de setup
 */
export function calculateSetupFee(rentAmount: number): SetupFeePayment {
  const setupFeeTotal = rentAmount * SETUP_FEE_PERCENTAGE;

  // Distribuicao da taxa de setup (valores aproximados)
  const breakdown = {
    vistoriaInicial: setupFeeTotal * 0.35, // 35% - Vistoria
    registroContrato: setupFeeTotal * 0.25, // 25% - Registro
    mintagemNFT: setupFeeTotal * 0.20, // 20% - NFT
    geracaoGarantia: setupFeeTotal * 0.20, // 20% - Garantia
  };

  return {
    description: 'Taxa de Setup (Vistoria, Registro, NFT e Garantia)',
    amount: setupFeeTotal,
    dueDate: new Date(), // Sera calculado no schedule
    breakdown,
  };
}

/**
 * Adiciona dias a uma data
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calcula o numero de dias em um mes
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calcula a proxima data de vencimento baseada no dia escolhido
 * Sempre retorna uma data FUTURA em relacao a dataBase
 */
function getNextDueDate(baseDate: Date, dueDay: PaymentDueDay): Date {
  const result = new Date(baseDate);
  result.setDate(dueDay);
  result.setHours(0, 0, 0, 0);

  // Se a data ja passou, vai para o proximo mes
  if (result <= baseDate) {
    result.setMonth(result.getMonth() + 1);
  }

  return result;
}

/**
 * Formata mes/ano para exibicao
 */
function formatMonthYear(date: Date): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${months[date.getMonth()]}/${date.getFullYear()}`;
}

/**
 * Calcula o primeiro aluguel proporcional (pos-pago conforme Lei 8.245/91)
 *
 * REGRA: O aluguel e POS-PAGO. O locatario paga DEPOIS de usar o imovel.
 *
 * Exemplo:
 * - Contrato assinado em 25/01
 * - Data de vencimento: dia 15
 * - Primeiro aluguel: 15/02, referente aos dias 25/01 a 31/01 (7 dias)
 * - Segundo aluguel: 15/03, referente ao mes de Fevereiro completo
 */
export function calculateFirstRentPayment(
  config: ContractPaymentConfig
): FirstRentPayment {
  const { rentAmount, occupancyStartDate, paymentDueDay } = config;

  // Primeiro vencimento: proximo dia de vencimento apos inicio da ocupacao
  const firstDueDate = getNextDueDate(occupancyStartDate, paymentDueDay);

  // Periodo de referencia: do inicio da ocupacao ate o fim do mes
  const referenceStartDate = new Date(occupancyStartDate);
  referenceStartDate.setHours(0, 0, 0, 0);

  const referenceEndDate = new Date(occupancyStartDate);
  referenceEndDate.setMonth(referenceEndDate.getMonth() + 1);
  referenceEndDate.setDate(0); // Ultimo dia do mes da ocupacao
  referenceEndDate.setHours(23, 59, 59, 999);

  // Calcula dias de ocupacao
  const daysInMonth = getDaysInMonth(
    occupancyStartDate.getFullYear(),
    occupancyStartDate.getMonth()
  );
  const dayOfOccupancy = occupancyStartDate.getDate();
  const daysOccupied = daysInMonth - dayOfOccupancy + 1;

  // Verifica se e mes completo ou proporcional
  const isProRata = dayOfOccupancy > 1;

  // Calcula valor proporcional
  const dailyRate = rentAmount / daysInMonth;
  const proRataAmount = isProRata ? dailyRate * daysOccupied : rentAmount;

  const month = formatMonthYear(occupancyStartDate);

  return {
    description: isProRata
      ? `Aluguel Proporcional - ${daysOccupied} dias de ${month}`
      : `Aluguel Integral - ${month}`,
    amount: Math.round(proRataAmount * 100) / 100,
    dueDate: firstDueDate,
    daysOccupied,
    totalDaysInPeriod: daysInMonth,
    referenceStartDate,
    referenceEndDate,
    isProRata,
  };
}

/**
 * Calcula o cronograma completo de pagamentos iniciais
 */
export function calculatePaymentSchedule(
  config: ContractPaymentConfig
): PaymentSchedule {
  const { rentAmount, contractSignatureDate, paymentDueDay, occupancyStartDate } = config;

  // 1. Taxa de Setup (2 dias apos assinatura)
  const setupFee = calculateSetupFee(rentAmount);
  setupFee.dueDate = addDays(contractSignatureDate, SETUP_FEE_DAYS_AFTER_SIGNATURE);

  // 2. Primeiro Aluguel (proporcional, pos-pago)
  const firstRent = calculateFirstRentPayment(config);

  // 3. Segundo Aluguel (primeiro mes integral)
  const secondDueDate = new Date(firstRent.dueDate);
  secondDueDate.setMonth(secondDueDate.getMonth() + 1);

  // Mes de referencia do segundo aluguel
  const secondRefMonth = new Date(occupancyStartDate);
  secondRefMonth.setMonth(secondRefMonth.getMonth() + 1);

  const secondRent = {
    description: `Aluguel Integral - ${formatMonthYear(secondRefMonth)}`,
    amount: rentAmount,
    dueDate: secondDueDate,
    referenceMonth: formatMonthYear(secondRefMonth),
  };

  // 4. Pagamentos futuros
  const futurePaymentsStart = new Date(secondDueDate);
  futurePaymentsStart.setMonth(futurePaymentsStart.getMonth() + 1);

  return {
    setupFee,
    firstRent,
    secondRent,
    futurePayments: {
      dayOfMonth: paymentDueDay,
      amount: rentAmount,
      startingFrom: futurePaymentsStart,
    },
  };
}

/**
 * Valida se um dia de vencimento e valido
 */
export function isValidDueDay(day: number): day is PaymentDueDay {
  return AVAILABLE_DUE_DAYS.includes(day as PaymentDueDay);
}

/**
 * Retorna descricao legivel do cronograma
 */
export function getPaymentScheduleSummary(schedule: PaymentSchedule): string[] {
  const formatDate = (d: Date) => d.toLocaleDateString('pt-BR');
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return [
    `1. Taxa de Setup: ${formatCurrency(schedule.setupFee.amount)} - Vencimento: ${formatDate(schedule.setupFee.dueDate)}`,
    `   (Inclui: Vistoria, Registro do Contrato, Mintagem NFT e Geracao de Garantia)`,
    ``,
    `2. Primeiro Aluguel: ${formatCurrency(schedule.firstRent.amount)} - Vencimento: ${formatDate(schedule.firstRent.dueDate)}`,
    `   ${schedule.firstRent.description}`,
    `   ${schedule.firstRent.isProRata ? `(${schedule.firstRent.daysOccupied} de ${schedule.firstRent.totalDaysInPeriod} dias)` : '(Mes completo)'}`,
    ``,
    `3. Segundo Aluguel: ${formatCurrency(schedule.secondRent.amount)} - Vencimento: ${formatDate(schedule.secondRent.dueDate)}`,
    `   ${schedule.secondRent.description}`,
    ``,
    `4. Proximos Alugueis: ${formatCurrency(schedule.futurePayments.amount)}/mes`,
    `   Vencimento: Todo dia ${schedule.futurePayments.dayOfMonth} de cada mes`,
    `   A partir de: ${formatDate(schedule.futurePayments.startingFrom)}`,
  ];
}

/**
 * Calcula o valor diario do aluguel
 */
export function getDailyRentRate(rentAmount: number, month: Date): number {
  const daysInMonth = getDaysInMonth(month.getFullYear(), month.getMonth());
  return rentAmount / daysInMonth;
}

/**
 * Calcula o aluguel proporcional para um periodo especifico
 */
export function calculateProRataRent(
  rentAmount: number,
  startDate: Date,
  endDate: Date
): { amount: number; days: number; dailyRate: number } {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysInMonth = getDaysInMonth(startDate.getFullYear(), startDate.getMonth());
  const dailyRate = rentAmount / daysInMonth;
  const amount = Math.round(dailyRate * days * 100) / 100;

  return { amount, days, dailyRate };
}
