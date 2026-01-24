/**
 * Vinculo Brasil - Area do Cliente Inquilino
 *
 * Dashboard do inquilino com visao geral do contrato,
 * pagamentos e sistema de avaliacoes.
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import {
  Home,
  DollarSign,
  Star,
  MessageSquare,
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Calendar,
  CreditCard,
  AlertCircle,
  MapPin,
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
import { Progress } from '@/components/ui/progress';

// ============================================
// TYPES
// ============================================

interface RentalContract {
  id: string;
  propertyAddress: string;
  propertyType: 'apartment' | 'house' | 'commercial';
  landlordName: string;
  startDate: string;
  endDate: string;
  rentValue: number;
  guaranteeType: 'vinculo' | 'fiador' | 'caucao';
  status: 'active' | 'ending_soon' | 'ended';
  dueDay: number;
}

interface PaymentHistory {
  id: string;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  status: 'paid' | 'pending' | 'late';
  month: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ============================================
// PRODUCTION DATA (No Mocks)
// ============================================
// Data will be fetched from API - no fallback mock data

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function calculateContractProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  return Math.round(((now - start) / (end - start)) * 100);
}

function calculateMonthsRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
  return Math.max(0, months);
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

function OverviewSection({ contract, nextPayment }: { contract: RentalContract; nextPayment: PaymentHistory | null }) {
  const progress = calculateContractProgress(contract.startDate, contract.endDate);
  const monthsRemaining = calculateMonthsRemaining(contract.endDate);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aluguel Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(contract.rentValue)}</div>
            <p className="text-xs text-muted-foreground">Vencimento dia {contract.dueDay}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contrato</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthsRemaining} meses</div>
            <p className="text-xs text-muted-foreground">Restantes ate {formatDate(contract.endDate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Garantia</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-700 capitalize">{contract.guaranteeType}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Protecao garantida</p>
          </CardContent>
        </Card>
      </div>

      {nextPayment && nextPayment.status === 'pending' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Proximo pagamento:</strong> {formatCurrency(nextPayment.amount)} ate {formatDate(nextPayment.dueDate)}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Meu Imovel
          </CardTitle>
          <CardDescription>Detalhes do seu contrato de locacao</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-lg">{contract.propertyAddress}</p>
              <p className="text-sm text-muted-foreground">Locador: {contract.landlordName}</p>
              <Badge className="mt-2 bg-green-100 text-green-700">
                Contrato Ativo
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progresso do contrato</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatDate(contract.startDate)}</span>
              <span>{formatDate(contract.endDate)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Tipo</p>
              <p className="font-medium capitalize">
                {contract.propertyType === 'apartment' ? 'Apartamento' : contract.propertyType === 'house' ? 'Casa' : 'Comercial'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inicio</p>
              <p className="font-medium">{formatDate(contract.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Termino</p>
              <p className="font-medium">{formatDate(contract.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vencimento</p>
              <p className="font-medium">Dia {contract.dueDay}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentHistorySection({ history, rentValue }: { history: PaymentHistory[]; rentValue: number }) {
  const paidPayments = history.filter((h) => h.status === 'paid');
  const totalPaid = paidPayments.reduce((sum, h) => sum + h.amount, 0);
  const pendingPayment = history.find((h) => h.status === 'pending');

  return (
    <div className="space-y-6">
      {pendingPayment && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">Pagamento Pendente</CardTitle>
            <CardDescription className="text-purple-700">
              {pendingPayment.month} - Vencimento: {formatDate(pendingPayment.dueDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-900">{formatCurrency(pendingPayment.amount)}</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historico de Pagamentos</CardTitle>
              <CardDescription>Seus pagamentos de aluguel</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Pago</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pagamento registrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    item.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'paid' ? 'bg-green-100' : item.status === 'late' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {item.status === 'paid' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : item.status === 'late' ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.month}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {formatDate(item.dueDate)}
                        {item.paymentDate && ` | Pago: ${formatDate(item.paymentDate)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      item.status === 'paid' ? 'text-green-600' : item.status === 'late' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {formatCurrency(item.amount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        item.status === 'paid'
                          ? 'border-green-200 text-green-700'
                          : item.status === 'late'
                            ? 'border-red-200 text-red-700'
                            : 'border-yellow-200 text-yellow-700'
                      }
                    >
                      {item.status === 'paid' ? 'Pago' : item.status === 'late' ? 'Atrasado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
            Avaliacao da Plataforma
          </CardTitle>
          <CardDescription>
            Sua opiniao e muito importante para melhorarmos nossos servicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingReview ? (
            <div className="space-y-4">
              <Alert className="bg-purple-50 border-purple-200">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  Voce ja deixou uma avaliacao. Obrigado pelo feedback!
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <StarRating rating={existingReview.rating} readonly size="md" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(existingReview.createdAt)}
                  </span>
                </div>
                {existingReview.comment && (
                  <p className="text-gray-700">{existingReview.comment}</p>
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
                Editar Avaliacao
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <p className="text-lg font-medium mb-2">Como voce avalia o Vinculo Brasil?</p>
              <p className="text-muted-foreground mb-6">
                Deixe sua nota e um comentario sobre sua experiencia como inquilino
              </p>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsModalOpen(true)}
              >
                <Star className="mr-2 h-4 w-4" />
                Deixar Avaliacao
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {existingReview ? 'Editar Avaliacao' : 'Avaliar Vinculo Brasil'}
            </DialogTitle>
            <DialogDescription>
              Compartilhe sua experiencia como inquilino na plataforma
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <p className="text-lg font-medium">Avaliacao enviada com sucesso!</p>
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
                  <Label htmlFor="comment">Comentario (opcional)</Label>
                  <Textarea
                    id="comment"
                    placeholder="Conte-nos mais sobre sua experiencia como inquilino..."
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
                  className="bg-purple-600 hover:bg-purple-700"
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
                      Enviar Avaliacao
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

export function TenantClientArea() {
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [contract, setContract] = useState<RentalContract | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Fetch real data from API
  // useEffect(() => {
  //   fetchContractData().then(data => {
  //     setContract(data.contract);
  //     setPaymentHistory(data.payments);
  //     setIsLoading(false);
  //   });
  // }, []);

  const handleSubmitReview = (rating: number, comment: string) => {
    const newReview: Review = {
      id: `review_${Date.now()}`,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    setUserReview(newReview);
    console.log('Avaliacao do inquilino salva:', newReview);
  };

  const nextPayment = paymentHistory.find((p) => p.status === 'pending') || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <VinculoBrasilLogo size="sm" />
              <Separator orientation="vertical" className="h-6" />
              <Link to="/inquilinos">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">Area do Inquilino</h1>
            </div>
            <Badge className="bg-purple-100 text-purple-700">Conta Ativa</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Visao Geral</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="review">Avaliacao</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {contract ? (
              <OverviewSection contract={contract} nextPayment={nextPayment} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum contrato encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            {contract && paymentHistory.length > 0 ? (
              <PaymentHistorySection history={paymentHistory} rentValue={contract.rentValue} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum histórico de pagamento encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review">
            <ReviewSection existingReview={userReview} onSubmitReview={handleSubmitReview} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default TenantClientArea;
