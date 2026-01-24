// ============================================
// VALIDATION UTILITIES
// Funções de validação de perfil e dados
// ============================================

interface User {
  id?: string;
  email?: string;
  name?: string;
  cpf?: string;
  phone?: string;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
}

/**
 * Valida se o usuário pode realizar investimentos
 * Requer: CPF, telefone, email, nome completo
 */
export function validateUserForInvestment(user: User | null | undefined): ValidationResult {
  const missingFields: string[] = [];

  if (!user) {
    return {
      isValid: false,
      missingFields: ['login'],
      errorMessage: 'Você precisa fazer login para investir',
    };
  }

  // Validar CPF
  if (!user.cpf) {
    missingFields.push('CPF');
  }

  // Validar telefone
  if (!user.phone) {
    missingFields.push('Telefone');
  }

  // Validar email
  if (!user.email) {
    missingFields.push('E-mail');
  }

  // Validar nome completo (KYC básico)
  if (!user.name || user.name.split(' ').length < 2) {
    missingFields.push('Nome Completo');
  }

  const isValid = missingFields.length === 0;

  return {
    isValid,
    missingFields,
    errorMessage: isValid
      ? undefined
      : `Complete seu cadastro para investir: ${missingFields.join(', ')}`,
  };
}

/**
 * Valida formato de CPF (validação básica de dígitos)
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1+$/.test(cleanCPF)) return false;

  // TODO: Adicionar validação completa com dígitos verificadores
  return true;
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 11) {
    // Celular: (XX) XXXXX-XXXX
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return phone;
}
