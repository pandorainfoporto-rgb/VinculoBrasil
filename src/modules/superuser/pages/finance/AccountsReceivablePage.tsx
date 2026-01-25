import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService, type ReceivableFilters } from "../../../../services/financeService";
import {
  Plus,
  Filter,
  Search,
  AlertCircle,
  Loader2,
  DollarSign,
  CheckCircle,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AccountReceivable } from "../../../../types/finance";

export function AccountsReceivablePage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReceivableFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<AccountReceivable | null>(null);

  // Query - Fetch Receivables
  const {
    data: receivables = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["receivables", filters],
    queryFn: () => financeService.getReceivables(filters),
  });

  // Mutation - Receive Payment
  const receivePaymentMutation = useMutation({
    mutationFn: (id: string) => financeService.receivePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Recebimento confirmado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao confirmar recebimento");
    },
  });

  // Mutation - Delete Receivable
  const deleteReceivableMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteReceivable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Receita excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir receita");
    },
  });

  // Calculate stats - FASE 19: Garantir que receivables é array antes de .reduce()
  const safeReceivables = Array.isArray(receivables) ? receivables : [];
  const totalReceivable = safeReceivables.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalOverdue = safeReceivables
    .filter((r) => r.status === "overdue")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const receivedThisMonth = safeReceivables
    .filter((r) => {
      if (!r.receivedAt) return false;
      const received = new Date(r.receivedAt);
      const now = new Date();
      return (
        received.getMonth() === now.getMonth() &&
        received.getFullYear() === now.getFullYear() &&
        r.status === "received"
      );
    })
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filter by search - FASE 19: Usar safeReceivables
  const filteredReceivables = safeReceivables.filter((r) =>
    (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReceive = (id: string) => {
    if (window.confirm("Confirmar recebimento desta receita?")) {
      receivePaymentMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Confirmar exclusão desta receita?")) {
      deleteReceivableMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contas a Receber</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas receitas e recebimentos
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingReceivable ? "Editar Conta a Receber" : "Nova Conta a Receber"}
              </DialogTitle>
            </DialogHeader>
            <ReceivableForm
              onClose={() => {
                setIsModalOpen(false);
                setEditingReceivable(null);
              }}
              editingReceivable={editingReceivable}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total a Receber</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                R$ {totalReceivable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <DollarSign className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Vencidas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                R$ {totalOverdue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recebido Mês Atual</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                R$ {receivedThisMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value === "all" ? undefined : (value as any) })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            Mais Filtros
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <AlertCircle size={48} />
            <p className="mt-4 text-lg font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verifique a conexão com o backend
            </p>
          </div>
        ) : filteredReceivables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <DollarSign size={48} />
            <p className="mt-4 text-lg font-medium">Nenhuma receita encontrada</p>
            <p className="text-sm">Clique em "Nova Receita" para cadastrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente/Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReceivables.map((receivable) => (
                  <tr
                    key={receivable.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {receivable.clientName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {receivable.clientType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {receivable.description}
                      </div>
                      {receivable.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {receivable.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      R$ {receivable.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {receivable.dueDate
                        ? format(new Date(receivable.dueDate), "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={receivable.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {receivable.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReceive(receivable.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingReceivable(receivable);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(receivable.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    received: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
    partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  const labels = {
    pending: "Pendente",
    received: "Recebido",
    overdue: "Vencido",
    cancelled: "Cancelado",
    partial: "Parcial",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

// Receivable Form Component
function ReceivableForm({
  onClose,
  editingReceivable,
}: {
  onClose: () => void;
  editingReceivable: AccountReceivable | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientName: editingReceivable?.clientName || "",
    clientType: editingReceivable?.clientType || ("other" as const),
    description: editingReceivable?.description || "",
    amount: editingReceivable?.amount || 0,
    dueDate: editingReceivable?.dueDate || "",
    category: editingReceivable?.category || "",
    entryType: "manual" as "manual" | "boleto" | "marketplace",
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<AccountReceivable>) => financeService.createReceivable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Receita criada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar receita");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AccountReceivable>) =>
      financeService.updateReceivable(editingReceivable!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] });
      toast.success("Receita atualizada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar receita");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReceivable) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clientName">Cliente/Origem</Label>
          <Input
            id="clientName"
            value={formData.clientName}
            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            placeholder="Ex: João Silva"
            required
          />
        </div>
        <div>
          <Label htmlFor="clientType">Tipo</Label>
          <Select
            value={formData.clientType}
            onValueChange={(value: any) => setFormData({ ...formData, clientType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">Inquilino</SelectItem>
              <SelectItem value="landlord">Proprietário</SelectItem>
              <SelectItem value="agency">Imobiliária</SelectItem>
              <SelectItem value="investor">Investidor</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Aluguel Janeiro/2025"
          required
        />
      </div>

      <div>
        <Label htmlFor="entryType">Tipo de Entrada</Label>
        <Select
          value={formData.entryType}
          onValueChange={(value: any) => setFormData({ ...formData, entryType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de entrada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="boleto">Boleto Sistema</SelectItem>
            <SelectItem value="marketplace">Repasse Marketplace</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Vencimento</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Categoria DRE</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Ex: Receitas de Aluguel"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {createMutation.isPending || updateMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Salvando...
            </>
          ) : editingReceivable ? (
            "Atualizar"
          ) : (
            "Criar Receita"
          )}
        </Button>
      </div>
    </form>
  );
}
