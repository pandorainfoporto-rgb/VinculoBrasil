/**
 * TreasuryVestingChart - Grafico de vesting da Treasury
 *
 * Componente standalone para exibir o cronograma de liberacao
 * de tokens da Treasury com cliff e vesting linear.
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Lock, Unlock, Clock, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TOKEN_DISTRIBUTION, VESTING_CONFIG, formatVBRz } from '@/lib/tokenomics-types';
import { cn } from '@/lib/utils';

// =============================================================================
// TIPOS
// =============================================================================

export interface VestingStatus {
  isStarted: boolean;
  isInCliff: boolean;
  isFullyVested: boolean;
  vestingProgress: number;
  cliffProgress: number;
  totalVested: number;
  totalLocked: number;
  releasable: number;
  nextUnlockDate: Date;
  nextUnlockAmount: number;
  daysToNextUnlock: number;
  daysToCliffEnd: number;
}

export interface VestingChartDataPoint {
  month: number;
  date: Date;
  label: string;
  locked: number;
  released: number;
  cumulative: number;
  isCliff: boolean;
  isCurrent: boolean;
}

// =============================================================================
// FUNCOES AUXILIARES
// =============================================================================

/**
 * Calcula o status atual do vesting
 */
export function calculateVestingStatus(): VestingStatus {
  const now = new Date();
  const startDate = VESTING_CONFIG.startDate;
  const totalAmount = TOKEN_DISTRIBUTION.team.amount;

  // Calcula fim do cliff
  const cliffEndDate = new Date(startDate);
  cliffEndDate.setDate(cliffEndDate.getDate() + VESTING_CONFIG.cliffDays);

  // Verifica se iniciou
  const isStarted = now >= startDate;

  // Verifica se esta no cliff
  const isInCliff = now >= startDate && now < cliffEndDate;

  // Calcula progresso do cliff
  let cliffProgress = 0;
  if (now >= cliffEndDate) {
    cliffProgress = 100;
  } else if (isStarted) {
    const msInCliff = now.getTime() - startDate.getTime();
    const totalCliffMs = cliffEndDate.getTime() - startDate.getTime();
    cliffProgress = (msInCliff / totalCliffMs) * 100;
  }

  // Calcula tokens liberados
  let totalVested = 0;
  let vestingProgress = 0;

  if (now >= cliffEndDate) {
    const msFromCliff = now.getTime() - cliffEndDate.getTime();
    const monthsFromCliff = Math.floor(msFromCliff / (30 * 24 * 60 * 60 * 1000));
    const releasePercent = Math.min(monthsFromCliff * VESTING_CONFIG.releasePerMonth, 1);
    totalVested = totalAmount * releasePercent;
    vestingProgress = releasePercent * 100;
  }

  const totalLocked = totalAmount - totalVested;
  const releasable = totalVested * 0.8; // Simula 80% ja retirado

  // Proximo unlock
  let nextUnlockDate = cliffEndDate;
  if (!isInCliff && now >= cliffEndDate) {
    const msFromCliff = now.getTime() - cliffEndDate.getTime();
    const monthsFromCliff = Math.floor(msFromCliff / (30 * 24 * 60 * 60 * 1000));
    nextUnlockDate = new Date(cliffEndDate);
    nextUnlockDate.setMonth(nextUnlockDate.getMonth() + monthsFromCliff + 1);
  }

  const nextUnlockAmount = totalAmount * VESTING_CONFIG.releasePerMonth;
  const daysToNextUnlock = Math.max(0, Math.ceil((nextUnlockDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
  const daysToCliffEnd = Math.max(0, Math.ceil((cliffEndDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));

  const isFullyVested = vestingProgress >= 100;

  return {
    isStarted,
    isInCliff,
    isFullyVested,
    vestingProgress,
    cliffProgress,
    totalVested,
    totalLocked,
    releasable,
    nextUnlockDate,
    nextUnlockAmount,
    daysToNextUnlock,
    daysToCliffEnd,
  };
}

/**
 * Gera dados para o grafico de vesting
 */
export function generateVestingChartData(): VestingChartDataPoint[] {
  const data: VestingChartDataPoint[] = [];
  const totalAmount = TOKEN_DISTRIBUTION.team.amount;
  const startDate = VESTING_CONFIG.startDate;
  const now = new Date();

  // Meses 0-12: Cliff (nada liberado)
  for (let month = 0; month <= 12; month++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month);

    data.push({
      month,
      date,
      label: month === 0 ? 'Inicio' : month === 12 ? 'Cliff End' : `M${month}`,
      locked: totalAmount,
      released: 0,
      cumulative: 0,
      isCliff: true,
      isCurrent: now >= date && now < new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  // Meses 13-32: Liberacao linear 5% por mes
  for (let month = 13; month <= 32; month++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month);

    const monthsFromCliff = month - 12;
    const releasePercent = Math.min(monthsFromCliff * VESTING_CONFIG.releasePerMonth, 1);
    const cumulative = totalAmount * releasePercent;
    const locked = totalAmount - cumulative;
    const released = totalAmount * VESTING_CONFIG.releasePerMonth;

    data.push({
      month,
      date,
      label: `M${month}`,
      locked,
      released,
      cumulative,
      isCliff: false,
      isCurrent: now >= date && now < new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  return data;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

interface TreasuryVestingChartProps {
  className?: string;
  showStats?: boolean;
  height?: number;
  darkMode?: boolean;
}

export function TreasuryVestingChart({
  className,
  showStats = true,
  height = 300,
  darkMode = true,
}: TreasuryVestingChartProps) {
  const status = useMemo(() => calculateVestingStatus(), []);
  const chartData = useMemo(() => generateVestingChartData(), []);

  // Encontra o mes atual no grafico
  const currentMonth = chartData.findIndex(d => d.isCurrent);

  // Cores baseadas no modo
  const colors = darkMode
    ? {
        bg: 'bg-slate-900/80',
        border: 'border-slate-700/50',
        text: 'text-white',
        textMuted: 'text-slate-400',
        textDim: 'text-slate-500',
        cardBg: 'bg-slate-800/50',
        grid: '#334155',
        tooltip: { bg: '#1e293b', border: '#334155' },
      }
    : {
        bg: 'bg-white',
        border: 'border-gray-200',
        text: 'text-gray-900',
        textMuted: 'text-gray-600',
        textDim: 'text-gray-400',
        cardBg: 'bg-gray-50',
        grid: '#e5e7eb',
        tooltip: { bg: '#ffffff', border: '#e5e7eb' },
      };

  return (
    <Card className={cn(colors.bg, colors.border, className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={cn('flex items-center gap-2', colors.text)}>
              <Lock className="h-5 w-5 text-purple-400" />
              Treasury Vesting
            </CardTitle>
            <CardDescription className={colors.textMuted}>
              Liberacao de {formatVBRz(TOKEN_DISTRIBUTION.team.amount)} VBRz em 32 meses
            </CardDescription>
          </div>
          <Badge
            className={cn(
              status.isInCliff
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : status.isFullyVested
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            )}
          >
            {status.isInCliff ? 'EM CLIFF' : status.isFullyVested ? 'COMPLETO' : 'LIBERANDO'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-4 gap-3">
            <div className={cn('p-3 rounded-lg', colors.cardBg)}>
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span className={cn('text-xs uppercase', colors.textDim)}>Bloqueado</span>
              </div>
              <p className="text-lg font-bold text-amber-400">
                {(status.totalLocked / 1_000_000).toFixed(1)}M
              </p>
            </div>

            <div className={cn('p-3 rounded-lg', colors.cardBg)}>
              <div className="flex items-center gap-2 mb-1">
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                <span className={cn('text-xs uppercase', colors.textDim)}>Liberado</span>
              </div>
              <p className="text-lg font-bold text-emerald-400">
                {(status.totalVested / 1_000_000).toFixed(1)}M
              </p>
            </div>

            <div className={cn('p-3 rounded-lg', colors.cardBg)}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                <span className={cn('text-xs uppercase', colors.textDim)}>Prox. Unlock</span>
              </div>
              <p className="text-lg font-bold text-purple-400">
                {status.daysToNextUnlock}d
              </p>
            </div>

            <div className={cn('p-3 rounded-lg', colors.cardBg)}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                <span className={cn('text-xs uppercase', colors.textDim)}>Progresso</span>
              </div>
              <p className="text-lg font-bold text-blue-400">
                {status.vestingProgress.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={colors.textMuted}>
              {status.isInCliff ? 'Progresso do Cliff' : 'Progresso do Vesting'}
            </span>
            <span className="text-amber-400 font-medium">
              {status.isInCliff
                ? `${status.cliffProgress.toFixed(1)}%`
                : `${status.vestingProgress.toFixed(1)}%`}
            </span>
          </div>
          <Progress
            value={status.isInCliff ? status.cliffProgress : status.vestingProgress}
            className="h-2 bg-slate-800"
          />
          {status.isInCliff && (
            <p className={cn('text-xs', colors.textDim)}>
              <Clock className="h-3 w-3 inline mr-1" />
              {status.daysToCliffEnd} dias restantes no cliff
            </p>
          )}
        </div>

        {/* Area Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="vestingLocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="vestingReleased" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis
                dataKey="label"
                stroke={darkMode ? '#64748b' : '#9ca3af'}
                fontSize={10}
                tickLine={false}
                interval={2}
              />
              <YAxis
                stroke={darkMode ? '#64748b' : '#9ca3af'}
                fontSize={10}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.tooltip.bg,
                  border: `1px solid ${colors.tooltip.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: darkMode ? '#f8fafc' : '#1f2937', fontWeight: 'bold' }}
                formatter={(value: number, name: string) => [
                  `${formatVBRz(value)} VBRz`,
                  name === 'locked' ? 'Bloqueado' : 'Acumulado',
                ]}
              />
              {/* Linha de referencia no mes atual */}
              {currentMonth >= 0 && (
                <ReferenceLine
                  x={chartData[currentMonth]?.label}
                  stroke="#8b5cf6"
                  strokeDasharray="5 5"
                  label={{ value: 'Hoje', fill: '#8b5cf6', fontSize: 10 }}
                />
              )}
              {/* Linha de referencia no fim do cliff */}
              <ReferenceLine
                x="Cliff End"
                stroke="#f59e0b"
                strokeDasharray="3 3"
              />
              <Area
                type="monotone"
                dataKey="locked"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#vestingLocked)"
                name="locked"
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#vestingReleased)"
                name="cumulative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Labels */}
        <div className="flex justify-between text-xs">
          <div className={colors.textDim}>
            <Calendar className="h-3 w-3 inline mr-1" />
            Inicio: {VESTING_CONFIG.startDate.toLocaleDateString('pt-BR')}
          </div>
          <div className={colors.textDim}>
            <span className="text-amber-400">Cliff: 12 meses</span>
            {' | '}
            <span className="text-emerald-400">Vesting: 5%/mes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TreasuryVestingChart;
