import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Calculator,
  FileText,
  Shield,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Home,
  MapPin,
  TrendingUp,
  Loader2,
  QrCode,
  Copy,
  Clock,
  Zap
} from 'lucide-react';
import { calculateRentalBreakdown, type RentalBreakdownResult } from '@/services/FinancialService';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/assets/new' as any)({
  component: NewAssetWizard,
});

const MINT_FEE = 250.00;

interface WizardData {
  // Step 1: Asset Data
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  propertyType: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL' | '';

  // Step 2: Financial
  ownerNetRequest: number;
  hasAgency: boolean;
  agencyRate: number;
  agencyModel: 'DEDUCT_FROM_OWNER' | 'ADD_ON_PRICE';

  // Step 3: Documents
  matriculaFile: File | null;
  iptuFile: File | null;

  // Step 4: Insurance
  insuranceLead: boolean;

  // Calculated
  breakdown: RentalBreakdownResult | null;
}

const STEPS = [
  { id: 1, name: 'O Ativo', icon: Building2, description: 'Dados Físicos' },
  { id: 2, name: 'Potencial', icon: Calculator, description: 'Financeiro' },
  { id: 3, name: 'A Prova', icon: FileText, description: 'Documentação' },
  { id: 4, name: 'Proteção', icon: Shield, description: 'Seguro' },
  { id: 5, name: 'Pagamento', icon: CreditCard, description: 'Checkout' },
];

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartamento', icon: '🏢' },
  { value: 'HOUSE', label: 'Casa', icon: '🏠' },
  { value: 'COMMERCIAL', label: 'Comercial', icon: '🏪' },
];

function NewAssetWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | null>(null);

  const [data, setData] = useState<WizardData>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    propertyType: '',
    ownerNetRequest: 1000,
    hasAgency: false,
    agencyRate: 10,
    agencyModel: 'DEDUCT_FROM_OWNER',
    matriculaFile: null,
    iptuFile: null,
    insuranceLead: false,
    breakdown: null,
  });

  const updateData = (field: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...field }));
  };

  // Auto-calculate breakdown when financial data changes
  const updateFinancialData = (field: Partial<WizardData>) => {
    const newData = { ...data, ...field };
    const breakdown = calculateRentalBreakdown({
      ownerNetRequest: newData.ownerNetRequest,
      hasAgency: newData.hasAgency,
      agencyCommissionRate: newData.agencyRate,
      agencyCommissionModel: newData.agencyModel,
    });
    setData({ ...newData, breakdown });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.street && data.number && data.city && data.state && data.propertyType;
      case 2:
        return data.ownerNetRequest > 0;
      case 3:
        return data.matriculaFile && data.iptuFile;
      case 4:
        return true; // Optional step
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGeneratePayment = () => {
    // Open payment modal instead of minting immediately
    setShowPaymentModal(true);
  };

  const handleSimulatePixPayment = async () => {
    setIsProcessing(true);
    setShowPaymentModal(false);

    // Simulate payment detection
    await new Promise(resolve => setTimeout(resolve, 1500)); // Identificando pagamento...

    // Simulate NFT minting process
    await new Promise(resolve => setTimeout(resolve, 2000)); // Mintando NFT...
    await new Promise(resolve => setTimeout(resolve, 1500)); // Validando Matrícula...

    setIsProcessing(false);
    // Redirect to success page
    window.location.href = '/assets/success';
  };

  const handleBoletoAwait = () => {
    setShowPaymentModal(false);
    // Redirect to pending payment page
    window.location.href = '/assets/pending';
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Home className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Wizard de Tokenização</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Transforme seu imóvel em um NFT de Garantia Real
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && 'border-green-500 bg-green-500 text-white',
                    !isActive && !isCompleted && 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center hidden md:block">
                  <div className={cn('text-sm font-semibold', isActive && 'text-primary')}>
                    {step.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && <Step1AssetData data={data} updateData={updateData} />}
        {currentStep === 2 && <Step2Financial data={data} updateData={updateFinancialData} />}
        {currentStep === 3 && <Step3Documents data={data} updateData={updateData} />}
        {currentStep === 4 && <Step4Insurance data={data} updateData={updateData} />}
        {currentStep === 5 && <Step5Checkout data={data} />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isProcessing}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {currentStep < 5 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isProcessing}
          >
            Próximo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGeneratePayment}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Gerar Cobrança de Setup
                <CreditCard className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Pagamento da Taxa de Setup
            </DialogTitle>
            <DialogDescription>
              Escolha a forma de pagamento para criar seu NFT de Garantia Real
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Payment Amount */}
            <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg border-2 border-primary/20">
              <div className="text-sm text-muted-foreground mb-2">Valor da Taxa</div>
              <div className="text-4xl font-bold text-primary">R$ 250,00</div>
              <div className="text-xs text-muted-foreground mt-2">
                Pagamento único para tokenização
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
              <div className="text-sm font-semibold">Escolha o método de pagamento:</div>

              {/* PIX Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={cn(
                  'w-full p-6 rounded-lg border-2 text-left transition-all',
                  paymentMethod === 'pix'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-1">PIX - Aprovação Instantânea</div>
                    <div className="text-sm text-muted-foreground">
                      Pague com QR Code e seu NFT é criado em segundos
                    </div>
                  </div>
                  {paymentMethod === 'pix' && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>
              </button>

              {/* Boleto Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('boleto')}
                className={cn(
                  'w-full p-6 rounded-lg border-2 text-left transition-all',
                  paymentMethod === 'boleto'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-1">Boleto - Compensação em 1-2 dias</div>
                    <div className="text-sm text-muted-foreground">
                      NFT será criado após confirmação bancária
                    </div>
                  </div>
                  {paymentMethod === 'boleto' && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </div>
              </button>
            </div>

            {/* PIX QR Code */}
            {paymentMethod === 'pix' && (
              <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
                <div className="text-center">
                  <div className="text-sm font-semibold mb-4">Escaneie o QR Code</div>
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <QrCode className="w-48 h-48 text-gray-400" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-4">
                    QR Code fictício para demonstração
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold">Ou copie o código PIX:</div>
                  <div className="flex gap-2">
                    <Input
                      value="00020126580014BR.GOV.BCB.PIX..."
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="text-sm text-yellow-900 dark:text-yellow-100">
                    ⚡ <strong>Pagamento Instantâneo:</strong> Após o pagamento ser detectado,
                    o NFT será mintado automaticamente na blockchain.
                  </div>
                </div>

                {/* Simulation Button */}
                <Button
                  onClick={handleSimulatePixPayment}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Simular Pagamento PIX Aprovado (Teste)
                </Button>
              </div>
            )}

            {/* Boleto Code */}
            {paymentMethod === 'boleto' && (
              <div className="space-y-4 p-6 bg-muted/50 rounded-lg border">
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Código de Barras do Boleto:</div>
                  <div className="flex gap-2">
                    <Input
                      value="34191.79001 01043.510047 91020.150008 1 23450000025000"
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <div className="font-semibold mb-2">⏰ Prazo de Compensação</div>
                    <div>
                      O boleto leva de 1 a 2 dias úteis para compensar. Você receberá um
                      email assim que o pagamento for confirmado e o NFT for criado.
                    </div>
                  </div>
                </div>

                {/* Boleto Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleBoletoAwait}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Paguei via Boleto (Aguardar)
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Baixar Boleto (PDF)
                  </Button>
                </div>
              </div>
            )}

            {!paymentMethod && (
              <div className="text-center text-sm text-muted-foreground py-4">
                Selecione um método de pagamento acima
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                Processando Pagamento...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Identificando pagamento PIX...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4" />
                  <span>Mintando NFT na Polygon...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4" />
                  <span>Validando Matrícula...</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4" />
                  <span>Registrando na Blockchain...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// STEP 1: Asset Data
function Step1AssetData({ data, updateData }: { data: WizardData; updateData: (d: Partial<WizardData>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Qual imóvel será sua Garantia Real?
        </CardTitle>
        <CardDescription>
          Informe os dados físicos do imóvel que será tokenizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Type */}
        <div className="space-y-3">
          <Label>Tipo do Imóvel</Label>
          <div className="grid grid-cols-3 gap-4">
            {PROPERTY_TYPES.map((type) => (
              <button
                type="button"
                key={type.value}
                onClick={() => updateData({ propertyType: type.value as typeof data.propertyType })}
                className={cn(
                  'p-4 rounded-lg border-2 text-center transition-all hover:border-primary/50',
                  data.propertyType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="font-semibold">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Address */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              value={data.cep}
              onChange={(e) => updateData({ cep: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              placeholder="Av. Paulista"
              value={data.street}
              onChange={(e) => updateData({ street: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              placeholder="1000"
              value={data.number}
              onChange={(e) => updateData({ number: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              placeholder="Apto 101"
              value={data.complement}
              onChange={(e) => updateData({ complement: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              placeholder="Bela Vista"
              value={data.neighborhood}
              onChange={(e) => updateData({ neighborhood: e.target.value })}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              placeholder="São Paulo"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              placeholder="SP"
              maxLength={2}
              value={data.state}
              onChange={(e) => updateData({ state: e.target.value.toUpperCase() })}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// STEP 2: Financial Simulation
function Step2Financial({ data, updateData }: { data: WizardData; updateData: (d: Partial<WizardData>) => void }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Potencial Financeiro
          </CardTitle>
          <CardDescription>
            Defina quanto você espera receber mensalmente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Owner Net Request */}
          <div className="space-y-2">
            <Label htmlFor="ownerNet" className="text-base font-semibold">
              Quanto você espera receber LÍQUIDO? 💰
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="ownerNet"
                type="number"
                value={data.ownerNetRequest}
                onChange={(e) => updateData({ ownerNetRequest: Number(e.target.value) })}
                className="pl-10 text-lg font-semibold"
                min={0}
                step={50}
              />
            </div>
          </div>

          <Separator />

          {/* Has Agency */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hasAgency" className="text-base font-semibold">
                É administrado por Imobiliária?
              </Label>
              <p className="text-sm text-muted-foreground">
                Se a gestão passa por uma agência
              </p>
            </div>
            <Switch
              id="hasAgency"
              checked={data.hasAgency}
              onCheckedChange={(checked) => updateData({ hasAgency: checked })}
            />
          </div>

          {/* Agency Details */}
          {data.hasAgency && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="agencyRate">Taxa da Imobiliária (%)</Label>
                <Input
                  id="agencyRate"
                  type="number"
                  value={data.agencyRate}
                  onChange={(e) => updateData({ agencyRate: Number(e.target.value) })}
                  min={0}
                  max={30}
                  step={0.5}
                />
              </div>

              <div className="space-y-2">
                <Label>Modelo de Cobrança</Label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => updateData({ agencyModel: 'DEDUCT_FROM_OWNER' })}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-left transition-colors',
                      data.agencyModel === 'DEDUCT_FROM_OWNER'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="font-semibold">Desconta do Proprietário</div>
                    <div className="text-sm text-muted-foreground">
                      A comissão sai do valor líquido
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateData({ agencyModel: 'ADD_ON_PRICE' })}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-left transition-colors',
                      data.agencyModel === 'ADD_ON_PRICE'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="font-semibold">Cobra por Fora</div>
                    <div className="text-sm text-muted-foreground">
                      Adicionada ao preço total
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Financial Preview */}
      {data.breakdown && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Projeção em Tempo Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Inquilino Pagará</div>
              <div className="text-4xl font-bold text-primary">
                R$ {data.breakdown.totalRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Você recebe (líquido):</span>
                <span className="font-semibold text-green-600">
                  R$ {data.breakdown.ownerNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {data.breakdown.agencyCommission > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comissão Imobiliária:</span>
                  <span className="font-semibold text-orange-600">
                    R$ {data.breakdown.agencyCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Garantia NFT (5%):</span>
                <span className="font-semibold">
                  R$ {data.breakdown.guarantorFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seguro:</span>
                <span className="font-semibold">
                  R$ {data.breakdown.insuranceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// STEP 3: Documents
function Step3Documents({ data, updateData }: { data: WizardData; updateData: (d: Partial<WizardData>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Validação Jurídica (Due Diligence)
        </CardTitle>
        <CardDescription>
          Esses documentos serão hashados e registrados na Blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Matrícula */}
        <div className="space-y-3">
          <Label htmlFor="matricula" className="text-base font-semibold">
            Matrícula Atualizada (PDF) *
          </Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              id="matricula"
              type="file"
              accept=".pdf"
              onChange={(e) => updateData({ matriculaFile: e.target.files?.[0] || null })}
              className="hidden"
            />
            <label htmlFor="matricula" className="cursor-pointer">
              {data.matriculaFile ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">{data.matriculaFile.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Clique para fazer upload da Matrícula
                  </div>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            📄 Documento que comprova a propriedade do imóvel
          </p>
        </div>

        <Separator />

        {/* IPTU */}
        <div className="space-y-3">
          <Label htmlFor="iptu" className="text-base font-semibold">
            Capa do IPTU (Foto/PDF) *
          </Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              id="iptu"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => updateData({ iptuFile: e.target.files?.[0] || null })}
              className="hidden"
            />
            <label htmlFor="iptu" className="cursor-pointer">
              {data.iptuFile ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">{data.iptuFile.name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    Clique para fazer upload do IPTU
                  </div>
                </div>
              )}
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            🏛️ Comprovante de pagamento ou carnê do IPTU
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <div className="font-semibold mb-1">Segurança e Privacidade</div>
              <div>
                Seus documentos são criptografados e apenas o hash (impressão digital) é armazenado
                na blockchain. Os arquivos originais ficam em ambiente seguro com acesso restrito.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// STEP 4: Insurance
function Step4Insurance({ data, updateData }: { data: WizardData; updateData: (d: Partial<WizardData>) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Proteção do Patrimônio
        </CardTitle>
        <CardDescription>
          Opcional: Proteja seu imóvel contra incêndio e danos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">Seguro Lead</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Receba cotações automáticas de seguros para proteger seu patrimônio contra
                incêndio, enchentes, danos estruturais e outras coberturas.
              </p>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Cobertura contra incêndio e explosão</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Danos elétricos e hidráulicos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Responsabilidade civil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Assistência 24h</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={data.insuranceLead}
                  onCheckedChange={(checked) => updateData({ insuranceLead: checked as boolean })}
                />
                <label
                  htmlFor="insurance"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sim, aceito receber cotação automática
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Esta etapa é opcional. Você pode continuar sem contratar o seguro.
            No entanto, recomendamos a proteção para maior tranquilidade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// STEP 5: Checkout
function Step5Checkout({ data }: { data: WizardData }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Resumo do Ativo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Endereço</div>
            <div className="font-semibold">
              <MapPin className="w-4 h-4 inline mr-1" />
              {data.street}, {data.number}
              {data.complement && ` - ${data.complement}`}
            </div>
            <div className="text-sm text-muted-foreground">
              {data.neighborhood && `${data.neighborhood}, `}
              {data.city} - {data.state}
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-1">Tipo</div>
            <div className="font-semibold">
              {PROPERTY_TYPES.find(t => t.value === data.propertyType)?.label}
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-1">Valor Mensal Esperado</div>
            <div className="font-semibold text-lg">
              R$ {data.ownerNetRequest.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <Separator />

          <div>
            <div className="text-sm text-muted-foreground mb-1">Documentos</div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matrícula: {data.matriculaFile?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>IPTU: {data.iptuFile?.name}</span>
              </div>
            </div>
          </div>

          {data.insuranceLead && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-semibold">Lead de Seguro ativo</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Pagamento & Mint NFT
          </CardTitle>
          <CardDescription>
            Taxa única para criação do NFT de Garantia Real
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-6 border-2 border-primary/20">
            <div className="text-center mb-4">
              <div className="text-sm text-muted-foreground mb-2">Investimento Total</div>
              <div className="text-5xl font-bold text-primary">R$ 250,00</div>
              <div className="text-sm text-muted-foreground mt-2">Taxa única</div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Criação do NFT de Garantia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Setup Jurídico Completo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Registro na Blockchain Polygon</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Hash dos Documentos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Validação Imediata</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-2xl">🏦</div>
              <div className="text-sm text-yellow-900 dark:text-yellow-100">
                <div className="font-semibold mb-1">Credibilidade Bancária</div>
                <div>
                  Este NFT tem validade jurídica e pode ser usado como garantia real
                  em contratos de aluguel e operações financeiras.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
