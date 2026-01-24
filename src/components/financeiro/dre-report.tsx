/**
 * Vinculo.io - Demonstrativo de Resultado do Exercicio (DRE)
 *
 * Relatorio DRE completo com correlacao de tipos de despesa,
 * tipos de receita, fornecedores e colaboradores.
 */

import { useState } from 'react';
import { MOCK_TIPOS_RECEITA, LINHAS_DRE_RECEITA } from './tipos-receita-form';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Percent,
  Building2,
  Users,
  FileText,
  ChevronDown,
  ChevronRight,
  Printer,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================
// TYPES
// ============================================

interface DespesaDetalhe {
  id: string;
  descricao: string;
  fornecedor: string;
  tipoDespesa: string;
  valor: number;
  data: string;
}

interface LinhaDre {
  id: string;
  codigo: string;
  descricao: string;
  valor: number;
  percentual: number;
  tipo: 'receita' | 'deducao' | 'custo' | 'despesa' | 'resultado';
  nivel: number;
  expandivel: boolean;
  detalhes?: DespesaDetalhe[];
  sublinhas?: LinhaDre[];
}

interface DreData {
  periodo: string;
  linhas: LinhaDre[];
  totais: {
    receitaBruta: number;
    deducoes: number;
    receitaLiquida: number;
    custosServicos: number;
    lucroBruto: number;
    despesasOperacionais: number;
    lucroOperacional: number;
    resultadoFinanceiro: number;
    lucroAntesIr: number;
    impostos: number;
    lucroLiquido: number;
  };
}

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const EMPTY_DRE_DATA: DreData = {
  periodo: '',
  linhas: [],
  totais: {
    receitaBruta: 0,
    deducoes: 0,
    receitaLiquida: 0,
    custosServicos: 0,
    lucroBruto: 0,
    despesasOperacionais: 0,
    lucroOperacional: 0,
    resultadoFinanceiro: 0,
    lucroAntesIr: 0,
    impostos: 0,
    lucroLiquido: 0,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '' : ''}${value.toFixed(1)}%`;
}

function getLinhaStyle(linha: LinhaDre) {
  if (linha.tipo === 'resultado') {
    return 'bg-muted/50 font-bold';
  }
  if (linha.nivel === 0) {
    return 'font-semibold';
  }
  return '';
}

function getValorColor(linha: LinhaDre): string {
  if (linha.tipo === 'resultado') {
    return linha.valor >= 0 ? 'text-emerald-400' : 'text-red-400';
  }
  if (linha.tipo === 'receita') {
    return 'text-emerald-400';
  }
  if (linha.tipo === 'deducao' || linha.tipo === 'custo' || linha.tipo === 'despesa') {
    return 'text-red-400';
  }
  return 'text-foreground';
}

// ============================================
// COMPONENTS
// ============================================

function LinhaDetalheSheet({
  open,
  onClose,
  linha,
}: {
  open: boolean;
  onClose: () => void;
  linha: LinhaDre | null;
}) {
  if (!linha) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-background border-border w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            Detalhes: {linha.descricao}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Composicao detalhada desta linha do DRE
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6">
          <div className="space-y-6">
            {/* Resumo */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Valor Total</p>
                    <p className={`text-2xl font-black ${getValorColor(linha)}`}>
                      {formatCurrency(Math.abs(linha.valor))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">% Receita</p>
                    <p className="text-xl font-bold text-muted-foreground">{formatPercent(linha.percentual)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes por Lancamento */}
            {linha.detalhes && linha.detalhes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Lancamentos
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground text-[10px]">Descricao</TableHead>
                      <TableHead className="text-muted-foreground text-[10px]">Fornecedor</TableHead>
                      <TableHead className="text-muted-foreground text-[10px] text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linha.detalhes.map((detalhe) => {
                      const isReceita = linha.tipo === 'receita';
                      return (
                        <TableRow key={detalhe.id} className="border-border/50">
                          <TableCell>
                            <div>
                              <p className="text-sm text-muted-foreground">{detalhe.descricao}</p>
                              <p className={`text-[10px] ${isReceita ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                {detalhe.tipoDespesa}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {detalhe.fornecedor}
                          </TableCell>
                          <TableCell className={`text-right font-mono text-sm ${isReceita ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(detalhe.valor)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Sublinhas */}
            {linha.sublinhas && linha.sublinhas.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Composicao
                </h4>
                {linha.sublinhas.map((sublinha) => (
                  <Card key={sublinha.id} className="bg-card/50 border-border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{sublinha.descricao}</p>
                          <p className="text-[10px] text-muted-foreground">{formatPercent(sublinha.percentual)} da receita</p>
                        </div>
                        <p className={`font-mono font-bold ${getValorColor(sublinha)}`}>
                          {formatCurrency(sublinha.valor)}
                        </p>
                      </div>
                      {sublinha.percentual !== 0 && (
                        <Progress
                          value={Math.abs(sublinha.percentual)}
                          className="h-1 mt-3"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function LinhaCollapsible({
  linha,
  onViewDetails,
}: {
  linha: LinhaDre;
  onViewDetails: (linha: LinhaDre) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSublinhas = linha.sublinhas && linha.sublinhas.length > 0;

  const linhaStyle = getLinhaStyle(linha);
  const valorColor = getValorColor(linha);
  const paddingLeft = linha.nivel * 24;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className={`flex items-center justify-between py-3 px-4 border-b border-border/50 hover:bg-muted/30 transition-colors ${linhaStyle}`}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasSublinhas ? (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
            ) : (
              <div className="w-6" />
            )}
            <span className="text-[10px] text-muted-foreground font-mono w-12">{linha.codigo}</span>
            <span className={`text-sm ${linha.tipo === 'resultado' ? 'font-bold' : ''}`}>
              {linha.descricao}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-sm ${valorColor} ${linha.tipo === 'resultado' ? 'text-base font-bold' : ''}`}>
              {formatCurrency(linha.valor)}
            </span>
            <span className="text-xs text-muted-foreground w-16 text-right">
              {formatPercent(linha.percentual)}
            </span>
            {(linha.detalhes || hasSublinhas) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-indigo-400"
                onClick={() => onViewDetails(linha)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {hasSublinhas && (
          <CollapsibleContent>
            {linha.sublinhas!.map((sublinha) => (
              <LinhaCollapsible
                key={sublinha.id}
                linha={sublinha}
                onViewDetails={onViewDetails}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </>
  );
}

function KpiCards({ totais }: { totais: DreData['totais'] }) {
  const margemBruta = (totais.lucroBruto / totais.receitaLiquida) * 100;
  const margemOperacional = (totais.lucroOperacional / totais.receitaLiquida) * 100;
  const margemLiquida = (totais.lucroLiquido / totais.receitaLiquida) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Receita Liquida</p>
          <p className="text-xl font-black text-emerald-400">{formatCurrency(totais.receitaLiquida)}</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <Percent className="h-5 w-5 text-indigo-400 mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Margem Bruta</p>
          <p className="text-xl font-black text-indigo-400">{margemBruta.toFixed(1)}%</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <BarChart3 className="h-5 w-5 text-amber-400 mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Margem Operacional</p>
          <p className="text-xl font-black text-amber-400">{margemOperacional.toFixed(1)}%</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <PieChart className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Margem Liquida</p>
          <p className="text-xl font-black text-purple-400">{margemLiquida.toFixed(1)}%</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <DollarSign className="h-5 w-5 text-emerald-400 mb-2" />
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Lucro Liquido</p>
          <p className="text-xl font-black text-emerald-400">{formatCurrency(totais.lucroLiquido)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AnaliseComparativa() {
  // Dados vazios para producao - serao carregados do backend
  const dados: { mes: string; receita: number; despesas: number; lucro: number }[] = [];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Analise Comparativa (Ultimos 4 Meses)</CardTitle>
        <CardDescription className="text-muted-foreground">
          Evolucao dos principais indicadores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Periodo</TableHead>
              <TableHead className="text-muted-foreground text-right">Receita</TableHead>
              <TableHead className="text-muted-foreground text-right">Despesas</TableHead>
              <TableHead className="text-muted-foreground text-right">Lucro</TableHead>
              <TableHead className="text-muted-foreground text-right">Margem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados.map((d, i) => {
              const margem = (d.lucro / d.receita) * 100;
              const isLast = i === dados.length - 1;
              return (
                <TableRow key={d.mes} className={`border-border/50 ${isLast ? 'bg-muted/30' : ''}`}>
                  <TableCell className={`font-medium ${isLast ? 'text-indigo-400' : 'text-muted-foreground'}`}>
                    {d.mes}
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-400">
                    {formatCurrency(d.receita)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-red-400">
                    {formatCurrency(d.despesas)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-emerald-400 font-bold">
                    {formatCurrency(d.lucro)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-indigo-400">
                    {margem.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DistribuicaoDespesas({ data }: { data: DreData }) {
  const despesasOp = data.linhas.find(l => l.id === 'despesas_operacionais');
  if (!despesasOp?.sublinhas) return null;

  const total = Math.abs(despesasOp.valor);

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Distribuicao de Despesas Operacionais</CardTitle>
        <CardDescription className="text-muted-foreground">
          Total: {formatCurrency(total)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {despesasOp.sublinhas.map((sub) => {
          const percent = (Math.abs(sub.valor) / total) * 100;
          return (
            <div key={sub.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{sub.descricao}</span>
                <span className="text-muted-foreground">{formatCurrency(Math.abs(sub.valor))} ({percent.toFixed(1)}%)</span>
              </div>
              <Progress value={percent} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function DreReport() {
  const [data] = useState<DreData>(EMPTY_DRE_DATA);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('jan_2024');
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedLinha, setSelectedLinha] = useState<LinhaDre | null>(null);
  const [activeTab, setActiveTab] = useState('dre');

  const handleViewDetails = (linha: LinhaDre) => {
    setSelectedLinha(linha);
    setDetailSheetOpen(true);
  };

  const handleExport = () => {
    // Simular export
    alert('Exportando DRE para PDF/Excel...');
  };

  return (
    <div className="bg-background text-foreground font-sans">
      
        <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">DRE - DEMONSTRATIVO DE RESULTADO</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Demonstrativo de Resultado do Exercicio com detalhamento por tipo de despesa
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger className="w-48 bg-card border-border">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="jan_2024">Janeiro 2024</SelectItem>
                  <SelectItem value="dez_2023">Dezembro 2023</SelectItem>
                  <SelectItem value="nov_2023">Novembro 2023</SelectItem>
                  <SelectItem value="q4_2023">4T 2023</SelectItem>
                  <SelectItem value="ano_2023">Ano 2023</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-border gap-2">
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
              <Button onClick={handleExport} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <KpiCards totais={data.totais} />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="dre" className="data-[state=active]:bg-muted">
                DRE Completo
              </TabsTrigger>
              <TabsTrigger value="analise" className="data-[state=active]:bg-muted">
                Analise Comparativa
              </TabsTrigger>
              <TabsTrigger value="distribuicao" className="data-[state=active]:bg-muted">
                Distribuicao
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dre" className="mt-6">
              <Card className="bg-card border-border">
                <CardHeader className="border-b border-border">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Demonstrativo de Resultado</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Periodo: {data.periodo}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      Regime de Competencia
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Header da Tabela */}
                  <div className="flex items-center justify-between py-2 px-4 bg-muted/50 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-6" />
                      <span className="text-[10px] text-muted-foreground font-bold w-12">COD.</span>
                      <span className="text-[10px] text-muted-foreground font-bold">DESCRICAO</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-muted-foreground font-bold">VALOR</span>
                      <span className="text-[10px] text-muted-foreground font-bold w-16 text-right">% REC.</span>
                      <div className="w-6" />
                    </div>
                  </div>

                  {/* Linhas do DRE */}
                  {data.linhas.map((linha) => (
                    <LinhaCollapsible
                      key={linha.id}
                      linha={linha}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analise" className="mt-6">
              <AnaliseComparativa />
            </TabsContent>

            <TabsContent value="distribuicao" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DistribuicaoDespesas data={data} />
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Top 5 Maiores Despesas</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Por valor no periodo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Dados vazios para producao - serao calculados do DRE */}
                    <p className="text-muted-foreground text-sm">Nenhuma despesa registrada</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      

      {/* Detail Sheet */}
      <LinhaDetalheSheet
        open={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        linha={selectedLinha}
      />
    </div>
  );
}

export default DreReport;
