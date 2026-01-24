/**
 * Vinculo Brasil - Area do Cliente Garantidor
 *
 * Dashboard do garantidor com visão geral dos contratos,
 * rendimentos (os 5%) e sistema de avaliações.
 * CONECTADO COM API REAL
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { NoGuarantorContractsEmpty } from '@/components/ui/empty-state';
import { useGuarantorDashboard, useGuarantorEarnings } from '@/hooks/use-api';
import {
  Building2,
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  Home,
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  Wallet,
  PieChart,
  AlertTriangle,
  Shield,
  Calendar,
  Phone,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ============================================
// TYPES
// ============================================

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

// ============================================
// COMPONENTS
// ============================================

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function StarRating({ rating, onRatingChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          onClick={() => onRatingChange?.(star)}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface ReviewSectionProps {
  existingReview: Review | null;
  onSubmitReview: (rating: number, comment: string) => void;
}

function ReviewSection({ existingReview, onSubmitReview }: ReviewSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSubmitReview(rating, comment);
    setIsSubmitting(false);
    setSubmitSuccess(true);

    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Avaliação da Plataforma
          </CardTitle>
          <CardDescription>
            Sua opinião é muito importante para melhorarmos nossos serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingReview ? (
            <div className="space-y-4">
              <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                  Você já deixou uma avaliação. Obrigado pelo feedback!
                </AlertDescription>
              </Alert>

              <div className="p-4 border dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <StarRating rating={existingReview.rating} readonly size="md" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(existingReview.createdAt)}
                  </span>
                </div>
                {existingReview.comment && (
                  <p className="text-gray-700 dark:text-gray-300">{existingReview.comment}</p>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setRating(existingReview.rating);
                  setComment(existingReview.comment);
                  setIsModalOpen(true);
                }}
              >
                Editar Avaliação
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <p className="text-lg font-medium mb-2">Como você avalia o Vínculo Brasil?</p>
              <p className="text-muted-foreground mb-6">
                Deixe sua nota e um comentário sobre sua experiência
              </p>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsModalOpen(true)}
              >
                <Star className="mr-2 h-4 w-4" />
                Deixar Avaliação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {existingReview ? 'Editar Avaliação' : 'Avaliar Vínculo Brasil'}
            </DialogTitle>
            <DialogDescription>
              Compartilhe sua experiência como garantidor na plataforma
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-600" />
              <p className="text-lg font-medium">Avaliação enviada com sucesso!</p>
              <p className="text-muted-foreground">Obrigado pelo seu feedback</p>
            </div>
          ) : (
            <>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Sua Nota</Label>
                  <div className="flex justify-center py-2">
                    <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      {rating === 1 && 'Muito insatisfeito'}
                      {rating === 2 && 'Insatisfeito'}
                      {rating === 3 && 'Regular'}
                      {rating === 4 && 'Satisfeito'}
                      {rating === 5 && 'Muito satisfeito'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comentário (opcional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Conte-nos mais sobre sua experiência..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GuarantorClientArea() {
  const { data, isLoading, error } = useGuarantorDashboard();
  const { data: earningsData } = useGuarantorEarnings();
  const [userReview, setUserReview] = useState<Review | null>(null);

  const handleSubmitReview = (rating: number, comment: string) => {
    const newReview: Review = {
      id: `review_${Date.now()}`,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    setUserReview(newReview);
    toast.success('Avaliação enviada com sucesso!');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <VinculoBrasilLogo size="sm" />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold dark:text-white">Área do Garantidor</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <VinculoBrasilLogo size="sm" />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold dark:text-white">Área do Garantidor</h1>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-700 dark:text-white">Erro ao carregar dados</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {error instanceof Error ? error.message : 'Tente novamente mais tarde'}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Empty State
  if (!data?.contracts || data.contracts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <VinculoBrasilLogo size="sm" />
                <Separator orientation="vertical" className="h-6" />
                <Link to="/garantidores">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </Link>
                <h1 className="text-xl font-semibold dark:text-white">Área do Garantidor</h1>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Conta Ativa</Badge>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <NoGuarantorContractsEmpty />
        </main>
      </div>
    );
  }

  const { guarantor, contracts, stats, earnings } = data;
  const earningsHistory = earningsData?.history || earnings || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <VinculoBrasilLogo size="sm" />
              <Separator orientation="vertical" className="h-6" />
              <Link to="/garantidores">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold dark:text-white">Olá, {guarantor.name.split(' ')[0]}!</h1>
                <p className="text-sm text-muted-foreground">Área do Garantidor</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Shield className="h-3 w-3 mr-1" />
              Conta Ativa
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="earnings">Comissões</TabsTrigger>
            <TabsTrigger value="review">Avaliação</TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* ABA: VISÃO GERAL */}
          {/* ============================================ */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeContracts}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-100">Total Ganho (5%)</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-100" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {formatCurrency(stats.pendingEarnings)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Exposição de Risco</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stats.defaultedContracts > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {stats.defaultedContracts > 0 ? `${stats.defaultedContracts} inadimplente(s)` : 'Nenhum'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Contratos Garantidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Contratos Garantidos</CardTitle>
                  <CardDescription>Contratos onde você é o garantidor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contracts.map((contract) => (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg ${
                            contract.paymentStatus === 'ON_TIME' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                            contract.paymentStatus === 'LATE' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            <Home className={`h-6 w-6 ${
                              contract.paymentStatus === 'ON_TIME' ? 'text-emerald-600 dark:text-emerald-400' :
                              contract.paymentStatus === 'LATE' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                            }`} />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium dark:text-white">{contract.property.title}</p>
                            <p className="text-sm text-muted-foreground">{contract.property.address}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Inquilino: {contract.tenant.name}</span>
                              <span>•</span>
                              <span>Aluguel: {formatCurrency(contract.rentAmount)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge
                            className={
                              contract.paymentStatus === 'ON_TIME'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : contract.paymentStatus === 'LATE'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {contract.paymentStatus === 'ON_TIME' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {contract.paymentStatus === 'LATE' && <Clock className="h-3 w-3 mr-1" />}
                            {contract.paymentStatus === 'DEFAULTED' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {contract.paymentStatus === 'ON_TIME'
                              ? 'Em dia'
                              : contract.paymentStatus === 'LATE'
                                ? `${contract.daysOverdue} dias atrasado`
                                : 'Inadimplente'}
                          </Badge>
                          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(contract.guarantorFee)}/mês
                          </p>
                          <p className="text-xs text-muted-foreground">Sua comissão (5%)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerta de Inadimplência */}
              {contracts.some(c => c.paymentStatus === 'LATE' || c.paymentStatus === 'DEFAULTED') && (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Atenção:</strong> Existem contratos com pagamento atrasado.
                    Como garantidor, você pode ser acionado para cobrir o valor em caso de inadimplência prolongada.
                    <Button size="sm" variant="outline" className="ml-4 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700">
                      <Phone className="h-3 w-3 mr-1" />
                      Falar com Suporte
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* ABA: COMISSÕES (OS 5%) */}
          {/* ============================================ */}
          <TabsContent value="earnings">
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-100">Total Recebido</p>
                        <p className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                      </div>
                      <div className="p-3 bg-white/20 rounded-lg">
                        <Wallet className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Próximo Recebimento</p>
                        <p className="text-3xl font-bold text-amber-600">
                          {formatCurrency(stats.pendingEarnings)}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa Garantidor</p>
                        <p className="text-3xl font-bold">5%</p>
                        <p className="text-xs text-muted-foreground">do valor do aluguel</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <PieChart className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Recebimentos */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        Histórico de Comissões
                      </CardTitle>
                      <CardDescription>Todos os pagamentos recebidos como garantidor</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {earningsHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma comissão recebida ainda.</p>
                      <p className="text-sm">Quando os inquilinos pagarem, sua comissão aparecerá aqui.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {earningsHistory.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                            }`}>
                              {item.status === 'PAID' ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium dark:text-white">Comissão - {item.month}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.status === 'PAID' ? 'Recebido' : 'Pendente'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${
                              item.status === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {item.status === 'PAID' ? '+' : ''}{formatCurrency(item.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Explicação do Modelo */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                        Como funciona sua comissão de 5%?
                      </h3>
                      <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        <li>
                          ✅ <strong>Todo mês:</strong> Quando o inquilino paga, 5% do aluguel vai para você
                        </li>
                        <li>
                          ✅ <strong>Automático:</strong> O dinheiro cai na sua conta junto com o repasse
                        </li>
                        <li>
                          ✅ <strong>Garantia:</strong> Em caso de inadimplência, você é acionado para cobrir
                        </li>
                        <li>
                          ✅ <strong>Transparência:</strong> Acompanhe tudo aqui em tempo real
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* ABA: AVALIAÇÃO */}
          {/* ============================================ */}
          <TabsContent value="review">
            <ReviewSection existingReview={userReview} onSubmitReview={handleSubmitReview} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default GuarantorClientArea;
