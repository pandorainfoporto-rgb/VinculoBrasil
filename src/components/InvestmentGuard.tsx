// ============================================
// INVESTMENT GUARD - Validação de Perfil
// Impede investimento sem CPF e dados completos
// ============================================

import type { ReactNode } from 'react';
import { validateUserForInvestment } from '@/lib/validation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface InvestmentGuardProps {
  user: {
    id?: string;
    email?: string;
    name?: string;
    cpf?: string;
    phone?: string;
  } | null | undefined;
  onProfileIncomplete?: () => void;
  children: ReactNode;
}

/**
 * Componente que bloqueia ações de investimento
 * se o perfil do usuário estiver incompleto
 *
 * Usage:
 * <InvestmentGuard user={currentUser} onProfileIncomplete={() => navigate('/profile')}>
 *   <Button>Investir Agora</Button>
 * </InvestmentGuard>
 */
export function InvestmentGuard({
  user,
  onProfileIncomplete,
  children,
}: InvestmentGuardProps) {
  const validation = validateUserForInvestment(user);

  if (!validation.isValid) {
    return (
      <div className="space-y-3 md:space-y-4">
        <Alert variant="destructive" className="text-sm md:text-base">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm md:text-base">Perfil Incompleto</AlertTitle>
          <AlertDescription className="text-xs md:text-sm">
            {validation.errorMessage}
          </AlertDescription>
        </Alert>

        {onProfileIncomplete && (
          <Button
            onClick={onProfileIncomplete}
            variant="outline"
            className="w-full text-sm md:text-base py-2 md:py-3"
          >
            Completar Cadastro
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook-style validator para uso programático
 */
export function useInvestmentValidation(user: InvestmentGuardProps['user']) {
  const validation = validateUserForInvestment(user);

  return {
    canInvest: validation.isValid,
    missingFields: validation.missingFields,
    errorMessage: validation.errorMessage,
    validate: () => validation,
  };
}
