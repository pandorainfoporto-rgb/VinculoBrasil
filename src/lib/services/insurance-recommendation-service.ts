// =============================================================================
// Vinculo Insure - Servico de Recomendacao de Seguros
// =============================================================================
// Este servico analisa o perfil do usuario e retorna produtos de seguro
// elegiveis com descontos personalizados baseados em regras de negocio.
// =============================================================================

import {
  type InsuranceProduct,
  type InsuranceProductType,
  type InsuranceQuote,
  type PersonalizedOffer,
  type SpecialCondition,
  INSURANCE_PRODUCT_LABELS,
} from '../marketplace-types';

// -----------------------------------------------------------------------------
// Tipos internos
// -----------------------------------------------------------------------------

interface UserProfile {
  id: string;
  role: 'tenant' | 'landlord' | 'guarantor';
  email: string;
  name: string;
  cpf?: string;
  phone?: string;
}

interface PropertyContext {
  id: string;
  type: 'apartment' | 'house' | 'commercial';
  hasGarage: boolean;
  parkingSpaces: number;
  area: number;
  rentAmount: number;
  condoFee?: number;
}

interface ContractContext {
  id: string;
  startDate: Date;
  endDate: Date;
  monthsActive: number;
  isActive: boolean;
}

interface VehicleInfo {
  plate?: string;
  model?: string;
  year?: number;
  brand?: string;
}

interface RecommendationContext {
  user: UserProfile;
  property?: PropertyContext;
  contract?: ContractContext;
  vehicle?: VehicleInfo;
  existingPolicies: string[]; // IDs de apolices ja contratadas
}

interface RecommendationResult {
  offers: PersonalizedOffer[];
  quotes: InsuranceQuote[];
  totalSavings: number;
  loyaltyDiscount: number;
}

// -----------------------------------------------------------------------------
// Dados vazios para producao - produtos virao do backend
// -----------------------------------------------------------------------------

const EMPTY_PRODUCTS: InsuranceProduct[] = [];

// -----------------------------------------------------------------------------
// Classe Principal do Servico
// -----------------------------------------------------------------------------

export class InsuranceRecommendationService {
  private products: InsuranceProduct[] = EMPTY_PRODUCTS;

  /**
   * Retorna ofertas personalizadas para o usuario
   * Analisa perfil, propriedade e contrato para recomendar produtos
   */
  async getOffersForUser(context: RecommendationContext): Promise<RecommendationResult> {
    const { user, property, contract, vehicle, existingPolicies } = context;

    // Filtra produtos elegiveis
    const eligibleProducts = this.products.filter((product) => {
      // Nao mostrar produtos ja contratados
      if (existingPolicies.includes(product.id)) return false;

      // Verificar elegibilidade basica
      if (!this.checkEligibility(product, context)) return false;

      return true;
    });

    // Gera ofertas personalizadas
    const offers: PersonalizedOffer[] = [];
    const quotes: InsuranceQuote[] = [];

    for (const product of eligibleProducts) {
      const { offer, quote } = this.generateOffer(product, context);
      offers.push(offer);
      quotes.push(quote);
    }

    // Ordena por relevancia
    offers.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Calcula economia total
    const totalSavings = offers.reduce((sum, offer) => sum + (offer.originalPrice - offer.discountedPrice), 0);

    // Desconto de fidelidade base (cliente Vinculo)
    const loyaltyDiscount = contract?.isActive ? 10 : 0;

    return {
      offers,
      quotes,
      totalSavings,
      loyaltyDiscount,
    };
  }

  /**
   * Verifica se usuario e elegivel para o produto
   */
  private checkEligibility(product: InsuranceProduct, context: RecommendationContext): boolean {
    const { user, property, vehicle } = context;
    const criteria = product.eligibilityCriteria;

    // Requer imovel?
    if (criteria.requiresProperty && !property) return false;

    // Tipo de imovel permitido?
    if (property && criteria.propertyTypes) {
      if (!criteria.propertyTypes.includes(property.type)) return false;
    }

    // Requer veiculo?
    if (criteria.requiresVehicle && !vehicle) return false;

    // Idade maxima do veiculo?
    if (vehicle && criteria.vehicleMaxAge) {
      const vehicleAge = new Date().getFullYear() - (vehicle.year || 0);
      if (vehicleAge > criteria.vehicleMaxAge) return false;
    }

    return true;
  }

  /**
   * Gera oferta personalizada com descontos aplicaveis
   */
  private generateOffer(
    product: InsuranceProduct,
    context: RecommendationContext
  ): { offer: PersonalizedOffer; quote: InsuranceQuote } {
    const { user, property, contract, existingPolicies } = context;

    // Calcula premio base
    let basePremium = this.calculateBasePremium(product, context);

    // Aplica descontos
    const applicableDiscounts = this.getApplicableDiscounts(product, context);
    let totalDiscount = 0;

    for (const discount of applicableDiscounts) {
      totalDiscount += discount.discountPercent;
    }

    // Limite de desconto maximo: 35%
    totalDiscount = Math.min(totalDiscount, 35);

    const finalPremium = basePremium * (1 - totalDiscount / 100);
    const monthlyPayment = finalPremium / 12;

    // Calcula score de relevancia
    const relevanceScore = this.calculateRelevanceScore(product, context, applicableDiscounts.length);

    // Gera razao da oferta
    const reason = this.generateOfferReason(product, context);

    // Cria oferta
    const offer: PersonalizedOffer = {
      id: `offer_${product.id}_${user.id}`,
      userId: user.id,
      productId: product.id,
      productType: 'insurance',
      title: `${INSURANCE_PRODUCT_LABELS[product.type]} - ${product.insurerName}`,
      description: product.description,
      originalPrice: basePremium,
      discountedPrice: finalPremium,
      discountPercent: totalDiscount,
      reason,
      relevanceScore,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      isExpired: false,
      viewed: false,
      clicked: false,
      converted: false,
      createdAt: new Date(),
    };

    // Cria cotacao
    const quote: InsuranceQuote = {
      id: `quote_${product.id}_${user.id}_${Date.now()}`,
      userId: user.id,
      productId: product.id,
      propertyId: property?.id,
      contractId: contract?.id,
      coverageAmount: this.getCoverageAmount(product, context),
      basePremium,
      discounts: applicableDiscounts.map((d) => ({
        conditionId: d.id,
        name: d.name,
        discountPercent: d.discountPercent,
        discountAmount: basePremium * (d.discountPercent / 100),
      })),
      finalPremium,
      monthlyPayment,
      status: 'pendente',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    return { offer, quote };
  }

  /**
   * Calcula premio base do produto
   */
  private calculateBasePremium(product: InsuranceProduct, context: RecommendationContext): number {
    const { property, vehicle } = context;

    let coverageAmount = 0;

    switch (product.type) {
      case 'seguro_incendio':
      case 'seguro_residencial':
        // Base no valor do imovel estimado (100x aluguel)
        coverageAmount = (property?.rentAmount || 2000) * 100;
        break;

      case 'seguro_conteudo':
        // Base no valor do conteudo estimado
        coverageAmount = (property?.area || 50) * 500; // R$ 500/m2
        break;

      case 'seguro_auto':
        // Base no valor FIPE estimado do veiculo
        const vehicleValue = this.estimateVehicleValue(vehicle);
        coverageAmount = vehicleValue;
        break;

      case 'seguro_vida':
        // Cobertura padrao
        coverageAmount = 200000;
        break;

      default:
        coverageAmount = product.minCoverage;
    }

    // Aplica taxa base
    let premium = coverageAmount * product.basePremiumRate;

    // Garante limites
    premium = Math.max(premium, product.minPremium);
    premium = Math.min(premium, product.maxPremium);

    return Math.round(premium * 100) / 100;
  }

  /**
   * Estima valor do veiculo
   */
  private estimateVehicleValue(vehicle?: VehicleInfo): number {
    if (!vehicle || !vehicle.year) return 50000;

    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;

    // Valor base depreciando 10% ao ano
    const baseValue = 80000;
    const depreciatedValue = baseValue * Math.pow(0.9, age);

    return Math.max(depreciatedValue, 15000);
  }

  /**
   * Retorna descontos aplicaveis
   */
  private getApplicableDiscounts(product: InsuranceProduct, context: RecommendationContext): SpecialCondition[] {
    const { user, property, contract, existingPolicies } = context;
    const applicableDiscounts: SpecialCondition[] = [];

    if (!product.specialConditions) return applicableDiscounts;

    for (const condition of product.specialConditions) {
      const criteria = condition.criteria;
      let applies = true;

      // Verifica cada criterio
      if (criteria.userType && criteria.userType !== user.role) {
        applies = false;
      }

      if (criteria.hasGarage && !property?.hasGarage) {
        applies = false;
      }

      if (criteria.hasActiveContract && !contract?.isActive) {
        applies = false;
      }

      if (criteria.contractMonths && (contract?.monthsActive || 0) < criteria.contractMonths) {
        applies = false;
      }

      if (criteria.bundleWith) {
        // Verifica se tem outro seguro do bundle
        const hasBundle = existingPolicies.some((policyId) => {
          const existingProduct = this.products.find((p) => p.id === policyId);
          return existingProduct && criteria.bundleWith?.includes(existingProduct.type);
        });
        if (!hasBundle) applies = false;
      }

      // Verifica validade temporal
      if (condition.validFrom && new Date() < condition.validFrom) {
        applies = false;
      }
      if (condition.validUntil && new Date() > condition.validUntil) {
        applies = false;
      }

      if (applies) {
        applicableDiscounts.push(condition);
      }
    }

    return applicableDiscounts;
  }

  /**
   * Calcula score de relevancia para ordenacao
   */
  private calculateRelevanceScore(
    product: InsuranceProduct,
    context: RecommendationContext,
    discountCount: number
  ): number {
    const { user, property, contract, vehicle } = context;
    let score = 50; // Base

    // Bonus por tipo de usuario
    if (user.role === 'tenant' && product.type === 'seguro_conteudo') score += 20;
    if (user.role === 'landlord' && product.type === 'seguro_residencial') score += 20;

    // Bonus por contexto
    if (property?.hasGarage && product.type === 'seguro_auto') score += 25;
    if (contract?.isActive) score += 10;
    if (vehicle && product.type === 'seguro_auto') score += 30;

    // Bonus por descontos aplicaveis
    score += discountCount * 10;

    // Obrigatoriedade (incendio sempre relevante)
    if (product.type === 'seguro_incendio') score += 15;

    return Math.min(score, 100);
  }

  /**
   * Gera razao/contexto da oferta
   */
  private generateOfferReason(product: InsuranceProduct, context: RecommendationContext): string {
    const { user, property, contract, vehicle } = context;

    switch (product.type) {
      case 'seguro_incendio':
        return 'Seguro obrigatorio para contratos de aluguel';

      case 'seguro_conteudo':
        if (user.role === 'tenant') {
          return 'Proteja seus bens dentro do imovel alugado';
        }
        return 'Protecao para conteudo do imovel';

      case 'seguro_auto':
        if (property?.hasGarage) {
          return `Imovel com ${property.parkingSpaces} vaga(s) - ganhe 10% OFF no seguro auto!`;
        }
        return 'Proteja seu veiculo com condicoes especiais';

      case 'seguro_vida':
        if (contract && contract.monthsActive >= 6) {
          return 'Cliente fidelidade - 20% de desconto exclusivo!';
        }
        return 'Protecao financeira para sua familia';

      case 'seguro_residencial':
        if (user.role === 'landlord') {
          return 'Proteja seu patrimonio com cobertura completa';
        }
        return 'Pacote completo de protecao residencial';

      default:
        return 'Oferta especial para clientes Vinculo';
    }
  }

  /**
   * Retorna valor de cobertura calculado
   */
  private getCoverageAmount(product: InsuranceProduct, context: RecommendationContext): number {
    const { property, vehicle } = context;

    switch (product.type) {
      case 'seguro_incendio':
      case 'seguro_residencial':
        return (property?.rentAmount || 2000) * 100;

      case 'seguro_conteudo':
        return (property?.area || 50) * 500;

      case 'seguro_auto':
        return this.estimateVehicleValue(vehicle);

      case 'seguro_vida':
        return 200000;

      default:
        return product.minCoverage;
    }
  }

  /**
   * Retorna todos os produtos disponiveis
   */
  getAllProducts(): InsuranceProduct[] {
    return this.products.filter((p) => p.isActive);
  }

  /**
   * Retorna produto por ID
   */
  getProductById(productId: string): InsuranceProduct | undefined {
    return this.products.find((p) => p.id === productId);
  }

  /**
   * Retorna produtos por tipo
   */
  getProductsByType(type: InsuranceProductType): InsuranceProduct[] {
    return this.products.filter((p) => p.type === type && p.isActive);
  }

  /**
   * Simula contratacao de seguro
   */
  async contractInsurance(quoteId: string, paymentMethod: 'boleto' | 'cartao' | 'pix'): Promise<{
    success: boolean;
    policyId?: string;
    message: string;
  }> {
    // Em producao, chamaria API real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      policyId: `policy_${Date.now()}`,
      message: 'Seguro contratado com sucesso! Apolice enviada por email.',
    };
  }
}

// Instancia singleton
export const insuranceRecommendationService = new InsuranceRecommendationService();
