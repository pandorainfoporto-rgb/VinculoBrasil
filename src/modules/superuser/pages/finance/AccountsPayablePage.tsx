import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService, type PayableFilters } from "../../../../services/financeService";
import {
  Plus,
  Filter,
  Search,
  AlertCircle,
  Loader2,
  DollarSign,
  Calendar,
  CheckCircle,
  Edit,
  Trash2,
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
import type { AccountPayable } from "../../../../types/finance";

export function AccountsPayablePage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PayableFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);

  // Query - Fetch Payables
  const {
    data: payables = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["payables", filters],
    queryFn: () => financeService.getPayables(filters),
  });

  // Query - Fetch Suppliers for dropdown
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => financeService.getSuppliers(),
  });

  // Query - Fetch Categories for dropdown (FASE 21)
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => financeService.getCategories({ type: "EXPENSE" }),
  });

  // Mutation - Pay Bill
  const payBillMutation = useMutation({
    mutationFn: (id: string) => financeService.payBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Conta paga com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao pagar conta");
    },
  });

  // Mutation - Delete Payable
  const deletePayableMutation = useMutation({
    mutationFn: (id: string) => financeService.deletePayable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Conta excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir conta");
    },
  });

  // Calculate stats - FASE 19: Garantir que payables é array antes de .reduce()
  const safePayables = Array.isArray(payables) ? payables : [];
  const totalPayable = safePayables.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOverdue = safePayables
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const next7Days = safePayables
    .filter((p) => {
      if (!p.dueDate) return false;
      const due = new Date(p.dueDate);
      const today = new Date();
      const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7 && p.status === "pending";
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // Filter by search - FASE 19: Usar safePayables
  const filteredPayables = safePayables.filter((p) =>
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayBill = (id: string) => {
    if (window.confirm("Confirmar pagamento desta conta?")) {
      payBillMutation.mutate(id);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Confirmar exclusão desta conta?")) {
      deletePayableMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contas a Pagar</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas obrigações financeiras
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingPayable ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
              </DialogTitle>
            </DialogHeader>
            <PayableForm
              suppliers={suppliers}
              categories={categories}
              onClose={() => {
                setIsModalOpen(false);
                setEditingPayable(null);
              }}
              editingPayable={editingPayable}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total a Pagar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                R$ {totalPayable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Próximos 7 dias</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                R$ {next7Days.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <Calendar className="text-orange-600 dark:text-orange-400" size={24} />
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
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
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
        ) : filteredPayables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <DollarSign size={48} />
            <p className="mt-4 text-lg font-medium">Nenhuma conta encontrada</p>
            <p className="text-sm">Clique em "Nova Conta" para cadastrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fornecedor
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
                {filteredPayables.map((payable) => (
                  <tr
                    key={payable.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payable.description}
                      </div>
                      {payable.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payable.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payable.supplierName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      R$ {payable.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {payable.dueDate
                        ? format(new Date(payable.dueDate), "dd/MM/yyyy", { locale: ptBR })
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={payable.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {payable.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePayBill(payable.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPayable(payable);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(payable.id)}
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
    paid: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
    partial: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  const labels = {
    pending: "Pendente",
    paid: "Pago",
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

// Payable Form Component (FASE 21 - Selects Reais)
function PayableForm({
  suppliers,
  categories,
  onClose,
  editingPayable,
}: {
  suppliers: any[];
  categories: any[];
  onClose: () => void;
  editingPayable: AccountPayable | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    description: editingPayable?.description || "",
    supplierId: editingPayable?.supplierId || "",
    categoryId: editingPayable?.categoryId || "",
    amount: editingPayable?.amount || 0,
    dueDate: editingPayable?.dueDate || "",
    category: editingPayable?.category || "",
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<AccountPayable>) => financeService.createPayable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Conta criada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar conta");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AccountPayable>) =>
      financeService.updatePayable(editingPayable!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] });
      toast.success("Conta atualizada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayable) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Ex: Aluguel escritório"
          required
        />
      </div>

      <div>
        <Label htmlFor="supplier">Fornecedor</Label>
        <Select
          value={formData.supplierId}
          onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o fornecedor" />
          </SelectTrigger>
          <SelectContent>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
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
        <Label htmlFor="categoryId">Categoria DRE</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.code ? `${cat.code} - ` : ""}{cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          ) : editingPayable ? (
            "Atualizar"
          ) : (
            "Criar Conta"
          )}
        </Button>
      </div>
    </form>
  );
}
