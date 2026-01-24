// ============================================
// DASHBOARD CONTAINER - Centro de Comando Unificado
// Seletor inteligente com todas as views do Super Admin
// ============================================

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  Brain,
  Coins,
  ChevronRight,
} from 'lucide-react';

// Importa as views especializadas
import { MainView } from './views/MainView';
import { FinancialView } from './views/FinancialView';
import { ConsultiveView } from './views/ConsultiveView';
import { Web3View } from './views/Web3View';

// ============================================
// TIPOS E CONFIGURACAO
// ============================================

export type DashboardView = 'main' | 'financial' | 'consultive' | 'web3';

interface ViewOption {
  id: DashboardView;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'main',
    label: 'Visao Principal',
    shortLabel: 'Principal',
    description: 'Resumo geral, Cards de VBRz, Alertas Criticos',
    icon: LayoutDashboard,
    color: 'text-blue-400',
    bgColor: 'bg-blue-600/20',
  },
  {
    id: 'financial',
    label: 'Analytics Financeiro',
    shortLabel: 'Financeiro',
    description: 'Graficos de Receita, Inadimplencia, DRE',
    icon: BarChart3,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-600/20',
  },
  {
    id: 'consultive',
    label: 'Consultiva & KPIs',
    shortLabel: 'KPIs',
    description: 'Ocupacao, Churn, Performance de corretores',
    icon: Brain,
    color: 'text-violet-400',
    bgColor: 'bg-violet-600/20',
  },
  {
    id: 'web3',
    label: 'Web3 & Token',
    shortLabel: 'Web3',
    description: 'Treasury, Vesting, Dados da Blockchain',
    icon: Coins,
    color: 'text-amber-400',
    bgColor: 'bg-amber-600/20',
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function DashboardContainer() {
  const [currentView, setCurrentView] = useState<DashboardView>('main');

  const selectedOption = VIEW_OPTIONS.find((opt) => opt.id === currentView)!;
  const SelectedIcon = selectedOption.icon;

  // Renderiza a view correta baseado no estado
  const renderView = () => {
    switch (currentView) {
      case 'main':
        return <MainView />;
      case 'financial':
        return <FinancialView />;
      case 'consultive':
        return <ConsultiveView />;
      case 'web3':
        return <Web3View />;
      default:
        return <MainView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* HEADER DE CONTROLE */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Titulo e Descricao */}
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', selectedOption.bgColor)}>
                <SelectedIcon className={cn('h-6 w-6', selectedOption.color)} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Centro de Comando
                </h1>
                <p className="text-sm text-zinc-400 hidden md:block">
                  {selectedOption.description}
                </p>
              </div>
            </div>

            {/* SELETOR DE VIEWS */}
            <div className="w-full md:w-auto">
              <Select
                value={currentView}
                onValueChange={(value) => setCurrentView(value as DashboardView)}
              >
                <SelectTrigger className="w-full md:w-[280px] bg-zinc-900 border-zinc-700 text-white h-12">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-1.5 rounded-lg', selectedOption.bgColor)}>
                      <SelectedIcon className={cn('h-4 w-4', selectedOption.color)} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{selectedOption.label}</span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {VIEW_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isSelected = option.id === currentView;
                    return (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className={cn(
                          'text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer py-3',
                          isSelected && 'bg-zinc-800'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('p-1.5 rounded-lg', option.bgColor)}>
                            <Icon className={cn('h-4 w-4', option.color)} />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-zinc-500">{option.description}</span>
                          </div>
                          {isSelected && (
                            <Badge className="ml-auto bg-blue-600 text-xs">Ativo</Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Navigation Pills - Mobile Friendly */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 md:hidden">
            {VIEW_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = option.id === currentView;
              return (
                <button
                  key={option.id}
                  onClick={() => setCurrentView(option.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all text-sm',
                    isSelected
                      ? `${option.bgColor} ${option.color} font-medium`
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {option.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTEUDO DA VIEW */}
      <div className="animate-in fade-in duration-300">
        {renderView()}
      </div>
    </div>
  );
}

export default DashboardContainer;
