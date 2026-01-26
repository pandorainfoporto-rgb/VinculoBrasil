import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../../../../services/financeService";
import {
  Plus,
  Building2,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
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
import type { BankAccount } from "../../../../types/finance";

export function BankAccountsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Query - Fetch Bank Accounts
  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: () => financeService.getBankAccounts(),
  });

  // Mutation - Delete Account
  const deleteAccountMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      toast.success("Conta excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir conta");
    },
  });

  // Calculate stats - FASE 19: Garantir que accounts é array antes de .reduce()
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  const totalBalance = safeAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const activeAccounts = safeAccounts.filter((acc) => acc.isActive).length;

  const handleDelete = (id: string) => {
    if (window.confirm("Confirmar exclusão desta conta bancária?")) {
      deleteAccountMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contas Bancárias</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie contas bancárias e gateways de pagamento
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta Bancária" : "Nova Conta Bancária"}
              </DialogTitle>
            </DialogHeader>
            <BankAccountForm
              onClose={() => {
                setIsModalOpen(false);
                setEditingAccount(null);
              }}
              editingAccount={editingAccount}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                R$ {totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Contas Ativas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeAccounts} de {accounts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <Building2 className="text-emerald-600 dark:text-emerald-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div>
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
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Building2 size={48} />
            <p className="mt-4 text-lg font-medium">Nenhuma conta cadastrada</p>
            <p className="text-sm">Clique em "Nova Conta" para cadastrar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Bank Logo Placeholder */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                    <Building2 className="text-white" size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAccount(account);
                        setIsModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit size={16} className="text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Account Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {account.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{account.bank}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
                    <span>Ag: {account.agency}</span>
                    <span>•</span>
                    <span>CC: {account.accountNumber}</span>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        Saldo Atual
                      </span>
                      <div className="flex items-center gap-1">
                        {account.balance >= 0 ? (
                          <TrendingUp size={14} className="text-green-600" />
                        ) : (
                          <TrendingDown size={14} className="text-red-600" />
                        )}
                        <span
                          className={`text-lg font-bold ${account.balance >= 0
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                            }`}
                        >
                          R$ {Math.abs(account.balance).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${account.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                        }`}
                    >
                      {account.isActive ? "Ativa" : "Inativa"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bank Account Form Component
function BankAccountForm({
  onClose,
  editingAccount,
}: {
  onClose: () => void;
  editingAccount: BankAccount | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: editingAccount?.name || "",
    bank: editingAccount?.bank || "",
    agency: editingAccount?.agency || "",
    accountNumber: editingAccount?.accountNumber || "",
    accountType: editingAccount?.accountType || ("checking" as const),
    balance: editingAccount?.balance || 0,
    isActive: editingAccount?.isActive ?? true,
  });

  // Fetch Bank Registry
  const { data: bankRegistry = [] } = useQuery({
    queryKey: ['bankRegistry', formData.accountType],
    queryFn: () => financeService.getBankRegistry({
      isGateway: formData.accountType === 'gateway'
    }),
    enabled: formData.accountType !== 'cash'
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<BankAccount>) => financeService.createBankAccount({
      ...data,
      type: formData.accountType.toUpperCase() as any
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      toast.success("Conta criada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar conta");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<BankAccount>) =>
      financeService.updateBankAccount(editingAccount!.id, {
        ...data,
        type: formData.accountType.toUpperCase() as any
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      toast.success("Conta atualizada com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isCash = formData.accountType === 'cash' as any; // Temporary cast to allow new type
  const isGateway = formData.accountType === 'gateway' as any;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="accountType">Tipo de Conta</Label>
        <Select
          value={formData.accountType}
          onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de conta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Conta Corrente</SelectItem>
            <SelectItem value="savings">Conta Poupança</SelectItem>
            <SelectItem value="gateway">Gateway de Pagamento</SelectItem>
            <SelectItem value="cash">Caixa Físico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="name">Nome da Conta</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={isCash ? "Ex: Caixinha do Escritório" : "Ex: Conta Principal"}
          required
        />
      </div>

      {!isCash && (
        <div>
          <Label htmlFor="bank">{isGateway ? "Instituição / Gateway" : "Banco"}</Label>
          <Select
            value={formData.bank}
            onValueChange={(value) => setFormData({ ...formData, bank: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {bankRegistry.map((bank: any) => (
                <SelectItem key={bank.code} value={bank.name}>
                  {bank.code} - {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!isCash && !isGateway && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="agency">Agência</Label>
            <Input
              id="agency"
              value={formData.agency}
              onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
              placeholder="0001"
              required={!isCash}
            />
          </div>
          <div>
            <Label htmlFor="accountNumber">Conta</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="12345-6"
              required={!isCash}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="balance">Saldo Atual (R$)</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300"
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Conta Ativa
        </Label>
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
          ) : editingAccount ? (
            "Atualizar"
          ) : (
            "Salvar Conta"
          )}
        </Button>
      </div>
    </form>
  );
}
