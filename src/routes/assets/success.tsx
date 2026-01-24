import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, ExternalLink, Download, Zap, Shield } from 'lucide-react';

export const Route = createFileRoute('/assets/success' as any)({
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-6 animate-pulse">
          <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
          <Zap className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
            Pagamento PIX Confirmado
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">NFT Criado com Sucesso! 🎉</h1>
        <p className="text-xl text-muted-foreground">
          Seu imóvel foi tokenizado e registrado na Blockchain Polygon
        </p>
      </div>

      {/* NFT Details Card */}
      <Card className="mb-8 border-2 border-green-200 dark:border-green-800">
        <CardHeader className="bg-green-50 dark:bg-green-950">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-600" />
            Detalhes do NFT de Garantia Real
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Token ID</div>
            <div className="font-mono text-sm bg-muted p-2 rounded">
              #VB-00001-2024
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
            <div className="font-mono text-xs bg-muted p-2 rounded break-all">
              0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Network</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="font-semibold">Polygon Mainnet</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
              ✓
            </div>
            <div>
              <div className="font-semibold mb-1 text-green-900 dark:text-green-100">
                NFT Mintado na Polygon
              </div>
              <div className="text-sm text-green-800 dark:text-green-200">
                Seu NFT de Garantia Real foi criado e registrado na blockchain.
                O hash dos documentos está armazenado de forma imutável.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
              2
            </div>
            <div>
              <div className="font-semibold mb-1">Validação Jurídica em Andamento</div>
              <div className="text-sm text-muted-foreground">
                Nossa equipe jurídica está validando os documentos enviados.
                Você receberá uma notificação em até 24h.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
              3
            </div>
            <div>
              <div className="font-semibold mb-1">Ativo Pronto para Uso</div>
              <div className="text-sm text-muted-foreground">
                Após a validação, você poderá usar este NFT como garantia em
                contratos de aluguel e operações financeiras.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline" size="lg">
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Link>
        </Button>
        <Button size="lg" className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Baixar Comprovante
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver na Blockchain
          </a>
        </Button>
      </div>

      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">🦅 Bem-vindo ao Futuro da Garantia Real!</div>
          <p className="text-sm text-muted-foreground">
            Você agora faz parte do ecossistema VínculoBrasil. Seu patrimônio está
            protegido pela tecnologia blockchain e validado juridicamente.
          </p>
        </div>
      </div>
    </div>
  );
}
