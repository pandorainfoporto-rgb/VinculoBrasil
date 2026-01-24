// ============================================
// ROTA /admin/marketplace - ERP de Gestao do Marketplace
// Parceiros, Produtos/Servicos, Aprovacoes
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Package,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Plus,
  Eye,
  MessageSquare,
  Percent,
  CreditCard,
  Wallet,
  Bitcoin,
  Search,
  Filter,
  Building2,
  RefreshCw,
  Send,
  DollarSign,
  Tag,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Gift,
  Flame,
  ArrowRightLeft,
  Coins,
  Calendar,
  Hash,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  useMarketplaceItems,
  usePendingItems,
  useCreateMarketplaceItem,
  useApproveItem,
  useUpdatePaymentFlags,
  useDeleteMarketplaceItem,
  useMarketplaceStats,
  type Partner,
  type MarketplaceItem,
  type MarketplaceItemStatus,
  type CreatePartnerInput,
  type CreateMarketplaceItemInput,
} from "@/hooks/use-marketplace";
import {
  useVoucherCampaigns,
  useCreateVoucherCampaign,
  useUpdateVoucherCampaign,
  useDeleteVoucherCampaign,
  useGenerateVoucherCodes,
  useVoucherStats,
  type VoucherCampaign,
  type CreateCampaignInput,
  type VoucherSettlementType,
} from "@/hooks/use-vouchers";

export const Route = createFileRoute("/admin/marketplace")({
  component: AdminMarketplacePage,
});

// Categorias disponiveis
const CATEGORIES = [
  "Seguros",
  "Mudanca",
  "Decoracao",
  "Limpeza",
  "Manutencao",
  "Internet",
  "Eletrodomesticos",
  "Moveis",
  "Servicos Gerais",
];

function AdminMarketplacePage() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [searchTerm, setSearchTerm] = useState("");

  // Partner Dialog State
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Item Dialog State
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketplaceItem | null>(null);

  // Review Dialog State
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<MarketplaceItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"reject" | "request_changes">("reject");
  const [reviewFeedback, setReviewFeedback] = useState("");

  // API Hooks
  const { data: stats, isLoading: statsLoading } = useMarketplaceStats();
  const { data: partners = [], isLoading: partnersLoading, refetch: refetchPartners } = usePartners({ search: searchTerm || undefined });
  const { data: pendingItems = [], isLoading: pendingLoading, refetch: refetchPending } = usePendingItems();
  const { data: allItems = [], isLoading: itemsLoading, refetch: refetchItems } = useMarketplaceItems({ status: "APPROVED" });

  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const deletePartnerMutation = useDeletePartner();
  const createItemMutation = useCreateMarketplaceItem();
  const approveItemMutation = useApproveItem();
  const updatePaymentFlagsMutation = useUpdatePaymentFlags();
  const deleteItemMutation = useDeleteMarketplaceItem();

  // Helper Functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const getStatusBadge = (status: MarketplaceItemStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
            <Clock className="h-3 w-3 mr-1" /> Pendente
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovado
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
            <XCircle className="h-3 w-3 mr-1" /> Rejeitado
          </Badge>
        );
      case "CHANGES_REQUESTED":
        return (
          <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
            <MessageSquare className="h-3 w-3 mr-1" /> Alteracoes
          </Badge>
        );
    }
  };

  // Handlers
  const handleApprove = async (item: MarketplaceItem) => {
    try {
      await approveItemMutation.mutateAsync({
        id: item.id,
        action: { action: "approve" },
      });
    } catch (error) {
      console.error("Erro ao aprovar item:", error);
    }
  };

  const handleOpenReview = (item: MarketplaceItem, action: "reject" | "request_changes") => {
    setReviewingItem(item);
    setReviewAction(action);
    setReviewFeedback("");
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewingItem) return;
    try {
      await approveItemMutation.mutateAsync({
        id: reviewingItem.id,
        action: {
          action: reviewAction === "reject" ? "reject" : "request_changes",
          feedback: reviewFeedback,
        },
      });
      setReviewDialogOpen(false);
      setReviewingItem(null);
      setReviewFeedback("");
    } catch (error) {
      console.error("Erro ao enviar review:", error);
    }
  };

  const handleTogglePaymentFlag = async (
    item: MarketplaceItem,
    flag: "acceptsVbrz" | "acceptsCrypto" | "acceptsPix" | "acceptsCard"
  ) => {
    try {
      await updatePaymentFlagsMutation.mutateAsync({
        id: item.id,
        flags: { [flag]: !item[flag] },
      });
    } catch (error) {
      console.error("Erro ao atualizar flag de pagamento:", error);
    }
  };

  const handleRefreshAll = () => {
    refetchPartners();
    refetchPending();
    refetchItems();
  };

  // Filtered items for search
  const filteredPendingItems = pendingItems.filter(
    (item) =>
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredApprovedItems = allItems.filter(
    (item) =>
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout userName="Administrador">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                  Gestao do Marketplace
                </h1>
                <p className="text-muted-foreground mt-2">
                  ERP para gerenciar parceiros, produtos e aprovacoes do marketplace Vinculo Brasil.
                </p>
              </div>
            </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefreshAll} disabled={partnersLoading || pendingLoading || itemsLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${(partnersLoading || pendingLoading || itemsLoading) ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes de Aprovacao</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statsLoading ? "-" : stats?.items.pending ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Itens Aprovados</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statsLoading ? "-" : stats?.items.approved ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Parceiros Ativos</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statsLoading ? "-" : stats?.partners.active ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Itens</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {statsLoading ? "-" : stats?.items.total ?? 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="approvals" className="gap-2">
              <Clock className="w-4 h-4" />
              Aprovacoes ({stats?.items.pending ?? 0})
            </TabsTrigger>
            <TabsTrigger value="partners" className="gap-2">
              <Users className="w-4 h-4" />
              Parceiros
            </TabsTrigger>
            <TabsTrigger value="catalog" className="gap-2">
              <Package className="w-4 h-4" />
              Catalogo
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="gap-2">
              <Gift className="w-4 h-4" />
              Vouchers VBRz
            </TabsTrigger>
          </TabsList>

          {/* Busca */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, parceiro ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* ============================================ */}
          {/* TAB: APROVACOES */}
          {/* ============================================ */}
          <TabsContent value="approvals">
            <div className="space-y-4">
              {pendingLoading ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                    <p className="mt-2 text-muted-foreground">Carregando itens pendentes...</p>
                  </CardContent>
                </Card>
              ) : filteredPendingItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-400 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum item pendente!</h3>
                    <p className="text-muted-foreground">Todos os itens foram revisados.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredPendingItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Image placeholder */}
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                          {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {item.partner?.name} • {item.category}
                              </p>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>

                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {item.description || "Sem descricao"}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{formatCurrency(Number(item.basePrice))}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Percent className="h-4 w-4 text-purple-600" />
                              <span>
                                Comissao: {item.negotiatedCommission ?? item.partner?.defaultCommissionRate ?? 10}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="h-4 w-4 text-blue-600" />
                              <span>Desconto Vinculo: {item.vinculoClientDiscount}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.acceptsPix && <span title="PIX"><Wallet className="h-4 w-4 text-green-600" /></span>}
                              {item.acceptsCard && <span title="Cartao"><CreditCard className="h-4 w-4 text-blue-600" /></span>}
                              {item.acceptsCrypto && <span title="Crypto"><Bitcoin className="h-4 w-4 text-orange-600" /></span>}
                              {item.acceptsVbrz && <span title="VBRZ"><DollarSign className="h-4 w-4 text-purple-600" /></span>}
                            </div>
                          </div>

                          {item.adminFeedback && (
                            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                              <strong>Feedback anterior:</strong> {item.adminFeedback}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(item)}
                            disabled={approveItemMutation.isPending}
                          >
                            {approveItemMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                            )}
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReview(item, "request_changes")}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Solicitar Alteracoes
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOpenReview(item, "reject")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: PARCEIROS */}
          {/* ============================================ */}
          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Parceiros do Marketplace</CardTitle>
                    <CardDescription>
                      Empresas que vendem produtos e servicos na plataforma
                    </CardDescription>
                  </div>
                  <Button onClick={() => { setEditingPartner(null); setPartnerDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Parceiro
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {partnersLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                    <p className="mt-2 text-muted-foreground">Carregando parceiros...</p>
                  </div>
                ) : partners.length === 0 ? (
                  <div className="py-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum parceiro cadastrado</h3>
                    <p className="text-muted-foreground">Clique em "Cadastrar Parceiro" para adicionar o primeiro.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Empresa</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Comissao Padrao</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell>
                            <div className="font-medium">{partner.tradeName || partner.name}</div>
                            <div className="text-sm text-muted-foreground">{partner.name}</div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{partner.cnpj}</TableCell>
                          <TableCell>
                            <div className="text-sm">{partner.email}</div>
                            <div className="text-sm text-muted-foreground">{partner.phone}</div>
                          </TableCell>
                          <TableCell>{partner._count?.items ?? 0}</TableCell>
                          <TableCell>{(partner.defaultCommissionRate * 100).toFixed(0)}%</TableCell>
                          <TableCell>
                            <Badge variant={partner.isActive ? "default" : "secondary"}>
                              {partner.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingPartner(partner); setPartnerDialogOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm(`Deseja excluir o parceiro "${partner.name}"?`)) {
                                    deletePartnerMutation.mutate(partner.id);
                                  }
                                }}
                                disabled={deletePartnerMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: CATALOGO */}
          {/* ============================================ */}
          <TabsContent value="catalog">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Catalogo de Produtos e Servicos</CardTitle>
                    <CardDescription>
                      Itens aprovados e disponiveis no marketplace. Edite flags de pagamento aqui.
                    </CardDescription>
                  </div>
                  <Button onClick={() => { setEditingItem(null); setItemDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {itemsLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                    <p className="mt-2 text-muted-foreground">Carregando catalogo...</p>
                  </div>
                ) : filteredApprovedItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">Nenhum item no catalogo</h3>
                    <p className="text-muted-foreground">Aprove itens pendentes ou adicione novos.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Parceiro</TableHead>
                        <TableHead>Preco</TableHead>
                        <TableHead>Comissao</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Pagamentos</TableHead>
                        <TableHead>Acoes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovedItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.category}</div>
                          </TableCell>
                          <TableCell>{item.partner?.name}</TableCell>
                          <TableCell>{formatCurrency(Number(item.basePrice))}</TableCell>
                          <TableCell>
                            {item.negotiatedCommission
                              ? `${(item.negotiatedCommission * 100).toFixed(0)}%`
                              : `${((item.partner?.defaultCommissionRate ?? 0.1) * 100).toFixed(0)}%`}
                          </TableCell>
                          <TableCell>{item.vinculoClientDiscount}%</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant={item.acceptsPix ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleTogglePaymentFlag(item, "acceptsPix")}
                                disabled={updatePaymentFlagsMutation.isPending}
                              >
                                <Wallet className="h-3 w-3" />
                              </Button>
                              <Button
                                variant={item.acceptsCard ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleTogglePaymentFlag(item, "acceptsCard")}
                                disabled={updatePaymentFlagsMutation.isPending}
                              >
                                <CreditCard className="h-3 w-3" />
                              </Button>
                              <Button
                                variant={item.acceptsCrypto ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleTogglePaymentFlag(item, "acceptsCrypto")}
                                disabled={updatePaymentFlagsMutation.isPending}
                              >
                                <Bitcoin className="h-3 w-3" />
                              </Button>
                              <Button
                                variant={item.acceptsVbrz ? "default" : "outline"}
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => handleTogglePaymentFlag(item, "acceptsVbrz")}
                                disabled={updatePaymentFlagsMutation.isPending}
                              >
                                <DollarSign className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm(`Deseja excluir o item "${item.title}"?`)) {
                                    deleteItemMutation.mutate(item.id);
                                  }
                                }}
                                disabled={deleteItemMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: VOUCHERS VBRz */}
          {/* ============================================ */}
          <TabsContent value="vouchers">
            <VoucherCampaignsTab partners={partners} />
          </TabsContent>
        </Tabs>

        {/* ============================================ */}
        {/* DIALOG: REVIEW (REJEITAR/SOLICITAR ALTERACOES) */}
        {/* ============================================ */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "reject" ? "Rejeitar Item" : "Solicitar Alteracoes"}
              </DialogTitle>
              <DialogDescription>
                Informe o motivo para o parceiro ajustar o cadastro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Item</Label>
                <p className="font-medium">{reviewingItem?.title}</p>
                <p className="text-sm text-muted-foreground">{reviewingItem?.partner?.name}</p>
              </div>
              <div className="space-y-2">
                <Label>Observacoes {reviewAction === "request_changes" && <span className="text-red-500">*</span>}</Label>
                <Textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Descreva o que precisa ser alterado ou o motivo da rejeicao..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant={reviewAction === "reject" ? "destructive" : "default"}
                onClick={handleSubmitReview}
                disabled={approveItemMutation.isPending || (reviewAction === "request_changes" && !reviewFeedback)}
              >
                {approveItemMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============================================ */}
        {/* DIALOG: CADASTRO/EDICAO DE PARCEIRO */}
        {/* ============================================ */}
        <PartnerDialog
          open={partnerDialogOpen}
          onOpenChange={setPartnerDialogOpen}
          partner={editingPartner}
          onSave={async (data) => {
            try {
              if (editingPartner) {
                await updatePartnerMutation.mutateAsync({ id: editingPartner.id, data });
              } else {
                await createPartnerMutation.mutateAsync(data as CreatePartnerInput);
              }
              setPartnerDialogOpen(false);
              setEditingPartner(null);
            } catch (error) {
              console.error("Erro ao salvar parceiro:", error);
            }
          }}
          isLoading={createPartnerMutation.isPending || updatePartnerMutation.isPending}
        />

        {/* ============================================ */}
        {/* DIALOG: CADASTRO DE ITEM */}
        {/* ============================================ */}
        <ItemDialog
          open={itemDialogOpen}
          onOpenChange={setItemDialogOpen}
          partners={partners}
          onSave={async (data) => {
            try {
              await createItemMutation.mutateAsync(data);
              setItemDialogOpen(false);
            } catch (error) {
              console.error("Erro ao criar item:", error);
            }
          }}
          isLoading={createItemMutation.isPending}
        />
        </div>
      </div>
    </AdminLayout>
  );
}

// ============================================
// DIALOG COMPONENT: PARTNER
// ============================================
interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onSave: (data: Partial<CreatePartnerInput>) => Promise<void>;
  isLoading: boolean;
}

function PartnerDialog({ open, onOpenChange, partner, onSave, isLoading }: PartnerDialogProps) {
  const isEdit = !!partner;
  const [formData, setFormData] = useState<Partial<CreatePartnerInput>>({
    name: "",
    tradeName: "",
    cnpj: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    defaultCommissionRate: 0.10,
    isActive: true,
  });

  // Reset form when dialog opens/closes or partner changes
  useState(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        tradeName: partner.tradeName || "",
        cnpj: partner.cnpj,
        email: partner.email,
        phone: partner.phone || "",
        website: partner.website || "",
        description: partner.description || "",
        defaultCommissionRate: partner.defaultCommissionRate,
        isActive: partner.isActive,
      });
    } else {
      setFormData({
        name: "",
        tradeName: "",
        cnpj: "",
        email: "",
        phone: "",
        website: "",
        description: "",
        defaultCommissionRate: 0.10,
        isActive: true,
      });
    }
  });

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return value;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.cnpj || !formData.email) {
      alert("Preencha os campos obrigatorios: Nome, CNPJ e Email");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Parceiro" : "Novo Parceiro"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Atualize as informacoes do parceiro" : "Cadastre um novo parceiro no marketplace"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input
                  placeholder="Razao Social"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  placeholder="Nome Fantasia"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                maxLength={18}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://www.empresa.com.br"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                placeholder="Breve descricao do parceiro e seus servicos..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Comissao Padrao (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="10"
                  value={(formData.defaultCommissionRate ?? 0.10) * 100}
                  onChange={(e) => setFormData({ ...formData, defaultCommissionRate: Number(e.target.value) / 100 })}
                />
                <p className="text-xs text-muted-foreground">Nossa comissao sobre vendas deste parceiro</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <span className="text-sm">{formData.isActive ? "Ativo" : "Inativo"}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Salvar Alteracoes" : "Cadastrar Parceiro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DIALOG COMPONENT: ITEM
// ============================================
interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partners: Partner[];
  onSave: (data: CreateMarketplaceItemInput) => Promise<void>;
  isLoading: boolean;
}

function ItemDialog({ open, onOpenChange, partners, onSave, isLoading }: ItemDialogProps) {
  const [formData, setFormData] = useState<Partial<CreateMarketplaceItemInput>>({
    partnerId: "",
    title: "",
    description: "",
    category: "",
    basePrice: 0,
    images: [],
    negotiatedCommission: undefined,
    acceptsVbrz: false,
    acceptsCrypto: false,
    acceptsPix: true,
    acceptsCard: true,
    vinculoClientDiscount: 0,
    featured: false,
  });

  const handleSubmit = () => {
    if (!formData.partnerId || !formData.title || !formData.category || !formData.basePrice) {
      alert("Preencha os campos obrigatorios: Parceiro, Titulo, Categoria e Preco");
      return;
    }
    onSave(formData as CreateMarketplaceItemInput);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Item no Marketplace</DialogTitle>
          <DialogDescription>
            Cadastre um novo produto ou servico. O item sera criado como "Pendente" para aprovacao.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Parceiro *</Label>
              <Select
                value={formData.partnerId}
                onValueChange={(value) => setFormData({ ...formData, partnerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {partners.filter(p => p.isActive).map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.tradeName || partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Titulo *</Label>
              <Input
                placeholder="Nome do produto ou servico"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                placeholder="Descricao detalhada do produto ou servico..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preco Base (R$) *</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Desconto Vinculo (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="0"
                  value={formData.vinculoClientDiscount}
                  onChange={(e) => setFormData({ ...formData, vinculoClientDiscount: Number(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Formas de Pagamento Aceitas</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.acceptsPix}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsPix: checked })}
                  />
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm">PIX</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.acceptsCard}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsCard: checked })}
                  />
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Cartao</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.acceptsCrypto}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsCrypto: checked })}
                  />
                  <Bitcoin className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">Crypto</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.acceptsVbrz}
                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsVbrz: checked })}
                  />
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">VBRZ</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// VOUCHER CAMPAIGNS TAB COMPONENT
// ============================================
interface VoucherCampaignsTabProps {
  partners: Partner[];
}

function VoucherCampaignsTab({ partners }: VoucherCampaignsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<VoucherCampaign | null>(null);
  const [generateCodesDialogOpen, setGenerateCodesDialogOpen] = useState(false);
  const [selectedCampaignForCodes, setSelectedCampaignForCodes] = useState<VoucherCampaign | null>(null);
  const [codesQuantity, setCodesQuantity] = useState(10);
  const [codesPrefix, setCodesPrefix] = useState("VBRZ");

  // API Hooks
  const { data: campaigns = [], isLoading, refetch } = useVoucherCampaigns();
  const { data: voucherStats } = useVoucherStats();
  const createCampaignMutation = useCreateVoucherCampaign();
  const updateCampaignMutation = useUpdateVoucherCampaign();
  const deleteCampaignMutation = useDeleteVoucherCampaign();
  const generateCodesMutation = useGenerateVoucherCodes();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (campaign: VoucherCampaign) => {
    setEditingCampaign(campaign);
    setDialogOpen(true);
  };

  const handleDelete = async (campaign: VoucherCampaign) => {
    if (!confirm(`Deseja excluir a campanha "${campaign.title}"?`)) return;
    try {
      await deleteCampaignMutation.mutateAsync(campaign.id);
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      alert("Erro ao excluir. Campanhas com resgates não podem ser excluídas.");
    }
  };

  const handleSave = async (data: Partial<CreateCampaignInput>) => {
    try {
      if (editingCampaign) {
        await updateCampaignMutation.mutateAsync({ id: editingCampaign.id, data });
      } else {
        await createCampaignMutation.mutateAsync(data as CreateCampaignInput);
      }
      setDialogOpen(false);
      setEditingCampaign(null);
    } catch (error) {
      console.error("Erro ao salvar campanha:", error);
    }
  };

  const handleOpenGenerateCodes = (campaign: VoucherCampaign) => {
    setSelectedCampaignForCodes(campaign);
    setCodesQuantity(10);
    setCodesPrefix("VBRZ");
    setGenerateCodesDialogOpen(true);
  };

  const handleGenerateCodes = async () => {
    if (!selectedCampaignForCodes) return;
    try {
      const result = await generateCodesMutation.mutateAsync({
        campaignId: selectedCampaignForCodes.id,
        quantity: codesQuantity,
        prefix: codesPrefix,
      });
      alert(`${result.data.generated} códigos gerados com sucesso!`);
      setGenerateCodesDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Erro ao gerar códigos:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {voucherStats?.campaigns.active ?? 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Resgates</p>
                <p className="text-2xl font-bold text-blue-600">
                  {voucherStats?.redemptions.confirmed ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VBRz Queimado</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Number(voucherStats?.tokenomics.totalBurnedVbrz ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">VBRz Transferido</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Number(voucherStats?.tokenomics.totalTransferredVbrz ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <ArrowRightLeft className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Campanhas de Voucher
              </CardTitle>
              <CardDescription>
                Gerencie campanhas de resgate com tokens VBRz
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="mt-2 text-muted-foreground">Carregando campanhas...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Gift className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Nenhuma campanha cadastrada</h3>
              <p className="text-muted-foreground">Crie sua primeira campanha de vouchers VBRz.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Custo VBRz</TableHead>
                  <TableHead>Politica</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Resgates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="font-medium">{campaign.title}</div>
                      {campaign.category && (
                        <div className="text-sm text-muted-foreground">{campaign.category}</div>
                      )}
                    </TableCell>
                    <TableCell>{campaign.partner?.tradeName || campaign.partner?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold">{Number(campaign.costInVbrz).toLocaleString()}</span>
                      </div>
                      {campaign.originalValue && (
                        <div className="text-xs text-muted-foreground">
                          Valor: {formatCurrency(Number(campaign.originalValue))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={campaign.settlementType === "BURN" ? "destructive" : "default"}
                        className="gap-1"
                      >
                        {campaign.settlementType === "BURN" ? (
                          <>
                            <Flame className="h-3 w-3" /> Queima
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="h-3 w-3" /> Transfer
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium">{campaign.availableStock}</span>
                        <span className="text-muted-foreground"> / {campaign.totalStock}</span>
                      </div>
                    </TableCell>
                    <TableCell>{campaign._count?.redemptions ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.isActive ? "default" : "secondary"}>
                        {campaign.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenGenerateCodes(campaign)}
                          title="Gerar Códigos"
                        >
                          <Hash className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(campaign)}
                          disabled={deleteCampaignMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Create/Edit Campaign */}
      <VoucherCampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        partners={partners}
        onSave={handleSave}
        isLoading={createCampaignMutation.isPending || updateCampaignMutation.isPending}
      />

      {/* Dialog: Generate Codes */}
      <Dialog open={generateCodesDialogOpen} onOpenChange={setGenerateCodesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Códigos de Voucher</DialogTitle>
            <DialogDescription>
              Gere códigos únicos para a campanha "{selectedCampaignForCodes?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quantidade de Códigos</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={codesQuantity}
                onChange={(e) => setCodesQuantity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prefixo do Código</Label>
              <Input
                placeholder="VBRZ"
                maxLength={10}
                value={codesPrefix}
                onChange={(e) => setCodesPrefix(e.target.value.toUpperCase())}
              />
              <p className="text-xs text-muted-foreground">
                Exemplo: {codesPrefix}-A1B2C3D4
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateCodesDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerateCodes} disabled={generateCodesMutation.isPending}>
              {generateCodesMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gerar {codesQuantity} Códigos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// VOUCHER CAMPAIGN DIALOG COMPONENT
// ============================================
interface VoucherCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: VoucherCampaign | null;
  partners: Partner[];
  onSave: (data: Partial<CreateCampaignInput>) => Promise<void>;
  isLoading: boolean;
}

function VoucherCampaignDialog({
  open,
  onOpenChange,
  campaign,
  partners,
  onSave,
  isLoading,
}: VoucherCampaignDialogProps) {
  const isEdit = !!campaign;
  const [formData, setFormData] = useState<Partial<CreateCampaignInput>>({
    partnerId: "",
    title: "",
    description: "",
    rules: "",
    costInVbrz: 100,
    originalValue: undefined,
    discountPercentage: undefined,
    settlementType: "BURN",
    partnerWalletAddress: "",
    totalStock: 100,
    maxPerUser: 1,
    category: "",
    featured: false,
  });

  // Reset form when dialog opens
  useState(() => {
    if (campaign) {
      setFormData({
        partnerId: campaign.partnerId,
        title: campaign.title,
        description: campaign.description || "",
        rules: campaign.rules || "",
        costInVbrz: Number(campaign.costInVbrz),
        originalValue: campaign.originalValue ? Number(campaign.originalValue) : undefined,
        discountPercentage: campaign.discountPercentage ?? undefined,
        settlementType: campaign.settlementType,
        partnerWalletAddress: campaign.partnerWalletAddress || "",
        totalStock: campaign.totalStock,
        maxPerUser: campaign.maxPerUser,
        category: campaign.category || "",
        featured: campaign.featured,
      });
    } else {
      setFormData({
        partnerId: "",
        title: "",
        description: "",
        rules: "",
        costInVbrz: 100,
        originalValue: undefined,
        discountPercentage: undefined,
        settlementType: "BURN",
        partnerWalletAddress: "",
        totalStock: 100,
        maxPerUser: 1,
        category: "",
        featured: false,
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.partnerId || !formData.title || !formData.costInVbrz || !formData.totalStock) {
      alert("Preencha os campos obrigatórios: Parceiro, Título, Custo VBRz e Estoque");
      return;
    }
    if (formData.settlementType === "PARTNER_WALLET" && !formData.partnerWalletAddress) {
      alert("Informe o endereço da carteira do parceiro para política TRANSFER");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Campanha" : "Nova Campanha de Voucher"}</DialogTitle>
          <DialogDescription>
            Configure a campanha de resgate com tokens VBRz
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Parceiro *</Label>
              <Select
                value={formData.partnerId}
                onValueChange={(value) => setFormData({ ...formData, partnerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {partners.filter((p) => p.isActive).map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.tradeName || partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Título da Campanha *</Label>
              <Input
                placeholder="Ex: Desconto 50% no iFood"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o benefício oferecido..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Regras de Uso</Label>
              <Textarea
                placeholder="Condições e restrições..."
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                rows={2}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Custo em VBRz *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.costInVbrz}
                  onChange={(e) => setFormData({ ...formData, costInVbrz: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Original (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={formData.originalValue ?? ""}
                  onChange={(e) => setFormData({ ...formData, originalValue: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>Desconto (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="0"
                  value={formData.discountPercentage ?? ""}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Política de Liquidação (Tokenomics) *</Label>
              <Select
                value={formData.settlementType}
                onValueChange={(value: VoucherSettlementType) => setFormData({ ...formData, settlementType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BURN">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-600" />
                      <span>BURN - Queimar VBRz (Deflação)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PARTNER_WALLET">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                      <span>TRANSFER - Enviar para Parceiro</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.settlementType === "BURN"
                  ? "O VBRz será enviado para endereço de queima, reduzindo o supply total."
                  : "O VBRz será transferido para a carteira do parceiro como pagamento."}
              </p>
            </div>

            {formData.settlementType === "PARTNER_WALLET" && (
              <div className="space-y-2">
                <Label>Endereço da Carteira do Parceiro *</Label>
                <Input
                  placeholder="0x..."
                  value={formData.partnerWalletAddress}
                  onChange={(e) => setFormData({ ...formData, partnerWalletAddress: e.target.value })}
                />
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Estoque Total *</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.totalStock}
                  onChange={(e) => setFormData({ ...formData, totalStock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Máx por Usuário</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.maxPerUser}
                  onChange={(e) => setFormData({ ...formData, maxPerUser: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  placeholder="alimentacao, servicos..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label>Campanha em Destaque</Label>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Salvar Alterações" : "Criar Campanha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
