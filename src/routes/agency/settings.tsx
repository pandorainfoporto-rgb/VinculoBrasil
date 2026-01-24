// ============================================
// AGENCY OS - Configuracoes e Gestao de Time
// ============================================
// Simulador de Split com Modelos GROSS/NET
// Regra 85/15 do Ecossistema Vinculo

import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AgencyLayout } from '@/components/layouts/AgencyLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Settings,
  Users,
  Calculator,
  UserPlus,
  CornerDownRight,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Building2,
  User,
  Percent,
  DollarSign,
  Edit,
  Trash2,
  MoreHorizontal,
  Phone,
  Mail,
  CreditCard,
  Shield,
  TrendingUp,
  PiggyBank,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const Route = createFileRoute('/agency/settings' as never)({
  component: AgencySettingsPage,
})

// ============================================
// SCHEMAS E TIPOS
// ============================================

const agentFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email invalido'),
  phone: z.string().optional(),
  commission: z.coerce.number().min(0).max(100, 'Comissao deve ser entre 0 e 100%'),
  pixKey: z.string().optional(),
  directSplit: z.boolean().optional(),
})

type AgentFormData = z.infer<typeof agentFormSchema>

interface Agent {
  id: string
  name: string
  email: string
  phone?: string
  commission: number
  pixKey?: string
  directSplit?: boolean
  deals: number
  revenue: number
  status: 'active' | 'inactive'
}

// Mock de corretores existentes
const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Carlos Mendes',
    email: 'carlos@imoveis.com',
    phone: '11999887766',
    commission: 30,
    pixKey: 'carlos@imoveis.com',
    directSplit: true,
    deals: 12,
    revenue: 45600,
    status: 'active',
  },
  {
    id: '2',
    name: 'Patricia Souza',
    email: 'patricia@imoveis.com',
    phone: '11988776655',
    commission: 25,
    pixKey: '11988776655',
    directSplit: true,
    deals: 8,
    revenue: 28400,
    status: 'active',
  },
  {
    id: '3',
    name: 'Roberto Lima',
    email: 'roberto@imoveis.com',
    phone: '11977665544',
    commission: 35,
    pixKey: '123.456.789-00',
    directSplit: false,
    deals: 5,
    revenue: 19200,
    status: 'inactive',
  },
]

// ============================================
// SIMULADOR DE SPLIT - TIPOS
// ============================================

interface SimulatorState {
  baseValue: number
  agencyFee: number
  pricingModel: 'GROSS' | 'NET'
}

interface SplitResults {
  V: number           // Base Imobiliaria (85%)
  VT: number          // Valor Total (Boleto do Inquilino)
  ownerShare: number  // Repasse Proprietario
  agencyGross: number // Agencia Bruto (antes do corretor)
  agencyNet: number   // Agencia Liquido (apos corretor)
  agentSplit: number  // Comissao do Corretor
  vinculoSystem: number // 15% Ecossistema
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function AgencySettingsPage() {
  const [agents, setAgents] = useState(MOCK_AGENTS)
  const [isAddingAgent, setIsAddingAgent] = useState(false)

  // State do Novo Corretor
  const [newAgentCommission, setNewAgentCommission] = useState(30)

  // State do Simulador
  const [sim, setSim] = useState<SimulatorState>({
    baseValue: 2000,
    agencyFee: 10,
    pricingModel: 'NET',
  })

  // Form para novo corretor
  const form = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      commission: 30,
      pixKey: '',
      directSplit: true,
    },
  })

  // ============================================
  // CALCULO DO SPLIT (MATEMATICA DO NEGOCIO)
  // ============================================
  const calculateSplit = useMemo((): SplitResults => {
    const agentRate = newAgentCommission / 100 // Ex: 30% = 0.3
    const agencyRate = sim.agencyFee / 100     // Ex: 10% = 0.1

    let V = 0          // Base Imobiliaria (85% do Total)
    let ownerShare = 0 // Repasse ao Proprietario
    let agencyGross = 0 // Receita Bruta Agencia

    if (sim.pricingModel === 'GROSS') {
      // ============================================
      // GROSS (DESCONTAR):
      // O Valor de Entrada JA E o V (Base Imobiliaria)
      // A comissao da imobiliaria e DESCONTADA do total
      // O dono recebe MENOS que o valor anunciado
      // ============================================
      V = sim.baseValue
      agencyGross = V * agencyRate        // Ex: 2000 * 10% = 200
      ownerShare = V - agencyGross        // Ex: 2000 - 200 = 1800
    } else {
      // ============================================
      // NET (ACRESCENTAR):
      // O Valor de Entrada e o LIQUIDO do Dono
      // A comissao da imobiliaria e SOMADA em cima
      // O dono recebe EXATAMENTE o valor informado
      // ============================================
      ownerShare = sim.baseValue                    // Ex: 2000 (limpo)
      agencyGross = sim.baseValue * agencyRate      // Ex: 2000 * 10% = 200
      V = ownerShare + agencyGross                  // Ex: 2000 + 200 = 2200
    }

    // O Split do Corretor (SEMPRE sai da fatia da Agencia)
    const agentSplit = agencyGross * agentRate    // Ex: 200 * 30% = 60
    const agencyNet = agencyGross - agentSplit    // Ex: 200 - 60 = 140

    // Ecossistema Vinculo: Se V = 85%, entao VT = V / 0.85
    // 15% = Garantia + Seguro + Plataforma
    const VT = V / 0.85                           // Gross up para 100%
    const vinculoSystem = VT - V                  // Os 15%

    return {
      V,
      VT,
      ownerShare,
      agencyGross,
      agencyNet,
      agentSplit,
      vinculoSystem,
    }
  }, [sim, newAgentCommission])

  // ============================================
  // HANDLERS
  // ============================================

  const onSubmitAgent = async (data: AgentFormData) => {
    console.log('Novo corretor:', data)

    // TODO: Chamar API para criar corretor
    const newAgent: Agent = {
      id: String(agents.length + 1),
      name: data.name,
      email: data.email,
      phone: data.phone,
      commission: data.commission,
      pixKey: data.pixKey,
      directSplit: data.directSplit,
      deals: 0,
      revenue: 0,
      status: 'active',
    }

    setAgents([...agents, newAgent])
    setIsAddingAgent(false)
    form.reset()
  }

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <AgencyLayout agencyName="Fatto Imoveis" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Settings className="h-6 w-6 text-zinc-400" />
              Configuracoes
            </h1>
            <p className="text-zinc-400">Gerencie seu time e configuracoes da imobiliaria</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="team" className="data-[state=active]:bg-zinc-700">
              <Users className="h-4 w-4 mr-2" />
              Time
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-zinc-700">
              <Settings className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-zinc-700">
              <Wallet className="h-4 w-4 mr-2" />
              Financeiro
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* TAB: GESTAO DE TIME */}
          {/* ============================================ */}
          <TabsContent value="team" className="space-y-6">
            {/* Header do Time */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">Corretores</h2>
                <p className="text-sm text-zinc-500">
                  {agents.filter(a => a.status === 'active').length} ativos de {agents.length} cadastrados
                </p>
              </div>
              <Dialog open={isAddingAgent} onOpenChange={setIsAddingAgent}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Corretor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100 flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-emerald-400" />
                      Cadastrar Novo Corretor
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500">
                      Configure os dados e a comissao do corretor. Use o simulador para visualizar o split.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* ============================================ */}
                    {/* COLUNA 1: FORMULARIO DO CORRETOR */}
                    {/* ============================================ */}
                    <div className="space-y-4">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitAgent)} className="space-y-4">
                          {/* Nome */}
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300">Nome Completo *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nome do corretor"
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Email e Telefone */}
                          <div className="grid grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300">Email *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                      <Input
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-zinc-300">Telefone</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                      <Input
                                        placeholder="11999999999"
                                        className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10"
                                        {...field}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Comissao */}
                          <FormField
                            control={form.control}
                            name="commission"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300 flex items-center gap-2">
                                  <Percent className="h-4 w-4" />
                                  Comissao do Corretor (%)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-lg font-bold"
                                      {...field}
                                      onChange={e => {
                                        field.onChange(e)
                                        setNewAgentCommission(Number(e.target.value) || 0)
                                      }}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                                  </div>
                                </FormControl>
                                <FormDescription className="text-zinc-600 text-xs">
                                  Percentual sobre a receita bruta da agencia
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Chave PIX */}
                          <FormField
                            control={form.control}
                            name="pixKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Chave PIX (para repasse)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="CPF, Email, Telefone ou Chave Aleatoria"
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-zinc-600 text-xs">
                                  Usado para repasse automatico via Gateway
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Separator className="bg-zinc-800" />

                          <Button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                          >
                            Cadastrar Corretor
                          </Button>
                        </form>
                      </Form>
                    </div>

                    {/* ============================================ */}
                    {/* COLUNA 2: SIMULADOR DE SPLIT */}
                    {/* ============================================ */}
                    <div className="bg-zinc-950/50 p-5 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-3">
                        <Calculator className="text-blue-400 h-5 w-5" />
                        <h3 className="font-bold text-zinc-100">Simulador de Split (Prova Real)</h3>
                      </div>

                      {/* Controles do Simulador */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <Label className="text-xs text-zinc-400">Valor Base (Imovel)</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">R$</span>
                            <Input
                              type="number"
                              value={sim.baseValue}
                              onChange={e => setSim({ ...sim, baseValue: Number(e.target.value) })}
                              className="h-8 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-zinc-400">Taxa Adm Agencia (%)</Label>
                          <div className="relative mt-1">
                            <Input
                              type="number"
                              value={sim.agencyFee}
                              onChange={e => setSim({ ...sim, agencyFee: Number(e.target.value) })}
                              className="h-8 text-sm bg-zinc-800 border-zinc-700 text-zinc-100"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">%</span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle GROSS / NET */}
                      <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg border border-zinc-700 mb-5">
                        <button
                          type="button"
                          onClick={() => setSim({ ...sim, pricingModel: 'GROSS' })}
                          className={`flex-1 text-xs py-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                            sim.pricingModel === 'GROSS'
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : 'text-zinc-500 hover:bg-zinc-700'
                          }`}
                        >
                          <ArrowDownRight className="h-3.5 w-3.5" />
                          Descontar (GROSS)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSim({ ...sim, pricingModel: 'NET' })}
                          className={`flex-1 text-xs py-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                            sim.pricingModel === 'NET'
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'text-zinc-500 hover:bg-zinc-700'
                          }`}
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          Acrescentar (NET)
                        </button>
                      </div>

                      {/* A CASCATA DE VALORES */}
                      <div className="space-y-2 font-mono text-sm">
                        {/* 1. O INQUILINO PAGA */}
                        <div className="flex justify-between items-center bg-zinc-800 text-white p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-zinc-400" />
                            <span className="text-zinc-300">Boleto Inquilino</span>
                          </div>
                          <span className="font-bold text-lg">
                            {calculateSplit.VT.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>

                        <div className="pl-3 border-l-2 border-zinc-700 space-y-2 ml-2">
                          {/* 2. VINCULO TIRA 15% */}
                          <div className="flex justify-between text-zinc-500 text-xs py-1">
                            <span className="flex items-center gap-1.5">
                              <Shield className="h-3 w-3" />
                              Ecossistema Vinculo (15%)
                            </span>
                            <span>- {calculateSplit.vinculoSystem.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>

                          {/* 3. SOBRAM OS 85% */}
                          <div className="flex justify-between font-bold text-zinc-200 py-1 bg-zinc-800/50 px-2 rounded">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                              Base Imobiliaria (85%)
                            </span>
                            <span>{calculateSplit.V.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          </div>

                          {/* 4. SPLITS IMOBILIARIOS */}
                          <div className="pl-3 border-l-2 border-blue-900/50 space-y-2 ml-2">
                            {/* Proprietario */}
                            <div className="flex justify-between text-emerald-400 font-medium py-1">
                              <span className="flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Proprietario
                              </span>
                              <span>{calculateSplit.ownerShare.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>

                            {/* Agencia Bruto */}
                            <div className="flex justify-between text-blue-400 font-medium bg-blue-900/20 p-2 rounded">
                              <span className="flex items-center gap-1.5">
                                <PiggyBank className="h-3.5 w-3.5" />
                                Agencia (Bruto)
                              </span>
                              <span>{calculateSplit.agencyGross.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            </div>

                            {/* 5. O CORRETOR (DENTRO DA AGENCIA) */}
                            <div className="pl-3 space-y-1">
                              <div className="flex items-center gap-2 text-xs text-orange-400 font-bold">
                                <CornerDownRight className="h-3.5 w-3.5" />
                                <div className="flex-1 flex justify-between">
                                  <span>Corretor ({newAgentCommission}%)</span>
                                  <span>{calculateSplit.agentSplit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-blue-300 font-bold">
                                <CornerDownRight className="h-3.5 w-3.5" />
                                <div className="flex-1 flex justify-between">
                                  <span>Agencia (Liquido)</span>
                                  <span>{calculateSplit.agencyNet.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explicacao do Modelo */}
                      <div className={`mt-4 p-3 rounded-lg text-xs ${
                        sim.pricingModel === 'GROSS'
                          ? 'bg-blue-900/20 border border-blue-500/30 text-blue-300'
                          : 'bg-emerald-900/20 border border-emerald-500/30 text-emerald-300'
                      }`}>
                        {sim.pricingModel === 'GROSS' ? (
                          <>
                            <strong>GROSS (Descontar):</strong> O valor de R$ {sim.baseValue.toLocaleString('pt-BR')} ja inclui a comissao.
                            O proprietario recebe R$ {calculateSplit.ownerShare.toLocaleString('pt-BR')} (valor descontado).
                          </>
                        ) : (
                          <>
                            <strong>NET (Acrescentar):</strong> O proprietario recebe exatamente R$ {sim.baseValue.toLocaleString('pt-BR')} (liquido).
                            A comissao de R$ {calculateSplit.agencyGross.toLocaleString('pt-BR')} e somada ao boleto.
                          </>
                        )}
                      </div>

                      <p className="text-[10px] text-zinc-600 mt-3 text-center">
                        * Valores estimados. O split final no Gateway pode variar centavos por arredondamento.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Lista de Corretores */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">Corretor</TableHead>
                      <TableHead className="text-zinc-400">Comissao</TableHead>
                      <TableHead className="text-zinc-400">Chave PIX</TableHead>
                      <TableHead className="text-zinc-400">Negocios</TableHead>
                      <TableHead className="text-zinc-400">Receita Gerada</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400 w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id} className="border-zinc-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-100">{agent.name}</p>
                              <p className="text-xs text-zinc-500">{agent.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                            {agent.commission}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-zinc-400 font-mono">
                            {agent.pixKey || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-zinc-100">{agent.deals}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-emerald-400 font-medium">
                            {agent.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              agent.status === 'active'
                                ? 'border-emerald-500/30 text-emerald-400'
                                : 'border-zinc-600 text-zinc-500'
                            }
                          >
                            {agent.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                              <DropdownMenuItem className="text-zinc-100 focus:bg-zinc-700 cursor-pointer">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-400 focus:bg-zinc-700 cursor-pointer"
                                onClick={() => handleDeleteAgent(agent.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Card de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Total de Corretores</p>
                      <p className="text-2xl font-bold text-zinc-100">{agents.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Negocios Fechados</p>
                      <p className="text-2xl font-bold text-zinc-100">
                        {agents.reduce((sum, a) => sum + a.deals, 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Receita Total Gerada</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {agents.reduce((sum, a) => sum + a.revenue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: CONFIGURACOES GERAIS */}
          {/* ============================================ */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Dados da Imobiliaria</CardTitle>
                <CardDescription className="text-zinc-500">
                  Informacoes basicas e personalizacao
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Nome da Imobiliaria</Label>
                    <Input
                      defaultValue="Fatto Imoveis"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">CNPJ</Label>
                    <Input
                      defaultValue="12.345.678/0001-99"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Email de Contato</Label>
                    <Input
                      type="email"
                      defaultValue="contato@fattoimoveis.com.br"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Telefone</Label>
                    <Input
                      defaultValue="(11) 3333-4444"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                </div>
                <Separator className="bg-zinc-800" />
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Salvar Alteracoes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: CONFIGURACOES FINANCEIRAS */}
          {/* ============================================ */}
          <TabsContent value="financial" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-zinc-100">Modelo de Precificacao Padrao</CardTitle>
                <CardDescription className="text-zinc-500">
                  Defina como a comissao sera aplicada por padrao nos novos contratos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="p-4 rounded-lg border-2 border-blue-500 bg-blue-500/10 text-left"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownRight className="h-5 w-5 text-blue-400" />
                      <span className="font-bold text-blue-400">GROSS (Descontar)</span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      A comissao e descontada do valor total. O proprietario recebe menos.
                      Ex: Aluguel R$2000 - 10% = R$1800 para o dono.
                    </p>
                  </button>
                  <button
                    className="p-4 rounded-lg border border-zinc-700 hover:border-emerald-500/50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                      <span className="font-bold text-zinc-300">NET (Acrescentar)</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      A comissao e somada ao valor base. O proprietario recebe o valor cheio.
                      Ex: Base R$2000 + 10% = Boleto R$2200.
                    </p>
                  </button>
                </div>

                <Separator className="bg-zinc-800" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-300">Taxa de Administracao Padrao (%)</Label>
                    <Input
                      type="number"
                      defaultValue="10"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Chave PIX da Agencia</Label>
                    <Input
                      defaultValue="12345678000199"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                    />
                  </div>
                </div>

                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Salvar Configuracoes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AgencyLayout>
  )
}
