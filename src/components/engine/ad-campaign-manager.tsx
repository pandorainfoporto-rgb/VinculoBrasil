/**
 * Ad Campaign Manager - Engine de Anuncios
 * Sistema de campanhas publicitarias para monetizacao
 *
 * Features:
 * - Campanhas rotativas com carrosel
 * - Segmentacao por tipo de cliente (tenant, landlord, guarantor, all)
 * - Tamanhos responsivos (mobile/desktop)
 * - Contagem de views para cobranca
 * - Suporte a imagem e video
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import {
  Megaphone,
  Plus,
  Image,
  Video,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Users,
  Building2,
  Home,
  Shield,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  Upload,
} from 'lucide-react';

// Tipos de clientes para segmentacao
export type ClientType = 'tenant' | 'landlord' | 'guarantor' | 'insurer' | 'realestate' | 'all';

// Tipos de media
export type MediaType = 'image' | 'video';

// Status da campanha
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'scheduled' | 'completed' | 'archived';

// Configuracao de tamanho responsivo
export interface ResponsiveSize {
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
}

// Configuracao de midia
export interface CampaignMedia {
  id: string;
  type: MediaType;
  url: string;
  mobileUrl?: string; // URL alternativa para mobile
  alt: string;
  duration?: number; // Duracao em segundos para video
}

// Metricas de campanha
export interface CampaignMetrics {
  views: number;
  uniqueViews: number;
  clicks: number;
  ctr: number; // Click-through rate
  revenue: number; // Receita gerada
  costPerView: number;
}

// Configuracao de cobranca
export interface BillingConfig {
  model: 'cpm' | 'cpc' | 'cpa' | 'flat'; // CPM, CPC, CPA ou valor fixo
  rate: number; // Valor cobrado
  currency: string;
  minViews?: number; // Minimo de views para cobranca
  maxBudget?: number; // Orcamento maximo
  currentSpend: number;
}

// Campanha publicitaria
export interface AdCampaign {
  id: string;
  name: string;
  description: string;
  partnerId: string;
  partnerName: string;
  status: CampaignStatus;
  targetAudience: ClientType[];
  media: CampaignMedia[];
  responsiveSize: ResponsiveSize;
  carouselInterval: number; // Intervalo em segundos entre slides
  startDate: Date;
  endDate: Date;
  priority: number; // 1-10, maior = mais prioridade
  clickUrl: string;
  metrics: CampaignMetrics;
  billing: BillingConfig;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Parceiro anunciante
export interface AdPartner {
  id: string;
  name: string;
  logo: string;
  contactEmail: string;
  contactPhone: string;
  totalSpend: number;
  activeCampaigns: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
}

// Props do componente de exibicao de anuncios
export interface AdBannerProps {
  placement: 'sidebar' | 'header' | 'footer' | 'inline' | 'modal';
  clientType: ClientType;
  maxAds?: number;
  className?: string;
  onAdView?: (campaignId: string) => void;
  onAdClick?: (campaignId: string) => void;
}

// Mock de campanhas
const mockCampaigns: AdCampaign[] = [
  {
    id: 'camp_1',
    name: 'Seguro Residencial Premium',
    description: 'Campanha de seguro residencial para proprietarios e garantidores',
    partnerId: 'partner_1',
    partnerName: 'Seguradora Vinculo',
    status: 'active',
    targetAudience: ['landlord', 'guarantor'],
    media: [
      {
        id: 'media_1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
        mobileUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
        alt: 'Seguro Residencial Premium',
      },
    ],
    responsiveSize: {
      mobile: { width: 320, height: 250 },
      tablet: { width: 728, height: 90 },
      desktop: { width: 970, height: 250 },
    },
    carouselInterval: 5,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    priority: 8,
    clickUrl: 'https://vinculobrasil.com.br/seguro-residencial',
    metrics: {
      views: 45230,
      uniqueViews: 12450,
      clicks: 1823,
      ctr: 4.03,
      revenue: 9115.0,
      costPerView: 0.05,
    },
    billing: {
      model: 'cpm',
      rate: 5.0,
      currency: 'BRL',
      minViews: 1000,
      maxBudget: 50000,
      currentSpend: 9115.0,
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: 'admin@vinculobrasil.com.br',
  },
  {
    id: 'camp_2',
    name: 'Seguro de Vida Familiar',
    description: 'Protecao para toda a familia - disponivel para todos os clientes',
    partnerId: 'partner_1',
    partnerName: 'Seguradora Vinculo',
    status: 'active',
    targetAudience: ['all'],
    media: [
      {
        id: 'media_2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=400&fit=crop',
        mobileUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop',
        alt: 'Seguro de Vida Familiar',
      },
      {
        id: 'media_3',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop',
        alt: 'Familia Protegida',
      },
    ],
    responsiveSize: {
      mobile: { width: 320, height: 250 },
      tablet: { width: 728, height: 90 },
      desktop: { width: 970, height: 250 },
    },
    carouselInterval: 7,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    priority: 10,
    clickUrl: 'https://vinculobrasil.com.br/seguro-vida',
    metrics: {
      views: 89450,
      uniqueViews: 34200,
      clicks: 4523,
      ctr: 5.06,
      revenue: 22262.5,
      costPerView: 0.05,
    },
    billing: {
      model: 'cpm',
      rate: 5.0,
      currency: 'BRL',
      maxBudget: 100000,
      currentSpend: 22262.5,
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    createdBy: 'admin@vinculobrasil.com.br',
  },
  {
    id: 'camp_3',
    name: 'Servico de Mudanca Express',
    description: 'Servico exclusivo para inquilinos que estao se mudando',
    partnerId: 'partner_2',
    partnerName: 'Mudancas Express Ltda',
    status: 'active',
    targetAudience: ['tenant'],
    media: [
      {
        id: 'media_4',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=400&fit=crop',
        mobileUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop',
        alt: 'Mudanca Express',
      },
    ],
    responsiveSize: {
      mobile: { width: 320, height: 250 },
      tablet: { width: 728, height: 90 },
      desktop: { width: 970, height: 250 },
    },
    carouselInterval: 6,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-30'),
    priority: 7,
    clickUrl: 'https://mudancasexpress.com.br',
    metrics: {
      views: 23100,
      uniqueViews: 8900,
      clicks: 1234,
      ctr: 5.34,
      revenue: 6175.0,
      costPerView: 0.05,
    },
    billing: {
      model: 'cpm',
      rate: 5.0,
      currency: 'BRL',
      maxBudget: 25000,
      currentSpend: 6175.0,
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    createdBy: 'admin@vinculobrasil.com.br',
  },
  {
    id: 'camp_4',
    name: 'Financiamento Imobiliario',
    description: 'Taxas especiais para proprietarios e imobiliarias',
    partnerId: 'partner_3',
    partnerName: 'Banco Vinculo',
    status: 'active',
    targetAudience: ['landlord', 'realestate'],
    media: [
      {
        id: 'media_5',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
        alt: 'Financiamento Imobiliario',
      },
    ],
    responsiveSize: {
      mobile: { width: 320, height: 250 },
      tablet: { width: 728, height: 90 },
      desktop: { width: 970, height: 250 },
    },
    carouselInterval: 8,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    priority: 9,
    clickUrl: 'https://vinculobrasil.com.br/financiamento',
    metrics: {
      views: 15600,
      uniqueViews: 6200,
      clicks: 890,
      ctr: 5.71,
      revenue: 4450.0,
      costPerView: 0.05,
    },
    billing: {
      model: 'cpc',
      rate: 2.5,
      currency: 'BRL',
      maxBudget: 30000,
      currentSpend: 4450.0,
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date(),
    createdBy: 'admin@vinculobrasil.com.br',
  },
  {
    id: 'camp_5',
    name: 'Consorcio de Imoveis',
    description: 'Realize o sonho da casa propria',
    partnerId: 'partner_3',
    partnerName: 'Banco Vinculo',
    status: 'paused',
    targetAudience: ['tenant', 'guarantor'],
    media: [
      {
        id: 'media_6',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=400&fit=crop',
        alt: 'Consorcio de Imoveis',
      },
    ],
    responsiveSize: {
      mobile: { width: 320, height: 250 },
      tablet: { width: 728, height: 90 },
      desktop: { width: 970, height: 250 },
    },
    carouselInterval: 5,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2024-10-31'),
    priority: 6,
    clickUrl: 'https://vinculobrasil.com.br/consorcio',
    metrics: {
      views: 8900,
      uniqueViews: 3400,
      clicks: 445,
      ctr: 5.0,
      revenue: 2225.0,
      costPerView: 0.05,
    },
    billing: {
      model: 'cpm',
      rate: 5.0,
      currency: 'BRL',
      maxBudget: 15000,
      currentSpend: 2225.0,
    },
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date(),
    createdBy: 'admin@vinculobrasil.com.br',
  },
];

// Mock de parceiros
const mockPartners: AdPartner[] = [
  {
    id: 'partner_1',
    name: 'Seguradora Vinculo',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop',
    contactEmail: 'contato@seguradoravinculo.com.br',
    contactPhone: '(11) 3456-7890',
    totalSpend: 31377.5,
    activeCampaigns: 2,
    status: 'active',
    createdAt: new Date('2023-06-15'),
  },
  {
    id: 'partner_2',
    name: 'Mudancas Express Ltda',
    logo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=100&h=100&fit=crop',
    contactEmail: 'marketing@mudancasexpress.com.br',
    contactPhone: '(11) 2345-6789',
    totalSpend: 6175.0,
    activeCampaigns: 1,
    status: 'active',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'partner_3',
    name: 'Banco Vinculo',
    logo: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=100&h=100&fit=crop',
    contactEmail: 'marketing@bancovinculo.com.br',
    contactPhone: '(11) 4567-8901',
    totalSpend: 6675.0,
    activeCampaigns: 1,
    status: 'active',
    createdAt: new Date('2024-02-01'),
  },
];

// Componente de exibicao de anuncios (para usar nos dashboards)
export function AdBanner({
  placement,
  clientType,
  maxAds = 3,
  className,
  onAdView,
  onAdClick
}: AdBannerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [visibleCampaigns, setVisibleCampaigns] = useState<AdCampaign[]>([]);

  // Filtra campanhas por tipo de cliente
  useEffect(() => {
    const filtered = mockCampaigns
      .filter(c => c.status === 'active')
      .filter(c => c.targetAudience.includes('all') || c.targetAudience.includes(clientType))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxAds);
    setVisibleCampaigns(filtered);
  }, [clientType, maxAds]);

  // Auto-play do carrosel
  useEffect(() => {
    if (!api || visibleCampaigns.length <= 1) return;

    const interval = (visibleCampaigns[current]?.carouselInterval || 5) * 1000;
    const timer = setInterval(() => {
      api.scrollNext();
    }, interval);

    return () => clearInterval(timer);
  }, [api, current, visibleCampaigns]);

  // Registra view quando muda slide
  useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      const idx = api.selectedScrollSnap();
      setCurrent(idx);
      if (visibleCampaigns[idx] && onAdView) {
        onAdView(visibleCampaigns[idx].id);
      }
    });
  }, [api, visibleCampaigns, onAdView]);

  // Registra view inicial
  useEffect(() => {
    if (visibleCampaigns.length > 0 && onAdView) {
      onAdView(visibleCampaigns[0].id);
    }
  }, [visibleCampaigns, onAdView]);

  const handleClick = (campaign: AdCampaign) => {
    if (onAdClick) {
      onAdClick(campaign.id);
    }
    window.open(campaign.clickUrl, '_blank', 'noopener,noreferrer');
  };

  if (visibleCampaigns.length === 0) return null;

  // Determina tamanho baseado no placement
  const getSizeClass = () => {
    switch (placement) {
      case 'sidebar':
        return 'w-full max-w-[300px]';
      case 'header':
        return 'w-full max-h-[90px]';
      case 'footer':
        return 'w-full max-h-[90px]';
      case 'inline':
        return 'w-full';
      case 'modal':
        return 'w-full max-w-[600px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className={cn('relative', getSizeClass(), className)}>
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {visibleCampaigns.map((campaign) => (
            <CarouselItem key={campaign.id}>
              <div
                className="relative cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => handleClick(campaign)}
              >
                <img
                  src={campaign.media[0]?.url}
                  alt={campaign.media[0]?.alt}
                  className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <p className="text-sm font-medium truncate">{campaign.name}</p>
                    <p className="text-xs opacity-80">{campaign.partnerName}</p>
                  </div>
                </div>
                {/* Badge de patrocinado */}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/50 text-white text-[10px]">
                    Patrocinado
                  </Badge>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicadores de slide */}
      {visibleCampaigns.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {visibleCampaigns.map((_, idx) => (
            <button
              key={idx}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                idx === current ? 'bg-primary' : 'bg-gray-300'
              )}
              onClick={() => api?.scrollTo(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Painel de Gerenciamento de Campanhas (Admin)
export function AdCampaignManager() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(mockCampaigns);
  const [partners, setPartners] = useState<AdPartner[]>(mockPartners);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');
  const [filterAudience, setFilterAudience] = useState<ClientType | 'all'>('all');

  // Estatisticas gerais
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalViews: campaigns.reduce((sum, c) => sum + c.metrics.views, 0),
    totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0),
    avgCtr: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length
      : 0,
  };

  // Campanhas filtradas
  const filteredCampaigns = campaigns.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterAudience !== 'all' && !c.targetAudience.includes(filterAudience) && !c.targetAudience.includes('all')) return false;
    return true;
  });

  const handleToggleStatus = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        return { ...c, status: c.status === 'active' ? 'paused' : 'active' };
      }
      return c;
    }));
  };

  const handleDeleteCampaign = (campaignId: string) => {
    if (confirm('Tem certeza que deseja excluir esta campanha?')) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const statusConfig: Record<CampaignStatus, { color: string; label: string }> = {
      draft: { color: 'bg-gray-500', label: 'Rascunho' },
      active: { color: 'bg-green-500', label: 'Ativo' },
      paused: { color: 'bg-amber-500', label: 'Pausado' },
      scheduled: { color: 'bg-blue-500', label: 'Agendado' },
      completed: { color: 'bg-purple-500', label: 'Concluido' },
      archived: { color: 'bg-gray-400', label: 'Arquivado' },
    };
    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getAudienceIcon = (type: ClientType) => {
    switch (type) {
      case 'tenant': return <Home className="h-3 w-3" />;
      case 'landlord': return <Building2 className="h-3 w-3" />;
      case 'guarantor': return <Shield className="h-3 w-3" />;
      case 'insurer': return <Shield className="h-3 w-3" />;
      case 'realestate': return <Building2 className="h-3 w-3" />;
      case 'all': return <Users className="h-3 w-3" />;
    }
  };

  const getAudienceLabel = (type: ClientType) => {
    const labels: Record<ClientType, string> = {
      tenant: 'Inquilinos',
      landlord: 'Proprietarios',
      guarantor: 'Garantidores',
      insurer: 'Seguradoras',
      realestate: 'Imobiliarias',
      all: 'Todos',
    };
    return labels[type];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            Engine de Anuncios
          </h2>
          <p className="text-muted-foreground">
            Gerencie campanhas publicitarias e monetize sua plataforma
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Estatisticas */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                <p className="text-xs text-muted-foreground">Total Campanhas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">Campanhas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalViews / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MousePointer className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(stats.totalClicks / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Total Cliques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.totalRevenue / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCtr.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">CTR Medio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Parceiros
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="placements" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Posicoes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Campanhas */}
        <TabsContent value="campaigns" className="space-y-4">
          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as CampaignStatus | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="paused">Pausados</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="scheduled">Agendados</SelectItem>
                  <SelectItem value="completed">Concluidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Audiencia:</Label>
              <Select value={filterAudience} onValueChange={(v) => setFilterAudience(v as ClientType | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="tenant">Inquilinos</SelectItem>
                  <SelectItem value="landlord">Proprietarios</SelectItem>
                  <SelectItem value="guarantor">Garantidores</SelectItem>
                  <SelectItem value="insurer">Seguradoras</SelectItem>
                  <SelectItem value="realestate">Imobiliarias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Campanhas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map(campaign => (
              <Card key={campaign.id} className="overflow-hidden">
                {/* Preview da midia */}
                <div className="relative aspect-video bg-gray-100">
                  {campaign.media[0]?.type === 'image' ? (
                    <img
                      src={campaign.media[0].url}
                      alt={campaign.media[0].alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(campaign.status)}
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90">
                      Prioridade: {campaign.priority}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.partnerName}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(campaign.id)}
                      >
                        {campaign.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Audiencia */}
                  <div className="flex flex-wrap gap-1">
                    {campaign.targetAudience.map(type => (
                      <Badge key={type} variant="outline" className="text-xs flex items-center gap-1">
                        {getAudienceIcon(type)}
                        {getAudienceLabel(type)}
                      </Badge>
                    ))}
                  </div>

                  {/* Metricas */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-lg font-bold">{(campaign.metrics.views / 1000).toFixed(1)}K</p>
                      <p className="text-[10px] text-muted-foreground">Views</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-lg font-bold">{campaign.metrics.clicks}</p>
                      <p className="text-[10px] text-muted-foreground">Cliques</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <p className="text-lg font-bold">{campaign.metrics.ctr.toFixed(1)}%</p>
                      <p className="text-[10px] text-muted-foreground">CTR</p>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Gasto: R$ {campaign.billing.currentSpend.toLocaleString()}</span>
                      {campaign.billing.maxBudget && (
                        <span>Max: R$ {campaign.billing.maxBudget.toLocaleString()}</span>
                      )}
                    </div>
                    {campaign.billing.maxBudget && (
                      <Progress
                        value={(campaign.billing.currentSpend / campaign.billing.maxBudget) * 100}
                        className="h-2"
                      />
                    )}
                  </div>

                  {/* Periodo */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(campaign.startDate).toLocaleDateString('pt-BR')} -{' '}
                      {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Parceiros */}
        <TabsContent value="partners" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Parceiros anunciantes cadastrados na plataforma
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {partners.map(partner => (
              <Card key={partner.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <CardTitle className="text-base">{partner.name}</CardTitle>
                      <CardDescription>
                        {partner.activeCampaigns} campanha(s) ativa(s)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <p className="text-lg font-bold">R$ {(partner.totalSpend / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-muted-foreground">Total Gasto</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <p className="text-lg font-bold">{partner.activeCampaigns}</p>
                      <p className="text-xs text-muted-foreground">Campanhas</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      {partner.contactEmail}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Cliente desde {new Date(partner.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatorio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Tipo de Cliente</CardTitle>
              <CardDescription>
                Comparativo de engajamento por segmento de audiencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segmento</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(['tenant', 'landlord', 'guarantor', 'all'] as ClientType[]).map(type => {
                    const typeCampaigns = campaigns.filter(c =>
                      c.targetAudience.includes(type) || c.targetAudience.includes('all')
                    );
                    const views = typeCampaigns.reduce((sum, c) => sum + c.metrics.views, 0);
                    const clicks = typeCampaigns.reduce((sum, c) => sum + c.metrics.clicks, 0);
                    const revenue = typeCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
                    const ctr = views > 0 ? (clicks / views) * 100 : 0;

                    return (
                      <TableRow key={type}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAudienceIcon(type)}
                            {getAudienceLabel(type)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{clicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{ctr.toFixed(2)}%</TableCell>
                        <TableCell className="text-right">R$ {revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Campanhas por CTR</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...campaigns]
                    .sort((a, b) => b.metrics.ctr - a.metrics.ctr)
                    .slice(0, 5)
                    .map(campaign => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.partnerName}</TableCell>
                        <TableCell className="text-right">{campaign.metrics.views.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge className={campaign.metrics.ctr >= 5 ? 'bg-green-500' : 'bg-amber-500'}>
                            {campaign.metrics.ctr.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">R$ {campaign.metrics.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Posicoes */}
        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posicoes de Anuncios</CardTitle>
              <CardDescription>
                Configuracao dos espacos publicitarios disponiveis na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Sidebar */}
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      <CardTitle className="text-base">Sidebar</CardTitle>
                    </div>
                    <CardDescription>Lateral do dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Desktop:</span>
                        <span className="font-mono">300x250</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Mobile:</span>
                        <span className="font-mono">320x100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max. Anuncios:</span>
                        <span className="font-mono">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Header */}
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      <CardTitle className="text-base">Header Banner</CardTitle>
                    </div>
                    <CardDescription>Topo do dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Desktop:</span>
                        <span className="font-mono">970x90</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Mobile:</span>
                        <span className="font-mono">320x50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max. Anuncios:</span>
                        <span className="font-mono">3</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inline */}
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      <CardTitle className="text-base">Inline Content</CardTitle>
                    </div>
                    <CardDescription>Entre secoes do conteudo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Desktop:</span>
                        <span className="font-mono">728x90</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Mobile:</span>
                        <span className="font-mono">320x250</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max. Anuncios:</span>
                        <span className="font-mono">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Footer */}
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      <CardTitle className="text-base">Footer Banner</CardTitle>
                    </div>
                    <CardDescription>Rodape do dashboard</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Desktop:</span>
                        <span className="font-mono">970x90</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tamanho Mobile:</span>
                        <span className="font-mono">320x50</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max. Anuncios:</span>
                        <span className="font-mono">2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview de Anuncios</CardTitle>
              <CardDescription>
                Visualize como os anuncios aparecem para cada tipo de cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Inquilino
                  </Label>
                  <AdBanner placement="sidebar" clientType="tenant" className="border-2 border-dashed p-2" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Proprietario
                  </Label>
                  <AdBanner placement="sidebar" clientType="landlord" className="border-2 border-dashed p-2" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Garantidor
                  </Label>
                  <AdBanner placement="sidebar" clientType="guarantor" className="border-2 border-dashed p-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Nova Campanha */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Campanha</DialogTitle>
            <DialogDescription>
              Crie uma nova campanha publicitaria para seus parceiros
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome da Campanha</Label>
                <Input placeholder="Ex: Seguro Residencial 2024" />
              </div>
              <div className="space-y-2">
                <Label>Parceiro</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um parceiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map(partner => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea placeholder="Descreva a campanha..." />
            </div>

            <div className="space-y-2">
              <Label>Audiencia Alvo</Label>
              <div className="flex flex-wrap gap-2">
                {(['tenant', 'landlord', 'guarantor', 'insurer', 'realestate', 'all'] as ClientType[]).map(type => (
                  <Button key={type} variant="outline" size="sm" className="gap-2">
                    {getAudienceIcon(type)}
                    {getAudienceLabel(type)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data Inicio</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Midia</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Arraste imagens/videos ou clique para fazer upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: JPG, PNG, GIF, MP4 | Max: 10MB
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Modelo de Cobranca</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="CPM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpm">CPM (por mil views)</SelectItem>
                    <SelectItem value="cpc">CPC (por clique)</SelectItem>
                    <SelectItem value="cpa">CPA (por acao)</SelectItem>
                    <SelectItem value="flat">Valor Fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="5.00" />
              </div>
              <div className="space-y-2">
                <Label>Orcamento Max.</Label>
                <Input type="number" placeholder="10000" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>URL de Clique</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Intervalo Carrosel (seg)</Label>
                <Input type="number" defaultValue={5} min={3} max={30} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prioridade (1-10)</Label>
              <Input type="number" defaultValue={5} min={1} max={10} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Campanha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdCampaignManager;
