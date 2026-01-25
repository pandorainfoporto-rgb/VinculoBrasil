import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { useAgencyStore, type Agency, type AgencyStatus } from "../../../stores/useAgencyStore";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ============================================================
// AGENCIES MANAGEMENT PAGE
// ============================================================

const agencySchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  address: z.string().min(5, "Endereço obrigatório"),
  status: z.enum(["active", "pending", "suspended", "inactive"]),
});

type AgencyFormData = z.infer<typeof agencySchema>;

export function AgenciesManagementPage() {
  const { agencies, addAgency, updateAgency, deleteAgency } = useAgencyStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgencyStatus | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Filtrar imobiliárias
  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch =
      agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.cnpj.includes(searchTerm) ||
      agency.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || agency.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setIsModalOpen(true);
    setOpenMenu(null);
  };

  const handleDelete = (agency: Agency) => {
    if (confirm(`Tem certeza que deseja excluir "${agency.name}"?`)) {
      deleteAgency(agency.id);
      toast.success("Imobiliária excluída com sucesso!");
    }
    setOpenMenu(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgency(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-blue-600" size={28} />
            Gestão de Imobiliárias
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Cadastre e gerencie as imobiliárias parceiras
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Nova Imobiliária
        </button>
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
              placeholder="Buscar por nome, CNPJ ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AgencyStatus | "all")}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="pending">Pendentes</option>
            <option value="suspended">Suspensas</option>
            <option value="inactive">Inativas</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={agencies.length}
          color="blue"
        />
        <StatCard
          label="Ativas"
          value={agencies.filter((a) => a.status === "active").length}
          color="green"
        />
        <StatCard
          label="Pendentes"
          value={agencies.filter((a) => a.status === "pending").length}
          color="yellow"
        />
        <StatCard
          label="Suspensas"
          value={agencies.filter((a) => a.status === "suspended").length}
          color="red"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Imobiliária
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CNPJ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cidade/UF
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Imóveis
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredAgencies.map((agency) => (
                <tr
                  key={agency.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agency.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {agency.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {agency.cnpj}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {agency.city}/{agency.state}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {agency.propertiesCount}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={agency.status} />
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === agency.id ? null : agency.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                    {openMenu === agency.id && (
                      <div className="absolute right-6 top-14 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-40">
                        <button
                          onClick={() => handleEdit(agency)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            toast.info("Funcionalidade em desenvolvimento");
                            setOpenMenu(null);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Eye size={16} />
                          Ver Detalhes
                        </button>
                        <button
                          onClick={() => handleDelete(agency)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAgencies.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma imobiliária encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AgencyModal
          agency={editingAgency}
          onClose={handleCloseModal}
          onSave={(data) => {
            if (editingAgency) {
              updateAgency(editingAgency.id, data);
              toast.success("Imobiliária atualizada com sucesso!");
            } else {
              addAgency(data);
              toast.success("Imobiliária cadastrada com sucesso!");
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
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "yellow" | "red";
}) {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================
function StatusBadge({ status }: { status: AgencyStatus }) {
  const config = {
    active: {
      icon: CheckCircle,
      label: "Ativa",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    pending: {
      icon: Clock,
      label: "Pendente",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    suspended: {
      icon: AlertTriangle,
      label: "Suspensa",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    inactive: {
      icon: XCircle,
      label: "Inativa",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    },
  };

  const { icon: Icon, label, color } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}

// ============================================================
// AGENCY MODAL
// ============================================================
function AgencyModal({
  agency,
  onClose,
  onSave,
}: {
  agency: Agency | null;
  onClose: () => void;
  onSave: (data: AgencyFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: agency
      ? {
          name: agency.name,
          cnpj: agency.cnpj,
          email: agency.email,
          phone: agency.phone,
          city: agency.city,
          state: agency.state,
          address: agency.address,
          status: agency.status,
        }
      : {
          status: "pending",
        },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {agency ? "Editar Imobiliária" : "Nova Imobiliária"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Imobiliária *
              </label>
              <input
                {...register("name")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Imóveis Premium SP"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                CNPJ *
              </label>
              <input
                {...register("cnpj")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="00.000.000/0001-00"
              />
              {errors.cnpj && (
                <p className="text-red-500 text-xs mt-1">{errors.cnpj.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail *
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="contato@imobiliaria.com.br"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefone *
              </label>
              <input
                {...register("phone")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cidade *
              </label>
              <input
                {...register("city")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="São Paulo"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado (UF) *
              </label>
              <input
                {...register("state")}
                maxLength={2}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="SP"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Endereço *
              </label>
              <input
                {...register("address")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Av. Paulista, 1000 - Bela Vista"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Ativa</option>
                <option value="pending">Pendente</option>
                <option value="suspended">Suspensa</option>
                <option value="inactive">Inativa</option>
              </select>
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
              {agency ? "Salvar Alterações" : "Cadastrar Imobiliária"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
