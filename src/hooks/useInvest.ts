// ============================================
// HOOK: useInvest
// API Integration para criar ordens de investimento
// ============================================

import { useState } from 'react';

interface PixData {
  qrCode: string; // Base64 image or URL
  copyPaste: string; // Pix copy-paste code
  expiresAt?: string;
  orderId: string; // ID do pedido para polling
}

interface InvestmentResponse {
  success: boolean;
  data: {
    intentId: string;
    listing: {
      id: string;
      askingPrice: number;
      totalMonths: number;
    };
    externalReference: string;
    paymentDetails: {
      amount: number;
      description: string;
      externalReference: string;
    };
    pixQrCode?: string; // QR Code image (base64)
    pixQrCodeImage?: string; // Alternative field name
    pixCode?: string; // Copy-paste code
    pixExpiresAt?: string;
    message: string;
  };
}

export function useInvest() {
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cria uma ordem de investimento (buy intent)
   * Retorna os dados do Pix para pagamento
   */
  const createOrder = async (listingId: string): Promise<InvestmentResponse['data'] | null> => {
    setLoading(true);
    setError(null);

    try {
      // Chamar API real do backend
      const response = await fetch('/api/p2p/buy-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
          // TODO: Add userId from auth context
          // buyerId: getCurrentUser().id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar ordem de investimento');
      }

      const result: InvestmentResponse = await response.json();

      if (!result.success) {
        throw new Error(result.data?.message || 'Erro ao processar pedido');
      }

      // Extrair dados do Pix (o backend pode mandar em formatos diferentes)
      const pixQrCodeImage = result.data.pixQrCode || result.data.pixQrCodeImage;
      const pixCopyPaste = result.data.pixCode;

      if (pixQrCodeImage && pixCopyPaste) {
        setPixData({
          qrCode: pixQrCodeImage,
          copyPaste: pixCopyPaste,
          expiresAt: result.data.pixExpiresAt,
          orderId: result.data.intentId, // Salvar ID para polling
        });
      }

      // Log de sucesso
      console.log('✅ Ordem de investimento criada:', {
        intentId: result.data.intentId,
        amount: result.data.paymentDetails.amount,
        reference: result.data.externalReference,
      });

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro ao criar ordem:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpa os dados do Pix (para resetar o fluxo)
   */
  const resetPixData = () => {
    setPixData(null);
    setError(null);
  };

  /**
   * Verifica o status de um pagamento (polling)
   * Útil para saber quando o Pix foi confirmado
   */
  const checkPaymentStatus = async (orderId: string): Promise<{
    status: 'PENDING' | 'PAID' | 'SETTLING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
    txHash?: string;
  }> => {
    try {
      const response = await fetch(`/api/invest/orders/${orderId}/status`);
      const data = await response.json();
      return {
        status: data.status || 'PENDING',
        txHash: data.txHash,
      };
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      return { status: 'PENDING' };
    }
  };

  return {
    createOrder,
    loading,
    pixData,
    error,
    resetPixData,
    checkPaymentStatus,
  };
}
