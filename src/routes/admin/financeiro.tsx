import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import {
  Building2,
  Users,
  Receipt,
  Tag,
  FileText,
  ArrowLeft,
  Menu,
  X,
  TrendingUp,
  Wallet,
  BarChart3,
  DollarSign,
  Banknote,
  BadgeDollarSign,
  Calculator,
  CircleDollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

import { FornecedoresForm } from '@/components/financeiro/fornecedores-form';
import { ColaboradoresForm } from '@/components/financeiro/colaboradores-form';
import { ContasPagarForm } from '@/components/financeiro/contas-pagar-form';
import { TiposDespesaForm } from '@/components/financeiro/tipos-despesa-form';
import { TiposReceitaForm } from '@/components/financeiro/tipos-receita-form';
import { DreReport } from '@/components/financeiro/dre-report';
import { AlugueisReceberForm } from '@/components/financeiro/alugueis-receber-form';
import { ContasReceberForm } from '@/components/financeiro/contas-receber-form';
import { CalculadoraAluguel } from '@/components/financeiro/calculadora-aluguel';

export const Route = createFileRoute('/admin/financeiro')({
  component: FinanceiroPage,
});

type ModuloId = 'alugueis-receber' | 'contas-receber' | 'fornecedores' | 'colaboradores' | 'contas-pagar' | 'tipos-despesa' | 'tipos-receita' | 'calculadora' | 'dre';

interface ModuloConfig {
  id: ModuloId;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const MODULOS: ModuloConfig[] = [
  {
    id: 'alugueis-receber',
    label: 'Alugueis a Receber',
    description: 'Faturas e recebimentos',
    icon: Banknote,
    color: 'text-green-400',
  },
  {
    id: 'contas-receber',
    label: 'Contas a Receber',
    description: 'Comissoes, setups, intermediacoes',
    icon: BadgeDollarSign,
    color: 'text-amber-400',
  },
  {
    id: 'fornecedores',
    label: 'Fornecedores',
    description: 'Cadastro e gestao de fornecedores',
    icon: Building2,
    color: 'text-indigo-400',
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    description: 'Gestao de funcionarios e folha',
    icon: Users,
    color: 'text-emerald-400',
  },
  {
    id: 'contas-pagar',
    label: 'Contas a Pagar',
    description: 'Controle de pagamentos',
    icon: Receipt,
    color: 'text-amber-400',
  },
  {
    id: 'tipos-despesa',
    label: 'Tipos de Despesa',
    description: 'Categorias contabeis',
    icon: Tag,
    color: 'text-purple-400',
  },
  {
    id: 'tipos-receita',
    label: 'Tipos de Receita',
    description: 'Categorias de receitas',
    icon: CircleDollarSign,
    color: 'text-teal-400',
  },
  {
    id: 'calculadora',
    label: 'Calculadora',
    description: 'Simulador de aluguel',
    icon: Calculator,
    color: 'text-cyan-400',
  },
  {
    id: 'dre',
    label: 'DRE',
    description: 'Demonstrativo de Resultado',
    icon: FileText,
    color: 'text-blue-400',
  },
];

function Sidebar({
  moduloAtivo,
  setModuloAtivo,
  isMobile = false,
  onClose,
}: {
  moduloAtivo: ModuloId;
  setModuloAtivo: (id: ModuloId) => void;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className={`flex flex-col h-full ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">FINANCEIRO</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vinculo.io</p>
          </div>
        </div>
      </div>

      <Separator className="bg-muted mb-6" />

      {/* Menu */}
      <ScrollArea className="flex-1">
        <nav className="space-y-2">
          {MODULOS.map((modulo) => {
            const isActive = moduloAtivo === modulo.id;
            return (
              <button
                key={modulo.id}
                onClick={() => {
                  setModuloAtivo(modulo.id);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-muted border border-border'
                    : 'hover:bg-muted/50'
                }`}
              >
                <modulo.icon className={`h-5 w-5 ${isActive ? modulo.color : 'text-muted-foreground'}`} />
                <div>
                  <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {modulo.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">{modulo.description}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-border">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  );
}

function FinanceiroPage() {
  const [moduloAtivo, setModuloAtivo] = useState<ModuloId>('alugueis-receber');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderModulo = () => {
    switch (moduloAtivo) {
      case 'alugueis-receber':
        return <AlugueisReceberForm />;
      case 'contas-receber':
        return <ContasReceberForm />;
      case 'fornecedores':
        return <FornecedoresForm />;
      case 'colaboradores':
        return <ColaboradoresForm />;
      case 'contas-pagar':
        return <ContasPagarForm />;
      case 'tipos-despesa':
        return <TiposDespesaForm />;
      case 'tipos-receita':
        return <TiposReceitaForm />;
      case 'calculadora':
        return <CalculadoraAluguel />;
      case 'dre':
        return <DreReport />;
      default:
        return <AlugueisReceberForm />;
    }
  };

  const moduloConfig = MODULOS.find(m => m.id === moduloAtivo);

  return (
    <AdminLayout userName="Administrador">
      <div className="min-h-screen bg-background text-foreground flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 border-r border-border bg-background flex-shrink-0">
          <Sidebar moduloAtivo={moduloAtivo} setModuloAtivo={setModuloAtivo} />
        </aside>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="bg-background border-border p-0 w-80">
            <Sidebar
              moduloAtivo={moduloAtivo}
              setModuloAtivo={setModuloAtivo}
              isMobile
              onClose={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                {moduloConfig && (
                  <>
                    <moduloConfig.icon className={`h-5 w-5 ${moduloConfig.color}`} />
                    <span className="font-bold">{moduloConfig.label}</span>
                  </>
                )}
              </div>
            </div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
              Financeiro
            </Badge>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {renderModulo()}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}
