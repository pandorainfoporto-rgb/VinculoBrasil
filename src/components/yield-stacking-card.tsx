/**
 * Vinculo.io - YieldStackingCard Component
 *
 * Allows landlords to "turbocharge" their income by using their property
 * as collateral to guarantee other rental contracts.
 *
 * Key Features:
 * - 80% LTV (Loan-to-Value) calculation
 * - 5% yield on guaranteed contracts
 * - Real-time collateral utilization display
 * - Risk-managed guarantor activation
 *
 * This is the "Portal do Locador Turbinado" from the Gemini analysis.
 */

import { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Info,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface YieldStackingCardProps {
  propertyId: string;
  propertyAddress: string;
  propertyValue: number; // Market value in BRL
  currentStakedValue?: number; // Already committed collateral
  isGuarantorEnabled?: boolean;
  currentContractsGuaranteed?: number;
  maxContractsAllowed?: number;
  yieldRate?: number; // Default 5%
  onActivate?: (enabled: boolean) => void;
  onContractsChange?: (count: number) => void;
  className?: string;
}

export function YieldStackingCard({
  propertyId,
  propertyAddress,
  propertyValue = 500000,
  currentStakedValue = 0,
  isGuarantorEnabled = false,
  currentContractsGuaranteed = 0,
  maxContractsAllowed = 5,
  yieldRate = 0.05,
  onActivate,
  onContractsChange,
  className,
}: YieldStackingCardProps) {
  const [isActive, setIsActive] = useState(isGuarantorEnabled);
  const [contractsCount, setContractsCount] = useState(currentContractsGuaranteed || 2);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Calculate collateral power (80% LTV)
  const collateralFactor = 0.8;
  const totalCollateralPower = propertyValue * collateralFactor;
  const avgGuaranteePerContract = 15000; // R$15k average per contract
  const usedCollateral = currentStakedValue || (contractsCount * avgGuaranteePerContract);
  const collateralPercentage = Math.min(100, (usedCollateral / totalCollateralPower) * 100);

  // Calculate extra income (5% of each guaranteed rent)
  const avgRentGuaranteed = 3000; // R$3k average rent
  const extraMonthlyIncome = contractsCount * avgRentGuaranteed * yieldRate;

  // Risk assessment
  const riskLevel = collateralPercentage > 70 ? 'high' : collateralPercentage > 40 ? 'medium' : 'low';
  const availableCapacity = totalCollateralPower - usedCollateral;

  const handleActivation = () => {
    if (!isActive && !acceptedTerms) {
      setShowActivationDialog(true);
      return;
    }

    const newState = !isActive;
    setIsActive(newState);
    onActivate?.(newState);

    if (!newState) {
      setContractsCount(0);
      onContractsChange?.(0);
    }
  };

  const handleConfirmActivation = () => {
    setIsActive(true);
    setShowActivationDialog(false);
    onActivate?.(true);
  };

  const handleContractsChange = (value: number[]) => {
    const count = value[0];
    setContractsCount(count);
    onContractsChange?.(count);
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          'relative overflow-hidden bg-gradient-to-br from-indigo-900 via-zinc-900 to-black',
          'p-6 lg:p-8 rounded-[32px] text-foreground shadow-2xl border border-border',
          className
        )}
      >
        {/* Background Decorations */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/30">
              <Zap size={14} className="text-indigo-400 fill-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {isActive ? 'Yield Stacking Ativo' : 'Yield Stacking Disponivel'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={cn(
                  'transition-colors',
                  isActive ? 'text-emerald-400' : 'text-muted-foreground/70'
                )}
                size={24}
              />
              {isActive && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Online
                </Badge>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="text-xl lg:text-2xl font-bold">Turbinar Rendimento</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Use seu imovel como lastro para garantir novos contratos e ganhe +5% em cada um.
            </p>
          </div>

          {/* Property Info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-border">
            <Building2 className="text-indigo-400" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Imovel Lastro</p>
              <p className="text-sm font-medium truncate">{propertyAddress}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valor</p>
              <p className="text-sm font-bold text-emerald-400">
                R$ {(propertyValue / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          {/* Collateral Gauge */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1">
                Poder de Garantia Utilizado
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={12} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>80% do valor do imovel pode ser usado como garantia para contratos de terceiros.</p>
                  </TooltipContent>
                </Tooltip>
              </span>
              <span className={cn(
                riskLevel === 'high' && 'text-red-400',
                riskLevel === 'medium' && 'text-amber-400',
                riskLevel === 'low' && 'text-emerald-400'
              )}>
                {collateralPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={collateralPercentage}
              className={cn(
                'h-2 bg-white/10',
                riskLevel === 'high' && '[&>div]:bg-red-500',
                riskLevel === 'medium' && '[&>div]:bg-amber-500',
                riskLevel === 'low' && '[&>div]:bg-emerald-500'
              )}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Capacidade total: R$ {(totalCollateralPower / 1000).toFixed(0)}k</span>
              <span>Disponivel: R$ {(availableCapacity / 1000).toFixed(0)}k</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Contracts Guaranteed */}
            <div className="bg-white/5 p-4 rounded-2xl border border-border">
              <p className="text-muted-foreground text-[10px] font-bold uppercase">Contratos Garantidos</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-black">{isActive ? contractsCount : 0}</span>
                {isActive && (
                  <Slider
                    value={[contractsCount]}
                    min={1}
                    max={maxContractsAllowed}
                    step={1}
                    onValueChange={handleContractsChange}
                    className="flex-1"
                    disabled={!isActive}
                  />
                )}
              </div>
              {isActive && (
                <p className="text-[10px] text-muted-foreground/70 mt-1">
                  Max: {maxContractsAllowed} contratos
                </p>
              )}
            </div>

            {/* Extra Income */}
            <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
              <p className="text-indigo-400 text-[10px] font-bold uppercase">Renda Extra Est.</p>
              <p className="text-2xl font-black text-foreground mt-2">
                R$ {isActive ? extraMonthlyIncome.toLocaleString('pt-BR') : '0'}
                <span className="text-xs font-normal text-indigo-300">/mes</span>
              </p>
              {isActive && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                  <TrendingUp size={10} />
                  <span>+{(yieldRate * 100).toFixed(0)}% por contrato</span>
                </div>
              )}
            </div>
          </div>

          {/* Risk Warning */}
          {isActive && riskLevel === 'high' && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
              <AlertTriangle size={16} />
              <p className="text-xs">
                Alto uso do colateral. Considere reduzir contratos garantidos.
              </p>
            </div>
          )}

          {/* Benefits List */}
          {!isActive && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Beneficios</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Renda passiva de 5%/mes',
                  'Sem tirar dinheiro do bolso',
                  'Risco gerenciado por IA',
                  'Execucao automatica',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleActivation}
            className={cn(
              'w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2',
              isActive
                ? 'bg-emerald-500 hover:bg-emerald-600 text-foreground'
                : 'bg-white text-foreground hover:bg-muted'
            )}
          >
            {isActive ? (
              <>
                <Lock size={18} />
                Garantia em Operacao
              </>
            ) : (
              <>
                <Unlock size={18} />
                Ativar Alavancagem Residual
                <ArrowUpRight size={18} />
              </>
            )}
          </Button>

          {/* Status Footer */}
          {isActive && (
            <div className="text-center text-[10px] text-muted-foreground/70">
              <span className="inline-flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Conectado a rede Polygon - Colateral bloqueado on-chain
              </span>
            </div>
          )}
        </div>

        {/* Activation Confirmation Dialog */}
        <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" />
                Ativar Yield Stacking
              </DialogTitle>
              <DialogDescription>
                Ao ativar, seu imovel sera usado como garantia para contratos de terceiros.
                Voce recebera 5% de comissao sobre cada aluguel garantido.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex gap-3">
                  <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Importante:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                      <li>80% do valor do imovel sera usado como limite de garantia</li>
                      <li>Em caso de inadimplencia do inquilino garantido, seu colateral pode ser executado</li>
                      <li>Apenas inquilinos com Trust Score 800+ serao aceitos</li>
                      <li>Voce pode desativar a qualquer momento (contratos ativos permanecem)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Switch
                  id="accept-terms"
                  checked={acceptedTerms}
                  onCheckedChange={setAcceptedTerms}
                />
                <Label htmlFor="accept-terms" className="text-sm leading-tight cursor-pointer">
                  Li e aceito os termos de Yield Stacking. Entendo os riscos envolvidos e autorizo
                  o bloqueio do meu imovel como colateral na rede Polygon.
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActivationDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmActivation}
                disabled={!acceptedTerms}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Zap size={16} className="mr-2" />
                Confirmar Ativacao
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default YieldStackingCard;
