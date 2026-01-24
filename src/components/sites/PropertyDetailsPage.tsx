// ============================================
// PAGINA DE DETALHES DO IMOVEL (PDP)
// Property Detail Page - Checkout do Smart Contract
// ============================================

import { useState, useEffect } from 'react'
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Square,
  ShieldCheck,
  Check,
  Info,
  Share2,
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Loader2,
  Building2,
  Sparkles,
  BadgeCheck,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  PawPrint,
  Sofa,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// ============================================
// TIPOS
// ============================================

interface PropertyDetails {
  id: string
  title: string
  description?: string
  type: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
  zipCode?: string
  rentValue: number
  condoFee?: number
  iptuValue?: number
  area?: number
  bedrooms?: number
  bathrooms?: number
  parkingSpaces?: number
  floor?: number
  furnished?: boolean
  petFriendly?: boolean
  images: { id: string; url: string; caption?: string }[]
  agencyId: string
}

interface AgencyInfo {
  name: string
  phone?: string
  whatsapp?: string
  email?: string
  primaryColor?: string
  logoUrl?: string
}

interface Props {
  propertyId: string
  agencySlug: string
  onBack?: () => void
}

// ============================================
// CONFIGURACAO
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app'

// ============================================
// HELPERS
// ============================================

const toBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

// Calcula breakdown DeFi (Regra 85/15)
const calculateDeFiBreakdown = (rentValue: number, condoFee?: number, iptuValue?: number) => {
  const baseRent = rentValue
  const condo = condoFee || 0
  const iptu = iptuValue || 0

  // Base imobiliaria (aluguel + condominio + IPTU)
  const baseValue = baseRent + condo + iptu

  // Gross up para 100% (Base = 85%)
  const totalValue = baseValue / 0.85

  // 15% do ecossistema Vinculo
  const ecosystemFee = totalValue - baseValue

  // Divisao do ecossistema (exemplo: 8% garantidora, 7% plataforma)
  const warrantyFee = ecosystemFee * 0.53  // ~8% do total
  const platformFee = ecosystemFee * 0.47  // ~7% do total

  return {
    baseRent,
    condo,
    iptu,
    warrantyFee,
    platformFee,
    ecosystemFee,
    totalValue,
  }
}

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

export function PropertyDetailsPage({ propertyId, agencySlug, onBack }: Props) {
  const [property, setProperty] = useState<PropertyDetails | null>(null)
  const [agency, setAgency] = useState<AgencyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Galeria
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  // Lead Form
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [leadSent, setLeadSent] = useState(false)
  const [sendingLead, setSendingLead] = useState(false)

  // Favorito
  const [isFavorite, setIsFavorite] = useState(false)

  // Fetch property details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/public/agencies/${agencySlug}/property/${propertyId}`
        )

        if (!response.ok) {
          throw new Error('Imovel nao encontrado')
        }

        const data = await response.json()
        setProperty(data.property)
        setAgency(data.agency)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar imovel'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [propertyId, agencySlug])

  // Handle lead submission
  const handleSendLead = async () => {
    if (!leadForm.name || !leadForm.phone) {
      toast.error('Preencha nome e telefone')
      return
    }

    setSendingLead(true)
    try {
      const response = await fetch(`${API_URL}/api/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          message: leadForm.message,
          propertyId: property?.id,
          agencyId: property?.agencyId,
          source: 'WEBSITE',
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar')
      }

      setLeadSent(true)
      toast.success('Interesse registrado! Um corretor entrara em contato.')
    } catch {
      toast.error('Erro ao enviar contato. Tente novamente.')
    } finally {
      setSendingLead(false)
    }
  }

  // Navigation handlers
  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex(prev =>
        prev === property.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex(prev =>
        prev === 0 ? property.images.length - 1 : prev - 1
      )
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">Carregando imovel...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Imovel indisponivel</h1>
          <p className="text-gray-500 mb-6">{error || 'Este imovel nao esta mais disponivel.'}</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  const brandColor = agency?.primaryColor || '#0f172a'
  const breakdown = calculateDeFiBreakdown(property.rentValue, property.condoFee, property.iptuValue)
  const images = property.images?.length > 0
    ? property.images
    : [{ id: '1', url: 'https://images.unsplash.com/photo-1600596542815-60002552286b?q=80&w=2000&auto=format&fit=crop' }]

  const fullAddress = [
    property.street,
    property.number,
    property.complement,
    property.neighborhood,
    `${property.city} - ${property.state}`,
  ].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* ============================================ */}
      {/* 1. GALERIA DE FOTOS */}
      {/* ============================================ */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900">
        <img
          src={images[currentImageIndex]?.url}
          alt={property.title}
          className="w-full h-full object-cover"
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="bg-white/90 hover:bg-white backdrop-blur"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`backdrop-blur ${isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/90 hover:bg-white'}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 hover:bg-white backdrop-blur"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image counter and navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur">
              {currentImageIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* View all photos button */}
        {images.length > 1 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white backdrop-blur"
          >
            Ver todas as fotos
          </Button>
        )}
      </div>

      {/* ============================================ */}
      {/* 2. CONTEUDO PRINCIPAL */}
      {/* ============================================ */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Informacoes */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-gray-100 text-gray-700">
                      {propertyTypeLabel(property.type)}
                    </Badge>
                    {property.furnished && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <Sofa className="h-3 w-3 mr-1" />
                        Mobiliado
                      </Badge>
                    )}
                    {property.petFriendly && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <PawPrint className="h-3 w-3 mr-1" />
                        Aceita Pet
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {fullAddress || `${property.city} - ${property.state}`}
                  </p>
                </div>
              </div>

              {/* Caracteristicas */}
              <div className="flex flex-wrap gap-6 mt-8 border-y border-gray-100 py-6">
                {property.bedrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5" style={{ color: brandColor }} />
                    <span>
                      <span className="font-bold">{property.bedrooms}</span>{' '}
                      {property.bedrooms === 1 ? 'Quarto' : 'Quartos'}
                    </span>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5" style={{ color: brandColor }} />
                    <span>
                      <span className="font-bold">{property.bathrooms}</span>{' '}
                      {property.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}
                    </span>
                  </div>
                )}
                {property.parkingSpaces !== undefined && property.parkingSpaces > 0 && (
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5" style={{ color: brandColor }} />
                    <span>
                      <span className="font-bold">{property.parkingSpaces}</span>{' '}
                      {property.parkingSpaces === 1 ? 'Vaga' : 'Vagas'}
                    </span>
                  </div>
                )}
                {property.area !== undefined && (
                  <div className="flex items-center gap-2">
                    <Square className="h-5 w-5" style={{ color: brandColor }} />
                    <span>
                      <span className="font-bold">{property.area}</span> m2
                    </span>
                  </div>
                )}
                {property.floor !== undefined && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" style={{ color: brandColor }} />
                    <span>
                      <span className="font-bold">{property.floor}o</span> andar
                    </span>
                  </div>
                )}
              </div>

              {/* Descricao */}
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4">Sobre o Imovel</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {property.description ||
                    'Imovel incrivel com acabamento de alto padrao, localizado em area nobre. Perfeito para quem busca conforto, seguranca e praticidade.'}
                </p>
              </div>
            </div>

            {/* Card de Beneficios Vinculo */}
            <div
              className="rounded-2xl p-6 border flex items-start gap-4"
              style={{ backgroundColor: `${brandColor}08`, borderColor: `${brandColor}20` }}
            >
              <div
                className="p-3 rounded-full shadow-sm"
                style={{ backgroundColor: 'white' }}
              >
                <ShieldCheck className="h-6 w-6" style={{ color: brandColor }} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Alugue sem Fiador</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Este imovel conta com a tecnologia Vinculo. Sua garantia e digital,
                  instantanea e sem burocracia de cartorio. Aprovacao em minutos!
                </p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                    Sem fiador
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    Aprovacao rapida
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    Contrato digital
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* 3. CARD FINANCEIRO E CTA */}
          {/* ============================================ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4" style={{ color: brandColor }} />
                <span className="text-gray-500 text-sm font-medium">
                  Valor do Pacote Mensal
                </span>
              </div>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {toBRL(breakdown.totalValue)}
                </span>
                <span className="text-gray-400 mb-1">/mes</span>
              </div>

              {/* Waterfall Financeiro - DeFi Transparency */}
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Composicao do Valor
                </div>

                {/* Aluguel */}
                <div className="flex justify-between text-gray-600">
                  <span>Aluguel</span>
                  <span>{toBRL(breakdown.baseRent)}</span>
                </div>

                {/* Condominio */}
                {breakdown.condo > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Condominio</span>
                    <span>{toBRL(breakdown.condo)}</span>
                  </div>
                )}

                {/* IPTU */}
                {breakdown.iptu > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>IPTU</span>
                    <span>{toBRL(breakdown.iptu)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2" />

                {/* Seguro Fianca Digital */}
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Seguro Fianca Digital
                  </span>
                  <span>+ {toBRL(breakdown.warrantyFee)}</span>
                </div>

                {/* Taxa de Servico */}
                <div className="flex justify-between text-gray-500 text-sm">
                  <span>Taxa de Servico</span>
                  <span>+ {toBRL(breakdown.platformFee)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2" />

                {/* Total */}
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total Estimado</span>
                  <span>{toBRL(breakdown.totalValue)}</span>
                </div>
              </div>

              {/* Beneficio destaque */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
                <p className="text-emerald-700 text-sm text-center font-medium">
                  <ShieldCheck className="h-4 w-4 inline mr-1" />
                  Sem necessidade de fiador ou caucao
                </p>
              </div>

              {/* CTA Button */}
              <Dialog open={isLeadModalOpen} onOpenChange={setIsLeadModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full h-14 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: '#16a34a' }}
                  >
                    Tenho Interesse
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" style={{ color: brandColor }} />
                      Agendar Visita / Proposta
                    </DialogTitle>
                    <DialogDescription>
                      Preencha seus dados e um corretor entrara em contato em breve.
                    </DialogDescription>
                  </DialogHeader>

                  {!leadSent ? (
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome *</Label>
                        <Input
                          id="name"
                          value={leadForm.name}
                          onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                          placeholder="Como podemos te chamar?"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp *</Label>
                        <Input
                          id="phone"
                          value={leadForm.phone}
                          onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={leadForm.email}
                          onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                          placeholder="seu@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem (opcional)</Label>
                        <Textarea
                          id="message"
                          value={leadForm.message}
                          onChange={e => setLeadForm({ ...leadForm, message: e.target.value })}
                          placeholder="Gostaria de agendar uma visita para..."
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleSendLead}
                        className="w-full"
                        style={{ backgroundColor: brandColor }}
                        disabled={sendingLead}
                      >
                        {sendingLead ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Enviando...
                          </>
                        ) : (
                          'Enviar Solicitacao'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto mb-4 flex items-center justify-center">
                        <Check className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900">
                        Recebemos seu contato!
                      </h3>
                      <p className="text-gray-500 mt-2">
                        A imobiliaria retornara em breve.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsLeadModalOpen(false)
                          setLeadSent(false)
                          setLeadForm({ name: '', email: '', phone: '', message: '' })
                        }}
                        className="mt-4"
                      >
                        Fechar
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Info adicional */}
              <p className="text-xs text-center text-gray-400 mt-4">
                <Info className="h-3 w-3 inline mr-1" />
                Sujeito a analise de credito instantanea.
              </p>

              {/* Contato direto */}
              {agency && (agency.phone || agency.whatsapp) && (
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-gray-500 text-center mb-3">
                    Prefere falar direto?
                  </p>
                  <div className="flex gap-2">
                    {agency.whatsapp && (
                      <a
                        href={`https://wa.me/${agency.whatsapp}?text=Ola! Tenho interesse no imovel: ${property.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                          <Phone className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </a>
                    )}
                    {agency.email && (
                      <a href={`mailto:${agency.email}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MODAL GALERIA FULL */}
      {/* ============================================ */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="h-full flex items-center justify-center">
            <img
              src={images[currentImageIndex]?.url}
              alt={property.title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                  idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyDetailsPage
