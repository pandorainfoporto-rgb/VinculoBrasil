// ============================================
// SITE PUBLICO DA IMOBILIARIA (WHITELABEL)
// Portal Imobiliario Completo e Dinamico
// ============================================

import { useState, useEffect } from 'react'
import {
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Search,
  ArrowRight,
  Bed,
  Bath,
  Car,
  Home,
  Square,
  Heart,
  Share2,
  ChevronRight,
  Star,
  Shield,
  FileCheck,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PropertyDetailsPage } from './PropertyDetailsPage'

// ============================================
// TIPOS
// ============================================
interface AgencyPublicData {
  id: string
  name: string
  slug: string
  legalName?: string
  cnpj?: string
  creci?: string
  phone?: string
  email?: string
  whatsapp?: string
  instagram?: string
  city?: string
  state?: string
  address?: string
  logoUrl?: string
  coverImageUrl?: string
  primaryColor?: string
  secondaryColor?: string
  slogan?: string
  headerTitle?: string
  headerSubtitle?: string
  description?: string
  properties?: PropertyPreview[]
  siteConfig?: {
    heroImage?: string
    heroTitle?: string
    heroSubtitle?: string
    primaryColor?: string
    logoUrl?: string
  }
}

interface PropertyPreview {
  id: string
  title: string
  city: string
  state: string
  neighborhood?: string
  street?: string
  rentValue: number
  condoFee?: number
  iptuValue?: number
  images: { url: string }[]
  type: string
  bedrooms?: number
  bathrooms?: number
  parkingSpaces?: number
  area?: number
  description?: string
  furnished?: boolean
  petFriendly?: boolean
}

interface Props {
  slug: string
  propertyId?: string // Se fornecido, mostra a pagina de detalhes
}

// ============================================
// CONFIGURACAO
// ============================================
const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app'

// ============================================
// HELPERS
// ============================================

// Formata valor em BRL
const toBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

// Calcula o Valor Total para o Inquilino (V_T)
// Regra: V = 85% do total, logo V_T = V / 0.85
// Inclui: Aluguel + Condominio + IPTU + Taxas Vinculo (15%)
const calcTenantTotal = (rentValue: number, condoFee?: number, iptuValue?: number): number => {
  const baseValue = rentValue + (condoFee || 0) + (iptuValue || 0)
  // Gross up para incluir os 15% do ecossistema Vinculo
  const totalValue = baseValue / 0.85
  return totalValue
}

// Mapeia tipo de imovel
const propertyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    APARTMENT: 'Apartamento',
    HOUSE: 'Casa',
    COMMERCIAL: 'Comercial',
    LAND: 'Terreno',
    KITNET: 'Kitnet',
    LOFT: 'Loft',
    STUDIO: 'Studio',
    FARM: 'Sitio/Fazenda',
    WAREHOUSE: 'Galpao',
  }
  return labels[type] || type
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function AgencyPublicSite({ slug, propertyId: initialPropertyId }: Props) {
  const [agency, setAgency] = useState<AgencyPublicData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(initialPropertyId || null)

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        console.log(`[PUBLIC SITE] Carregando: ${slug}`)
        const response = await fetch(`${API_URL}/api/public/agencies/${slug}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Imobiliaria nao encontrada')
          }
          throw new Error('Erro ao carregar dados')
        }

        const data = await response.json()
        setAgency(data)
        console.log(`[PUBLIC SITE] Carregado: ${data.name}`)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        console.error('[PUBLIC SITE ERROR]', message)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchAgency()
  }, [slug])

  // Toggle favorito
  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  // Filtrar imoveis
  const filteredProperties = (agency?.properties || []).filter(prop => {
    const matchesSearch =
      !searchQuery ||
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.neighborhood?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = !selectedType || prop.type === selectedType

    return matchesSearch && matchesType
  })

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error || !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Site nao encontrado</h1>
          <p className="text-gray-500 mb-6">
            A imobiliaria "{slug}" nao existe ou ainda nao foi configurada.
          </p>
          <Button
            onClick={() => (window.location.href = 'https://vinculobrasil.com.br')}
            variant="outline"
          >
            Ir para Vinculo Brasil
          </Button>
        </div>
      </div>
    )
  }

  // Cores personalizadas
  const config = agency.siteConfig || {}
  const brandColor = config.primaryColor || agency.primaryColor || '#0f172a'
  const logoUrl = config.logoUrl || agency.logoUrl

  // Handler para abrir detalhes do imovel
  const handleOpenProperty = (propId: string) => {
    setSelectedPropertyId(propId)
    window.scrollTo(0, 0)
  }

  // Handler para voltar a lista
  const handleBackToList = () => {
    setSelectedPropertyId(null)
    window.scrollTo(0, 0)
  }

  // Se um imovel estiver selecionado, mostra a pagina de detalhes
  if (selectedPropertyId) {
    return (
      <PropertyDetailsPage
        propertyId={selectedPropertyId}
        agencySlug={slug}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50">
      {/* ============================================ */}
      {/* 1. NAVBAR WHITELABEL */}
      {/* ============================================ */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} className="h-10 w-auto" alt={agency.name} />
            ) : (
              <div
                className="text-2xl font-bold tracking-tight"
                style={{ color: brandColor }}
              >
                {agency.name}
              </div>
            )}
          </div>

          {/* Menu */}
          <div className="hidden md:flex gap-8 font-medium text-gray-600">
            <a href="#imoveis" className="hover:text-gray-900 transition-colors">
              Imoveis
            </a>
            <a href="#sobre" className="hover:text-gray-900 transition-colors">
              Sobre
            </a>
            <a href="#contato" className="hover:text-gray-900 transition-colors">
              Contato
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {agency.whatsapp && (
              <a
                href={`https://wa.me/${agency.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition shadow-lg"
                style={{ backgroundColor: brandColor }}
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            <Button
              variant="outline"
              className="rounded-full px-6"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              Area do Cliente
            </Button>
          </div>
        </div>
      </nav>

      {/* ============================================ */}
      {/* 2. HERO SECTION */}
      {/* ============================================ */}
      <section className="relative h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-slate-900">
          {config.heroImage || agency.coverImageUrl ? (
            <img
              src={config.heroImage || agency.coverImageUrl}
              className="w-full h-full object-cover opacity-40"
              alt="Hero"
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center opacity-30"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop')",
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl space-y-6">
          <Badge
            variant="outline"
            className="text-white border-white/30 backdrop-blur px-4 py-1.5 mb-4"
          >
            {agency.name} - Imobiliaria Digital
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            {config.heroTitle || agency.headerTitle || 'Encontre seu lugar no mundo.'}
          </h1>

          <p className="text-xl text-gray-200 font-light max-w-2xl mx-auto">
            {config.heroSubtitle ||
              agency.headerSubtitle ||
              agency.slogan ||
              'Tecnologia Blockchain e seguranca juridica para o seu proximo aluguel.'}
          </p>

          {/* Search Bar */}
          <div className="mt-8 bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-2 w-full">
              <MapPin className="h-5 w-5 text-gray-400 ml-4" />
              <Input
                className="border-none shadow-none focus-visible:ring-0 text-base"
                placeholder="Qual bairro voce procura?"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-40">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="APARTMENT">Apartamento</SelectItem>
                  <SelectItem value="HOUSE">Casa</SelectItem>
                  <SelectItem value="KITNET">Kitnet</SelectItem>
                  <SelectItem value="STUDIO">Studio</SelectItem>
                  <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              size="lg"
              className="rounded-xl px-8 h-12 w-full md:w-auto"
              style={{ backgroundColor: brandColor }}
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Contrato Digital
            </div>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Garantia Blockchain
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Pagamento Seguro
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3. IMOVEIS EM DESTAQUE */}
      {/* ============================================ */}
      <section id="imoveis" className="py-20 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Imoveis em Destaque</h2>
            <p className="text-gray-500 mt-2">
              Encontre o imovel perfeito para voce. Precos ja incluem todas as taxas.
            </p>
          </div>
          <Button variant="ghost" className="gap-2 text-gray-600 hover:text-gray-900">
            Ver todos os imoveis
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <Home className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum imovel encontrado
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedType
                ? 'Tente ajustar os filtros de busca.'
                : 'Volte em breve para conferir novidades.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(prop => {
              const totalValue = calcTenantTotal(prop.rentValue, prop.condoFee, prop.iptuValue)
              const isFavorite = favorites.includes(prop.id)

              return (
                <Card
                  key={prop.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleOpenProperty(prop.id)}
                >
                  {/* Imagem */}
                  <div className="h-64 bg-gray-200 relative overflow-hidden">
                    <img
                      src={
                        prop.images?.[0]?.url ||
                        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80'
                      }
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={prop.title}
                    />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-white/90 text-gray-900 hover:bg-white backdrop-blur shadow-sm">
                        {propertyTypeLabel(prop.type)}
                      </Badge>
                      {prop.furnished && (
                        <Badge className="bg-emerald-500 text-white">Mobiliado</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          toggleFavorite(prop.id)
                        }}
                        className={`p-2 rounded-full backdrop-blur transition ${
                          isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-600 hover:bg-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white backdrop-blur transition">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-16">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-white/70 text-xs mb-1">Valor total mensal</p>
                          <p className="text-white font-bold text-2xl">
                            {toBRL(totalValue)}
                            <span className="text-sm font-normal opacity-80">/mes</span>
                          </p>
                        </div>
                        {prop.area && (
                          <div className="text-white/80 text-sm flex items-center gap-1">
                            <Square className="h-4 w-4" />
                            {prop.area}m2
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 truncate mb-1">
                      {prop.title}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                      <MapPin className="h-4 w-4" />
                      {prop.neighborhood ? `${prop.neighborhood}, ` : ''}
                      {prop.city} - {prop.state}
                    </p>

                    {/* Features */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-4">
                      {prop.bedrooms !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="h-4 w-4" />
                          {prop.bedrooms} {prop.bedrooms === 1 ? 'Quarto' : 'Quartos'}
                        </div>
                      )}
                      {prop.bathrooms !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4" />
                          {prop.bathrooms} {prop.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}
                        </div>
                      )}
                      {prop.parkingSpaces !== undefined && prop.parkingSpaces > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Car className="h-4 w-4" />
                          {prop.parkingSpaces} {prop.parkingSpaces === 1 ? 'Vaga' : 'Vagas'}
                        </div>
                      )}
                    </div>

                    {/* Breakdown */}
                    <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Aluguel</span>
                        <span>{toBRL(prop.rentValue)}</span>
                      </div>
                      {prop.condoFee && prop.condoFee > 0 && (
                        <div className="flex justify-between">
                          <span>Condominio</span>
                          <span>{toBRL(prop.condoFee)}</span>
                        </div>
                      )}
                      {prop.iptuValue && prop.iptuValue > 0 && (
                        <div className="flex justify-between">
                          <span>IPTU</span>
                          <span>{toBRL(prop.iptuValue)}</span>
                        </div>
                      )}
                      <div className="flex justify-between mt-1 pt-1 border-t font-medium text-gray-700">
                        <span>Taxa Garantia/Seguro</span>
                        <span>Inclusa</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full mt-4 transition-colors"
                      style={{ backgroundColor: brandColor }}
                      onClick={() => handleOpenProperty(prop.id)}
                    >
                      Ver Detalhes
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Info Banner */}
        <div
          className="mt-12 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ backgroundColor: `${brandColor}10` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${brandColor}20` }}
            >
              <Shield className="h-6 w-6" style={{ color: brandColor }} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Preco Transparente</h4>
              <p className="text-sm text-gray-600">
                Os valores exibidos ja incluem todas as taxas. Sem surpresas.
              </p>
            </div>
          </div>
          <Button variant="outline" style={{ borderColor: brandColor, color: brandColor }}>
            Saiba mais sobre nossos precos
          </Button>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. DIFERENCIAIS */}
      {/* ============================================ */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Por que alugar com a {agency.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <FileCheck className="h-8 w-8" style={{ color: brandColor }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contrato Digital</h3>
              <p className="text-gray-500 text-sm">
                Assinatura eletronica com validade juridica. Sem burocracia.
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <Shield className="h-8 w-8" style={{ color: brandColor }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Garantia Inclusa</h3>
              <p className="text-gray-500 text-sm">
                Sistema de garantia integrado. Sem fiador ou caucao tradicional.
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}15` }}
              >
                <Star className="h-8 w-8" style={{ color: brandColor }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Atendimento Premium</h3>
              <p className="text-gray-500 text-sm">
                Suporte dedicado durante todo o processo de locacao.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 5. SOBRE */}
      {/* ============================================ */}
      <section id="sobre" className="py-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Sobre a {agency.name}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {agency.description ||
              `A ${agency.name} e uma imobiliaria comprometida em encontrar o imovel ideal para voce.
              Com atendimento personalizado e tecnologia de ponta, estamos prontos para
              ajuda-lo em todas as etapas da sua jornada imobiliaria.`}
          </p>
          {(agency.creci || agency.cnpj) && (
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              {agency.creci && <span>CRECI: {agency.creci}</span>}
              {agency.cnpj && <span>CNPJ: {agency.cnpj}</span>}
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* 6. CONTATO */}
      {/* ============================================ */}
      <section id="contato" className="py-20" style={{ backgroundColor: brandColor }}>
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Fale Conosco</h2>
          <p className="text-white/80 mb-12 max-w-xl mx-auto">
            Tem alguma duvida ou quer agendar uma visita? Entre em contato!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {agency.phone && (
              <a
                href={`tel:${agency.phone}`}
                className="flex flex-col items-center p-6 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                <Phone className="h-8 w-8 mb-3" />
                <span className="text-lg font-medium">{agency.phone}</span>
                <span className="text-sm text-white/70">Ligue agora</span>
              </a>
            )}

            {agency.email && (
              <a
                href={`mailto:${agency.email}`}
                className="flex flex-col items-center p-6 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                <Mail className="h-8 w-8 mb-3" />
                <span className="text-lg font-medium">{agency.email}</span>
                <span className="text-sm text-white/70">Envie um email</span>
              </a>
            )}

            {agency.whatsapp && (
              <a
                href={`https://wa.me/${agency.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 rounded-xl bg-white/10 hover:bg-white/20 transition"
              >
                <Phone className="h-8 w-8 mb-3" />
                <span className="text-lg font-medium">WhatsApp</span>
                <span className="text-sm text-white/70">Resposta rapida</span>
              </a>
            )}
          </div>

          {agency.address && (
            <div className="mt-12 flex items-center justify-center gap-2 text-white/80">
              <MapPin className="h-5 w-5" />
              <span>
                {agency.address}
                {agency.city && ` - ${agency.city}`}
                {agency.state && `, ${agency.state}`}
              </span>
            </div>
          )}

          {agency.instagram && (
            <a
              href={agency.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 text-white/80 hover:text-white transition"
            >
              <Instagram className="h-5 w-5" />
              Siga no Instagram
            </a>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* 7. FOOTER */}
      {/* ============================================ */}
      <footer className="py-8 px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              {agency.legalName || agency.name} &copy; {new Date().getFullYear()} - Todos
              os direitos reservados
            </div>
            <div className="text-gray-500 text-xs">
              Powered by{' '}
              <a
                href="https://vinculobrasil.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                Vinculo Brasil
              </a>{' '}
              Protocol
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================ */}
      {/* FLOATING WHATSAPP BUTTON */}
      {/* ============================================ */}
      {agency.whatsapp && (
        <a
          href={`https://wa.me/${agency.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition z-50"
        >
          <Phone className="h-6 w-6 text-white" />
        </a>
      )}
    </div>
  )
}

export default AgencyPublicSite
