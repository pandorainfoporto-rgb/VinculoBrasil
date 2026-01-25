import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Award,
  X,
} from "lucide-react";
import { useRealtorStore, type Realtor, type RealtorStatus } from "../../../stores/useRealtorStore";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ============================================================
// REALTORS PAGE - Gestão de Corretores
// ============================================================

const realtorSchema = z.object({
  name: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  creci: z.string().min(5, "CRECI obrigatório"),
  creciState: z.string().length(2, "Use a sigla do estado"),
  status: z.enum(["active", "inactive", "pending"]),
  commissionSplit: z.number().min(0).max(1, "Split deve ser entre 0 e 1"),
});

type RealtorFormData = z.infer<typeof realtorSchema>;

export function RealtorsPage() {
  const { realtors, addRealtor, updateRealtor, deleteRealtor } = useRealtorStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RealtorStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRealtor, setEditingRealtor] = useState<Realtor | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Simula imobiliária logada (agency-001)
  const currentAgencyId = "agency-001";

  // Filtrar corretores da imobiliária atual
  const agencyRealtors = realtors.filter((r) => r.agencyId === currentAgencyId);

  const filteredRealtors = agencyRealtors.filter((realtor) => {
    const matchesSearch =
      realtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      realtor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      realtor.creci.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || realtor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (realtor: Realtor) => {
    setEditingRealtor(realtor);
    setIsModalOpen(true);
    setOpenMenu(null);
  };

  const handleDelete = (realtor: Realtor) => {
    if (confirm(`Tem certeza que deseja excluir o corretor "${realtor.name}"?`)) {
      deleteRealtor(realtor.id);
      toast.success("Corretor excluído com sucesso!");
    }
    setOpenMenu(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRealtor(null);
  };

  // Stats
  const stats = {
    total: agencyRealtors.length,
    active: agencyRealtors.filter((r) => r.status === "active").length,
    pending: agencyRealtors.filter((r) => r.status === "pending").length,
    totalCommission: agencyRealtors.reduce((sum, r) => sum + r.totalCommission, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Corretores
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie sua equipe de corretores
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Novo Corretor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={Users} />
        <StatCard label="Ativos" value={stats.active} color="green" />
        <StatCard label="Pendentes" value={stats.pending} color="yellow" />
        <StatCard
          label="Comissões Pagas"
          value={`R$ ${stats.totalCommission.toLocaleString("pt-BR")}`}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CRECI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RealtorStatus | "all")}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      {/* Realtors Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRealtors.map((realtor) => (
          <RealtorCard
            key={realtor.id}
            realtor={realtor}
            onEdit={() => handleEdit(realtor)}
            onDelete={() => handleDelete(realtor)}
            onMenuToggle={() => setOpenMenu(openMenu === realtor.id ? null : realtor.id)}
            isMenuOpen={openMenu === realtor.id}
          />
        ))}
      </div>

      {filteredRealtors.length === 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 py-12 text-center">
          <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Nenhum corretor encontrado</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-blue-600 hover:underline"
          >
            Cadastrar primeiro corretor
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <RealtorModal
          realtor={editingRealtor}
          agencyId={currentAgencyId}
          onClose={handleCloseModal}
          onSave={(data) => {
            if (editingRealtor) {
              updateRealtor(editingRealtor.id, data);
              toast.success("Corretor atualizado com sucesso!");
            } else {
              addRealtor({
                ...data,
                agencyId: currentAgencyId,
              });
              toast.success("Corretor cadastrado com sucesso!");
            }
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  icon: Icon,
  color = "gray",
}: {
  label: string;
  value: string | number;
  icon?: typeof Users;
  color?: "gray" | "blue" | "green" | "yellow" | "purple";
}) {
  const colors = {
    gray: "text-gray-600 dark:text-gray-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className={colors[color]} size={24} />}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REALTOR CARD
// ============================================================
function RealtorCard({
  realtor,
  onEdit,
  onDelete,
  onMenuToggle,
  isMenuOpen,
}: {
  realtor: Realtor;
  onEdit: () => void;
  onDelete: () => void;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}) {
  const statusConfig = {
    active: { label: "Ativo", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    inactive: { label: "Inativo", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
    pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="relative h-24 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {realtor.name.charAt(0)}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2 py-1 rounded-full ${statusConfig[realtor.status].color}`}>
            {statusConfig[realtor.status].label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={onMenuToggle}
            className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-10 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-36">
              <button
                onClick={onEdit}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit size={14} />
                Editar
              </button>
              <button
                onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye size={14} />
                Ver Detalhes
              </button>
              <button
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2 space-y-3">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            {realtor.name}
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-sm text-blue-600 dark:text-blue-400">
            <Award size={14} />
            CRECI {realtor.creci}/{realtor.creciState}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail size={14} />
            <span className="truncate">{realtor.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Phone size={14} />
            {realtor.phone}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Contratos</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{realtor.contractsCount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Split</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {(realtor.commissionSplit * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Comissão</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                R$ {(realtor.totalCommission / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REALTOR MODAL
// ============================================================
function RealtorModal({
  realtor,
  agencyId,
  onClose,
  onSave,
}: {
  realtor: Realtor | null;
  agencyId: string;
  onClose: () => void;
  onSave: (data: RealtorFormData & { agencyId: string }) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RealtorFormData>({
    resolver: zodResolver(realtorSchema),
    defaultValues: realtor
      ? {
          name: realtor.name,
          email: realtor.email,
          phone: realtor.phone,
          cpf: realtor.cpf,
          creci: realtor.creci,
          creciState: realtor.creciState,
          status: realtor.status,
          commissionSplit: realtor.commissionSplit,
        }
      : {
          status: "pending",
          commissionSplit: 0.30,
        },
  });

  const onSubmit = (data: RealtorFormData) => {
    onSave({
      ...data,
      agencyId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {realtor ? "Editar Corretor" : "Novo Corretor"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Nome */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Completo</label>
            <input
              {...register("name")}
              className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              placeholder="Nome do corretor"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                placeholder="email@exemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone</label>
              <input
                {...register("phone")}
                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          {/* CPF */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CPF</label>
            <input
              {...register("cpf")}
              className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              placeholder="000.000.000-00"
            />
            {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
          </div>

          {/* CRECI */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CRECI</label>
              <input
                {...register("creci")}
                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                placeholder="123456-F"
              />
              {errors.creci && <p className="text-red-500 text-xs mt-1">{errors.creci.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">UF</label>
              <input
                {...register("creciState")}
                maxLength={2}
                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white uppercase"
                placeholder="SP"
              />
              {errors.creciState && <p className="text-red-500 text-xs mt-1">{errors.creciState.message}</p>}
            </div>
          </div>

          {/* Status e Split */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                {...register("status")}
                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="pending">Pendente</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Split da Comissão</label>
              <input
                {...register("commissionSplit", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="w-full mt-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                placeholder="0.30"
              />
              <p className="text-xs text-gray-500 mt-1">Ex: 0.30 = 30%</p>
              {errors.commissionSplit && <p className="text-red-500 text-xs mt-1">{errors.commissionSplit.message}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {realtor ? "Salvar Alterações" : "Cadastrar Corretor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
