import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Palette,
  Image,
  Globe,
  Phone,
  Instagram,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Bed,
  Bath,
  Car,
  ExternalLink
} from 'lucide-react'

export const Route = createFileRoute('/agency/setup' as never)({
  component: AgencySetupPage,
})

interface AgencyData {
  name: string
  slug: string
  slogan: string
  description: string
  cnpj: string
  whatsapp: string
  instagram: string
  website: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string
}

const STEPS = [
  { id: 1, title: 'Dados Básicos', icon: Building2 },
  { id: 2, title: 'Identidade Visual', icon: Palette },
  { id: 3, title: 'Contato & Redes', icon: Phone },
  { id: 4, title: 'Revisão', icon: Check },
]

const COLOR_PRESETS = [
  { name: 'Azul Profissional', primary: '#0066FF', secondary: '#00CC99' },
  { name: 'Verde Natureza', primary: '#059669', secondary: '#34D399' },
  { name: 'Roxo Moderno', primary: '#7C3AED', secondary: '#A78BFA' },
  { name: 'Vermelho Energia', primary: '#DC2626', secondary: '#F87171' },
  { name: 'Laranja Vibrante', primary: '#EA580C', secondary: '#FB923C' },
  { name: 'Rosa Elegante', primary: '#DB2777', secondary: '#F472B6' },
]

// Mock property for preview
const PREVIEW_PROPERTY = {
  title: 'Apartamento 3 Quartos - Centro',
  address: 'Rua das Flores, 123 - Centro',
  price: 2500,
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  area: 85,
  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop'
}

function AgencySetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [agencyData, setAgencyData] = useState<AgencyData>({
    name: '',
    slug: '',
    slogan: '',
    description: '',
    cnpj: '',
    whatsapp: '',
    instagram: '',
    website: '',
    primaryColor: '#0066FF',
    secondaryColor: '#00CC99',
    logoUrl: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const updateData = (field: keyof AgencyData, value: string) => {
    setAgencyData(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    updateData('name', name)
    if (!agencyData.slug || agencyData.slug === generateSlug(agencyData.name)) {
      updateData('slug', generateSlug(name))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setIsComplete(true)
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Imobiliária Criada com Sucesso!</CardTitle>
            <CardDescription>
              Sua página personalizada está pronta para uso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Seu site está disponível em:</p>
              <a
                href={`/imob/${agencyData.slug}`}
                className="text-lg font-semibold text-blue-600 hover:underline flex items-center justify-center gap-2"
              >
                vinculobrasil.com.br/imob/{agencyData.slug}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = '/agency/dashboard'}
              >
                Ir para Dashboard
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: agencyData.primaryColor }}
                onClick={() => window.location.href = `/imob/${agencyData.slug}`}
              >
                Ver Meu Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurar Minha Imobiliária</h1>
          <p className="text-gray-600">Crie seu site personalizado em minutos</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                }`}
              >
                <step.icon className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Informe os dados básicos da sua imobiliária'}
                {currentStep === 2 && 'Personalize as cores e logo da sua marca'}
                {currentStep === 3 && 'Configure seus canais de contato'}
                {currentStep === 4 && 'Revise as informações antes de criar'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Dados Básicos */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Imobiliária *</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Fatto Imóveis"
                      value={agencyData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL do Site *</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">vinculobrasil.com.br/imob/</span>
                      <Input
                        id="slug"
                        placeholder="fatto-imoveis"
                        value={agencyData.slug}
                        onChange={(e) => updateData('slug', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Esta será a URL pública do seu site
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input
                      id="slogan"
                      placeholder="Ex: Realizando sonhos em Dois Vizinhos"
                      value={agencyData.slogan}
                      onChange={(e) => updateData('slogan', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0001-00"
                      value={agencyData.cnpj}
                      onChange={(e) => updateData('cnpj', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Conte um pouco sobre sua imobiliária..."
                      value={agencyData.description}
                      onChange={(e) => updateData('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Identidade Visual */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Paleta de Cores Sugeridas</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            updateData('primaryColor', preset.primary)
                            updateData('secondaryColor', preset.secondary)
                          }}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            agencyData.primaryColor === preset.primary
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex gap-1 mb-2">
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Cor Primária</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          value={agencyData.primaryColor}
                          onChange={(e) => updateData('primaryColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={agencyData.primaryColor}
                          onChange={(e) => updateData('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Cor Secundária</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          value={agencyData.secondaryColor}
                          onChange={(e) => updateData('secondaryColor', e.target.value)}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={agencyData.secondaryColor}
                          onChange={(e) => updateData('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL do Logo</Label>
                    <Input
                      id="logoUrl"
                      placeholder="https://exemplo.com/logo.png"
                      value={agencyData.logoUrl}
                      onChange={(e) => updateData('logoUrl', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Cole a URL de uma imagem ou deixe em branco para usar o nome
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: Contato & Redes */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      <Input
                        id="whatsapp"
                        placeholder="(45) 99999-9999"
                        value={agencyData.whatsapp}
                        onChange={(e) => updateData('whatsapp', e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Será usado no botão "Agendar Visita"
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="flex items-center gap-2">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <div className="flex items-center flex-1">
                        <span className="text-gray-500 text-sm mr-1">@</span>
                        <Input
                          id="instagram"
                          placeholder="fattoimoveis"
                          value={agencyData.instagram}
                          onChange={(e) => updateData('instagram', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Site Externo</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <Input
                        id="website"
                        placeholder="https://fattoimoveis.com.br"
                        value={agencyData.website}
                        onChange={(e) => updateData('website', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Revisão */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nome:</span>
                      <span className="font-medium">{agencyData.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">URL:</span>
                      <span className="font-medium">vinculobrasil.com.br/imob/{agencyData.slug || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Slogan:</span>
                      <span className="font-medium">{agencyData.slogan || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CNPJ:</span>
                      <span className="font-medium">{agencyData.cnpj || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Cores:</span>
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: agencyData.primaryColor }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: agencyData.secondaryColor }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">WhatsApp:</span>
                      <span className="font-medium">{agencyData.whatsapp || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Instagram:</span>
                      <span className="font-medium">{agencyData.instagram ? `@${agencyData.instagram}` : '-'}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Pronto para lançar!</strong> Ao confirmar, sua página será criada
                      instantaneamente e você poderá começar a adicionar imóveis.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !agencyData.name || !agencyData.slug}
                    style={{ backgroundColor: agencyData.primaryColor }}
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Minha Imobiliária'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-700">Preview ao Vivo</h3>
              <Badge variant="secondary">Tempo Real</Badge>
            </div>

            {/* Preview Card - Mini Site Header */}
            <Card className="overflow-hidden">
              <div
                className="h-16 flex items-center justify-between px-4"
                style={{ backgroundColor: agencyData.primaryColor }}
              >
                <div className="flex items-center gap-3">
                  {agencyData.logoUrl ? (
                    <img
                      src={agencyData.logoUrl}
                      alt="Logo"
                      className="h-10 w-auto bg-white rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-10 px-3 bg-white/20 rounded flex items-center">
                      <span className="text-white font-bold">
                        {agencyData.name || 'Sua Imobiliária'}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                >
                  Contato
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <h2
                    className="text-xl font-bold"
                    style={{ color: agencyData.primaryColor }}
                  >
                    {agencyData.slogan || 'Seu slogan aparecerá aqui'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Encontre o imóvel dos seus sonhos
                  </p>
                </div>

                {/* Preview Property Card */}
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={PREVIEW_PROPERTY.image}
                    alt={PREVIEW_PROPERTY.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h4 className="font-semibold text-sm">{PREVIEW_PROPERTY.title}</h4>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {PREVIEW_PROPERTY.address}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Bed className="w-3 h-3" /> {PREVIEW_PROPERTY.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-3 h-3" /> {PREVIEW_PROPERTY.bathrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" /> {PREVIEW_PROPERTY.parking}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        className="font-bold"
                        style={{ color: agencyData.primaryColor }}
                      >
                        R$ {PREVIEW_PROPERTY.price.toLocaleString('pt-BR')}/mês
                      </span>
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: agencyData.primaryColor,
                          color: 'white'
                        }}
                      >
                        Agendar Visita
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* URL Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    vinculobrasil.com.br/imob/<span className="font-medium text-gray-900">{agencyData.slug || 'seu-slug'}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
