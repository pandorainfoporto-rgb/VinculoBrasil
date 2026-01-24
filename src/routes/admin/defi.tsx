// ============================================
// ADMIN DEFI - Antecipação de Aluguéis P2P
// Fluxo simplificado: Proprietário solicita, Investidores aprovam
// Feature Flag: Empréstimo NFT está DESATIVADO
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { RentAnticipation } from '@/components/defi/rent-anticipation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Coins, TrendingUp, FileText } from 'lucide-react';

export const Route = createFileRoute('/admin/defi' as never)({
  component: DefiPage,
});

// Mock contracts para demonstração admin
const MOCK_CONTRACTS = [
  {
    id: 'contract-001',
    nftTokenId: 'NFT-2024-001',
    propertyAddress: 'Rua das Flores, 123 - Jardins, SP',
    tenantName: 'Maria Silva',
    monthlyRent: 3500,
    remainingMonths: 18,
    isLocked: false,
  },
  {
    id: 'contract-002',
    nftTokenId: 'NFT-2024-002',
    propertyAddress: 'Av. Paulista, 1000 - Bela Vista, SP',
    tenantName: 'João Santos',
    monthlyRent: 5200,
    remainingMonths: 24,
    isLocked: false,
  },
  {
    id: 'contract-003',
    nftTokenId: 'NFT-2024-003',
    propertyAddress: 'Rua Oscar Freire, 500 - Pinheiros, SP',
    tenantName: 'Ana Costa',
    monthlyRent: 4800,
    remainingMonths: 12,
    isLocked: true,
    existingLoanId: 'loan-001',
  },
];

function DefiPage() {
  const [activeTab, setActiveTab] = useState('anticipation');

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-950 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Antecipação de Aluguéis</h1>
              <p className="text-sm text-slate-400">Investidores P2P financiam antecipações</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 p-1 mb-6">
            <TabsTrigger
              value="anticipation"
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 text-slate-400"
            >
              <Coins className="h-4 w-4 mr-2" />
              Antecipação de Aluguel
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-slate-400"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anticipation">
            {/* walletConnected removido - proprietário não precisa de MetaMask */}
            <RentAnticipation
              userId="admin-001"
              userName="Administrador"
              contracts={MOCK_CONTRACTS}
            />
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-emerald-400" />
                    Antecipações Ativas
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Contratos com antecipação em andamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-400">12</div>
                  <p className="text-sm text-slate-500 mt-1">R$ 156.000 antecipados</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    NFTs em Garantia
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Contratos tokenizados como garantia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">8</div>
                  <p className="text-sm text-slate-500 mt-1">Valor: R$ 240.000</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-amber-400" />
                    Yield Pool
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Retorno médio dos investidores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-400">18.5%</div>
                  <p className="text-sm text-slate-500 mt-1">ao ano (CDI + 6%)</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
