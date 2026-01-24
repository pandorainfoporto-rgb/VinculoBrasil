// =============================================================================
// Rent Anticipation - Antecipacao de Aluguel DeFi
// LOGICA FINANCEIRA CORRIGIDA - FORMULA SIMPLIFICADA
// =============================================================================
// O calculo é feito em cima do VALOR LIQUIDO que o proprietario JA RECEBE
// (depois de descontada a imobiliária/corretor)
// Custos da antecipação: Taxa_Plataforma (2%) + Desagio_Investidor (min 12% a.a.)
// =============================================================================

import { useState, useEffect, useMemo, memo } from 'react';
import {
  TrendingUp,
  Lock,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Info,
  Coins,
  Shield,
  Clock,
  FileText,
  Percent,
  Calculator,
  Minus,
  Equal,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

interface RentAnticipationProps {
  userId: string;
  userName?: string;
  contracts: ContractInfo[];
  walletConnected?: boolean;
  walletAddress?: string;
  onConnectWallet?: () => void;
}

interface ContractInfo {
  id: string;
  nftTokenId: string;
  propertyAddress: string;
  tenantName: string;
  monthlyRent: number;
  remainingMonths: number;
  isLocked: boolean;
  existingLoanId?: string;
}

// =============================================================================
// CONFIGURACAO FINANCEIRA - Apenas custos da operação
// =============================================================================

interface FinancialConfig {
  // Custos da Operacao de Antecipacao (sobre o valor liquido do proprietario)
  taxaPlataforma: number;     // % Vinculo Brasil
  desagioInvestidor: number;  // % a.a. minimo para investidor
}

const DEFAULT_CONFIG: FinancialConfig = {
  taxaPlataforma: 2,      // 2% (variavel de configuracao)
  desagioInvestidor: 12,  // 12% a.a. minimo
};

// =============================================================================
// RESULTADO DA SIMULACAO
// =============================================================================

interface SimulationResult {
  // Entrada
  mesesSelecionados: number;
  aluguelLiquido: number;       // Valor que o proprietário JÁ recebe
  valorTotalAntecipavel: number; // Valor líquido x meses

  // Custos da Antecipacao (únicos custos)
  custoPlataforma: number;
  custoDesagio: number;
  totalCustosAntecipacao: number;

  // Resultado Final
  valorFinalReceber: number;
  taxaEfetivaAnual: number;
  parcelaMensal: number;
}

// -----------------------------------------------------------------------------
// Componente de Linha de Calculo
// -----------------------------------------------------------------------------

const CalculoRow = memo(function CalculoRow({
  label,
  value,
  type = 'neutral',
  bold = false,
  tooltip,
}: {
  label: string;
  value: number;
  type?: 'positive' | 'negative' | 'neutral' | 'result';
  bold?: boolean;
  tooltip?: string;
}) {
  const formatValue = (v: number) => {
    const formatted = Math.abs(v).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    if (type === 'negative') return `- ${formatted}`;
    if (type === 'positive') return `+ ${formatted}`;
    return formatted;
  };

  const colorClass = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-zinc-300',
    result: 'text-blue-400',
  }[type];

  return (
    <div className={cn('flex items-center justify-between py-1.5', bold && 'font-medium')}>
      <div className="flex items-center gap-1">
        <span className={cn('text-sm', bold ? 'text-white' : 'text-zinc-400')}>
          {label}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-zinc-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className={cn('text-sm font-mono', colorClass)}>
        {formatValue(value)}
      </span>
    </div>
  );
});

// -----------------------------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------------------------

export function RentAnticipation({
  userId,
  userName,
  contracts,
}: RentAnticipationProps) {
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(null);
  const [monthsToAnticipate, setMonthsToAnticipate] = useState(6);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Configuracao editavel pelo proprietario
  const [config, setConfig] = useState<FinancialConfig>(DEFAULT_CONFIG);
  const [desagioCustomizado, setDesagioCustomizado] = useState(DEFAULT_CONFIG.desagioInvestidor);

  // Seleciona primeiro contrato elegivel
  useEffect(() => {
    const eligibleContract = contracts.find((c) => !c.isLocked && c.remainingMonths >= 3);
    if (eligibleContract && !selectedContract) {
      setSelectedContract(eligibleContract);
    }
  }, [contracts, selectedContract]);

  // =============================================================================
  // CALCULO DA SIMULACAO - FORMULA SIMPLIFICADA
  // Calcula apenas sobre o valor LIQUIDO que o proprietário já recebe
  // =============================================================================

  const simulation = useMemo((): SimulationResult | null => {
    if (!selectedContract) return null;

    const maxMonths = Math.min(12, selectedContract.remainingMonths);
    const meses = Math.min(monthsToAnticipate, maxMonths);

    // O monthlyRent aqui representa o valor LIQUIDO que o proprietário recebe
    // (já descontada imobiliária/corretor)
    const aluguelLiquido = selectedContract.monthlyRent;
    const valorTotalAntecipavel = aluguelLiquido * meses;

    // ======================
    // CUSTOS DA ANTECIPACAO (únicos custos)
    // ======================
    // Taxa da plataforma (2% configuravel)
    const custoPlataforma = valorTotalAntecipavel * (config.taxaPlataforma / 100);

    // Desagio do investidor (minimo 12% a.a., proporcional aos meses)
    const taxaAnual = desagioCustomizado / 100;
    const taxaPeriodo = taxaAnual * (meses / 12);
    const custoDesagio = valorTotalAntecipavel * taxaPeriodo;

    const totalCustosAntecipacao = custoPlataforma + custoDesagio;

    // ======================
    // RESULTADO FINAL
    // ======================
    const valorFinalReceber = valorTotalAntecipavel - totalCustosAntecipacao;

    // Taxa efetiva anualizada
    const taxaEfetivaAnual = ((totalCustosAntecipacao / valorFinalReceber) * (12 / meses)) * 100;

    // Parcela mensal (valor que sera reposto do aluguel)
    const parcelaMensal = valorTotalAntecipavel / meses;

    return {
      mesesSelecionados: meses,
      aluguelLiquido,
      valorTotalAntecipavel,
      custoPlataforma,
      custoDesagio,
      totalCustosAntecipacao,
      valorFinalReceber,
      taxaEfetivaAnual,
      parcelaMensal,
    };
  }, [selectedContract, monthsToAnticipate, config, desagioCustomizado]);

  const handleAnticipate = async () => {
    if (!selectedContract || !simulation) return;

    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsConfirmDialogOpen(false);
      setShowSuccessMessage(true);
      setSelectedContract(null);
    } catch (error) {
      console.error('Erro na solicitacao:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const maxMonths = selectedContract
    ? Math.min(12, selectedContract.remainingMonths)
    : 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-emerald-500" />
            Simulador de Antecipacao
          </h1>
          <p className="text-zinc-400">
            Antecipe ate 12 meses de aluguel - Formula transparente
          </p>
        </div>

        <Badge variant="outline" className="text-sm py-2 px-3 border-emerald-600 text-emerald-400">
          <Calculator className="h-4 w-4 mr-2" />
          Calculo em Tempo Real
        </Badge>
      </div>

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <Alert className="bg-green-900/30 border-green-600">
          <CheckCircle2 className="h-5 w-5 text-green-400" />
          <AlertTitle className="text-green-300 text-lg">Solicitacao Enviada!</AlertTitle>
          <AlertDescription className="text-green-400/90 mt-2">
            Sua solicitacao foi enviada para os investidores P2P.
            Prazo de resposta: <strong>2 a 3 dias uteis</strong>
          </AlertDescription>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 border-green-600 text-green-400 hover:bg-green-900/50"
            onClick={() => setShowSuccessMessage(false)}
          >
            Entendido
          </Button>
        </Alert>
      )}

      {/* Cards de Taxas - Apenas custos da operação */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-lg">
                <Coins className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Taxa Plataforma</p>
                <p className="text-lg font-bold text-white">{config.taxaPlataforma}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-600 rounded-lg">
                <Percent className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Deságio Investidor</p>
                <p className="text-lg font-bold text-white">{desagioCustomizado}% a.a.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selecao de Contrato */}
        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Seus Contratos</CardTitle>
            <CardDescription className="text-zinc-400">
              Selecione o contrato para antecipar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum contrato elegivel</p>
              </div>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.id}
                  className={cn(
                    'p-3 rounded-lg border transition-all cursor-pointer',
                    selectedContract?.id === contract.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : contract.isLocked
                      ? 'border-zinc-700 bg-zinc-800/30 opacity-60 cursor-not-allowed'
                      : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                  )}
                  onClick={() => !contract.isLocked && setSelectedContract(contract)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-white truncate">
                        {contract.propertyAddress}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {contract.tenantName}
                      </p>
                    </div>
                    {contract.isLocked && <Lock className="h-4 w-4 text-zinc-500" />}
                  </div>

                  <div className="flex justify-between text-xs mt-2 pt-2 border-t border-zinc-700">
                    <span className="text-zinc-400">
                      R$ {contract.monthlyRent.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-zinc-400">
                      {contract.remainingMonths} meses
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Simulador Detalhado */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-500" />
              Calculo Detalhado
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Formula transparente passo a passo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedContract ? (
              <div className="text-center py-12 text-zinc-500">
                <ArrowRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um contrato para simular</p>
              </div>
            ) : (
              <>
                {/* Slider de Meses */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-white">Meses a antecipar</Label>
                    <span className="text-2xl font-bold text-emerald-400">
                      {monthsToAnticipate}
                    </span>
                  </div>
                  <Slider
                    value={[monthsToAnticipate]}
                    onValueChange={(value) => setMonthsToAnticipate(value[0])}
                    min={1}
                    max={maxMonths}
                    step={1}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>1 mes</span>
                    <span>{maxMonths} meses</span>
                  </div>
                </div>

                {/* Desagio Customizado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white flex items-center gap-1">
                      Desagio do Investidor (a.a.)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-zinc-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">Minimo 12% a.a. Quanto maior, mais atrativo para investidores.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={12}
                        max={36}
                        value={desagioCustomizado}
                        onChange={(e) => setDesagioCustomizado(Math.max(12, Number(e.target.value)))}
                        className="w-20 h-8 text-right bg-zinc-800 border-zinc-700 text-white"
                      />
                      <span className="text-zinc-400 text-sm">%</span>
                    </div>
                  </div>
                  {desagioCustomizado > 12 && (
                    <p className="text-xs text-emerald-400">
                      Lance competitivo: +{desagioCustomizado - 12}% acima do minimo
                    </p>
                  )}
                </div>

                <Separator className="bg-zinc-800" />

                {/* Resultado da Simulacao */}
                {simulation && (
                  <div className="space-y-4">
                    {/* PASSO 1: Base de Calculo - Valor Liquido */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-300">PASSO 1: Base de Calculo</span>
                      </div>

                      <CalculoRow
                        label="Valor Liquido Mensal (ja recebido)"
                        value={simulation.aluguelLiquido}
                        type="neutral"
                        tooltip="Valor que voce ja recebe apos descontos da imobiliaria"
                      />

                      <div className="pl-4 border-l-2 border-emerald-500/30 ml-2 my-2">
                        <CalculoRow
                          label={`x ${simulation.mesesSelecionados} meses`}
                          value={simulation.valorTotalAntecipavel}
                          type="positive"
                          tooltip="Total a antecipar"
                        />
                      </div>

                      <Separator className="bg-zinc-700 my-2" />

                      <CalculoRow
                        label="= Valor Total Antecipavel"
                        value={simulation.valorTotalAntecipavel}
                        type="result"
                        bold
                      />
                    </div>

                    {/* PASSO 2: Custos da Antecipacao */}
                    <div className="bg-zinc-800/50 rounded-lg p-4 space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-300">PASSO 2: Custo da Operacao</span>
                      </div>

                      <div className="pl-4 border-l-2 border-amber-500/30 ml-2">
                        <CalculoRow
                          label={`Taxa Plataforma (${config.taxaPlataforma}%)`}
                          value={simulation.custoPlataforma}
                          type="negative"
                          tooltip="Taxa do Vinculo Brasil"
                        />
                        <CalculoRow
                          label={`Desagio Investidor (${desagioCustomizado}% a.a. x ${simulation.mesesSelecionados} meses)`}
                          value={simulation.custoDesagio}
                          type="negative"
                          tooltip="Remuneracao do investidor P2P"
                        />
                      </div>

                      <Separator className="bg-zinc-700 my-2" />

                      <CalculoRow
                        label="= Total Custos Antecipacao"
                        value={simulation.totalCustosAntecipacao}
                        type="negative"
                        bold
                      />
                    </div>

                    {/* RESULTADO FINAL */}
                    <div className="bg-gradient-to-r from-emerald-900/30 to-emerald-800/20 border border-emerald-700/50 rounded-lg p-6 text-center">
                      <p className="text-sm text-zinc-400 mb-1">Valor Final a Receber</p>
                      <p className="text-4xl font-bold text-emerald-400">
                        {simulation.valorFinalReceber.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-3 text-sm">
                        <span className="text-zinc-400">
                          Taxa efetiva: <strong className="text-white">{simulation.taxaEfetivaAnual.toFixed(1)}% a.a.</strong>
                        </span>
                        <span className="text-zinc-400">
                          Parcela: <strong className="text-white">R$ {simulation.parcelaMensal.toLocaleString('pt-BR')}/mes</strong>
                        </span>
                      </div>
                    </div>

                    {/* Alerta */}
                    <Alert className="bg-blue-900/20 border-blue-700">
                      <AlertCircle className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-300 text-sm">
                        Seu NFT do contrato ficara bloqueado ate a quitacao completa.
                        Os pagamentos mensais do inquilino serao automaticamente direcionados para repor a antecipacao.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
              disabled={!selectedContract}
              onClick={() => setIsConfirmDialogOpen(true)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Solicitar Antecipacao
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Como Funciona */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Como Funciona a Formula</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-white">Base de Calculo</h4>
                  <p className="text-sm text-zinc-400">
                    O calculo usa o valor LIQUIDO que voce ja recebe mensalmente
                    (apos descontos da imobiliaria/corretor), multiplicado pelos meses desejados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-white">Custo da Operacao</h4>
                  <p className="text-sm text-zinc-400">
                    Sobre o valor total, aplica-se apenas a taxa da plataforma ({config.taxaPlataforma}%)
                    e o desagio do investidor (minimo 12% a.a.).
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Resumo da Formula</h4>
              <div className="space-y-1 text-sm font-mono">
                <p className="text-zinc-300">Valor_Liquido_Mensal (ja recebido)</p>
                <p className="text-blue-400">x Meses = Valor_Total_Antecipavel</p>
                <p className="text-amber-400">- Taxa_Plataforma ({config.taxaPlataforma}%)</p>
                <p className="text-amber-400">- Desagio_Investidor (% a.a.)</p>
                <p className="text-emerald-400 font-bold">= Valor_Final_a_Receber</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmacao */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Antecipacao</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Sua solicitacao sera enviada para analise dos investidores P2P
            </DialogDescription>
          </DialogHeader>

          {simulation && selectedContract && (
            <div className="space-y-4 py-4">
              <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4 text-center">
                <p className="text-sm text-zinc-400">Valor a Receber</p>
                <p className="text-3xl font-bold text-emerald-400">
                  {simulation.valorFinalReceber.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-300">
                  <span>Contrato</span>
                  <span className="font-medium truncate max-w-[200px]">{selectedContract.propertyAddress}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Meses antecipados</span>
                  <span className="font-medium">{simulation.mesesSelecionados}</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Parcela mensal</span>
                  <span className="font-medium">
                    R$ {simulation.parcelaMensal.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <Alert className="bg-blue-900/20 border-blue-700">
                <Clock className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300 text-sm">
                  Prazo de resposta: <strong>2 a 3 dias uteis</strong>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isProcessing}
              className="border-zinc-700 text-zinc-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAnticipate}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RentAnticipation;
