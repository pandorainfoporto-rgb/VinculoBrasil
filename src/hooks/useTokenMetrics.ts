/**
 * useTokenMetrics - Hook para metricas do token VBRz
 *
 * CONECTADO A BLOCKCHAIN REAL via ethers.js
 * Lê balanceOf de wallets configuradas em .env
 */

import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { VBRZ_CONFIG, TOKEN_DISTRIBUTION, VESTING_CONFIG } from '@/lib/tokenomics-types';

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

// Endereços das carteiras (devem estar em .env)
const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET || '';
const CASHBACK_WALLET = import.meta.env.VITE_CASHBACK_WALLET || '';
const TOKEN_CONTRACT = import.meta.env.VITE_VBRZ_CONTRACT || '';
const POLYGON_RPC = import.meta.env.VITE_POLYGON_RPC || 'https://polygon-rpc.com';

// ABI mínimo para leitura de ERC20
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// =============================================================================
// TIPOS
// =============================================================================

export interface TokenMetrics {
  // Preco e Market Cap
  priceUSD: number;
  priceBRL: number;
  priceChange24h: number;
  marketCapBRL: number;

  // Supply
  totalSupply: number;
  circulatingSupply: number;
  treasuryBalance: number;
  cashbackPoolBalance: number;
  lockedInVesting: number;

  // Burn & Cashback
  totalBurned: number;
  totalBurnedBRL: number;
  burnedLast24h: number;
  totalCashbackDistributed: number;
  cashbackDistributedBRL: number;
  cashbackLast24h: number;

  // Volume
  volume24h: number;
  transactions24h: number;

  // Holders
  totalHolders: number;
  activeHolders24h: number;

  // Vesting
  vestingStartDate: Date;
  vestingCliffEndDate: Date;
  vestingEndDate: Date;
  vestedAmount: number;
  releasableAmount: number;
  nextUnlockDate: Date;
  nextUnlockAmount: number;
  isInCliff: boolean;
  vestingProgress: number;

  // Timestamps
  lastUpdated: Date;

  // Status de conexão
  isBlockchainConnected: boolean;
  blockchainError?: string;
}

export interface TokenTransaction {
  id: string;
  type: 'cashback' | 'burn' | 'transfer' | 'mint' | 'airdrop';
  from: string;
  to: string;
  amount: number;
  valueBRL: number;
  txHash: string;
  timestamp: Date;
  description: string;
}

export interface TopHolder {
  rank: number;
  address: string;
  label?: string;
  balance: number;
  percentOfSupply: number;
  valueBRL: number;
  isContract: boolean;
  category: 'treasury' | 'team' | 'investor' | 'exchange' | 'user' | 'contract';
}

export interface VestingDataPoint {
  month: number;
  date: Date;
  label: string;
  released: number;
  locked: number;
  cumulative: number;
}

// =============================================================================
// FUNÇÕES DE BUSCA
// =============================================================================

async function fetchBlockchainData(): Promise<{
  treasuryBalance: number;
  cashbackPoolBalance: number;
  totalSupply: number;
  isConnected: boolean;
  error?: string;
}> {
  // Se não tiver contrato configurado, retorna zeros
  if (!TOKEN_CONTRACT || !TREASURY_WALLET) {
    return {
      treasuryBalance: 0,
      cashbackPoolBalance: 0,
      totalSupply: 0,
      isConnected: false,
      error: 'Contrato ou carteiras não configuradas',
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    const contract = new ethers.Contract(TOKEN_CONTRACT, ERC20_ABI, provider);

    // Busca em paralelo
    const [treasuryRaw, cashbackRaw, totalSupplyRaw, decimals] = await Promise.all([
      contract.balanceOf(TREASURY_WALLET) as Promise<bigint>,
      CASHBACK_WALLET ? contract.balanceOf(CASHBACK_WALLET) as Promise<bigint> : Promise.resolve(BigInt(0)),
      contract.totalSupply() as Promise<bigint>,
      contract.decimals() as Promise<number>,
    ]);

    // Converte de wei para número
    const divisor = BigInt(10 ** decimals);
    const treasuryBalance = Number(treasuryRaw / divisor);
    const cashbackPoolBalance = Number(cashbackRaw / divisor);
    const totalSupply = Number(totalSupplyRaw / divisor);

    return {
      treasuryBalance,
      cashbackPoolBalance,
      totalSupply,
      isConnected: true,
    };
  } catch (error) {
    console.error('Erro ao conectar à blockchain:', error);
    return {
      treasuryBalance: 0,
      cashbackPoolBalance: 0,
      totalSupply: 0,
      isConnected: false,
      error: error instanceof Error ? error.message : 'Erro de conexão',
    };
  }
}

function calculateVestingData(): {
  vestingStartDate: Date;
  vestingCliffEndDate: Date;
  vestingEndDate: Date;
  vestedAmount: number;
  releasableAmount: number;
  nextUnlockDate: Date;
  nextUnlockAmount: number;
  isInCliff: boolean;
  vestingProgress: number;
} {
  const now = new Date();
  const vestingStart = VESTING_CONFIG.startDate;
  const cliffEnd = new Date(vestingStart);
  cliffEnd.setDate(cliffEnd.getDate() + VESTING_CONFIG.cliffDays);

  const vestingEnd = new Date(cliffEnd);
  vestingEnd.setMonth(vestingEnd.getMonth() + VESTING_CONFIG.vestingMonths);

  const isInCliff = now < cliffEnd;
  let vestedAmount = 0;
  let vestingProgress = 0;

  if (!isInCliff) {
    const monthsFromCliff = Math.floor((now.getTime() - cliffEnd.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const releasePercent = Math.min(monthsFromCliff * VESTING_CONFIG.releasePerMonth, 1);
    vestedAmount = TOKEN_DISTRIBUTION.team.amount * releasePercent;
    vestingProgress = releasePercent * 100;
  }

  const nextUnlockDate = isInCliff ? cliffEnd : new Date(cliffEnd);
  if (!isInCliff) {
    const monthsFromCliff = Math.floor((now.getTime() - cliffEnd.getTime()) / (30 * 24 * 60 * 60 * 1000));
    nextUnlockDate.setMonth(cliffEnd.getMonth() + monthsFromCliff + 1);
  }

  const nextUnlockAmount = TOKEN_DISTRIBUTION.team.amount * VESTING_CONFIG.releasePerMonth;

  return {
    vestingStartDate: vestingStart,
    vestingCliffEndDate: cliffEnd,
    vestingEndDate: vestingEnd,
    vestedAmount,
    releasableAmount: vestedAmount * 0.8,
    nextUnlockDate,
    nextUnlockAmount,
    isInCliff,
    vestingProgress,
  };
}

async function fetchTokenMetrics(): Promise<TokenMetrics> {
  // Busca dados da blockchain
  const blockchainData = await fetchBlockchainData();

  // Calcula dados de vesting
  const vestingData = calculateVestingData();

  // Usa dados da blockchain se disponíveis, senão usa os valores do tokenomics
  const totalSupply = blockchainData.totalSupply || VBRZ_CONFIG.maxSupply;
  const treasuryBalance = blockchainData.treasuryBalance || TOKEN_DISTRIBUTION.treasury.amount;
  const cashbackPoolBalance = blockchainData.cashbackPoolBalance || TOKEN_DISTRIBUTION.cashbackPool.amount;

  // Calcula supply circulante (total - treasury - cashback pool - team locked)
  const lockedInVesting = TOKEN_DISTRIBUTION.team.amount - vestingData.vestedAmount;
  const circulatingSupply = totalSupply - treasuryBalance - cashbackPoolBalance - lockedInVesting;

  return {
    priceUSD: 0.02,
    priceBRL: VBRZ_CONFIG.fixedPegBRL,
    priceChange24h: 0,
    marketCapBRL: totalSupply * VBRZ_CONFIG.fixedPegBRL,

    totalSupply,
    circulatingSupply: Math.max(0, circulatingSupply),
    treasuryBalance,
    cashbackPoolBalance,
    lockedInVesting,

    // Dados que precisariam de indexador/API (usando estimativas)
    totalBurned: 0,
    totalBurnedBRL: 0,
    burnedLast24h: 0,
    totalCashbackDistributed: 0,
    cashbackDistributedBRL: 0,
    cashbackLast24h: 0,

    volume24h: 0,
    transactions24h: 0,

    totalHolders: 0,
    activeHolders24h: 0,

    ...vestingData,

    lastUpdated: new Date(),
    isBlockchainConnected: blockchainData.isConnected,
    blockchainError: blockchainData.error,
  };
}

function generateVestingChartData(): VestingDataPoint[] {
  const data: VestingDataPoint[] = [];
  const totalTeamTokens = TOKEN_DISTRIBUTION.team.amount;
  const vestingStart = VESTING_CONFIG.startDate;

  // Meses 0-12: Cliff (nada liberado)
  for (let month = 0; month <= 12; month++) {
    const date = new Date(vestingStart);
    date.setMonth(date.getMonth() + month);

    data.push({
      month,
      date,
      label: month === 0 ? 'Inicio' : month === 12 ? 'Fim Cliff' : `Mes ${month}`,
      released: 0,
      locked: totalTeamTokens,
      cumulative: 0,
    });
  }

  // Meses 13-32: Liberacao linear 5% por mes
  for (let month = 13; month <= 32; month++) {
    const date = new Date(vestingStart);
    date.setMonth(date.getMonth() + month);

    const monthsFromCliff = month - 12;
    const releasePercent = Math.min(monthsFromCliff * VESTING_CONFIG.releasePerMonth, 1);
    const released = totalTeamTokens * releasePercent;
    const locked = totalTeamTokens - released;

    data.push({
      month,
      date,
      label: `Mes ${month}`,
      released: totalTeamTokens * VESTING_CONFIG.releasePerMonth,
      locked,
      cumulative: released,
    });
  }

  return data;
}

// =============================================================================
// HOOK
// =============================================================================

export function useTokenMetrics() {
  const metricsQuery = useQuery({
    queryKey: ['token', 'metrics'],
    queryFn: fetchTokenMetrics,
    staleTime: 1000 * 30, // 30 segundos
    refetchInterval: 1000 * 60, // 1 minuto
  });

  // Dados de vesting para o gráfico (estáticos, calculados uma vez)
  const vestingChartData = generateVestingChartData();

  // Dados de distribuição para pie chart
  const distributionData = Object.entries(TOKEN_DISTRIBUTION).map(([key, value]) => ({
    name: value.label,
    value: value.amount,
    percent: value.percent,
    color: value.color,
  }));

  // Top holders - atualmente vazio pois precisaria de indexador
  const topHolders: TopHolder[] = [];

  // Transações - atualmente vazio pois precisaria de indexador
  const transactions: TokenTransaction[] = [];

  return {
    metrics: metricsQuery.data || null,
    transactions,
    topHolders,
    vestingChartData,
    distributionData,
    isLoading: metricsQuery.isLoading,
    error: metricsQuery.error,
    refresh: metricsQuery.refetch,
  };
}

export default useTokenMetrics;
