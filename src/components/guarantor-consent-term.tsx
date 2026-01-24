/**
 * Vinculo.io - Termo de Consentimento do Garantidor
 *
 * Documento juridico-tech que o locador assina digitalmente para
 * ativar o Yield Stacking. Vinculado ao NFT do imovel.
 */

import { useState } from 'react';
import {
  FileText,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Check,
  Loader2,
  Fingerprint,
  ExternalLink,
  Building2,
  Percent,
  Clock,
  Scale,
  Lock,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ============================================
// TYPES
// ============================================

interface PropertyData {
  id: string;
  matricula: string;
  address: string;
  marketValue: number;
  ownerName: string;
  ownerCpf: string;
}

interface ConsentTermProps {
  property: PropertyData;
  onSign: (signatureData: SignatureData) => Promise<void>;
  onCancel: () => void;
}

interface SignatureData {
  propertyId: string;
  matricula: string;
  timestamp: Date;
  ipAddress: string;
  walletAddress: string;
  termsVersion: string;
  ltvPercentage: number;
  yieldPercentage: number;
}

// ============================================
// CONSTANTS
// ============================================

const TERMS_VERSION = '1.0.0';
const LTV_PERCENTAGE = 80;
const YIELD_PERCENTAGE = 5;
const GRACE_PERIOD_HOURS = 48;

const TERM_CLAUSES = [
  {
    number: 1,
    title: 'OBJETO',
    content: `O Proprietario autoriza a plataforma Vinculo.io a utilizar o imovel matriculado sob no [MATRICULA] como lastro de garantia para contratos de locacao de terceiros dentro do ecossistema.`,
    icon: Building2,
  },
  {
    number: 2,
    title: 'COLATERAL E LTV',
    content: `O Proprietario esta ciente de que o limite de garantia concedido respeitara o calculo de LTV = Valor_Mercado x 0.80 (oitenta por cento do valor de mercado do imovel).`,
    icon: Percent,
  },
  {
    number: 3,
    title: 'REMUNERACAO',
    content: `Em contrapartida a disponibilizacao do lastro, o Proprietario fara jus a 5% (cinco por cento) do valor bruto de cada aluguel garantido, pago automaticamente via Smart Contract no momento da liquidacao.`,
    icon: Percent,
  },
  {
    number: 4,
    title: 'EXECUCAO AUTOMATICA',
    content: `O Proprietario aceita e autoriza que, em caso de inadimplencia confirmada do locatario garantido (apos o prazo de carencia de 48h), o protocolo execute automaticamente a retencao de valores do seu pool de recebiveis ou execute o colateral conforme as regras da rede Polygon.`,
    icon: Clock,
  },
  {
    number: 5,
    title: 'IMUTABILIDADE',
    content: `Este termo e registrado em blockchain e possui forca executiva extrajudicial, conforme Art. 784, III do CPC e Lei 14.063/2020 sobre assinaturas eletronicas.`,
    icon: Lock,
  },
];

const ACKNOWLEDGMENTS = [
  {
    id: 'ownership',
    label: 'Declaro que sou o legitimo proprietario do imovel indicado',
  },
  {
    id: 'ltv',
    label: 'Compreendo que o limite de garantia sera de 80% do valor de mercado',
  },
  {
    id: 'yield',
    label: 'Entendo que receberei 5% de cada aluguel garantido pelo meu imovel',
  },
  {
    id: 'execution',
    label: 'Aceito a execucao automatica em caso de inadimplencia apos 48h',
  },
  {
    id: 'blockchain',
    label: 'Estou ciente que este termo sera registrado de forma imutavel na blockchain',
  },
  {
    id: 'legal',
    label: 'Li e concordo com todos os termos e condicoes acima descritos',
  },
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

function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// ============================================
// COMPONENTS
// ============================================

function PropertySummary({ property }: { property: PropertyData }) {
  const ltvValue = property.marketValue * (LTV_PERCENTAGE / 100);

  return (
    <Card className="bg-muted border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground/70 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Imovel Objeto da Garantia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Matricula</p>
            <p className="font-mono font-medium">{property.matricula}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Proprietario</p>
            <p className="font-medium">{property.ownerName}</p>
            <p className="text-xs text-muted-foreground">{formatCPF(property.ownerCpf)}</p>
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-muted-foreground text-sm">Endereco</p>
          <p className="font-medium text-sm">{property.address}</p>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-xs text-muted-foreground">Valor de Mercado</p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(property.marketValue)}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-xs text-emerald-600">Limite de Garantia (LTV)</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(ltvValue)}</p>
            <p className="text-[10px] text-emerald-500">{LTV_PERCENTAGE}% do valor</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TermClause({
  number,
  title,
  content,
  icon: Icon,
  matricula,
}: {
  number: number;
  title: string;
  content: string;
  icon: React.ElementType;
  matricula: string;
}) {
  const formattedContent = content.replace('[MATRICULA]', matricula);

  return (
    <div className="flex gap-4 py-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground/70" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground mb-2">
          <span className="text-emerald-600">{number}.</span> {title}
        </h4>
        <p className="text-sm text-muted-foreground/70 leading-relaxed">{formattedContent}</p>
      </div>
    </div>
  );
}

function SignatureSection({
  acknowledged,
  setAcknowledged,
  isSigning,
  onSign,
}: {
  acknowledged: Record<string, boolean>;
  setAcknowledged: (id: string, value: boolean) => void;
  isSigning: boolean;
  onSign: () => void;
}) {
  const allAcknowledged = ACKNOWLEDGMENTS.every((ack) => acknowledged[ack.id]);

  return (
    <Card className="border-2 border-emerald-200 bg-emerald-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Fingerprint className="h-5 w-5" />
          Assinatura Digital
        </CardTitle>
        <CardDescription>
          Confirme cada item abaixo para assinar digitalmente este termo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ACKNOWLEDGMENTS.map((ack) => (
          <div key={ack.id} className="flex items-start gap-3">
            <Checkbox
              id={ack.id}
              checked={acknowledged[ack.id] || false}
              onCheckedChange={(checked) => setAcknowledged(ack.id, checked as boolean)}
              className="mt-0.5"
            />
            <Label
              htmlFor={ack.id}
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              {ack.label}
            </Label>
          </div>
        ))}

        <Separator className="my-6" />

        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            Ao assinar, voce concorda com a execucao automatica via Smart Contract em caso de
            inadimplencia. Esta acao e irreversivel e sera registrada na blockchain.
          </p>
        </div>

        <Button
          onClick={onSign}
          disabled={!allAcknowledged || isSigning}
          className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
          size="lg"
        >
          {isSigning ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Registrando na Blockchain...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" />
              Assinar Termo de Adesao
            </>
          )}
        </Button>

        <p className="text-[10px] text-center text-muted-foreground">
          Versao do Termo: {TERMS_VERSION} | Data: {formatDate(new Date())}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GuarantorConsentTerm({ property, onSign, onCancel }: ConsentTermProps) {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});
  const [isSigning, setIsSigning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAcknowledge = (id: string, value: boolean) => {
    setAcknowledged((prev) => ({ ...prev, [id]: value }));
  };

  const handleSign = async () => {
    setIsSigning(true);

    try {
      const signatureData: SignatureData = {
        propertyId: property.id,
        matricula: property.matricula,
        timestamp: new Date(),
        ipAddress: '0.0.0.0', // Will be captured server-side
        walletAddress: '0x...', // Will be captured from wallet
        termsVersion: TERMS_VERSION,
        ltvPercentage: LTV_PERCENTAGE,
        yieldPercentage: YIELD_PERCENTAGE,
      };

      await onSign(signatureData);
      setShowSuccess(true);
    } catch (error) {
      console.error('Erro ao assinar termo:', error);
    } finally {
      setIsSigning(false);
    }
  };

  if (showSuccess) {
    return (
      <Card className="max-w-2xl mx-auto border-emerald-200">
        <CardContent className="py-12 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <Check className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Termo Assinado com Sucesso!</h2>
            <p className="text-muted-foreground/70">
              Seu imovel agora esta habilitado para o programa de garantidores.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg inline-block">
            <p className="text-xs text-muted-foreground mb-1">Hash da Transacao</p>
            <code className="text-sm font-mono text-emerald-600">
              0x7a2f...3f1b
            </code>
            <a
              href="#"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2 justify-center"
            >
              Ver no PolygonScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onCancel}>
              Voltar ao Dashboard
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Ver Meus Contratos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge className="bg-emerald-100 text-emerald-700">
          <Shield className="h-3 w-3 mr-1" />
          Documento Juridico-Tech
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">
          Termo de Adesao ao Protocolo de Garantia Segura
        </h1>
        <p className="text-muted-foreground">
          Este termo sera registrado de forma imutavel na blockchain Polygon
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property Summary */}
        <div className="lg:col-span-1">
          <PropertySummary property={property} />
        </div>

        {/* Terms Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Clausulas do Termo
              </CardTitle>
              <CardDescription>
                Leia atentamente cada clausula antes de assinar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="divide-y divide-zinc-100">
                  {TERM_CLAUSES.map((clause) => (
                    <TermClause
                      key={clause.number}
                      number={clause.number}
                      title={clause.title}
                      content={clause.content}
                      icon={clause.icon}
                      matricula={property.matricula}
                    />
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Legal Footer */}
                <div className="p-4 bg-muted rounded-lg text-xs text-muted-foreground/70 space-y-2">
                  <p>
                    <strong>Base Legal:</strong> Este termo e celebrado com base na Lei 14.063/2020
                    (assinaturas eletronicas), Lei 10.406/2002 (Codigo Civil) e Art. 784, III do CPC
                    (titulo executivo extrajudicial).
                  </p>
                  <p>
                    <strong>Jurisdicao:</strong> Foro da Comarca de Cuiaba/MT para dirimir quaisquer
                    controversias.
                  </p>
                  <p>
                    <strong>Smart Contract:</strong> VinculoProtocol.sol na rede Polygon (Chain ID:
                    137).
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Signature Section */}
          <SignatureSection
            acknowledged={acknowledged}
            setAcknowledged={handleAcknowledge}
            isSigning={isSigning}
            onSign={handleSign}
          />

          {/* Cancel Button */}
          <div className="flex justify-center">
            <Button variant="ghost" onClick={onCancel} disabled={isSigning}>
              Cancelar e Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DEMO WRAPPER (for testing)
// ============================================

export function GuarantorConsentTermDemo() {
  const mockProperty: PropertyData = {
    id: 'prop_001',
    matricula: '12.345-CRI-MT',
    address: 'Rua das Flores, 123 - Jardim Europa, Cuiaba/MT - CEP 78000-000',
    marketValue: 450000,
    ownerName: 'Renato Silva',
    ownerCpf: '123.456.789-00',
  };

  const handleSign = async (signatureData: SignatureData) => {
    console.log('Assinatura recebida:', signatureData);
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  const handleCancel = () => {
    console.log('Cancelado');
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <GuarantorConsentTerm property={mockProperty} onSign={handleSign} onCancel={handleCancel} />
    </div>
  );
}

export default GuarantorConsentTerm;
