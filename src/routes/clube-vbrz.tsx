// ============================================
// ROTA /clube-vbrz - Clube de Recompensas VBRz
// Resgate de vouchers com tokens VBRz
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Gift,
  Coins,
  Flame,
  ArrowRightLeft,
  Search,
  Ticket,
  CheckCircle2,
  Clock,
  Copy,
  QrCode,
  Wallet,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Store,
  Calendar,
  Tag,
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useAvailableVouchers,
  useRedeemVoucher,
  useConfirmRedemption,
  useMyVouchers,
  type VoucherCampaign,
  type VoucherRedemption,
} from "@/hooks/use-vouchers";
import { useCryptoWallets } from "@/contexts/crypto-wallets-context";
import { copyToClipboard as copyToClipboardUtil } from "@/lib/clipboard";

export const Route = createFileRoute("/clube-vbrz")({
  component: ClubeVBRzPage,
});

function ClubeVBRzPage() {
  const [activeTab, setActiveTab] = useState("available");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherCampaign | null>(null);
  const [redemptionResult, setRedemptionResult] = useState<{
    redemptionId: string;
    voucherCode: string;
  } | null>(null);

  const navigate = useNavigate();

  // Usa carteira operacional cadastrada no sistema
  const { getOperationalWallet, primaryWallet } = useCryptoWallets();
  const operationalWallet = getOperationalWallet() || primaryWallet;
  const walletConnected = !!operationalWallet;
  const walletAddress = operationalWallet ?
    `${operationalWallet.address.slice(0, 6)}...${operationalWallet.address.slice(-4)}` :
    "Nao conectada";
  const vbrzBalance = operationalWallet?.balance.brz || 0;

  // API Hooks
  const { data: availableVouchers = [], isLoading: loadingVouchers } = useAvailableVouchers(
    selectedCategory || undefined
  );
  const { data: myVouchers = [], isLoading: loadingMyVouchers } = useMyVouchers();
  const redeemMutation = useRedeemVoucher();
  const confirmMutation = useConfirmRedemption();

  // Categories for filtering
  const categories = [
    { id: "alimentacao", label: "Alimentacao", icon: "🍔" },
    { id: "entretenimento", label: "Entretenimento", icon: "🎬" },
    { id: "servicos", label: "Servicos", icon: "🔧" },
    { id: "compras", label: "Compras", icon: "🛒" },
    { id: "viagens", label: "Viagens", icon: "✈️" },
  ];

  // Filter vouchers
  const filteredVouchers = availableVouchers.filter(
    (voucher) =>
      !searchTerm ||
      voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.partner?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenRedeem = (voucher: VoucherCampaign) => {
    setSelectedVoucher(voucher);
    setRedemptionResult(null);
    setRedeemDialogOpen(true);
  };

  const handleRedeem = async () => {
    if (!selectedVoucher || !operationalWallet) return;

    try {
      // In production, this would:
      // 1. Connect to Web3 wallet
      // 2. Send VBRz tokens to dead address or partner wallet
      // 3. Get txHash from blockchain
      // For now, simulate with mock txHash
      const mockTxHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;

      const result = await redeemMutation.mutateAsync({
        campaignId: selectedVoucher.id,
        userWalletAddress: operationalWallet.address,
        txHash: mockTxHash,
      });

      // Simulate blockchain confirmation
      setTimeout(async () => {
        try {
          await confirmMutation.mutateAsync({
            redemptionId: result.data.redemptionId,
            blockNumber: 45000000 + Math.floor(Math.random() * 1000),
          });
        } catch (e) {
          console.error("Erro ao confirmar:", e);
        }
      }, 2000);

      setRedemptionResult({
        redemptionId: result.data.redemptionId,
        voucherCode: result.data.voucherCode,
      });
    } catch (error) {
      console.error("Erro ao resgatar:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    copyToClipboardUtil(text);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/" })}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                  <Gift className="h-6 w-6" />
                </div>
                Clube VBRz
              </h1>
              <p className="text-muted-foreground mt-1">
                Resgate vouchers exclusivos usando seus tokens VBRz
              </p>
            </div>
          </div>

          {/* Wallet Status */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">
                    {walletConnected ? walletAddress : "Desconectada"}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-lg">{vbrzBalance.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">VBRz</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tokenomics Info Banner */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Sparkles className="h-8 w-8" />
                <div>
                  <h3 className="font-semibold">Tokenomics VBRz</h3>
                  <p className="text-sm opacity-90">
                    Ao resgatar vouchers, seus VBRz sao queimados ou transferidos para parceiros,
                    valorizando o ecossistema!
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-orange-300">
                    <Flame className="h-4 w-4" />
                    <span className="font-bold">BURN</span>
                  </div>
                  <p className="text-xs opacity-80">Reducao de supply</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green-300">
                    <ArrowRightLeft className="h-4 w-4" />
                    <span className="font-bold">TRANSFER</span>
                  </div>
                  <p className="text-xs opacity-80">Pagamento a parceiros</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="available" className="gap-2">
              <Gift className="w-4 h-4" />
              Vouchers Disponiveis
            </TabsTrigger>
            <TabsTrigger value="my-vouchers" className="gap-2">
              <Ticket className="w-4 h-4" />
              Meus Vouchers
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* TAB: VOUCHERS DISPONIVEIS */}
          {/* ============================================ */}
          <TabsContent value="available">
            {/* Search & Categories */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar vouchers ou parceiros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todos
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="whitespace-nowrap"
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Vouchers Grid */}
            {loadingVouchers ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-500" />
                <p className="mt-2 text-muted-foreground">Carregando vouchers...</p>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Nenhum voucher disponivel</h3>
                  <p className="text-muted-foreground">
                    Novos vouchers serao adicionados em breve!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    userBalance={vbrzBalance}
                    onRedeem={() => handleOpenRedeem(voucher)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ============================================ */}
          {/* TAB: MEUS VOUCHERS */}
          {/* ============================================ */}
          <TabsContent value="my-vouchers">
            {loadingMyVouchers ? (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-500" />
                <p className="mt-2 text-muted-foreground">Carregando seus vouchers...</p>
              </div>
            ) : myVouchers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Ticket className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium">Voce ainda nao resgatou vouchers</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore os vouchers disponiveis e resgate com seus VBRz!
                  </p>
                  <Button onClick={() => setActiveTab("available")}>
                    Ver Vouchers Disponiveis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myVouchers.map((redemption) => (
                  <MyVoucherCard key={redemption.id} redemption={redemption} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ============================================ */}
        {/* DIALOG: RESGATE DE VOUCHER */}
        {/* ============================================ */}
        <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
          <DialogContent className="sm:max-w-md">
            {!redemptionResult ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-600" />
                    Resgatar Voucher
                  </DialogTitle>
                  <DialogDescription>
                    Confirme o resgate usando seus tokens VBRz
                  </DialogDescription>
                </DialogHeader>

                {selectedVoucher && (
                  <div className="space-y-4 py-4">
                    <div className="p-4 bg-slate-800 rounded-xl">
                      <h3 className="font-semibold">{selectedVoucher.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedVoucher.partner?.tradeName || selectedVoucher.partner?.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                      <div>
                        <p className="text-sm text-muted-foreground">Custo</p>
                        <div className="flex items-center gap-2">
                          <Coins className="h-5 w-5 text-yellow-500" />
                          <span className="text-2xl font-bold">
                            {Number(selectedVoucher.costInVbrz).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">VBRz</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedVoucher.settlementType === "BURN"
                            ? "border-orange-300 bg-orange-50 text-orange-700"
                            : "border-blue-300 bg-blue-50 text-blue-700"
                        }
                      >
                        {selectedVoucher.settlementType === "BURN" ? (
                          <>
                            <Flame className="h-3 w-3 mr-1" /> BURN
                          </>
                        ) : (
                          <>
                            <ArrowRightLeft className="h-3 w-3 mr-1" /> TRANSFER
                          </>
                        )}
                      </Badge>
                    </div>

                    {vbrzBalance < Number(selectedVoucher.costInVbrz) && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>Saldo insuficiente de VBRz</span>
                      </div>
                    )}

                    <Separator />

                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Carteira: {walletAddress}
                      </p>
                      <p className="flex items-center gap-2 mt-1">
                        <Coins className="h-4 w-4" />
                        Saldo atual: {vbrzBalance.toLocaleString()} VBRz
                      </p>
                      <p className="flex items-center gap-2 mt-1">
                        <Coins className="h-4 w-4" />
                        Saldo apos resgate:{" "}
                        {(vbrzBalance - Number(selectedVoucher.costInVbrz)).toLocaleString()} VBRz
                      </p>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleRedeem}
                    disabled={
                      redeemMutation.isPending ||
                      !selectedVoucher ||
                      vbrzBalance < Number(selectedVoucher?.costInVbrz || 0)
                    }
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {redeemMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Coins className="h-4 w-4 mr-2" />
                    )}
                    Confirmar Resgate
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Voucher Resgatado!
                  </DialogTitle>
                  <DialogDescription>
                    Seu voucher foi resgatado com sucesso
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl text-center">
                    <p className="text-sm text-muted-foreground mb-2">Seu codigo de voucher:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-2xl font-mono font-bold tracking-wider">
                        {redemptionResult.voucherCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(redemptionResult.voucherCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-4 bg-slate-900 border-2 border-dashed border-purple-600 rounded-xl">
                      <QrCode className="h-24 w-24 text-purple-600" />
                    </div>
                  </div>

                  <p className="text-sm text-center text-muted-foreground">
                    Apresente este codigo no estabelecimento parceiro para utilizar seu voucher.
                  </p>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setRedeemDialogOpen(false);
                      setActiveTab("my-vouchers");
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Ver Meus Vouchers
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ============================================
// VOUCHER CARD COMPONENT
// ============================================
interface VoucherCardProps {
  voucher: VoucherCampaign;
  userBalance: number;
  onRedeem: () => void;
}

function VoucherCard({ voucher, userBalance, onRedeem }: VoucherCardProps) {
  const canAfford = userBalance >= Number(voucher.costInVbrz);
  const hasStock = voucher.availableStock > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Banner Image */}
      <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-400 relative">
        {voucher.featured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500">
            <Sparkles className="h-3 w-3 mr-1" />
            Destaque
          </Badge>
        )}
        <Badge
          variant="outline"
          className={`absolute top-2 right-2 ${
            voucher.settlementType === "BURN"
              ? "border-orange-300 bg-orange-50 text-orange-700"
              : "border-blue-300 bg-blue-50 text-blue-700"
          }`}
        >
          {voucher.settlementType === "BURN" ? (
            <Flame className="h-3 w-3" />
          ) : (
            <ArrowRightLeft className="h-3 w-3" />
          )}
        </Badge>
        {voucher.partner?.logo ? (
          <img
            src={voucher.partner.logo}
            alt={voucher.partner.name}
            className="absolute bottom-2 left-2 h-12 w-12 rounded-lg bg-slate-900 p-1"
          />
        ) : (
          <div className="absolute bottom-2 left-2 h-12 w-12 rounded-lg bg-slate-900 flex items-center justify-center">
            <Store className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{voucher.title}</CardTitle>
        <CardDescription>
          {voucher.partner?.tradeName || voucher.partner?.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        {voucher.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {voucher.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div>
            {voucher.originalValue && (
              <p className="text-xs text-muted-foreground line-through">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(voucher.originalValue))}
              </p>
            )}
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-lg">
                {Number(voucher.costInVbrz).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">VBRz</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Disponiveis</p>
            <p className="font-semibold">{voucher.availableStock}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          disabled={!canAfford || !hasStock}
          onClick={onRedeem}
        >
          {!hasStock ? (
            "Esgotado"
          ) : !canAfford ? (
            "Saldo Insuficiente"
          ) : (
            <>
              <Gift className="h-4 w-4 mr-2" />
              Resgatar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================
// MY VOUCHER CARD COMPONENT
// ============================================
interface MyVoucherCardProps {
  redemption: VoucherRedemption;
}

function MyVoucherCard({ redemption }: MyVoucherCardProps) {
  const [showCode, setShowCode] = useState(false);

  const copyToClipboard = (text: string) => {
    copyToClipboardUtil(text);
  };

  const isConfirmed = redemption.txStatus === "confirmed";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Partner Logo */}
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
            {redemption.campaign?.partner?.logo ? (
              <img
                src={redemption.campaign.partner.logo}
                alt={redemption.campaign.partner.name}
                className="h-12 w-12 rounded-lg"
              />
            ) : (
              <Store className="h-8 w-8 text-purple-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{redemption.campaign?.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {redemption.campaign?.partner?.tradeName || redemption.campaign?.partner?.name}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  isConfirmed
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-yellow-300 bg-yellow-50 text-yellow-700"
                }
              >
                {isConfirmed ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmado
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" /> Pendente
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {Number(redemption.vbrzPaid).toLocaleString()} VBRz
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(redemption.redeemedAt).toLocaleDateString("pt-BR")}
              </span>
              <Badge
                variant="outline"
                className={
                  redemption.settlementType === "BURN"
                    ? "border-orange-200 text-orange-600"
                    : "border-blue-200 text-blue-600"
                }
              >
                {redemption.settlementType === "BURN" ? (
                  <Flame className="h-3 w-3" />
                ) : (
                  <ArrowRightLeft className="h-3 w-3" />
                )}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="shrink-0">
            {isConfirmed ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? "Ocultar" : "Ver Codigo"}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguardando...
              </div>
            )}
          </div>
        </div>

        {/* Voucher Code */}
        {showCode && isConfirmed && (
          <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Codigo do Voucher:</p>
                <code className="text-xl font-mono font-bold tracking-wider">
                  {redemption.voucherCode}
                </code>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(redemption.voucherCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
