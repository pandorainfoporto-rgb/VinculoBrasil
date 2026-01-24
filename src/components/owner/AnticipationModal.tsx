// ============================================
// MODAL DE ANTECIPAÇÃO DE RECEBÍVEIS
// Fluxo Self-Service 100% Automatizado
// ============================================

import { useState } from 'react';
import { Banknote, ArrowRight, AlertCircle, Check, X, TrendingUp, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Contract {
  id: string;
  property: string;
  rentValue: number;
  status: string;
}

interface AnticipationModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: number; months: number; listingData: any }) => void;
}

export function AnticipationModal({ contract, isOpen, onClose, onConfirm }: AnticipationModalProps) {
  // CONFIGURAÇÕES (Isso viria do Backend/Settings depois)
  const MONTHS_TO_SELL = 12;
  const DISCOUNT_RATE = 0.15; // 15% de deságio (Retorno do Investidor)
  const PLATFORM_FEE = 0.05; // 5% Taxa Vínculo

  const totalValue = contract.rentValue * MONTHS_TO_SELL;
  const investorProfit = totalValue * DISCOUNT_RATE;
  const vinculoFee = totalValue * PLATFORM_FEE;
  const netReceive = totalValue - investorProfit - vinculoFee;

  const [step, setStep] = useState(1);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleConfirm = () => {
    const listingData = {
      contractId: contract.id,
      totalValue,
      investorProfit,
      platformFee: vinculoFee,
      netAmount: netReceive,
      months: MONTHS_TO_SELL,
      discountRate: DISCOUNT_RATE,
    };
    onConfirm({ amount: netReceive, months: MONTHS_TO_SELL, listingData });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Banknote className="text-blue-600" />
            Antecipar Aluguéis
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            {step === 1 ? 'Simule quanto você pode receber agora' : 'Confirme a operação'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          /* PASSO 1: A SIMULAÇÃO */
          <div className="space-y-4 mt-4">
            {/* Card de Destaque - Valor Total */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 mb-1 font-medium">Valor Total (12 meses)</p>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalValue)}</p>
              <p className="text-xs text-blue-700 mt-1">
                {formatCurrency(contract.rentValue)} x {MONTHS_TO_SELL} meses
              </p>
            </div>

            {/* Breakdown de Valores */}
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  Deságio (Lucro Investidor)
                </span>
                <span className="text-red-600 font-semibold">
                  - {formatCurrency(investorProfit)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 pl-6">
                <span>Taxa de retorno: {(DISCOUNT_RATE * 100).toFixed(0)}% a.a.</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-purple-500" />
                  Taxa da Plataforma
                </span>
                <span className="text-red-600 font-semibold">- {formatCurrency(vinculoFee)}</span>
              </div>

              <div className="h-px bg-gray-300 my-2"></div>

              {/* Valor Líquido - Destaque */}
              <div className="flex justify-between items-center bg-green-50 -mx-4 -mb-4 p-4 rounded-b-xl border-t-2 border-green-200">
                <span className="text-lg font-bold text-green-800">Você Recebe (À Vista)</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(netReceive)}
                </span>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-800">
                💡 <strong>Como funciona:</strong> Você vende os próximos {MONTHS_TO_SELL} meses de
                aluguel para investidores. O dinheiro cai na sua conta em até 24h após a venda.
              </p>
            </div>

            {/* CTA - Avançar */}
            <Button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 mt-4 text-base"
            >
              Sim, quero vender <ArrowRight size={20} />
            </Button>

            <button
              onClick={onClose}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          /* PASSO 2: O ACEITE E DISPARO */
          <div className="space-y-4 mt-4">
            {/* Warning Card */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 flex gap-3">
              <AlertCircle className="text-yellow-600 w-6 h-6 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900">
                <p className="font-semibold mb-2">⚠️ Confirme antes de prosseguir:</p>
                <ul className="space-y-1 text-xs text-yellow-800">
                  <li>• Seu contrato será tokenizado e ofertado no marketplace</li>
                  <li>
                    • Investidores receberão notificação automática por WhatsApp e E-mail
                  </li>
                  <li>• Assim que um investidor comprar, o valor cai na sua conta cadastrada</li>
                  <li>
                    • Os próximos {MONTHS_TO_SELL} meses de aluguel serão direcionados ao comprador
                  </li>
                </ul>
              </div>
            </div>

            {/* Resumo Rápido */}
            <div className="bg-gray-100 p-4 rounded-xl">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Imóvel</p>
                  <p className="font-semibold text-gray-900">{contract.property}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Você recebe</p>
                  <p className="font-bold text-green-700">{formatCurrency(netReceive)}</p>
                </div>
              </div>
            </div>

            {/* CTA - Confirmar */}
            <Button
              onClick={handleConfirm}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 text-base"
            >
              <Check size={20} /> Confirmar e Ofertar
            </Button>

            {/* Voltar */}
            <button
              onClick={() => setStep(1)}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Voltar para simulação
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
