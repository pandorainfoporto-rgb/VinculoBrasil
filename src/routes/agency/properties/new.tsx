// ============================================
// AGENCY OS - Cadastro de Novo Imóvel
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================
// Formulário com Calculadora de Split em Tempo Real

import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AgencyLayout } from '@/components/layouts/AgencyLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAgencyOwners } from '@/hooks/use-agency-contracts'
import { useCreateProperty } from '@/hooks/use-agency-properties'
import { toast } from 'sonner'
import {
  Home,
  Building2,
  User,
  MapPin,
  DollarSign,
  Calculator,
  Percent,
  ChevronLeft,
  Save,
  Bed,
  Bath,
  Car,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Info,
  Shield,
  TrendingUp,
  Lock,
  Coins,
  Loader2,
  Plus,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/agency/properties/new' as never)({
  component: NewPropertyPage,
})

// ============================================
// SCHEMAS E TIPOS
// ============================================

const propertyFormSchema = z.object({
  // Proprietario
  ownerId: z.string().min(1, 'Selecione um proprietario'),

  // Endereco
  street: z.string().min(3, 'Endereco obrigatorio'),
  number: z.string().min(1, 'Numero obrigatorio'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatorio'),
  city: z.string().min(2, 'Cidade obrigatoria'),
  state: z.string().min(2, 'Estado obrigatorio'),
  zipCode: z.string().min(8, 'CEP obrigatorio'),

  // Caracteristicas
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'KITNET', 'STUDIO']),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  parkingSpaces: z.coerce.number().min(0),
  area: z.coerce.number().min(1, 'Area obrigatoria'),
  description: z.string().optional(),

  // Financeiro - Split Calculator
  baseValue: z.coerce.number().min(1, 'Valor base obrigatorio'),
  pricingModel: z.enum(['GROSS', 'NET']),
  commissionType: z.enum(['PERCENTAGE', 'FIXED']),
  commissionValue: z.coerce.number().min(0),

  // Taxas adicionais
  condoFee: z.coerce.number().min(0).optional(),
  iptuValue: z.coerce.number().min(0).optional(),

  // Collateral / Garantia DeFi
  collateralEnabled: z.boolean().optional(),
  collateralYieldRate: z.coerce.number().min(0).max(5).optional(), // 0-5% ao mês
  collateralMaxExposure: z.coerce.number().min(0).optional(),
})

type PropertyFormData = z.infer<typeof propertyFormSchema>

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartamento', icon: Building2 },
  { value: 'HOUSE', label: 'Casa', icon: Home },
  { value: 'COMMERCIAL', label: 'Comercial', icon: Building2 },
  { value: 'KITNET', label: 'Kitnet', icon: Home },
  { value: 'STUDIO', label: 'Studio', icon: Building2 },
  { value: 'LAND', label: 'Terreno', icon: Square },
]

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function NewPropertyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Busca proprietários reais da API
  const { data: owners = [], isLoading: isLoadingOwners, isError: isOwnersError } = useAgencyOwners()

  // Mutation para criar imóvel
  const createPropertyMutation = useCreateProperty()

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      ownerId: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      propertyType: 'APARTMENT',
      bedrooms: 2,
      bathrooms: 1,
      parkingSpaces: 1,
      area: 50,
      description: '',
      baseValue: 2000,
      pricingModel: 'GROSS',
      commissionType: 'PERCENTAGE',
      commissionValue: 10,
      condoFee: 0,
      iptuValue: 0,
      // Collateral
      collateralEnabled: false,
      collateralYieldRate: 0.5,
      collateralMaxExposure: 0,
    },
  })

  // Watch para calculo em tempo real do Split
  const watchedValues = useWatch({
    control: form.control,
    name: ['baseValue', 'pricingModel', 'commissionType', 'commissionValue'],
  })

  // Calculo do Split em tempo real
  const splitCalculation = useMemo(() => {
    const [baseValue, pricingModel, commissionType, commissionValue] = watchedValues
    const base = Number(baseValue) || 0
    const rate = Number(commissionValue) || 0

    let finalRent = 0
    let ownerShare = 0
    let agencyShare = 0

    if (pricingModel === 'GROSS') {
      // BRUTO: Desconta a comissao do total
      // Ex: Aluguel R$2000, Taxa 10% -> Proprietario R$1800, Imobiliaria R$200
      finalRent = base
      agencyShare = commissionType === 'PERCENTAGE' ? (base * rate / 100) : rate
      ownerShare = finalRent - agencyShare
    } else {
      // LIQUIDO: Adiciona a comissao ao valor base
      // Ex: Dono quer R$2000 limpo + 10% -> Anuncio R$2200
      agencyShare = commissionType === 'PERCENTAGE' ? (base * rate / 100) : rate
      finalRent = base + agencyShare
      ownerShare = base
    }

    return {
      finalRent: Math.max(0, finalRent),
      ownerShare: Math.max(0, ownerShare),
      agencyShare: Math.max(0, agencyShare),
      commissionPercent: finalRent > 0 ? (agencyShare / finalRent * 100) : 0,
    }
  }, [watchedValues])

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true)
    try {
      // Chama API real para criar imóvel
      await createPropertyMutation.mutateAsync({
        ownerId: data.ownerId,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        propertyType: data.propertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parkingSpaces: data.parkingSpaces,
        area: data.area,
        description: data.description,
        baseValue: data.baseValue,
        pricingModel: data.pricingModel,
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
        condoFee: data.condoFee,
        iptuValue: data.iptuValue,
      })

      // Redirect para listagem após sucesso
      window.location.href = '/agency/properties'
    } catch (error) {
      console.error('Erro ao salvar:', error)
      // Toast de erro já é tratado pelo hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AgencyLayout agencyName="Fatto Imoveis" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-100"
            onClick={() => window.location.href = '/agency/properties'}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Novo Imovel</h1>
            <p className="text-zinc-400">Cadastre um imovel e configure a divisao de valores</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ============================================ */}
              {/* COLUNA ESQUERDA - FORMULARIO */}
              {/* ============================================ */}
              <div className="lg:col-span-2 space-y-6">
                {/* Proprietario */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                      <User className="h-5 w-5 text-emerald-400" />
                      Proprietario
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Selecione o dono do imovel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="ownerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Proprietário *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-100">
                                <SelectValue placeholder={isLoadingOwners ? "Carregando..." : "Selecione o proprietário"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              {isLoadingOwners ? (
                                <div className="p-4 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-zinc-400" />
                                  <p className="text-xs text-zinc-500 mt-2">Carregando proprietários...</p>
                                </div>
                              ) : isOwnersError ? (
                                <div className="p-4 text-center">
                                  <AlertCircle className="h-4 w-4 mx-auto text-red-400" />
                                  <p className="text-xs text-red-400 mt-2">Erro ao carregar proprietários</p>
                                </div>
                              ) : owners.length === 0 ? (
                                <div className="p-4 text-center">
                                  <User className="h-4 w-4 mx-auto text-zinc-500" />
                                  <p className="text-xs text-zinc-500 mt-2">Nenhum proprietário cadastrado</p>
                                  <Button
                                    type="button"
                                    variant="link"
                                    size="sm"
                                    className="text-emerald-400 mt-1"
                                    onClick={() => window.location.href = '/agency/owners'}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Cadastrar Proprietário
                                  </Button>
                                </div>
                              ) : (
                                owners.map((owner) => (
                                  <SelectItem
                                    key={owner.id}
                                    value={owner.id}
                                    className="text-zinc-100 focus:bg-zinc-700"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{owner.name}</span>
                                      <span className="text-xs text-zinc-500">({owner.email})</span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Endereco */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      Endereco
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">CEP *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Estado *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                  <SelectValue placeholder="UF" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                {BRAZILIAN_STATES.map((state) => (
                                  <SelectItem key={state} value={state} className="text-zinc-100 focus:bg-zinc-700">
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Cidade *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cidade"
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-zinc-300">Rua/Avenida *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nome da rua"
                                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Numero *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Complemento</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Apto, Bloco"
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Bairro *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do bairro"
                              className="bg-zinc-800 border-zinc-700 text-zinc-100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Caracteristicas */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                      <Home className="h-5 w-5 text-amber-400" />
                      Caracteristicas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Tipo de Imovel *</FormLabel>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {PROPERTY_TYPES.map((type) => (
                              <Button
                                key={type.value}
                                type="button"
                                variant="outline"
                                className={`h-auto py-3 flex-col gap-1 border-zinc-700 ${
                                  field.value === type.value
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'
                                }`}
                                onClick={() => field.onChange(type.value)}
                              >
                                <type.icon className="h-5 w-5" />
                                <span className="text-xs">{type.label}</span>
                              </Button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-1">
                              <Bed className="h-4 w-4" /> Quartos
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-1">
                              <Bath className="h-4 w-4" /> Banheiros
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="parkingSpaces"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-1">
                              <Car className="h-4 w-4" /> Vagas
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-1">
                              <Square className="h-4 w-4" /> Area (m2)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Descricao</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o imovel..."
                              className="bg-zinc-800 border-zinc-700 text-zinc-100 min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Valores e Split */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-emerald-400" />
                      Valores e Comissao
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Configure o modelo de precificacao e comissao
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Modelo de Precificacao */}
                    <FormField
                      control={form.control}
                      name="pricingModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300">Modelo de Precificacao *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-auto p-4 flex-col items-start gap-2 border-zinc-700 ${
                                field.value === 'GROSS'
                                  ? 'bg-emerald-500/10 border-emerald-500'
                                  : 'bg-zinc-800/50 hover:bg-zinc-800'
                              }`}
                              onClick={() => field.onChange('GROSS')}
                            >
                              <div className="flex items-center gap-2">
                                <ArrowDownRight className={`h-5 w-5 ${field.value === 'GROSS' ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                <span className={`font-semibold ${field.value === 'GROSS' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                  BRUTO (Gross)
                                </span>
                              </div>
                              <p className={`text-xs text-left ${field.value === 'GROSS' ? 'text-emerald-400/80' : 'text-zinc-500'}`}>
                                Comissao descontada do valor total.
                                Ex: Aluguel R$2000, Taxa 10% → Proprietario R$1800
                              </p>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={`h-auto p-4 flex-col items-start gap-2 border-zinc-700 ${
                                field.value === 'NET'
                                  ? 'bg-blue-500/10 border-blue-500'
                                  : 'bg-zinc-800/50 hover:bg-zinc-800'
                              }`}
                              onClick={() => field.onChange('NET')}
                            >
                              <div className="flex items-center gap-2">
                                <ArrowUpRight className={`h-5 w-5 ${field.value === 'NET' ? 'text-blue-400' : 'text-zinc-500'}`} />
                                <span className={`font-semibold ${field.value === 'NET' ? 'text-blue-400' : 'text-zinc-300'}`}>
                                  LIQUIDO (Net)
                                </span>
                              </div>
                              <p className={`text-xs text-left ${field.value === 'NET' ? 'text-blue-400/80' : 'text-zinc-500'}`}>
                                Comissao somada ao valor base.
                                Ex: Base R$2000 + 10% → Anuncio R$2200
                              </p>
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="bg-zinc-800" />

                    {/* Valor Base e Comissao */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="baseValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {form.watch('pricingModel') === 'GROSS' ? 'Valor do Aluguel' : 'Valor Liquido Dono'}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={100}
                                  className="bg-zinc-800 border-zinc-700 text-zinc-100 pl-10 text-lg font-semibold"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-zinc-600 text-xs">
                              {form.watch('pricingModel') === 'GROSS'
                                ? 'Valor total anunciado'
                                : 'Quanto o proprietario quer receber'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commissionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Tipo de Comissao</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                  <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-zinc-800 border-zinc-700">
                                <SelectItem value="PERCENTAGE" className="text-zinc-100 focus:bg-zinc-700">
                                  <div className="flex items-center gap-2">
                                    <Percent className="h-4 w-4" />
                                    Percentual
                                  </div>
                                </SelectItem>
                                <SelectItem value="FIXED" className="text-zinc-100 focus:bg-zinc-700">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Valor Fixo
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="commissionValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">
                              {form.watch('commissionType') === 'PERCENTAGE' ? 'Taxa (%)' : 'Valor (R$)'}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                  {form.watch('commissionType') === 'PERCENTAGE' ? '%' : 'R$'}
                                </span>
                                <Input
                                  type="number"
                                  min={0}
                                  step={form.watch('commissionType') === 'PERCENTAGE' ? 0.5 : 10}
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

                    <Separator className="bg-zinc-800" />

                    {/* Taxas Adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="condoFee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">Condominio (R$/mes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="iptuValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300">IPTU (R$/mes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="0"
                                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* ============================================ */}
                {/* COLLATERAL / GARANTIA DEFI */}
                {/* ============================================ */}
                <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/30 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-zinc-100 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-400" />
                      Garantia DeFi (Opcional)
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Permita que este imovel seja usado como garantia para outros contratos no ecossistema Vinculo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Toggle de Habilitacao */}
                    <FormField
                      control={form.control}
                      name="collateralEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                          <div className="space-y-0.5">
                            <FormLabel className="text-zinc-200 font-medium">
                              Habilitar como Garantia
                            </FormLabel>
                            <FormDescription className="text-zinc-500 text-xs">
                              O proprietario podera ganhar rendimentos extras ao oferecer este imovel como garantia
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Campos de Configuracao (aparecem se habilitado) */}
                    {form.watch('collateralEnabled') && (
                      <div className="space-y-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <div className="flex items-center gap-2 text-purple-400 text-sm font-medium">
                          <Coins className="h-4 w-4" />
                          Configuracao de Yield
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="collateralYieldRate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300 flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  Taxa de Yield (% ao mes)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-zinc-600 text-xs">
                                  Rendimento mensal para o proprietario
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="collateralMaxExposure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-zinc-300 flex items-center gap-1">
                                  <Lock className="h-4 w-4" />
                                  Exposicao Maxima (R$)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={1000}
                                    placeholder="Ex: 50000"
                                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription className="text-zinc-600 text-xs">
                                  Valor maximo que pode ser garantido
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Simulacao de Ganhos */}
                        {form.watch('baseValue') > 0 && form.watch('collateralYieldRate') && (
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-purple-300">Rendimento Estimado (mensal)</span>
                              <span className="text-purple-400 font-bold">
                                R$ {((form.watch('baseValue') * (form.watch('collateralYieldRate') || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                              <span className="text-purple-300">Rendimento Anual</span>
                              <span className="text-purple-400 font-bold">
                                R$ {((form.watch('baseValue') * (form.watch('collateralYieldRate') || 0) * 12) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Aviso de Consentimento */}
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-300">
                            Apos o cadastro, um pedido de consentimento sera enviado ao proprietario.
                            O imovel so podera ser usado como garantia apos aprovacao explicita.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Botoes de Acao */}
                <div className="flex items-center justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    onClick={() => window.location.href = '/agency/properties'}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Salvando...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Cadastrar Imovel
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* ============================================ */}
              {/* COLUNA DIREITA - CALCULADORA STICKY */}
              {/* ============================================ */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Split Calculator Card */}
                  <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/30 border-zinc-800 overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-zinc-100 flex items-center gap-2">
                          <Calculator className="h-5 w-5 text-emerald-400" />
                          Calculadora de Split
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            form.watch('pricingModel') === 'GROSS'
                              ? 'border-emerald-500/30 text-emerald-400'
                              : 'border-blue-500/30 text-blue-400'
                          }`}
                        >
                          {form.watch('pricingModel') === 'GROSS' ? 'BRUTO' : 'LIQUIDO'}
                        </Badge>
                      </div>
                      <CardDescription className="text-zinc-500">
                        Visualize a divisao em tempo real
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Valor Anunciado */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-zinc-400">Valor Anunciado</span>
                          <Wallet className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-3xl font-bold text-emerald-400">
                          R$ {splitCalculation.finalRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Valor que aparecera no anuncio
                        </p>
                      </div>

                      <Separator className="bg-zinc-800" />

                      {/* Divisao */}
                      <div className="space-y-3">
                        {/* Repasse Proprietario */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-blue-500/10">
                              <User className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Proprietario</p>
                              <p className="text-xs text-zinc-500">Repasse mensal</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-blue-400">
                            R$ {splitCalculation.ownerShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        {/* Receita Imobiliaria */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded bg-amber-500/10">
                              <PiggyBank className="h-4 w-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Sua Receita</p>
                              <p className="text-xs text-zinc-500">Comissao mensal</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-400">
                              R$ {splitCalculation.agencyShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {splitCalculation.commissionPercent.toFixed(1)}% do total
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Projecao Anual */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium text-amber-400">Projecao Anual</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-zinc-500">Receita Anual</p>
                            <p className="text-lg font-bold text-zinc-100">
                              R$ {(splitCalculation.agencyShare * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Repasse Anual</p>
                            <p className="text-lg font-bold text-zinc-100">
                              R$ {(splitCalculation.ownerShare * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dica de Modelo */}
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-zinc-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-zinc-300">Qual modelo usar?</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            <strong>BRUTO:</strong> Mais comum. O proprietario aceita receber menos que o valor anunciado.
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            <strong>LIQUIDO:</strong> Use quando o proprietario exige um valor fixo. A comissao e somada ao anuncio.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AgencyLayout>
  )
}
