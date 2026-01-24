// ============================================
// Admin: Modal de Rescisão Antecipada
// Lei do Inquilinato - Art. 4º (Multa Proporcional)
// ============================================

import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertCircle,
  Calculator,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// ============================================
// TYPES
// ============================================

interface TerminationSimulation {
  contractId: string;
  contractStartDate: string;
  contractEndDate: string;
  exitDate: string;
  monthlyRent: number;
  totalDurationMonths: number;
  elapsedMonths: number;
  remainingMonths: number;
  baseFineMonths: number;
  baseFineValue: number;
  proportionalFine: number;
  investorTotalOwed: number;
  investorPayout: number;
  hasShortfall: boolean;
  ownerDebt: number;
  investorId?: string;
  ownerId?: string;
  summary: string[];
}

interface Contract {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentValue: number;
  status: string;
  property?: {
    title: string;
    owner?: {
      name: string;
    };
  };
}

interface TerminationModalProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTerminationComplete?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function TerminationModal({
  contract,
  open,
  onOpenChange,
  onTerminationComplete,
}: TerminationModalProps) {
  const [exitDate, setExitDate] = useState<string>('');
  const [baseFineMonths, setBaseFineMonths] = useState<number>(3);
  const [simulation, setSimulation] = useState<TerminationSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState<'input' | 'preview' | 'confirm'>('input');

  // Reset state when modal opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setExitDate('');
      setBaseFineMonths(3);
      setSimulation(null);
      setStep('input');
    }
    onOpenChange(isOpen);
  };

  // Simulate termination
  const handleSimulate = async () => {
    if (!contract || !exitDate) {
      toast.error('Selecione a data de entrega das chaves');
      return;
    }

    setIsSimulating(true);

    try {
      const response = await fetch(`/api/contracts/${contract.id}/simulate-termination`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exitDate,
          baseFineMonths,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao simular rescisão');
      }

      const data = await response.json();
      setSimulation(data.simulation);
      setStep('preview');

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao simular rescisão');
    } finally {
      setIsSimulating(false);
    }
  };

  // Execute termination
  const handleExecute = async () => {
    if (!contract || !exitDate) return;

    setIsExecuting(true);

    try {
      const response = await fetch(`/api/contracts/${contract.id}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exitDate,
          baseFineMonths,
          confirmTermination: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar rescisão');
      }

      toast.success('Contrato rescindido com sucesso!');
      handleOpenChange(false);
      onTerminationComplete?.();

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao executar rescisão');
    } finally {
      setIsExecuting(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Rescisão Antecipada
          </DialogTitle>
          <DialogDescription>
            Lei do Inquilinato - Art. 4º (Multa Proporcional)
          </DialogDescription>
        </DialogHeader>

        {/* Contract Info */}
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p><strong>Contrato:</strong> {contract.id.slice(0, 8)}...</p>
          <p><strong>Inquilino:</strong> {contract.tenantName}</p>
          <p><strong>Imóvel:</strong> {contract.property?.title || 'N/A'}</p>
          <p><strong>Aluguel:</strong> {formatCurrency(contract.rentValue)}/mês</p>
        </div>

        <Separator />

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exitDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Entrega das Chaves
              </Label>
              <Input
                id="exitDate"
                type="date"
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                min={contract.startDate.split('T')[0]}
                max={contract.endDate.split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Contrato: {new Date(contract.startDate).toLocaleDateString('pt-BR')} até {new Date(contract.endDate).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseFineMonths">
                Multa Base (meses de aluguel)
              </Label>
              <Input
                id="baseFineMonths"
                type="number"
                min={1}
                max={12}
                value={baseFineMonths}
                onChange={(e) => setBaseFineMonths(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Padrão de mercado: 3 meses
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSimulate} disabled={!exitDate || isSimulating}>
                {isSimulating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Simular Rescisão
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && simulation && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Cálculo da Multa
              </h4>

              <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Duração do contrato:</span>
                  <span className="font-medium">{simulation.totalDurationMonths} meses</span>
                </div>
                <div className="flex justify-between">
                  <span>Meses cumpridos:</span>
                  <span className="font-medium">{simulation.elapsedMonths} meses</span>
                </div>
                <div className="flex justify-between">
                  <span>Meses restantes:</span>
                  <span className="font-medium text-orange-600">{simulation.remainingMonths} meses</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span>Multa base ({simulation.baseFineMonths} meses):</span>
                  <span className="font-medium">{formatCurrency(simulation.baseFineValue)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Multa proporcional:</span>
                  <span className="text-blue-600">{formatCurrency(simulation.proportionalFine)}</span>
                </div>
              </div>
            </div>

            {/* Investor Protection */}
            {simulation.investorId && (
              <div className="space-y-2">
                <h4 className="font-medium">Proteção ao Investidor</h4>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total devido ao investidor:</span>
                    <span className="font-medium">{formatCurrency(simulation.investorTotalOwed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multa para investidor:</span>
                    <span className="font-medium text-green-600">{formatCurrency(simulation.investorPayout)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Shortfall Warning */}
            {simulation.hasShortfall && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Déficit Identificado</AlertTitle>
                <AlertDescription>
                  A multa não cobre o valor total devido ao investidor.
                  O proprietário será cobrado em <strong>{formatCurrency(simulation.ownerDebt)}</strong> (Coobrigação).
                </AlertDescription>
              </Alert>
            )}

            {/* No Shortfall */}
            {simulation.investorId && !simulation.hasShortfall && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Multa Suficiente</AlertTitle>
                <AlertDescription>
                  A multa cobre o investimento. Sem débito para o proprietário.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('input')}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={() => setStep('confirm')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Confirmar Rescisão
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 'confirm' && simulation && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Ação Irreversível</AlertTitle>
              <AlertDescription>
                Esta ação irá:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Encerrar o contrato de locação</li>
                  <li>Gerar cobrança de multa ao inquilino ({formatCurrency(simulation.proportionalFine)})</li>
                  {simulation.hasShortfall && (
                    <li>Gerar cobrança ao proprietário ({formatCurrency(simulation.ownerDebt)})</li>
                  )}
                  <li>Liberar o imóvel para nova locação</li>
                  {simulation.investorId && (
                    <li>Encerrar repasses ao investidor P2P</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>

            <p className="text-sm text-center text-muted-foreground">
              Tem certeza que deseja prosseguir?
            </p>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('preview')}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={handleExecute}
                disabled={isExecuting}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirmar Rescisão
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
