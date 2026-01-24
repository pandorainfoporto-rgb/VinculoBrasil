// =============================================================================
// Marketplace Dashboard - Hub de Servicos e Seguros
// =============================================================================
// Dashboard principal do marketplace mostrando:
// - Cards de servicos de manutencao
// - Carrossel de seguros com ofertas personalizadas
// - Botao de contratacao com 1 clique
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Shield,
  Car,
  Home,
  Heart,
  Flame,
  Wrench,
  Zap,
  Droplets,
  PaintBucket,
  Wind,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  CheckCircle2,
  Gift,
  Percent,
  AlertCircle,
  Phone,
  ArrowRight,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import {
  type InsuranceProductType,
  type ServiceSpecialty,
  type PersonalizedOffer,
  INSURANCE_PRODUCT_LABELS,
  SERVICE_SPECIALTY_LABELS,
} from '@/lib/marketplace-types';

import { insuranceRecommendationService } from '@/lib/services/insurance-recommendation-service';
import { serviceHubService } from '@/lib/services/service-hub-service';

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------

interface MarketplaceDashboardProps {
  userId: string;
  userRole: 'tenant' | 'landlord' | 'guarantor';
  userName?: string;
  propertyId?: string;
  contractId?: string;
  hasGarage?: boolean;
  hasVehicle?: boolean;
}

interface InsuranceOffer {
  id: string;
  productId: string;
  type: InsuranceProductType;
  insurerName: string;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  monthlyPayment: number;
  reason: string;
  icon: React.ReactNode;
  color: string;
}

interface ServiceCard {
  specialty: ServiceSpecialty;
  icon: React.ReactNode;
  color: string;
  description: string;
  estimatedPrice: string;
  responseTime: string;
}

// -----------------------------------------------------------------------------
// Constantes
// -----------------------------------------------------------------------------

const INSURANCE_ICONS: Record<InsuranceProductType, React.ReactNode> = {
  seguro_fianca: <Shield className="h-6 w-6" />,
  seguro_incendio: <Flame className="h-6 w-6" />,
  seguro_conteudo: <Home className="h-6 w-6" />,
  seguro_auto: <Car className="h-6 w-6" />,
  seguro_vida: <Heart className="h-6 w-6" />,
  seguro_residencial: <Home className="h-6 w-6" />,
};

const INSURANCE_COLORS: Record<InsuranceProductType, string> = {
  seguro_fianca: 'from-blue-500 to-blue-600',
  seguro_incendio: 'from-orange-500 to-red-500',
  seguro_conteudo: 'from-purple-500 to-purple-600',
  seguro_auto: 'from-green-500 to-emerald-600',
  seguro_vida: 'from-pink-500 to-rose-500',
  seguro_residencial: 'from-indigo-500 to-indigo-600',
};

const SERVICE_CARDS: ServiceCard[] = [
  {
    specialty: 'eletricista',
    icon: <Zap className="h-8 w-8" />,
    color: 'bg-yellow-500',
    description: 'Instalacoes, reparos e manutencao eletrica',
    estimatedPrice: 'R$ 80 - R$ 250',
    responseTime: '30 min',
  },
  {
    specialty: 'encanador',
    icon: <Droplets className="h-8 w-8" />,
    color: 'bg-blue-500',
    description: 'Vazamentos, entupimentos e instalacoes',
    estimatedPrice: 'R$ 90 - R$ 300',
    responseTime: '45 min',
  },
  {
    specialty: 'pintor',
    icon: <PaintBucket className="h-8 w-8" />,
    color: 'bg-purple-500',
    description: 'Pintura interna e externa, textura',
    estimatedPrice: 'R$ 150 - R$ 500',
    responseTime: '1-2 dias',
  },
  {
    specialty: 'ar_condicionado',
    icon: <Wind className="h-8 w-8" />,
    color: 'bg-cyan-500',
    description: 'Instalacao, limpeza e manutencao de AC',
    estimatedPrice: 'R$ 100 - R$ 350',
    responseTime: '2 horas',
  },
  {
    specialty: 'geral',
    icon: <Wrench className="h-8 w-8" />,
    color: 'bg-gray-500',
    description: 'Pequenos reparos e servicos diversos',
    estimatedPrice: 'R$ 60 - R$ 200',
    responseTime: '1 hora',
  },
  {
    specialty: 'limpeza',
    icon: <Sparkles className="h-8 w-8" />,
    color: 'bg-green-500',
    description: 'Limpeza residencial e pos-obra',
    estimatedPrice: 'R$ 100 - R$ 400',
    responseTime: '24 horas',
  },
];

// -----------------------------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------------------------

export function MarketplaceDashboard({
  userId,
  userRole,
  userName,
  propertyId,
  contractId,
  hasGarage = false,
  hasVehicle = false,
}: MarketplaceDashboardProps) {
  const [insuranceOffers, setInsuranceOffers] = useState<InsuranceOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<InsuranceOffer | null>(null);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(1250);
  const [isContracting, setIsContracting] = useState(false);

  // Carrega ofertas personalizadas
  useEffect(() => {
    loadOffers();
  }, [userId, propertyId, contractId]);

  const loadOffers = async () => {
    setIsLoading(true);

    try {
      const result = await insuranceRecommendationService.getOffersForUser({
        user: {
          id: userId,
          role: userRole,
          email: `${userId}@vinculobrasil.com.br`,
          name: userName || 'Usuario',
        },
        property: propertyId
          ? {
              id: propertyId,
              type: 'apartment',
              hasGarage,
              parkingSpaces: hasGarage ? 1 : 0,
              area: 70,
              rentAmount: 2500,
            }
          : undefined,
        contract: contractId
          ? {
              id: contractId,
              startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
              endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
              monthsActive: 6,
              isActive: true,
            }
          : undefined,
        vehicle: hasVehicle
          ? {
              plate: 'ABC1234',
              model: 'Onix',
              year: 2021,
              brand: 'Chevrolet',
            }
          : undefined,
        existingPolicies: [],
      });

      const offers: InsuranceOffer[] = result.offers.map((offer) => {
        const product = insuranceRecommendationService.getProductById(offer.productId);
        const type = (product?.type || 'seguro_residencial') as InsuranceProductType;

        return {
          id: offer.id,
          productId: offer.productId,
          type,
          insurerName: product?.insurerName || 'Seguradora',
          title: offer.title,
          description: offer.description,
          originalPrice: offer.originalPrice,
          discountedPrice: offer.discountedPrice,
          discountPercent: offer.discountPercent,
          monthlyPayment: offer.discountedPrice / 12,
          reason: offer.reason,
          icon: INSURANCE_ICONS[type],
          color: INSURANCE_COLORS[type],
        };
      });

      setInsuranceOffers(offers);
    } catch (error) {
      console.error('Erro ao carregar ofertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContractInsurance = async (offer: InsuranceOffer) => {
    setSelectedOffer(offer);
    setIsContractDialogOpen(true);
  };

  const confirmContract = async () => {
    if (!selectedOffer) return;

    setIsContracting(true);

    try {
      // Simula contratacao
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Atualiza pontos de fidelidade
      setLoyaltyPoints((prev) => prev + Math.round(selectedOffer.discountedPrice / 10));

      setIsContractDialogOpen(false);

      // Mostra sucesso (em producao usaria toast)
      alert('Seguro contratado com sucesso! Apolice enviada por email.');

      // Remove oferta da lista
      setInsuranceOffers((prev) => prev.filter((o) => o.id !== selectedOffer.id));
    } catch (error) {
      console.error('Erro ao contratar:', error);
      alert('Erro ao contratar seguro. Tente novamente.');
    } finally {
      setIsContracting(false);
    }
  };

  const handleRequestService = (service: ServiceCard) => {
    setSelectedService(service);
    setIsServiceDialogOpen(true);
  };

  const nextCarouselSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.max(1, insuranceOffers.length - 2));
  };

  const prevCarouselSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Math.max(1, insuranceOffers.length - 2)) % Math.max(1, insuranceOffers.length - 2));
  };

  return (
    <div className="space-y-8">
      {/* Header com Fidelidade */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Vinculo</h1>
          <p className="text-muted-foreground">
            Seguros e servicos exclusivos para voce
          </p>
        </div>

        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="flex items-center gap-4 py-3 px-4">
            <Gift className="h-8 w-8" />
            <div>
              <p className="text-sm opacity-90">Pontos Fidelidade</p>
              <p className="text-2xl font-bold">{loyaltyPoints.toLocaleString()}</p>
            </div>
            <Button variant="secondary" size="sm" className="ml-4">
              Resgatar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principais */}
      <Tabs defaultValue="seguros" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="seguros" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguros
          </TabsTrigger>
          <TabsTrigger value="servicos" className="gap-2">
            <Wrench className="h-4 w-4" />
            Servicos
          </TabsTrigger>
        </TabsList>

        {/* Tab de Seguros */}
        <TabsContent value="seguros" className="space-y-6 mt-6">
          {/* Banner de destaque */}
          {hasGarage && !hasVehicle && (
            <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="flex items-center gap-4 py-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Car className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Oferta Especial!</h3>
                  <p className="text-white/90">
                    Seu imovel tem garagem! Ganhe 15% OFF no Seguro Auto.
                  </p>
                </div>
                <Badge className="bg-white text-green-600 hover:bg-white/90">
                  -15% OFF
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Carrossel de Seguros */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Ofertas Personalizadas</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevCarouselSlide}
                  disabled={insuranceOffers.length <= 3}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextCarouselSlide}
                  disabled={insuranceOffers.length <= 3}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-12 w-12 bg-muted rounded-full" />
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : insuranceOffers.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-semibold text-lg">Tudo protegido!</h3>
                  <p className="text-muted-foreground">
                    Voce ja contratou todos os seguros recomendados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="w-full whitespace-nowrap pb-4">
                <div className="flex gap-4">
                  {insuranceOffers.map((offer, index) => (
                    <Card
                      key={offer.id}
                      className="min-w-[320px] max-w-[320px] flex-shrink-0 overflow-hidden"
                    >
                      <div className={`h-2 bg-gradient-to-r ${offer.color}`} />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div
                            className={`p-3 rounded-lg bg-gradient-to-br ${offer.color} text-white`}
                          >
                            {offer.icon}
                          </div>
                          {offer.discountPercent > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-700"
                            >
                              <Percent className="h-3 w-3 mr-1" />
                              {offer.discountPercent}% OFF
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3">
                          {INSURANCE_PRODUCT_LABELS[offer.type]}
                        </CardTitle>
                        <CardDescription>{offer.insurerName}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {offer.reason}
                        </p>

                        <div className="space-y-1">
                          {offer.discountPercent > 0 && (
                            <p className="text-sm text-muted-foreground line-through">
                              R$ {offer.originalPrice.toFixed(2)}/ano
                            </p>
                          )}
                          <p className="text-2xl font-bold text-primary">
                            R$ {offer.monthlyPayment.toFixed(2)}
                            <span className="text-sm font-normal text-muted-foreground">
                              /mes
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Gift className="h-4 w-4 text-amber-500" />
                          <span>
                            +{Math.round(offer.discountedPrice / 10)} pontos
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full"
                          onClick={() => handleContractInsurance(offer)}
                        >
                          Contratar com 1 Clique
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}
          </div>

          {/* Banner Fidelidade Vinculo */}
          <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
            <CardContent className="flex flex-col md:flex-row items-center gap-4 py-6">
              <div className="p-4 bg-white/20 rounded-full">
                <Star className="h-10 w-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-xl">Programa Fidelidade Vinculo</h3>
                <p className="text-white/90 mt-1">
                  Contrate o Seguro do seu Carro e ganhe{' '}
                  <span className="font-bold">R$ 50,00</span> de desconto no
                  proximo aluguel!
                </p>
              </div>
              <Button variant="secondary" size="lg">
                Saiba Mais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Servicos */}
        <TabsContent value="servicos" className="space-y-6 mt-6">
          {/* Banner de servicos */}
          <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Wrench className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Precisa de um reparo?</h3>
                <p className="text-white/90">
                  Prestadores verificados a partir de 30 minutos.
                  Reparos ate R$ 200 aprovados automaticamente!
                </p>
              </div>
              <Badge className="bg-white text-blue-600 hover:bg-white/90">
                24/7
              </Badge>
            </CardContent>
          </Card>

          {/* Grid de Servicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_CARDS.map((service) => (
              <Card
                key={service.specialty}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleRequestService(service)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-lg ${service.color} text-white`}
                    >
                      {service.icon}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {service.responseTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">
                    {SERVICE_SPECIALTY_LABELS[service.specialty]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {service.estimatedPrice}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Solicitar Servico
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Informativo de Alcada */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-start gap-4 py-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-800">
                  Aprovacao Automatica
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  Reparos ate <strong>R$ 200,00</strong> sao aprovados
                  automaticamente quando cobertos pelo seu contrato. Sem
                  burocracia!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Contratacao de Seguro */}
      <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Contratacao</DialogTitle>
            <DialogDescription>
              Revise os detalhes do seguro antes de confirmar
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${selectedOffer.color} text-white`}
                >
                  {selectedOffer.icon}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {INSURANCE_PRODUCT_LABELS[selectedOffer.type]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedOffer.insurerName}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor anual</span>
                  <span className="font-medium">
                    R$ {selectedOffer.discountedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">12x de</span>
                  <span className="font-bold text-lg text-primary">
                    R$ {selectedOffer.monthlyPayment.toFixed(2)}
                  </span>
                </div>
                {selectedOffer.discountPercent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Economia</span>
                    <span className="font-medium">
                      R${' '}
                      {(selectedOffer.originalPrice - selectedOffer.discountedPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Gift className="h-4 w-4 text-amber-500" />
                <span>
                  Voce ganhara{' '}
                  <strong>{Math.round(selectedOffer.discountedPrice / 10)} pontos</strong>{' '}
                  de fidelidade
                </span>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <span>
                  O seguro sera cobrado junto com o boleto do seu aluguel mensal.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsContractDialogOpen(false)}
              disabled={isContracting}
            >
              Cancelar
            </Button>
            <Button onClick={confirmContract} disabled={isContracting}>
              {isContracting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Contratacao
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Solicitacao de Servico */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Servico</DialogTitle>
            <DialogDescription>
              Descreva o problema e enviaremos um profissional
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${selectedService.color} text-white`}>
                  {selectedService.icon}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {SERVICE_SPECIALTY_LABELS[selectedService.specialty]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedService.description}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor estimado</span>
                  <span className="font-medium">{selectedService.estimatedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tempo de resposta</span>
                  <span className="font-medium">{selectedService.responseTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm">
                    4.8 media de avaliacao (150+ servicos)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span>
                  Servicos ate R$ 200 sao aprovados automaticamente!
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsServiceDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={() => {
              setIsServiceDialogOpen(false);
              alert('Redirecionando para formulario de solicitacao...');
            }}>
              <Phone className="h-4 w-4 mr-2" />
              Solicitar Agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MarketplaceDashboard;
