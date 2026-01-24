// ============================================
// Admin: Tabela de Pedidos de Investimento
// Com botão de retry para pedidos com falha
// ============================================

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface InvestmentOrder {
  id: string;
  userId: string;
  listingId: string;
  status: 'PENDING' | 'AWAITING_PAYMENT' | 'PAID' | 'SETTLING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalPrice: number;
  asaasPaymentId?: string;
  txHash?: string;
  errorMessage?: string;
  createdAt: string;
  paidAt?: string;
  settledAt?: string;
}

interface InvestmentOrdersTableProps {
  orders: InvestmentOrder[];
  onRefresh?: () => void;
}

export function InvestmentOrdersTable({ orders, onRefresh }: InvestmentOrdersTableProps) {
  const [retrying, setRetrying] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'AWAITING_PAYMENT':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Aguardando
          </Badge>
        );
      case 'PAID':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pago
          </Badge>
        );
      case 'SETTLING':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            Liquidando
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Falhou
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRetry = async (order: InvestmentOrder) => {
    if (!order.asaasPaymentId) {
      toast.error("Pedido não tem ID de pagamento Asaas");
      return;
    }

    setRetrying(order.id);

    try {
      const response = await fetch(`/api/admin/settlements/${order.id}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asaasPaymentId: order.asaasPaymentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao reenviar');
      }

      toast.success("✅ Reenvio Iniciado - A liquidação foi reenviada para processamento");

      // Atualizar lista após 2 segundos
      setTimeout(() => {
        onRefresh?.();
      }, 2000);
    } catch (error) {
      toast.error(
        `❌ Erro no Reenvio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setRetrying(null);
    }
  };

  // Filtrar pedidos que precisam de atenção
  const problematicOrders = orders.filter(
    (o) => o.status === 'FAILED' || (o.status === 'PAID' && !o.txHash)
  );

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Alerta de pedidos problemáticos */}
      {problematicOrders.length > 0 && (
        <Alert variant="destructive" className="text-sm md:text-base">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertTitle className="text-sm md:text-base">⚠️ Atenção Necessária</AlertTitle>
          <AlertDescription className="text-xs md:text-sm">
            {problematicOrders.length} pedido(s) com falha ou sem hash de transação.
            Use o botão "Reenviar" para tentar novamente.
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <Table className="min-w-full">
          <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento ID</TableHead>
            <TableHead>TX Hash</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className={order.status === 'FAILED' ? 'bg-red-50' : ''}>
              <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(order.totalPrice)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {order.asaasPaymentId ? order.asaasPaymentId.slice(0, 10) + '...' : '-'}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {order.txHash ? (
                  <a
                    href={`https://polygonscan.com/tx/${order.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {order.txHash.slice(0, 10)}...
                  </a>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-xs">
                {new Date(order.createdAt).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>
                {/* 🚨 BOTÃO DE RETRY - Aparece para pedidos PAID sem TX ou FAILED */}
                {(order.status === 'FAILED' || (order.status === 'PAID' && !order.txHash)) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRetry(order)}
                    disabled={retrying === order.id}
                    className="text-xs md:text-sm whitespace-nowrap"
                  >
                    {retrying === order.id ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        <span className="hidden sm:inline">Reenviando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Reenviar Token</span>
                        <span className="sm:hidden">Reenviar</span>
                      </>
                    )}
                  </Button>
                )}

                {/* Mostrar erro se houver */}
                {order.errorMessage && (
                  <p className="text-xs text-red-600 mt-1">{order.errorMessage}</p>
                )}
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8 md:py-12 text-gray-500 text-sm md:text-base">
          <p>Nenhum pedido encontrado</p>
        </div>
      )}
    </div>
  );
}
