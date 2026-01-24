/**
 * Vinculo Brasil - Area do Cliente Locador
 *
 * Dashboard do locador com visao geral dos imoveis,
 * contratos, inquilinos e sistema de avaliacoes.
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import {
  Building2,
  Users,
  DollarSign,
  Star,
  MessageSquare,
  Home,
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Calendar,
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

interface Property {
  id: string;
  address: string;
  type: 'apartment' | 'house' | 'commercial';
  rentValue: number;
  status: 'rented' | 'available' | 'pending';
  tenantName?: string;
  contractEnd?: string;
}

interface Contract {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentValue: number;
  guaranteeType: 'vinculo' | 'fiador' | 'caucao';
  status: 'active' | 'ending_soon' | 'ended';
}

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  status: 'paid' | 'pending' | 'late';
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

function OverviewSection({ properties, contracts }: { properties: Property[]; contracts: Contract[] }) {
  const totalRentValue = properties.reduce((sum, p) => p.status === 'rented' ? sum + p.rentValue : sum, 0);
  const rentedCount = properties.filter((p) => p.status === 'rented').length;
  const availableCount = properties.filter((p) => p.status === 'available').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imoveis Cadastrados</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">
              {rentedCount} alugados, {availableCount} disponiveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquilinos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rentedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalRentValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Imoveis</CardTitle>
          <CardDescription>Imoveis cadastrados para locacao</CardDescription>
        </CardHeader>
        <CardContent>
          {properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Voce ainda nao tem imoveis cadastrados.</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                Cadastrar Imovel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{property.address}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Aluguel: {formatCurrency(property.rentValue)}</span>
                      {property.tenantName && <span>Inquilino: {property.tenantName}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        property.status === 'rented'
                          ? 'bg-blue-100 text-blue-700'
                          : property.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }
                    >
                      {property.status === 'rented'
                        ? 'Alugado'
                        : property.status === 'available'
                          ? 'Disponivel'
                          : 'Pendente'}
                    </Badge>
                    {property.contractEnd && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Contrato ate {formatDate(property.contractEnd)}
                      </p>
                    )}
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

function ContractsSection({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contratos de Locacao</CardTitle>
          <CardDescription>Todos os seus contratos ativos e historico</CardDescription>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum contrato encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{contract.propertyAddress}</p>
                      <p className="text-sm text-muted-foreground">Inquilino: {contract.tenantName}</p>
                    </div>
                    <Badge
                      className={
                        contract.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : contract.status === 'ending_soon'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {contract.status === 'active'
                        ? 'Ativo'
                        : contract.status === 'ending_soon'
                          ? 'Terminando'
                          : 'Encerrado'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inicio</p>
                      <p className="font-medium">{formatDate(contract.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Termino</p>
                      <p className="font-medium">{formatDate(contract.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aluguel</p>
                      <p className="font-medium">{formatCurrency(contract.rentValue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Garantia</p>
                      <div className="flex items-center gap-1">
                        {contract.guaranteeType === 'vinculo' && (
                          <Shield className="h-4 w-4 text-blue-600" />
                        )}
                        <p className="font-medium capitalize">{contract.guaranteeType}</p>
                      </div>
                    </div>
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

function PaymentHistorySection({ history }: { history: PaymentHistory[] }) {
  const totalReceived = history.filter((h) => h.status === 'paid').reduce((sum, h) => sum + h.amount, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historico de Pagamentos</CardTitle>
              <CardDescription>Alugueis recebidos dos inquilinos</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Recebido</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalReceived)}</p>
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
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'paid' ? 'bg-green-100' : item.status === 'late' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        item.status === 'paid' ? 'text-green-600' : item.status === 'late' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{item.propertyAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.tenantName} - {formatDate(item.date)}
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
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
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
                Deixe sua nota e um comentario sobre sua experiencia como locador
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
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
              Compartilhe sua experiencia como locador na plataforma
            </DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-blue-600" />
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
                    placeholder="Conte-nos mais sobre sua experiencia como locador..."
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
                  className="bg-blue-600 hover:bg-blue-700"
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

export function LandlordClientArea() {
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Fetch real data from API
  // useEffect(() => {
  //   fetchLandlordData().then(data => {
  //     setProperties(data.properties);
  //     setContracts(data.contracts);
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
    console.log('Avaliacao do locador salva:', newReview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <VinculoBrasilLogo size="sm" />
              <Separator orientation="vertical" className="h-6" />
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-xl font-semibold">Area do Locador</h1>
            </div>
            <Badge className="bg-blue-100 text-blue-700">Conta Ativa</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview">Visao Geral</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="review">Avaliacao</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {properties.length > 0 || contracts.length > 0 ? (
              <OverviewSection properties={properties} contracts={contracts} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum imóvel ou contrato encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contracts">
            {contracts.length > 0 ? (
              <ContractsSection contracts={contracts} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum contrato encontrado</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="payments">
            {paymentHistory.length > 0 ? (
              <PaymentHistorySection history={paymentHistory} />
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

export default LandlordClientArea;
