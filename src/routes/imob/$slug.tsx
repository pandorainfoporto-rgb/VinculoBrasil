import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  Phone,
  Instagram,
  Globe,
  Search,
  Heart,
  Share2,
  MessageCircle,
  ChevronRight,
  Home,
  Shield,
  Zap,
  Mail,
  Clock,
  Facebook,
  Youtube,
  Linkedin,
  CheckCircle,
  Loader2,
  Calendar,
} from 'lucide-react'

export const Route = createFileRoute('/imob/$slug')({
  component: AgencyStorefrontPage,
})

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app'

interface AgencyData {
  id: string
  name: string
  slug: string
  slogan: string | null
  description: string | null
  primaryColor: string
  secondaryColor: string
  logoUrl: string | null
  whatsapp: string | null
  instagram: string | null
  website: string | null
  coverImageUrl: string | null
  bannerUrl: string | null
  aboutUs: string | null
  aboutUsImageUrl: string | null
  headerTitle: string | null
  headerSubtitle: string | null
  ctaText: string | null
  ctaSecondaryText: string | null
  address: string | null
  phone: string | null
  email: string | null
  workingHours: string | null
  facebookUrl: string | null
  youtubeUrl: string | null
  linkedinUrl: string | null
}

interface Property {
  id: string
  title: string
  address: string
  neighborhood: string
  city: string
  price: number
  type: string
  bedrooms: number
  bathrooms: number
  parking: number
  area: number
  imageUrl: string | null
  featured: boolean
  status: string
}

function AgencyStorefrontPage() {
  const params = Route.useParams() as { slug: string }
  const slug = params.slug
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  // State for real data from API
  const [agency, setAgency] = useState<AgencyData | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch agency and properties from API
  useEffect(() => {
    const fetchAgencyData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch agency by slug
        const agencyResponse = await fetch(`${API_URL}/api/agencies/public/${slug}`)

        if (!agencyResponse.ok) {
          if (agencyResponse.status === 404) {
            setError('Imobiliária não encontrada')
          } else {
            throw new Error('Erro ao carregar dados da imobiliária')
          }
          setLoading(false)
          return
        }

        const agencyData = await agencyResponse.json()
        setAgency(agencyData.agency)

        // Fetch properties for this agency
        const propertiesResponse = await fetch(`${API_URL}/api/properties/public?agencyId=${agencyData.agency.id}&status=AVAILABLE`)
        if (propertiesResponse.ok) {
          const propertiesData = await propertiesResponse.json()
          setProperties(propertiesData.properties || [])
        }
      } catch (err) {
        console.error('Error fetching agency:', err)
        setError('Erro ao carregar dados. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    fetchAgencyData()
  }, [slug])

  // Filter properties
  const filteredProperties = properties.filter(p => {
    const matchesSearch = searchTerm === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.neighborhood && p.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = !selectedType || p.type === selectedType
    return matchesSearch && matchesType
  })

  const featuredProperties = properties.filter(p => p.featured)
  const propertyTypes = [...new Set(properties.map(p => p.type).filter(Boolean))]

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const openWhatsApp = (property?: Property) => {
    if (!agency?.whatsapp) return
    const phoneNum = agency.whatsapp.replace(/\D/g, '')
    const message = property
      ? `Olá! Tenho interesse no imóvel: ${property.title} (R$ ${property.price}/mês)`
      : `Olá! Gostaria de mais informações sobre os imóveis disponíveis.`
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`, '_blank')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-16 bg-gray-200 animate-pulse" />
        <div className="h-64 bg-gray-300 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'Imobiliária não encontrada'}
          </h2>
          <p className="text-gray-600 mb-4">
            Verifique se o endereço está correto ou entre em contato conosco.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Voltar para o Início
          </Button>
        </Card>
      </div>
    )
  }

  // Get agency colors with fallbacks
  const primaryColor = agency.primaryColor || '#0066FF'
  const secondaryColor = agency.secondaryColor || '#00CC99'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {agency.logoUrl ? (
                <img
                  src={agency.logoUrl}
                  alt={agency.name}
                  className="h-10 w-auto bg-white rounded px-2"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Building2 className="w-8 h-8 text-white" />
                  <span className="text-xl font-bold text-white">{agency.name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {agency.instagram && (
                <a
                  href={`https://instagram.com/${agency.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {agency.facebookUrl && (
                <a
                  href={agency.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {agency.whatsapp && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => openWhatsApp()}
                  className="gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Contato</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative h-64 md:h-80 bg-cover bg-center"
        style={{
          backgroundImage: agency.coverImageUrl
            ? `url(${agency.coverImageUrl})`
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          backgroundColor: primaryColor
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {agency.headerTitle || agency.slogan || `Bem-vindo à ${agency.name}`}
          </h1>
          <p className="text-white/80 max-w-2xl">
            {agency.headerSubtitle || agency.description || 'Encontre o imóvel dos seus sonhos conosco.'}
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por bairro, tipo de imóvel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {propertyTypes.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedType === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedType(null)}
                    style={selectedType === null ? { backgroundColor: primaryColor } : {}}
                  >
                    Todos
                  </Button>
                  {propertyTypes.map(type => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                      style={selectedType === type ? { backgroundColor: primaryColor } : {}}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && !searchTerm && !selectedType && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Destaques</h2>
            <Badge style={{ backgroundColor: secondaryColor, color: 'white' }}>
              Imóveis em Destaque
            </Badge>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredProperties.slice(0, 3).map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                agencyId={agency.id}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
                onContact={() => openWhatsApp(property)}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {searchTerm || selectedType ? 'Resultados da Busca' : 'Imóveis Disponíveis'}
          </h2>
          <span className="text-gray-500 text-sm">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'imóvel' : 'imóveis'}
          </span>
        </div>

        {/* Empty State - No Properties */}
        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Home className="w-10 h-10" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Em breve, novos imóveis!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Estamos preparando as melhores opções de imóveis para você.
              Entre em contato para saber mais sobre oportunidades exclusivas.
            </p>
            {agency.whatsapp && (
              <Button
                onClick={() => openWhatsApp()}
                style={{ backgroundColor: primaryColor }}
                className="gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {agency.ctaText || 'Falar com a Imobiliária'}
              </Button>
            )}
          </Card>
        ) : filteredProperties.length === 0 ? (
          <Card className="p-8 text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-600 mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-gray-500 text-sm">
              Tente buscar por outro termo ou remova os filtros
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                agencyId={agency.id}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={() => toggleFavorite(property.id)}
                onContact={() => openWhatsApp(property)}
              />
            ))}
          </div>
        )}
      </section>

      {/* About Us Section */}
      {agency.aboutUs && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2
                  className="text-2xl font-bold mb-4"
                  style={{ color: primaryColor }}
                >
                  Sobre Nós
                </h2>
                <div className="text-gray-600 whitespace-pre-line">
                  {agency.aboutUs}
                </div>
              </div>
              {agency.aboutUsImageUrl && (
                <div>
                  <img
                    src={agency.aboutUsImageUrl}
                    alt="Sobre a imobiliária"
                    className="rounded-lg shadow-lg w-full h-64 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section
        className="py-12"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className="text-2xl font-bold text-center mb-8"
            style={{ color: primaryColor }}
          >
            Por que alugar conosco?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Shield
                  className="w-7 h-7"
                  style={{ color: primaryColor }}
                />
              </div>
              <h3 className="font-semibold mb-2">Garantia Vínculo</h3>
              <p className="text-gray-600 text-sm">
                Alugue sem fiador com nossa garantia digital segura e rápida
              </p>
            </Card>
            <Card className="text-center p-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Zap
                  className="w-7 h-7"
                  style={{ color: primaryColor }}
                />
              </div>
              <h3 className="font-semibold mb-2">Processo Rápido</h3>
              <p className="text-gray-600 text-sm">
                Aprovação em até 24h e documentação 100% digital
              </p>
            </Card>
            <Card className="text-center p-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <MessageCircle
                  className="w-7 h-7"
                  style={{ color: primaryColor }}
                />
              </div>
              <h3 className="font-semibold mb-2">Suporte Dedicado</h3>
              <p className="text-gray-600 text-sm">
                Atendimento humanizado do início ao fim do contrato
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {(agency.address || agency.phone || agency.email || agency.workingHours) && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2
              className="text-2xl font-bold text-center mb-8"
              style={{ color: primaryColor }}
            >
              Entre em Contato
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {agency.address && (
                <Card className="p-4 text-center">
                  <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <h4 className="font-semibold text-sm mb-1">Endereço</h4>
                  <p className="text-gray-600 text-sm">{agency.address}</p>
                </Card>
              )}
              {agency.phone && (
                <Card className="p-4 text-center">
                  <Phone className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <h4 className="font-semibold text-sm mb-1">Telefone</h4>
                  <p className="text-gray-600 text-sm">{agency.phone}</p>
                </Card>
              )}
              {agency.email && (
                <Card className="p-4 text-center">
                  <Mail className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <h4 className="font-semibold text-sm mb-1">E-mail</h4>
                  <p className="text-gray-600 text-sm">{agency.email}</p>
                </Card>
              )}
              {agency.workingHours && (
                <Card className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: primaryColor }} />
                  <h4 className="font-semibold text-sm mb-1">Horário</h4>
                  <p className="text-gray-600 text-sm">{agency.workingHours}</p>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {agency.whatsapp && (
        <section
          className="py-12"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              {agency.ctaText || 'Encontrou o imóvel ideal?'}
            </h2>
            <p className="text-white/80 mb-6">
              {agency.ctaSecondaryText || 'Entre em contato agora e agende uma visita'}
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => openWhatsApp()}
              className="gap-2"
            >
              <Phone className="w-5 h-5" />
              Falar no WhatsApp
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {agency.logoUrl ? (
                <img src={agency.logoUrl} alt={agency.name} className="h-8 w-auto" />
              ) : (
                <>
                  <Building2 className="w-6 h-6" />
                  <span className="font-bold">{agency.name}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              {agency.instagram && (
                <a
                  href={`https://instagram.com/${agency.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {agency.facebookUrl && (
                <a
                  href={agency.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {agency.youtubeUrl && (
                <a
                  href={agency.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {agency.linkedinUrl && (
                <a
                  href={agency.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {agency.website && (
                <a
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
            <div className="text-gray-500 text-xs">
              Powered by <span className="text-white">Vínculo Brasil</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Property Card Component
interface PropertyCardProps {
  property: Property
  agencyId: string
  primaryColor: string
  secondaryColor: string
  isFavorite: boolean
  onToggleFavorite: () => void
  onContact: () => void
}

function PropertyCard({ property, agencyId, primaryColor, secondaryColor, isFavorite, onToggleFavorite, onContact }: PropertyCardProps) {
  const defaultImage = `https://via.placeholder.com/600x400/e5e7eb/9ca3af?text=Sem+Imagem`
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '' })
  const [sendingLead, setSendingLead] = useState(false)
  const [leadSent, setLeadSent] = useState(false)

  const handleSendLead = async () => {
    if (!leadForm.name || !leadForm.phone) {
      toast.error('Preencha nome e telefone')
      return
    }

    setSendingLead(true)
    try {
      const response = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email || undefined,
          source: 'SITE_IMOBILIARIA',
          agencyId: agencyId,
          propertyId: property.id,
          message: `Interesse no imóvel: ${property.title}`,
        }),
      })

      if (response.ok) {
        setLeadSent(true)
        toast.success('Recebemos seu contato! Um corretor entrará em contato.')
      } else {
        throw new Error('Erro ao enviar')
      }
    } catch {
      toast.error('Erro ao enviar. Tente novamente.')
    } finally {
      setSendingLead(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <div className="relative">
          <img
            src={property.imageUrl || defaultImage}
            alt={property.title}
            loading="lazy"
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultImage
            }}
          />
          {property.featured && (
            <Badge
              className="absolute top-2 left-2"
              style={{ backgroundColor: secondaryColor }}
            >
              Destaque
            </Badge>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 rounded-full bg-white/80 text-gray-600 hover:bg-white backdrop-blur-sm transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-700">
              {property.type}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.city}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bed className="w-4 h-4" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="w-4 h-4" /> {property.bathrooms}
              </span>
            )}
            {property.parking > 0 && (
              <span className="flex items-center gap-1">
                <Car className="w-4 h-4" /> {property.parking}
              </span>
            )}
            {property.area > 0 && (
              <span className="flex items-center gap-1">
                <Maximize2 className="w-4 h-4" /> {property.area}m²
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span
                className="text-xl font-bold"
                style={{ color: primaryColor }}
              >
                R$ {property.price?.toLocaleString('pt-BR') || '0'}
              </span>
              <span className="text-gray-500 text-sm">/mês</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowLeadModal(true)}
                className="gap-1"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Agendar</span>
              </Button>
              <Button
                size="sm"
                onClick={onContact}
                style={{ backgroundColor: primaryColor }}
                className="gap-1"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lead Gen Modal */}
      <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Visita</DialogTitle>
            <DialogDescription>
              {property.title}
            </DialogDescription>
          </DialogHeader>

          {leadSent ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Recebemos seu contato!
              </h3>
              <p className="text-gray-600 mb-4">
                Um corretor entrará em contato em breve.
              </p>
              <Button
                onClick={() => {
                  setShowLeadModal(false)
                  setLeadSent(false)
                  setLeadForm({ name: '', phone: '', email: '' })
                }}
              >
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="lead-name">Seu Nome *</Label>
                <Input
                  id="lead-name"
                  placeholder="Como podemos te chamar?"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lead-phone">Telefone / WhatsApp *</Label>
                <Input
                  id="lead-phone"
                  placeholder="(11) 99999-9999"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lead-email">E-mail (opcional)</Label>
                <Input
                  id="lead-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                style={{ backgroundColor: primaryColor }}
                onClick={handleSendLead}
                disabled={sendingLead}
              >
                {sendingLead ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar Visita
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Ao enviar, você concorda em receber contato da imobiliária.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
