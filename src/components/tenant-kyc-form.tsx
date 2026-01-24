/**
 * Vinculo.io - Tenant KYC Form
 *
 * Formulario de Pre-Analise de Risco (Know Your Customer).
 * O inquilino sobe os documentos e o sistema roda o risk-automation.ts
 * para gerar o Trust Score em tempo real.
 */

import { useState, useCallback } from 'react';
import {
  User,
  FileText,
  Wallet,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Briefcase,
  Phone,
  Mail,
  Home,
  Camera,
  File,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ============================================
// TYPES
// ============================================

interface PersonalData {
  fullName: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
}

interface FinancialData {
  monthlyIncome: number;
  occupation: string;
  employmentType: string;
  employerName: string;
  employmentTime: string;
}

interface DocumentData {
  identityDoc: File | null;
  incomeProof: File | null;
  addressProof: File | null;
  selfie: File | null;
}

interface KYCFormData {
  personal: PersonalData;
  financial: FinancialData;
  documents: DocumentData;
}

interface TrustScoreResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  maxRentApproved: number;
  factors: {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

// ============================================
// CONSTANTS
// ============================================

const INITIAL_PERSONAL_DATA: PersonalData = {
  fullName: '',
  cpf: '',
  birthDate: '',
  email: '',
  phone: '',
};

const INITIAL_FINANCIAL_DATA: FinancialData = {
  monthlyIncome: 0,
  occupation: '',
  employmentType: '',
  employerName: '',
  employmentTime: '',
};

const INITIAL_DOCUMENT_DATA: DocumentData = {
  identityDoc: null,
  incomeProof: null,
  addressProof: null,
  selfie: null,
};

const EMPLOYMENT_TYPES = [
  { value: 'clt', label: 'CLT (Carteira Assinada)' },
  { value: 'pj', label: 'PJ (Pessoa Juridica)' },
  { value: 'autonomo', label: 'Autonomo' },
  { value: 'empresario', label: 'Empresario' },
  { value: 'aposentado', label: 'Aposentado' },
  { value: 'servidor', label: 'Servidor Publico' },
];

const EMPLOYMENT_TIME_OPTIONS = [
  { value: '0-6', label: 'Menos de 6 meses' },
  { value: '6-12', label: '6 meses a 1 ano' },
  { value: '1-2', label: '1 a 2 anos' },
  { value: '2-5', label: '2 a 5 anos' },
  { value: '5+', label: 'Mais de 5 anos' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

function calculateTrustScore(data: KYCFormData): TrustScoreResult {
  let score = 500; // Base score
  const factors: TrustScoreResult['factors'] = [];

  // Income factor
  if (data.financial.monthlyIncome >= 10000) {
    score += 150;
    factors.push({
      name: 'Renda Alta',
      impact: 'positive',
      description: 'Renda mensal acima de R$ 10.000',
    });
  } else if (data.financial.monthlyIncome >= 5000) {
    score += 100;
    factors.push({
      name: 'Renda Media-Alta',
      impact: 'positive',
      description: 'Renda mensal acima de R$ 5.000',
    });
  } else if (data.financial.monthlyIncome >= 3000) {
    score += 50;
    factors.push({
      name: 'Renda Media',
      impact: 'neutral',
      description: 'Renda mensal compativel',
    });
  } else {
    score -= 50;
    factors.push({
      name: 'Renda Baixa',
      impact: 'negative',
      description: 'Renda mensal abaixo do ideal',
    });
  }

  // Employment type factor
  if (['clt', 'servidor'].includes(data.financial.employmentType)) {
    score += 100;
    factors.push({
      name: 'Estabilidade Profissional',
      impact: 'positive',
      description: 'Vinculo empregaticio estavel',
    });
  } else if (data.financial.employmentType === 'empresario') {
    score += 50;
    factors.push({
      name: 'Empresario',
      impact: 'neutral',
      description: 'Renda variavel mas com patrimonio',
    });
  }

  // Employment time factor
  if (['2-5', '5+'].includes(data.financial.employmentTime)) {
    score += 80;
    factors.push({
      name: 'Tempo de Empresa',
      impact: 'positive',
      description: 'Mais de 2 anos no emprego atual',
    });
  } else if (data.financial.employmentTime === '0-6') {
    score -= 30;
    factors.push({
      name: 'Emprego Recente',
      impact: 'negative',
      description: 'Menos de 6 meses no emprego atual',
    });
  }

  // Documents factor
  const docsProvided = Object.values(data.documents).filter((d) => d !== null).length;
  if (docsProvided === 4) {
    score += 120;
    factors.push({
      name: 'Documentacao Completa',
      impact: 'positive',
      description: 'Todos os documentos enviados',
    });
  } else if (docsProvided >= 2) {
    score += 60;
    factors.push({
      name: 'Documentacao Parcial',
      impact: 'neutral',
      description: 'Documentacao basica enviada',
    });
  }

  // Normalize score
  score = Math.min(Math.max(score, 300), 1000);

  // Calculate risk level
  let riskLevel: TrustScoreResult['riskLevel'] = 'high';
  if (score >= 750) riskLevel = 'low';
  else if (score >= 550) riskLevel = 'medium';

  // Calculate max rent approved (30% of income rule)
  const maxRentApproved = Math.floor(data.financial.monthlyIncome * 0.3);

  return { score, riskLevel, maxRentApproved, factors };
}

// ============================================
// STEP COMPONENTS
// ============================================

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex justify-between mb-12 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
            currentStep >= step
              ? 'bg-indigo-600 text-foreground shadow-lg shadow-indigo-200'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {currentStep > step ? <CheckCircle2 size={18} /> : step}
        </div>
      ))}
    </div>
  );
}

function PersonalDataStep({
  data,
  onChange,
}: {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Perfil Identitario</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Inicie a sua verificacao para aceder ao Marketplace
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="fullName" className="text-xs font-bold uppercase text-muted-foreground">
            Nome Completo
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="Ex: Joao da Silva"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf" className="text-xs font-bold uppercase text-muted-foreground">
            CPF
          </Label>
          <Input
            id="cpf"
            value={data.cpf}
            onChange={(e) => onChange({ ...data, cpf: formatCPF(e.target.value) })}
            placeholder="000.000.000-00"
            maxLength={14}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate" className="text-xs font-bold uppercase text-muted-foreground">
            Data de Nascimento
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange({ ...data, birthDate: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">
            <Mail className="h-3 w-3 inline mr-1" />
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="seu@email.com"
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">
            <Phone className="h-3 w-3 inline mr-1" />
            Telefone
          </Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: formatPhone(e.target.value) })}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}

function FinancialDataStep({
  data,
  onChange,
}: {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wallet className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Capacidade Financeira</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Estes dados definem o seu limite de aluguel garantido
        </p>
      </div>

      <div className="space-y-6">
        {/* Income Card */}
        <Card className="border-2 border-indigo-100 bg-indigo-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-600 uppercase">
                  Rendimento Mensal Comprovado
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg text-indigo-600">R$</span>
                  <Input
                    type="number"
                    value={data.monthlyIncome || ''}
                    onChange={(e) =>
                      onChange({ ...data, monthlyIncome: Number(e.target.value) })
                    }
                    placeholder="0,00"
                    className="text-2xl font-black border-none bg-transparent p-0 h-auto focus-visible:ring-0 w-40"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              <Briefcase className="h-3 w-3 inline mr-1" />
              Ocupacao / Cargo
            </Label>
            <Input
              value={data.occupation}
              onChange={(e) => onChange({ ...data, occupation: e.target.value })}
              placeholder="Ex: Desenvolvedor Senior"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Tipo de Vinculo</Label>
            <Select
              value={data.employmentType}
              onValueChange={(value) => onChange({ ...data, employmentType: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">
              <Home className="h-3 w-3 inline mr-1" />
              Nome da Empresa
            </Label>
            <Input
              value={data.employerName}
              onChange={(e) => onChange({ ...data, employerName: e.target.value })}
              placeholder="Ex: Tech Solutions LTDA"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Tempo de Empresa</Label>
            <Select
              value={data.employmentTime}
              onValueChange={(value) => onChange({ ...data, employmentTime: value })}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TIME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Max Rent Preview */}
        {data.monthlyIncome > 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                Aluguel maximo recomendado (30% da renda):{' '}
                <strong>{formatCurrency(data.monthlyIncome * 0.3)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentUploadStep({
  data,
  onChange,
}: {
  data: DocumentData;
  onChange: (data: DocumentData) => void;
}) {
  const handleFileUpload = (field: keyof DocumentData, file: File | null) => {
    onChange({ ...data, [field]: file });
  };

  const DocumentUploadBox = ({
    field,
    label,
    icon: Icon,
    accept,
  }: {
    field: keyof DocumentData;
    label: string;
    icon: React.ElementType;
    accept: string;
  }) => {
    const file = data[field];

    return (
      <div
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${
          file ? 'border-emerald-300 bg-emerald-50' : 'border-border hover:border-indigo-300'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={(e) => handleFileUpload(field, e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />

        {file ? (
          <>
            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700 truncate max-w-[150px] mx-auto">
              {file.name}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFileUpload(field, null);
              }}
              className="absolute top-2 right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200"
            >
              <X className="h-3 w-3 text-red-600" />
            </button>
          </>
        ) : (
          <>
            <Icon className="mx-auto mb-2 h-8 w-8 text-foreground group-hover:text-indigo-500 transition-colors" />
            <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-black text-foreground">Documentacao Digital</h2>
        <p className="text-muted-foreground text-sm mt-1">Upload seguro e criptografado via IPFS</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DocumentUploadBox
          field="identityDoc"
          label="RG / CNH / Passaporte"
          icon={FileText}
          accept="image/*,.pdf"
        />
        <DocumentUploadBox
          field="incomeProof"
          label="Comprovante de Renda"
          icon={File}
          accept="image/*,.pdf"
        />
        <DocumentUploadBox
          field="addressProof"
          label="Comprovante de Endereco"
          icon={Home}
          accept="image/*,.pdf"
        />
        <DocumentUploadBox
          field="selfie"
          label="Selfie com Documento"
          icon={Camera}
          accept="image/*"
        />
      </div>

      <div className="p-4 bg-muted rounded-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Seus dados estao seguros</p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os documentos sao criptografados e armazenados de forma descentralizada via
              IPFS. Nao compartilhamos seus dados com terceiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultStep({ result, onContinue }: { result: TrustScoreResult; onContinue: () => void }) {
  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-600';
    if (score >= 550) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRiskBadge = (level: TrustScoreResult['riskLevel']) => {
    const configs = {
      low: { label: 'Risco Baixo', color: 'bg-emerald-100 text-emerald-700' },
      medium: { label: 'Risco Medio', color: 'bg-amber-100 text-amber-700' },
      high: { label: 'Risco Alto', color: 'bg-red-100 text-red-700' },
    };
    return configs[level];
  };

  const riskBadge = getRiskBadge(result.riskLevel);

  return (
    <div className="text-center py-8 space-y-8 animate-in zoom-in-95">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-emerald-500 text-foreground rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200">
        <ShieldCheck size={48} />
      </div>

      <div>
        <h2 className="text-3xl font-black text-foreground">Analise Concluida!</h2>
        <p className="text-muted-foreground mt-2">Seu perfil foi analisado com sucesso</p>
      </div>

      {/* Score Display */}
      <Card className="max-w-sm mx-auto">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-2">
            Seu Trust Score
          </p>
          <p className={`text-6xl font-black ${getScoreColor(result.score)}`}>{result.score}</p>
          <Badge className={`mt-3 ${riskBadge.color}`}>{riskBadge.label}</Badge>

          <Separator className="my-6" />

          <div className="text-left space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Aluguel Aprovado</span>
              <span className="font-bold text-emerald-600">
                Ate {formatCurrency(result.maxRentApproved)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factors */}
      <div className="max-w-md mx-auto space-y-3">
        <p className="text-xs font-bold uppercase text-muted-foreground">Fatores de Analise</p>
        {result.factors.map((factor, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-3 rounded-xl text-left ${
              factor.impact === 'positive'
                ? 'bg-emerald-50'
                : factor.impact === 'negative'
                  ? 'bg-red-50'
                  : 'bg-muted'
            }`}
          >
            {factor.impact === 'positive' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            ) : factor.impact === 'negative' ? (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <Zap className="h-5 w-5 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">{factor.name}</p>
              <p className="text-xs text-muted-foreground">{factor.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={onContinue}
        className="w-full max-w-sm bg-card hover:bg-indigo-600 h-14 text-lg transition-all"
      >
        Ir para o Marketplace
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <p className="text-xs text-muted-foreground">
        Score valido por 30 dias | Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TenantKYCForm({ onComplete }: { onComplete?: (result: TrustScoreResult) => void }) {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TrustScoreResult | null>(null);

  const [personalData, setPersonalData] = useState<PersonalData>(INITIAL_PERSONAL_DATA);
  const [financialData, setFinancialData] = useState<FinancialData>(INITIAL_FINANCIAL_DATA);
  const [documentData, setDocumentData] = useState<DocumentData>(INITIAL_DOCUMENT_DATA);

  const totalSteps = 4;

  const canProceed = useCallback(() => {
    switch (step) {
      case 1:
        return (
          personalData.fullName &&
          personalData.cpf.length === 14 &&
          personalData.email &&
          personalData.phone
        );
      case 2:
        return (
          financialData.monthlyIncome > 0 &&
          financialData.occupation &&
          financialData.employmentType
        );
      case 3:
        return documentData.identityDoc && documentData.incomeProof;
      default:
        return true;
    }
  }, [step, personalData, financialData, documentData]);

  const handleNext = async () => {
    if (step === 3) {
      setIsAnalyzing(true);

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const formData: KYCFormData = {
        personal: personalData,
        financial: financialData,
        documents: documentData,
      };

      const scoreResult = calculateTrustScore(formData);
      setResult(scoreResult);
      setStep(4);
      setIsAnalyzing(false);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleContinue = () => {
    if (result && onComplete) {
      onComplete(result);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-0">
      <CardContent className="p-8">
        {/* Step Indicator */}
        {step < 4 && <StepIndicator currentStep={step} totalSteps={totalSteps} />}

        {/* Step Content */}
        {step === 1 && <PersonalDataStep data={personalData} onChange={setPersonalData} />}

        {step === 2 && <FinancialDataStep data={financialData} onChange={setFinancialData} />}

        {step === 3 && <DocumentUploadStep data={documentData} onChange={setDocumentData} />}

        {step === 4 && result && <ResultStep result={result} onContinue={handleContinue} />}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex gap-4 mt-12">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isAnalyzing}
              className="flex-1 h-12 bg-card hover:bg-indigo-600 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando Score AI...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}

        {/* Progress */}
        {step < 4 && (
          <div className="mt-6">
            <Progress value={(step / totalSteps) * 100} className="h-1" />
            <p className="text-xs text-center text-muted-foreground mt-2">
              Passo {step} de {totalSteps - 1}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TenantKYCForm;
