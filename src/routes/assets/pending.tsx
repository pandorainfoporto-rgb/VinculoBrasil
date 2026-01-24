import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Home, FileText, Bell, RefreshCw } from 'lucide-react';

export const Route = createFileRoute('/assets/pending' as any)({
  component: PendingPaymentPage,
});

function PendingPaymentPage() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-6">
          <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Aguardando Compensação 🟡</h1>
        <p className="text-xl text-muted-foreground">
          Seu pagamento via boleto está sendo processado
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
              1
            </div>
            <div>
              <div className="font-semibold mb-1 text-yellow-900 dark:text-yellow-100">
                ✅ Boleto Gerado
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                O boleto foi emitido com sucesso. Código de barras disponível para pagamento.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <div className="font-semibold mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Aguardando Compensação Bancária
              </div>
              <div className="text-sm text-muted-foreground">
                O banco está processando seu pagamento. Este processo leva de 1 a 2 dias úteis.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 opacity-50">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <div className="font-semibold mb-1">NFT Será Criado Automaticamente</div>
              <div className="text-sm text-muted-foreground">
                Assim que o pagamento for confirmado, seu NFT de Garantia Real será
                mintado na blockchain Polygon.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 opacity-50">
            <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 font-bold">
              4
            </div>
            <div>
              <div className="font-semibold mb-1">Notificação por Email</div>
              <div className="text-sm text-muted-foreground">
                Você receberá um email de confirmação com todos os detalhes do seu NFT.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Código do Boleto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs bg-muted p-3 rounded-lg break-all">
              34191.79001 01043.510047 91020.150008 1 23450000025000
            </div>
            <Button variant="outline" className="w-full mt-3">
              <FileText className="w-4 h-4 mr-2" />
              Baixar Boleto (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-3">
              Fique tranquilo! Você será notificado por:
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Email de confirmação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Notificação no dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>SMS (opcional)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button asChild variant="outline" size="lg">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Link>
        </Button>
        <Button size="lg" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Status
        </Button>
      </div>

      <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <div className="text-lg font-bold mb-2">⏰ Prazo Médio de Compensação</div>
          <p className="text-sm text-muted-foreground mb-4">
            Boletos geralmente compensam em 1 dia útil, mas podem levar até 2 dias dependendo
            do horário de pagamento e do banco emissor.
          </p>
          <div className="text-xs text-muted-foreground">
            <strong>Dica:</strong> Pagamentos via PIX são instantâneos! Da próxima vez, escolha
            PIX para ter seu NFT criado em segundos.
          </div>
        </div>
      </div>
    </div>
  );
}
