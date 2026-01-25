import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "../../../../services/financeService";
import {
  Truck,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  Users,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";
import { Label } from "../../../../components/ui/label";
import { toast } from "sonner";
import type {
  Supplier,
  SupplierAddress,
  SupplierBankAccount,
  SupplierContact,
  PersonType,
  AddressType,
  PixKeyType,
} from "../../../../types/finance";

// ============================================================
// SUPPLIERS PAGE - Gestao de Fornecedores 360 (FASE 23)
// UX: F2 para focar na busca, Tabs Enterprise, CRUD Completo
// ============================================================

export function SuppliersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // F2 Hotkey - Foca na busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Query - Fetch Suppliers
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => financeService.getSuppliers(),
  });

  // Mutation - Delete Supplier
  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor removido com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover fornecedor");
    },
  });

  // Filter suppliers by search term
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const filteredSuppliers = safeSuppliers.filter((s) =>
    (s.tradeName || s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.taxId || s.cnpj || "").includes(searchTerm) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const activeCount = safeSuppliers.filter((s) => s.isActive !== false).length;
  const inactiveCount = safeSuppliers.length - activeCount;
  const pjCount = safeSuppliers.filter((s) => s.personType === "JURIDICA").length;
  const pfCount = safeSuppliers.filter((s) => s.personType === "FISICA").length;

  const handleDelete = (id: string) => {
    if (window.confirm("Confirmar exclusao deste fornecedor?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Truck className="text-orange-600" size={32} />
            Fornecedores 360
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Cadastro completo de fornecedores | <kbd className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">F2</kbd> para buscar
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus size={18} />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 size={20} />
                {editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}
              </DialogTitle>
            </DialogHeader>
            <SupplierForm
              onClose={handleCloseModal}
              editingSupplier={editingSupplier}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {safeSuppliers.length}
              </p>
            </div>
            <div className="w-11 h-11 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <Truck className="text-orange-600 dark:text-orange-400" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-600 dark:text-green-400" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pessoa Juridica</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {pjCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Building2 className="text-blue-600 dark:text-blue-400" size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pessoa Fisica</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {pfCount}
              </p>
            </div>
            <div className="w-11 h-11 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <Users className="text-purple-600 dark:text-purple-400" size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              ref={searchInputRef}
              placeholder="Buscar por nome, CNPJ/CPF ou email... (F2)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-600" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-600">
            <AlertCircle size={48} />
            <p className="mt-4 text-lg font-medium">Erro ao carregar dados</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verifique a conexao com o backend
            </p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Truck size={48} />
            <p className="mt-4 text-lg font-medium">Nenhum fornecedor encontrado</p>
            <p className="text-sm">Clique em "Novo Fornecedor" para cadastrar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          supplier.personType === "JURIDICA"
                            ? "bg-blue-100 dark:bg-blue-900/20"
                            : "bg-purple-100 dark:bg-purple-900/20"
                        }`}>
                          {supplier.personType === "JURIDICA" ? (
                            <Building2 className="text-blue-600 dark:text-blue-400" size={20} />
                          ) : (
                            <Users className="text-purple-600 dark:text-purple-400" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {supplier.tradeName || supplier.name}
                          </div>
                          {supplier.legalName && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {supplier.legalName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-mono">{supplier.taxId || supplier.cnpj || "-"}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {supplier.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Mail size={14} />
                            {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <Phone size={14} />
                            {supplier.phone}
                          </div>
                        )}
                        {!supplier.email && !supplier.phone && "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        supplier.personType === "JURIDICA"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                      }`}>
                        {supplier.personType === "JURIDICA" ? "PJ" : "PF"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          supplier.isActive !== false
                            ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                        }`}
                      >
                        {supplier.isActive !== false ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(supplier.id)}
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

// ============================================================
// SUPPLIER FORM COMPONENT - Enterprise com Tabs
// ============================================================

interface SupplierFormData {
  // Dados Gerais
  tradeName: string;
  legalName: string;
  taxId: string;
  personType: PersonType;
  stateRegistration: string;
  municipalRegistration: string;
  category: string;
  email: string;
  phone: string;
  isActive: boolean;
  agencyId: string;

  // Endereco
  addresses: SupplierAddress[];

  // Conta Bancaria
  bankAccounts: SupplierBankAccount[];

  // Contatos
  contacts: SupplierContact[];
}

const emptyAddress: SupplierAddress = {
  type: "COMMERCIAL",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
  country: "BR",
  isPrimary: true,
};

const emptyBankAccount: SupplierBankAccount = {
  bankCode: "",
  bankName: "",
  agencyNumber: "",
  accountNumber: "",
  accountType: "CHECKING",
  pixKey: "",
  pixKeyType: undefined,
  holderName: "",
  holderDocument: "",
  isPrimary: true,
};

const emptyContact: SupplierContact = {
  name: "",
  role: "",
  email: "",
  phone: "",
  mobile: "",
  department: "",
  isPrimary: true,
};

function SupplierForm({
  onClose,
  editingSupplier,
}: {
  onClose: () => void;
  editingSupplier: Supplier | null;
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SupplierFormData>({
    tradeName: editingSupplier?.tradeName || editingSupplier?.name || "",
    legalName: editingSupplier?.legalName || "",
    taxId: editingSupplier?.taxId || editingSupplier?.cnpj || "",
    personType: editingSupplier?.personType || "JURIDICA",
    stateRegistration: editingSupplier?.stateRegistration || "",
    municipalRegistration: editingSupplier?.municipalRegistration || "",
    category: editingSupplier?.category || "",
    email: editingSupplier?.email || "",
    phone: editingSupplier?.phone || "",
    isActive: editingSupplier?.isActive !== false,
    agencyId: editingSupplier?.agencyId || "default-agency-id",
    addresses: editingSupplier?.addresses?.length ? editingSupplier.addresses : [{ ...emptyAddress }],
    bankAccounts: editingSupplier?.bankAccounts?.length ? editingSupplier.bankAccounts : [],
    contacts: editingSupplier?.contacts?.length ? editingSupplier.contacts : [],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) => financeService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor criado com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar fornecedor");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Supplier>) =>
      financeService.updateSupplier(editingSupplier!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Fornecedor atualizado com sucesso!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar fornecedor");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Limpa arrays vazios
    const payload = {
      ...formData,
      addresses: formData.addresses.filter(a => a.street),
      bankAccounts: formData.bankAccounts.filter(b => b.bankCode),
      contacts: formData.contacts.filter(c => c.name),
    };

    if (editingSupplier) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  // Handlers para arrays
  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { ...emptyAddress, isPrimary: formData.addresses.length === 0 }],
    });
  };

  const removeAddress = (index: number) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index),
    });
  };

  const updateAddress = (index: number, field: keyof SupplierAddress, value: string | boolean) => {
    const updated = [...formData.addresses];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, addresses: updated });
  };

  const addBankAccount = () => {
    setFormData({
      ...formData,
      bankAccounts: [...formData.bankAccounts, { ...emptyBankAccount, isPrimary: formData.bankAccounts.length === 0 }],
    });
  };

  const removeBankAccount = (index: number) => {
    setFormData({
      ...formData,
      bankAccounts: formData.bankAccounts.filter((_, i) => i !== index),
    });
  };

  const updateBankAccount = (index: number, field: keyof SupplierBankAccount, value: string | boolean | PixKeyType | undefined) => {
    const updated = [...formData.bankAccounts];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, bankAccounts: updated });
  };

  const addContact = () => {
    setFormData({
      ...formData,
      contacts: [...formData.contacts, { ...emptyContact, isPrimary: formData.contacts.length === 0 }],
    });
  };

  const removeContact = (index: number) => {
    setFormData({
      ...formData,
      contacts: formData.contacts.filter((_, i) => i !== index),
    });
  };

  const updateContact = (index: number, field: keyof SupplierContact, value: string | boolean) => {
    const updated = [...formData.contacts];
    (updated[index] as any)[field] = value;
    setFormData({ ...formData, contacts: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados" className="gap-1 text-xs sm:text-sm">
            <FileText size={14} />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="endereco" className="gap-1 text-xs sm:text-sm">
            <MapPin size={14} />
            <span className="hidden sm:inline">Endereco</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-1 text-xs sm:text-sm">
            <CreditCard size={14} />
            <span className="hidden sm:inline">Financeiro</span>
          </TabsTrigger>
          <TabsTrigger value="contatos" className="gap-1 text-xs sm:text-sm">
            <Users size={14} />
            <span className="hidden sm:inline">Contatos</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DADOS GERAIS */}
        <TabsContent value="dados" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personType">Tipo de Pessoa *</Label>
              <Select
                value={formData.personType}
                onValueChange={(value: PersonType) => setFormData({ ...formData, personType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JURIDICA">Pessoa Juridica (CNPJ)</SelectItem>
                  <SelectItem value="FISICA">Pessoa Fisica (CPF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="taxId">{formData.personType === "JURIDICA" ? "CNPJ" : "CPF"} *</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder={formData.personType === "JURIDICA" ? "00.000.000/0000-00" : "000.000.000-00"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tradeName">Nome Fantasia *</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                placeholder="Nome comercial"
                required
              />
            </div>
            <div>
              <Label htmlFor="legalName">Razao Social</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="Razao social completa"
              />
            </div>
          </div>

          {formData.personType === "JURIDICA" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stateRegistration">Inscricao Estadual</Label>
                <Input
                  id="stateRegistration"
                  value={formData.stateRegistration}
                  onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                  placeholder="IE"
                />
              </div>
              <div>
                <Label htmlFor="municipalRegistration">Inscricao Municipal</Label>
                <Input
                  id="municipalRegistration"
                  value={formData.municipalRegistration}
                  onChange={(e) => setFormData({ ...formData, municipalRegistration: e.target.value })}
                  placeholder="IM"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ex: Manutencao, Limpeza, Reforma"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Fornecedor ativo
            </Label>
          </div>
        </TabsContent>

        {/* TAB 2: ENDERECO */}
        <TabsContent value="endereco" className="space-y-4 mt-4">
          {formData.addresses.map((addr, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endereco {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAddress(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={addr.type}
                    onValueChange={(value: AddressType) => updateAddress(index, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                      <SelectItem value="DELIVERY">Entrega</SelectItem>
                      <SelectItem value="BILLING">Cobranca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Rua/Logradouro</Label>
                  <Input
                    value={addr.street}
                    onChange={(e) => updateAddress(index, "street", e.target.value)}
                    placeholder="Rua, Avenida..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Numero</Label>
                  <Input
                    value={addr.number}
                    onChange={(e) => updateAddress(index, "number", e.target.value)}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input
                    value={addr.complement || ""}
                    onChange={(e) => updateAddress(index, "complement", e.target.value)}
                    placeholder="Sala, Bloco"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Bairro</Label>
                  <Input
                    value={addr.neighborhood}
                    onChange={(e) => updateAddress(index, "neighborhood", e.target.value)}
                    placeholder="Bairro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <Label>Cidade</Label>
                  <Input
                    value={addr.city}
                    onChange={(e) => updateAddress(index, "city", e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label>UF</Label>
                  <Input
                    value={addr.state}
                    onChange={(e) => updateAddress(index, "state", e.target.value)}
                    placeholder="PR"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={addr.zipCode}
                    onChange={(e) => updateAddress(index, "zipCode", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addAddress} className="w-full gap-2">
            <Plus size={16} />
            Adicionar Endereco
          </Button>
        </TabsContent>

        {/* TAB 3: FINANCEIRO / PIX */}
        <TabsContent value="financeiro" className="space-y-4 mt-4">
          {formData.bankAccounts.map((bank, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conta Bancaria {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBankAccount(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Cod. Banco</Label>
                  <Input
                    value={bank.bankCode}
                    onChange={(e) => updateBankAccount(index, "bankCode", e.target.value)}
                    placeholder="001"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Nome do Banco</Label>
                  <Input
                    value={bank.bankName || ""}
                    onChange={(e) => updateBankAccount(index, "bankName", e.target.value)}
                    placeholder="Banco do Brasil"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Agencia</Label>
                  <Input
                    value={bank.agencyNumber}
                    onChange={(e) => updateBankAccount(index, "agencyNumber", e.target.value)}
                    placeholder="0001"
                  />
                </div>
                <div>
                  <Label>Conta</Label>
                  <Input
                    value={bank.accountNumber}
                    onChange={(e) => updateBankAccount(index, "accountNumber", e.target.value)}
                    placeholder="12345-6"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={bank.accountType || "CHECKING"}
                    onValueChange={(value) => updateBankAccount(index, "accountType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHECKING">Corrente</SelectItem>
                      <SelectItem value="SAVINGS">Poupanca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">Dados PIX</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tipo da Chave</Label>
                    <Select
                      value={bank.pixKeyType || ""}
                      onValueChange={(value: PixKeyType) => updateBankAccount(index, "pixKeyType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF</SelectItem>
                        <SelectItem value="CNPJ">CNPJ</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="PHONE">Telefone</SelectItem>
                        <SelectItem value="RANDOM">Chave Aleatoria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Chave PIX</Label>
                    <Input
                      value={bank.pixKey || ""}
                      onChange={(e) => updateBankAccount(index, "pixKey", e.target.value)}
                      placeholder="Chave PIX"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addBankAccount} className="w-full gap-2">
            <Plus size={16} />
            Adicionar Conta Bancaria
          </Button>
        </TabsContent>

        {/* TAB 4: CONTATOS */}
        <TabsContent value="contatos" className="space-y-4 mt-4">
          {formData.contacts.map((contact, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contato {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContact(index)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={contact.name}
                    onChange={(e) => updateContact(index, "name", e.target.value)}
                    placeholder="Nome do contato"
                  />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input
                    value={contact.role || ""}
                    onChange={(e) => updateContact(index, "role", e.target.value)}
                    placeholder="Ex: Gerente, Financeiro"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={contact.email || ""}
                    onChange={(e) => updateContact(index, "email", e.target.value)}
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Input
                    value={contact.department || ""}
                    onChange={(e) => updateContact(index, "department", e.target.value)}
                    placeholder="Ex: Compras, Vendas"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={contact.phone || ""}
                    onChange={(e) => updateContact(index, "phone", e.target.value)}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div>
                  <Label>Celular/WhatsApp</Label>
                  <Input
                    value={contact.mobile || ""}
                    onChange={(e) => updateContact(index, "mobile", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addContact} className="w-full gap-2">
            <Plus size={16} />
            Adicionar Contato
          </Button>
        </TabsContent>
      </Tabs>

      {/* Botoes de Acao */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Salvando...
            </>
          ) : editingSupplier ? (
            "Atualizar Fornecedor"
          ) : (
            "Criar Fornecedor"
          )}
        </Button>
      </div>
    </form>
  );
}
