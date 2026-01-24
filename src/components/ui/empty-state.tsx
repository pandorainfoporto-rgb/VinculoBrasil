// ============================================
// Componentes de Empty State Profissionais
// Ilustrações bonitas quando não há dados
// ============================================

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Home,
  Wallet,
  Users,
  Building2,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Search,
  Plus,
  type LucideIcon,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'compact' | 'card';
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
        {actionLabel && onAction && (
          <Button size="sm" variant="outline" onClick={onAction} className="mt-3">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 p-8 text-center', className)}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 mb-4">
          <Icon className="h-8 w-8 text-zinc-500 dark:text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-6">
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {/* Ilustração SVG decorativa */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-2xl" />
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 shadow-lg">
          <Icon className="h-12 w-12 text-zinc-500 dark:text-zinc-400" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
      <p className="text-zinc-500 mt-2 max-w-md">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================
// Empty States Pré-configurados por Contexto
// ============================================

export function NoContractsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="Nenhum contrato encontrado"
      description="Você ainda não possui contratos cadastrados. Inicie sua jornada criando um novo contrato."
      actionLabel="Novo Contrato"
      onAction={onAction}
    />
  );
}

export function NoPropertiesEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Home}
      title="Nenhum imóvel cadastrado"
      description="Comece adicionando seu primeiro imóvel para gerenciar aluguéis e contratos."
      actionLabel="Adicionar Imóvel"
      onAction={onAction}
    />
  );
}

export function NoPaymentsEmpty() {
  return (
    <EmptyState
      icon={Wallet}
      title="Nenhum pagamento encontrado"
      description="Quando você tiver pagamentos pendentes ou realizados, eles aparecerão aqui."
      variant="card"
    />
  );
}

export function NoTenantsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Nenhum inquilino cadastrado"
      description="Adicione inquilinos para começar a gerenciar seus contratos de locação."
      actionLabel="Adicionar Inquilino"
      onAction={onAction}
    />
  );
}

export function NoAgenciesEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={Building2}
      title="Nenhuma imobiliária cadastrada"
      description="Cadastre imobiliárias parceiras para expandir sua rede de gestão."
      actionLabel="Adicionar Imobiliária"
      onAction={onAction}
    />
  );
}

export function NoInvestmentsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={TrendingUp}
      title="Nenhum investimento realizado"
      description="Explore o marketplace P2P para encontrar oportunidades de investimento em recebíveis imobiliários."
      actionLabel="Explorar Marketplace"
      onAction={onAction}
    />
  );
}

export function NoTicketsEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Nenhum chamado aberto"
      description="Quando você precisar de suporte ou manutenção, abra um chamado aqui."
      actionLabel="Abrir Chamado"
      onAction={onAction}
      variant="card"
    />
  );
}

export function NoSearchResultsEmpty({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado encontrado"
      description={query ? `Não encontramos resultados para "${query}". Tente uma busca diferente.` : 'Tente ajustar os filtros ou termos de busca.'}
      variant="compact"
    />
  );
}

export function NoGuarantorContractsEmpty() {
  return (
    <EmptyState
      icon={ShieldCheck}
      title="Nenhum contrato vinculado"
      description="Quando você for adicionado como garantidor em um contrato, ele aparecerá aqui com todas as informações de comissão."
    />
  );
}

// ============================================
// Empty State para Inquilino sem contrato
// ============================================
export function TenantNoContractEmpty({ onContact }: { onContact?: () => void }) {
  return (
    <div className="text-center py-16">
      {/* Ilustração SVG customizada */}
      <div className="relative mb-6 mx-auto w-32 h-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-28 h-28"
          >
            {/* Casa */}
            <path
              d="M60 15L15 50V105H45V70H75V105H105V50L60 15Z"
              fill="#E5E7EB"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Porta */}
            <rect x="50" y="70" width="20" height="35" fill="#D1D5DB" />
            {/* Janela */}
            <rect x="25" y="55" width="20" height="20" fill="#93C5FD" stroke="#9CA3AF" strokeWidth="2" />
            <rect x="75" y="55" width="20" height="20" fill="#93C5FD" stroke="#9CA3AF" strokeWidth="2" />
            {/* Interrogação */}
            <circle cx="95" cy="25" r="18" fill="#6366F1" />
            <text x="95" y="32" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">?</text>
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
        Nenhum aluguel ativo
      </h2>
      <p className="text-slate-500 mt-2 max-w-sm mx-auto">
        Você ainda não possui contratos vinculados a este CPF. Entre em contato com sua imobiliária.
      </p>

      {onContact && (
        <Button onClick={onContact} className="mt-6" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          Falar com Suporte
        </Button>
      )}
    </div>
  );
}
