// =============================================================================
// Service Hub - Uber da Manutencao Residencial
// =============================================================================
// Sistema de despacho de servicos residenciais com:
// - Notificacao de prestadores num raio de 10km
// - GPS Tracking
// - Alcada automatica para reparos ate R$ 200
// - Avaliacao e pagamento integrado
// =============================================================================

import {
  type ServiceOrder,
  type ServiceProvider,
  type ServiceNotification,
  type ServicePhoto,
  type ServiceSpecialty,
  type ServiceUrgency,
  type ServiceOrderStatus,
  type GeoLocation,
  SERVICE_SPECIALTY_LABELS,
  SERVICE_URGENCY_LABELS,
} from '../marketplace-types';

// -----------------------------------------------------------------------------
// Constantes de Configuracao
// -----------------------------------------------------------------------------

const DEFAULT_SEARCH_RADIUS_KM = 10;
const AUTO_APPROVAL_THRESHOLD = 200; // R$ 200
const NOTIFICATION_EXPIRY_MINUTES = 15;
const MAX_PROVIDERS_TO_NOTIFY = 10;

// -----------------------------------------------------------------------------
// Dados vazios para producao - prestadores virao do backend
// -----------------------------------------------------------------------------

const EMPTY_PROVIDERS: ServiceProvider[] = [];

// -----------------------------------------------------------------------------
// Interface de Criacao de Ordem
// -----------------------------------------------------------------------------

interface CreateServiceOrderDTO {
  requesterId: string;
  requesterType: 'tenant' | 'landlord';
  propertyId: string;
  contractId?: string;
  specialty: ServiceSpecialty;
  title: string;
  description: string;
  urgency: ServiceUrgency;
  location: GeoLocation;
  address: string;
  photos?: File[];
  scheduledFor?: Date;
}

interface ServiceOrderResult {
  success: boolean;
  orderId?: string;
  order?: ServiceOrder;
  message: string;
  notifiedProviders?: number;
}

interface ProviderSearchResult {
  providers: ServiceProvider[];
  totalFound: number;
  searchRadius: number;
}

// -----------------------------------------------------------------------------
// Classe Principal do Servico
// -----------------------------------------------------------------------------

export class ServiceHubService {
  private providers: ServiceProvider[] = EMPTY_PROVIDERS;
  private orders: Map<string, ServiceOrder> = new Map();
  private notifications: Map<string, ServiceNotification[]> = new Map();

  /**
   * Cria uma nova ordem de servico
   */
  async createServiceOrder(dto: CreateServiceOrderDTO): Promise<ServiceOrderResult> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determina se sera auto-aprovado
    const autoApproved = await this.checkAutoApproval(dto);

    const order: ServiceOrder = {
      id: orderId,
      requesterId: dto.requesterId,
      requesterType: dto.requesterType,
      propertyId: dto.propertyId,
      contractId: dto.contractId,
      specialty: dto.specialty,
      title: dto.title,
      description: dto.description,
      urgency: dto.urgency,
      photosBefore: [],
      photosAfter: [],
      location: dto.location,
      address: dto.address,
      approvalThreshold: AUTO_APPROVAL_THRESHOLD,
      autoApproved,
      status: 'aberta',
      trackingEnabled: true,
      paymentStatus: 'pendente',
      createdAt: new Date(),
      scheduledFor: dto.scheduledFor,
    };

    // Salva ordem
    this.orders.set(orderId, order);

    // Notifica prestadores
    const notifiedCount = await this.notifyNearbyProviders(order);

    return {
      success: true,
      orderId,
      order,
      message: `Ordem criada! ${notifiedCount} prestadores foram notificados.`,
      notifiedProviders: notifiedCount,
    };
  }

  /**
   * Verifica se o servico pode ser auto-aprovado
   * Reparos ate R$ 200 sao aprovados automaticamente se estiverem no contrato
   */
  private async checkAutoApproval(dto: CreateServiceOrderDTO): Promise<boolean> {
    // Em producao, verificaria:
    // 1. Se existe contrato ativo
    // 2. Se o tipo de reparo esta coberto
    // 3. Historico de gastos do mes

    // Por padrao, inquilinos podem aprovar reparos ate R$ 200 automaticamente
    if (dto.requesterType === 'tenant' && dto.contractId) {
      return true;
    }

    return false;
  }

  /**
   * Notifica prestadores proximos
   */
  private async notifyNearbyProviders(order: ServiceOrder): Promise<number> {
    // Busca prestadores compativeis
    const nearbyProviders = this.findNearbyProviders(
      order.location,
      order.specialty,
      DEFAULT_SEARCH_RADIUS_KM
    );

    // Limita quantidade de notificacoes
    const providersToNotify = nearbyProviders.slice(0, MAX_PROVIDERS_TO_NOTIFY);

    const notifications: ServiceNotification[] = [];

    for (const provider of providersToNotify) {
      const distance = this.calculateDistance(order.location, provider.currentLocation!);
      const estimatedArrival = Math.round((distance / 30) * 60); // 30 km/h media

      const notification: ServiceNotification = {
        id: `notif_${order.id}_${provider.id}`,
        orderId: order.id,
        providerId: provider.id,
        status: 'enviada',
        sentAt: new Date(),
        distanceKm: distance,
        estimatedArrival,
      };

      notifications.push(notification);
    }

    // Salva notificacoes
    this.notifications.set(order.id, notifications);

    // Em producao, enviaria push notification real
    console.log(`[ServiceHub] ${notifications.length} prestadores notificados para ordem ${order.id}`);

    return notifications.length;
  }

  /**
   * Busca prestadores proximos que atendem a especialidade
   */
  findNearbyProviders(
    location: GeoLocation,
    specialty: ServiceSpecialty,
    radiusKm: number = DEFAULT_SEARCH_RADIUS_KM
  ): ServiceProvider[] {
    return this.providers
      .filter((provider) => {
        // Verifica se esta ativo e disponivel
        if (!provider.isActive || !provider.isAvailable) return false;

        // Verifica especialidade
        if (!provider.specialties.includes(specialty) && specialty !== 'geral') {
          return false;
        }

        // Verifica documentacao
        if (!provider.documentsVerified || !provider.backgroundCheckPassed) return false;

        // Verifica distancia
        if (!provider.currentLocation) return false;
        const distance = this.calculateDistance(location, provider.currentLocation);
        if (distance > radiusKm) return false;

        // Verifica se atende nesse raio
        if (distance > provider.serviceRadius) return false;

        return true;
      })
      .sort((a, b) => {
        // Ordena por distancia e rating
        const distA = this.calculateDistance(location, a.currentLocation!);
        const distB = this.calculateDistance(location, b.currentLocation!);

        // Peso: 70% distancia, 30% rating
        const scoreA = distA * 0.7 - a.rating * 0.3;
        const scoreB = distB * 0.7 - b.rating * 0.3;

        return scoreA - scoreB;
      });
  }

  /**
   * Calcula distancia entre dois pontos (formula Haversine)
   */
  private calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Prestador aceita ordem de servico
   */
  async acceptOrder(orderId: string, providerId: string): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    if (order.status !== 'aberta') {
      return { success: false, message: 'Ordem ja foi aceita por outro prestador' };
    }

    // Atualiza ordem
    order.providerId = providerId;
    order.providerAcceptedAt = new Date();
    order.status = 'aceita';

    // Atualiza notificacao
    const orderNotifications = this.notifications.get(orderId) || [];
    for (const notif of orderNotifications) {
      if (notif.providerId === providerId) {
        notif.status = 'aceita';
        notif.respondedAt = new Date();
      } else {
        notif.status = 'expirada';
      }
    }

    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      order,
      message: 'Ordem aceita! Inicie o deslocamento quando estiver pronto.',
    };
  }

  /**
   * Prestador inicia deslocamento
   */
  async startTransit(orderId: string, providerId: string): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    if (order.providerId !== providerId) {
      return { success: false, message: 'Voce nao e o prestador desta ordem' };
    }

    order.status = 'em_deslocamento';
    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      order,
      message: 'Deslocamento iniciado! GPS ativado.',
    };
  }

  /**
   * Prestador chega ao local
   */
  async arriveAtLocation(orderId: string, providerId: string): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    if (order.providerId !== providerId) {
      return { success: false, message: 'Voce nao e o prestador desta ordem' };
    }

    order.status = 'em_execucao';
    order.providerArrivedAt = new Date();
    order.startedAt = new Date();
    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      order,
      message: 'Chegada registrada! Bom trabalho.',
    };
  }

  /**
   * Atualiza localizacao do prestador (GPS tracking)
   */
  async updateProviderLocation(
    orderId: string,
    providerId: string,
    location: GeoLocation
  ): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order || order.providerId !== providerId) return;

    order.providerLocation = {
      ...location,
      timestamp: new Date(),
    };

    this.orders.set(orderId, order);
  }

  /**
   * Finaliza servico
   */
  async completeService(
    orderId: string,
    providerId: string,
    finalValue: number,
    photosAfter: ServicePhoto[]
  ): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    if (order.providerId !== providerId) {
      return { success: false, message: 'Voce nao e o prestador desta ordem' };
    }

    order.finalValue = finalValue;
    order.photosAfter = photosAfter;
    order.completedAt = new Date();

    // Verifica se precisa aprovacao
    if (finalValue > order.approvalThreshold && !order.autoApproved) {
      order.status = 'aguardando_aprovacao';
      return {
        success: true,
        orderId,
        order,
        message: `Servico finalizado! Valor de R$ ${finalValue.toFixed(2)} aguardando aprovacao.`,
      };
    }

    // Auto-aprovado ou dentro do limite
    order.status = 'concluida';
    order.paymentStatus = 'processando';

    this.orders.set(orderId, order);

    return {
      success: true,
      orderId,
      order,
      message: 'Servico concluido! Pagamento sera liberado em breve.',
    };
  }

  /**
   * Aprova pagamento da ordem
   */
  async approvePayment(orderId: string, approverId: string): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    order.status = 'concluida';
    order.paymentStatus = 'processando';
    this.orders.set(orderId, order);

    // Em producao, processaria pagamento real
    setTimeout(() => {
      const o = this.orders.get(orderId);
      if (o) {
        o.paymentStatus = 'pago';
        o.paidAt = new Date();
        this.orders.set(orderId, o);
      }
    }, 2000);

    return {
      success: true,
      orderId,
      order,
      message: 'Pagamento aprovado! Sera processado em instantes.',
    };
  }

  /**
   * Avalia servico
   */
  async rateService(
    orderId: string,
    rating: number,
    comment?: string
  ): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    order.rating = rating;
    order.ratingComment = comment;
    this.orders.set(orderId, order);

    // Atualiza rating do prestador
    if (order.providerId) {
      const provider = this.providers.find((p) => p.id === order.providerId);
      if (provider) {
        const newTotalRatings = provider.totalRatings + 1;
        const newRating =
          (provider.rating * provider.totalRatings + rating) / newTotalRatings;
        provider.rating = Math.round(newRating * 10) / 10;
        provider.totalRatings = newTotalRatings;
        provider.completedJobs += 1;
      }
    }

    return {
      success: true,
      orderId,
      order,
      message: 'Obrigado pela avaliacao!',
    };
  }

  /**
   * Cancela ordem de servico
   */
  async cancelOrder(orderId: string, reason: string): Promise<ServiceOrderResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: 'Ordem nao encontrada' };
    }

    if (['concluida', 'cancelada'].includes(order.status)) {
      return { success: false, message: 'Ordem nao pode ser cancelada' };
    }

    order.status = 'cancelada';
    this.orders.set(orderId, order);

    // Atualiza estatisticas do prestador se ja tinha aceitado
    if (order.providerId) {
      const provider = this.providers.find((p) => p.id === order.providerId);
      if (provider) {
        provider.cancelledJobs += 1;
      }
    }

    return {
      success: true,
      orderId,
      order,
      message: 'Ordem cancelada.',
    };
  }

  /**
   * Retorna ordem por ID
   */
  getOrderById(orderId: string): ServiceOrder | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Retorna ordens do usuario
   */
  getOrdersByUser(userId: string): ServiceOrder[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.requesterId === userId
    );
  }

  /**
   * Retorna ordens disponiveis para prestador
   */
  getAvailableOrdersForProvider(
    providerId: string,
    location: GeoLocation
  ): ServiceOrder[] {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) return [];

    return Array.from(this.orders.values()).filter((order) => {
      if (order.status !== 'aberta') return false;

      // Verifica especialidade
      if (!provider.specialties.includes(order.specialty)) return false;

      // Verifica distancia
      const distance = this.calculateDistance(location, order.location);
      if (distance > provider.serviceRadius) return false;

      return true;
    });
  }

  /**
   * Retorna ordens do prestador
   */
  getOrdersByProvider(providerId: string): ServiceOrder[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.providerId === providerId
    );
  }

  /**
   * Retorna todos os prestadores
   */
  getAllProviders(): ServiceProvider[] {
    return this.providers.filter((p) => p.isActive);
  }

  /**
   * Retorna prestador por ID
   */
  getProviderById(providerId: string): ServiceProvider | undefined {
    return this.providers.find((p) => p.id === providerId);
  }

  /**
   * Busca prestadores por especialidade
   */
  searchProviders(params: {
    specialty?: ServiceSpecialty;
    location?: GeoLocation;
    radiusKm?: number;
    minRating?: number;
  }): ProviderSearchResult {
    let providers = this.providers.filter((p) => p.isActive && p.isAvailable);

    if (params.specialty) {
      providers = providers.filter((p) => p.specialties.includes(params.specialty!));
    }

    if (params.minRating) {
      providers = providers.filter((p) => p.rating >= params.minRating!);
    }

    if (params.location) {
      const radius = params.radiusKm || DEFAULT_SEARCH_RADIUS_KM;
      providers = providers.filter((p) => {
        if (!p.currentLocation) return false;
        const distance = this.calculateDistance(params.location!, p.currentLocation);
        return distance <= radius;
      });
    }

    return {
      providers,
      totalFound: providers.length,
      searchRadius: params.radiusKm || DEFAULT_SEARCH_RADIUS_KM,
    };
  }

  /**
   * Estima valor do servico
   */
  estimateServiceValue(
    specialty: ServiceSpecialty,
    urgency: ServiceUrgency,
    estimatedHours: number = 2
  ): { min: number; max: number; average: number } {
    // Busca valores medios dos prestadores
    const specialtyProviders = this.providers.filter((p) =>
      p.specialties.includes(specialty)
    );

    if (specialtyProviders.length === 0) {
      return { min: 100, max: 300, average: 200 };
    }

    const rates = specialtyProviders.map((p) => p.hourlyRate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;

    // Aplica multiplicador de urgencia
    const urgencyMultiplier: Record<ServiceUrgency, number> = {
      baixa: 0.9,
      normal: 1.0,
      alta: 1.3,
      emergencia: 1.8,
    };

    const mult = urgencyMultiplier[urgency];

    return {
      min: Math.round(minRate * estimatedHours * mult),
      max: Math.round(maxRate * estimatedHours * mult),
      average: Math.round(avgRate * estimatedHours * mult),
    };
  }
}

// Instancia singleton
export const serviceHubService = new ServiceHubService();
