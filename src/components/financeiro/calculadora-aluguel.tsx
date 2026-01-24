/**
 * Vinculo.io - Calculadora de Aluguel
 *
 * Componente para calcular o valor total do aluguel baseado no
 * valor que o proprietario deseja receber liquido.
 *
 * Formula: x = (valorDesejadoLocador × 100) / 85
 *
 * Split 85/5/5/5:
 * - 85% Locador (proprietario)
 * - 5% Seguradora
 * - 5% Garantidor
 * - 5% Plataforma (Vinculo.io)
 */

import { useState, useMemo } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import {
  Calculator,
  DollarSign,
  Users,
  Shield,
  HandCoins,
  Landmark,
  ArrowRight,
  Info,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  calculatePaymentSchedule,
  getPaymentScheduleSummary,
  SETUP_FEE_PERCENTAGE,
  AVAILABLE_DUE_DAYS,
  type PaymentDueDay,
  type ContractPaymentConfig,
} from '@/lib/rental-payment-calculator';

// ============================================
// CONFIGURACAO DE SPLIT
// ============================================

const SPLIT_CONFIG = {
  locador: 85, // 85%
  seguradora: 5, // 5%
  garantidor: 5, // 5%
  plataforma: 5, // 5%
} as const;

// ============================================
// TIPOS
// ============================================

interface CalculoResult {
  valorTotal: number;
  locador: number;
  seguradora: number;
  garantidor: number;
  plataforma: number;
  formula: string;
}

// ============================================
// HELPERS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcula o valor TOTAL a cobrar do inquilino baseado no valor
 * que o proprietario deseja RECEBER liquido.
 *
 * Formula: x = (B × C) / A
 *          x = (valorDesejado × 100) / 85
 */
function calcularValorTotal(valorDesejadoLocador: number): CalculoResult {
  // Formula: x = (B × C) / A onde B = valor desejado, C = 100, A = 85
  const valorTotal = (valorDesejadoLocador * 100) / SPLIT_CONFIG.locador;
  const valorTotalArredondado = Math.round(valorTotal * 100) / 100;

  return {
    valorTotal: valorTotalArredondado,
    locador: Math.round((valorTotalArredondado * SPLIT_CONFIG.locador) / 100 * 100) / 100,
    seguradora: Math.round((valorTotalArredondado * SPLIT_CONFIG.seguradora) / 100 * 100) / 100,
    garantidor: Math.round((valorTotalArredondado * SPLIT_CONFIG.garantidor) / 100 * 100) / 100,
    plataforma: Math.round((valorTotalArredondado * SPLIT_CONFIG.plataforma) / 100 * 100) / 100,
    formula: `(${formatCurrency(valorDesejadoLocador)} × 100) / 85 = ${formatCurrency(valorTotalArredondado)}`,
  };
}

// ============================================
// COMPONENT
// ============================================

export function CalculadoraAluguel() {
  const [valorDesejado, setValorDesejado] = useState<string>('2000');
  const [copied, setCopied] = useState(false);
  const [diaVencimento, setDiaVencimento] = useState<PaymentDueDay>(10);
  const [dataContrato, setDataContrato] = useState<string>(new Date().toISOString().split('T')[0]);

  // Calculo em tempo real
  const resultado = useMemo(() => {
    const valor = parseFloat(valorDesejado.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    return calcularValorTotal(valor);
  }, [valorDesejado]);

  // Cronograma de pagamentos
  const cronogramaPagamentos = useMemo(() => {
    const rentAmount = resultado.valorTotal;
    if (rentAmount <= 0) return null;

    const config: ContractPaymentConfig = {
      rentAmount,
      contractSignatureDate: new Date(dataContrato),
      paymentDueDay: diaVencimento,
      occupancyStartDate: new Date(dataContrato),
    };

    return calculatePaymentSchedule(config);
  }, [resultado.valorTotal, diaVencimento, dataContrato]);

  // Taxa de setup
  const taxaSetup = resultado.valorTotal * SETUP_FEE_PERCENTAGE;

  // Handler para copiar resultado
  const handleCopy = async () => {
    const texto = `Valor Total: ${formatCurrency(resultado.valorTotal)}\n` +
      `- Locador (85%): ${formatCurrency(resultado.locador)}\n` +
      `- Seguradora (5%): ${formatCurrency(resultado.seguradora)}\n` +
      `- Garantidor (5%): ${formatCurrency(resultado.garantidor)}\n` +
      `- Plataforma (5%): ${formatCurrency(resultado.plataforma)}`;

    const success = await copyToClipboard(texto);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handler para limpar
  const handleClear = () => {
    setValorDesejado('');
  };

  // Valores de exemplo
  const exemplos = [1500, 2000, 2500, 3000, 3500, 4000, 5000];

  return (
    <TooltipProvider>
      <div className="bg-background text-foreground font-sans">
        <div className="max-w-4xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Calculator className="h-8 w-8 text-indigo-400" />
                CALCULADORA DE ALUGUEL
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Calcule o valor total baseado no que o proprietario deseja receber
              </p>
            </div>
          </div>

          {/* Explicacao da Formula */}
          <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                <Info className="h-4 w-4 text-indigo-400" />
                Como Funciona o Calculo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Formula da Regra de Tres:</strong>
                  </p>
                  <div className="bg-card rounded-lg p-4 font-mono text-center">
                    <p className="text-lg text-indigo-400">x = (B × C) / A</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      x = (valor desejado × 100) / 85
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Split de Pagamento (85/5/5/5):</strong>
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-emerald-400" />
                        Locador
                      </span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">85%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-400" />
                        Seguradora
                      </span>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">5%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <HandCoins className="h-3 w-3 text-amber-400" />
                        Garantidor
                      </span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">5%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Landmark className="h-3 w-3 text-purple-400" />
                        Plataforma
                      </span>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">5%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculadora Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Valor Desejado pelo Proprietario
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quanto o locador quer receber liquido?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valorDesejado" className="text-muted-foreground">
                    Valor em Reais (R$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="valorDesejado"
                      type="text"
                      value={valorDesejado}
                      onChange={(e) => setValorDesejado(e.target.value)}
                      placeholder="0,00"
                      className="pl-10 text-2xl font-bold bg-background border-border h-14"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="border-border"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>

                <Separator className="bg-border" />

                <div>
                  <Label className="text-muted-foreground text-xs">Valores de Exemplo</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exemplos.map((valor) => (
                      <Button
                        key={valor}
                        variant="outline"
                        size="sm"
                        onClick={() => setValorDesejado(valor.toString())}
                        className={cn(
                          'border-border text-xs',
                          valorDesejado === valor.toString() && 'bg-indigo-500/20 border-indigo-500/50'
                        )}
                      >
                        {formatCurrency(valor)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultado */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-indigo-400" />
                  Valor Total a Cobrar
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quanto o inquilino deve pagar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Valor Total */}
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor Total</p>
                  <p className="text-4xl font-black text-indigo-400">
                    {formatCurrency(resultado.valorTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {resultado.formula}
                  </p>
                </div>

                <Separator className="bg-border" />

                {/* Distribuicao */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-bold">
                    Distribuicao do Pagamento
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-emerald-400" />
                      Locador (85%)
                    </span>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(resultado.locador)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-blue-400" />
                      Seguradora (5%)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(resultado.seguradora)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm">
                      <HandCoins className="h-4 w-4 text-amber-400" />
                      Garantidor (5%)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(resultado.garantidor)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-sm">
                      <Landmark className="h-4 w-4 text-purple-400" />
                      Plataforma (5%)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(resultado.plataforma)}
                    </span>
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Botao Copiar */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCopy}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Resultado
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Copiar detalhes do calculo
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </div>

          {/* Cronograma de Pagamentos */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Cronograma de Pagamentos
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure as datas e veja o cronograma completo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataContrato">Data de Assinatura do Contrato</Label>
                  <Input
                    id="dataContrato"
                    type="date"
                    value={dataContrato}
                    onChange={(e) => setDataContrato(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diaVencimento">Dia de Vencimento Mensal</Label>
                  <Select
                    value={diaVencimento.toString()}
                    onValueChange={(v) => setDiaVencimento(parseInt(v) as PaymentDueDay)}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_DUE_DAYS.map((dia) => (
                        <SelectItem key={dia} value={dia.toString()}>
                          Dia {dia} de cada mes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Taxa de Setup */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HandCoins className="h-4 w-4 text-amber-500" />
                  <span className="font-semibold text-amber-600">Taxa de Setup (3%)</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(taxaSetup)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vencimento: 2 dias apos assinatura do contrato
                </p>
                <p className="text-xs text-muted-foreground">
                  Inclui: Vistoria inicial, Registro do contrato, Mintagem NFT, Geracao de garantia
                </p>
              </div>

              {/* Cronograma Detalhado */}
              {cronogramaPagamentos && (
                <div className="space-y-3">
                  {/* Primeiro Aluguel */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-blue-600">Primeiro Aluguel (Proporcional)</span>
                      {cronogramaPagamentos.firstRent.isProRata && (
                        <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-500">
                          Pro-rata
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(cronogramaPagamentos.firstRent.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vencimento: {cronogramaPagamentos.firstRent.dueDate.toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cronogramaPagamentos.firstRent.description}
                      {cronogramaPagamentos.firstRent.isProRata && ` (${cronogramaPagamentos.firstRent.daysOccupied} dias)`}
                    </p>
                  </div>

                  {/* Segundo Aluguel */}
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span className="font-semibold text-emerald-600">Segundo Aluguel (Integral)</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {formatCurrency(cronogramaPagamentos.secondRent.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Vencimento: {cronogramaPagamentos.secondRent.dueDate.toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cronogramaPagamentos.secondRent.description}
                    </p>
                  </div>

                  {/* Proximos Pagamentos */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground uppercase mb-1">Pagamentos Futuros</p>
                    <p className="font-semibold">
                      {formatCurrency(cronogramaPagamentos.futurePayments.amount)}/mes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Todo dia {cronogramaPagamentos.futurePayments.dayOfMonth} de cada mes
                    </p>
                  </div>
                </div>
              )}

              {/* Aviso Legal */}
              <div className="bg-muted/30 rounded-lg p-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Conforme Lei do Inquilinato (Lei 8.245/91)</p>
                  <p>
                    O aluguel e sempre POS-PAGO (Art. 42). O locatario paga apos utilizar o imovel.
                    O primeiro aluguel e calculado proporcionalmente aos dias de ocupacao.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exemplo Detalhado */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Exemplo Pratico</CardTitle>
              <CardDescription className="text-muted-foreground">
                Proprietario quer receber R$ 2.000,00 de aluguel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Passo 1: Formula</p>
                  <p className="font-mono text-sm">x = (B × C) / A</p>
                  <p className="font-mono text-sm">x = (2000 × 100) / 85</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Passo 2: Calculo</p>
                  <p className="font-mono text-sm">x = 200.000 / 85</p>
                  <p className="font-mono text-sm font-bold text-indigo-400">x = R$ 2.352,94</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase mb-2">Passo 3: Verificacao</p>
                  <p className="font-mono text-xs">2.352,94 × 85% = R$ 2.000,00 ✓</p>
                  <p className="font-mono text-xs">5% cada = R$ 117,65</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
